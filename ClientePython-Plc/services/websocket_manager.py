# websocket_manager.py
import websocket
import json
import threading
import time
import queue

from config.config import websocket_url
import services.shared as shared

class WebSocketManager:
    def __init__(self, url):
        self.url = url
        self.ws_app = None
        self.is_connected = False
        self._reconnect_thread = None
        self._stop_event = threading.Event()
        self._send_thread = None

        print(f"WebSocketManager inicializado para URL: {self.url}")

    def on_message(self, ws, message):
        try:
            data = json.loads(message)
            print(f"Notificación recibida desde WS: {data}")

            with shared.lock:
                if data.get("action") == "start":
                    shared.enviar_datos = True
                    print("Comando recibido: Iniciar envío de datos.")
                elif data.get("action") == "stop":
                    shared.enviar_datos = False
                    print("Comando recibido: Detener envío de datos.")
        except json.JSONDecodeError:
            print(f"Error al decodificar mensaje JSON desde WS: {message}")
        except Exception as e:
            print(f"Error inesperado en on_message: {e}")

    def on_error(self, ws, error):
        print(f"Error en WebSocket: {error}")
        self.is_connected = False

    def on_close(self, ws, close_status_code, close_msg):
        self.is_connected = False
        print(f"WebSocket cerrado. Código: {close_status_code}, Mensaje: {close_msg}")

    def on_open(self, ws):
        self.is_connected = True
        print("Conectado al WebSocket")
        ws.send("python-client")

    def _ws_loop(self):
        while not self._stop_event.is_set():
            try:
                print("Iniciando conexión WebSocket...")
                self.ws_app = websocket.WebSocketApp(
                    self.url,
                    on_open=self.on_open,
                    on_message=self.on_message,
                    on_error=self.on_error,
                    on_close=self.on_close
                )
                self.ws_app.run_forever(ping_interval=10, ping_timeout=5)
            except Exception as e:
                print(f"Error en WebSocketApp.run_forever: {e}")
            finally:
                if not self._stop_event.is_set():
                    print("Reconectando WebSocket en 3 segundos...")
                    time.sleep(3)

    def _sender_loop(self):
        """Bucle para enviar el JSON consolidado desde la cola compartida."""
        while not self._stop_event.is_set():
            try:
                # Bloquear hasta que haya un elemento en la cola o el evento de parada se active
                # Este 'timeout' es crucial para que el hilo no se quede bloqueado al detenerse.
                data_package = shared.data_queue.get(timeout=1)

                with shared.lock:
                    should_send = shared.enviar_datos

                if self.is_connected and should_send:
                    # El data_package ya es la lista de los 8 termopares o el mensaje global de PLC
                    json_message = json.dumps(data_package)
                    self.ws_app.send(json_message)
                    # print(f"Enviado por WS (consolidado): {json_message[:200]}...") # Log para depuración
                elif not self.is_connected:
                    print(f"No se pudo enviar datos (WS no conectado).")
                    # Opcional: Volver a poner el paquete en la cola si no se pudo enviar
                    # shared.data_queue.put(data_package)
                elif not should_send:
                    print(f"Envío de datos pausado por comando del servidor. Paquete no enviado.")
                    # Opcional: Volver a poner el paquete en la cola si se pausó
                    # shared.data_queue.put(data_package)
                
                shared.data_queue.task_done()

            except queue.Empty:
                # No hay elementos en la cola, simplemente continúa el bucle
                pass
            except Exception as e:
                print(f"Error en el hilo de envío de WebSocket: {e}")
                # En caso de error de envío, el `_ws_loop` se encargará de la reconexión

            time.sleep(0.05) # Pequeña pausa para no saturar la CPU

    def start(self):
        if not self._reconnect_thread or not self._reconnect_thread.is_alive():
            self._stop_event.clear()
            self._reconnect_thread = threading.Thread(target=self._ws_loop, daemon=True)
            self._reconnect_thread.start()
            print("WebSocketManager: Hilo de reconexión iniciado.")
        
        if not self._send_thread or not self._send_thread.is_alive():
            self._send_thread = threading.Thread(target=self._sender_loop, daemon=True)
            self._send_thread.start()
            print("WebSocketManager: Hilo de envío iniciado.")

    def stop(self):
        print("WebSocketManager: Deteniendo hilos...")
        self._stop_event.set()
        
        if self._reconnect_thread and self._reconnect_thread.is_alive():
            self._reconnect_thread.join(timeout=5)
            if self._reconnect_thread.is_alive():
                print("Advertencia: Hilo de reconexión no se detuvo limpiamente.")

        if self._send_thread and self._send_thread.is_alive():
            self._send_thread.join(timeout=5)
            if self._send_thread.is_alive():
                print("Advertencia: Hilo de envío no se detuvo limpiamente.")
        
        if self.ws_app:
            try:
                self.ws_app.close()
            except Exception as e:
                print(f"Error al cerrar ws_app: {e}")
            finally:
                self.ws_app = None

        print("WebSocketManager: Hilos detenidos.")

# Ejemplo de uso (para probar el módulo independientemente)
if __name__ == "__main__":
    from config.config import websocket_url # Asegúrate de que esta importación funcione si lo ejecutas solo
    
    print("Probando WebSocketManager de forma independiente con JSON consolidado...")
    
    shared.enviar_datos = True # Simula que el servidor ha dado la orden de iniciar

    manager = WebSocketManager(websocket_url)
    manager.start()

    try:
        # Simular una lectura completa de 8 termopares
        simulated_full_data = []
        for i in range(1, 9):
            # Simular diferentes estados y temperaturas
            if i % 3 == 0: # Algunos desconectados
                simulated_full_data.append({
                    'termopar': i,
                    'nombre': f"Termopar {i} (Ej: Descon.)",
                    'temperatura': None,
                    'estado': 'desconectado'
                })
            elif i % 4 == 1: # Algunos en estabilización
                 simulated_full_data.append({
                    'termopar': i,
                    'nombre': f"Termopar {i} (Ej: Estab.)",
                    'temperatura': None,
                    'estado': 'Estabilizando...'
                })
            else: # La mayoría conectados
                simulated_full_data.append({
                    'termopar': i,
                    'nombre': f"Termopar {i} (Ej: Conectado)",
                    'temperatura': round(20 + i * 1.5, 1),
                    'estado': 'conectado'
                })
        
        # Poner el paquete completo en la cola
        shared.data_queue.put({"type": "temperatures", "data": simulated_full_data})
        print("Paquete de 8 termopares encolado.")

        time.sleep(5) # Deja que el hilo envíe

        # Simular que el PLC se desconecta globalmente
        shared.data_queue.put({"type": "status", "message": "PLC no conectado"})
        print("Mensaje de PLC desconectado encolado.")
        time.sleep(5)

        # Simular que el servidor envía un comando 'stop'
        print("Simulando que el servidor envía 'stop' (necesitarías un WS server real para esto)")
        with shared.lock:
            shared.enviar_datos = False
        time.sleep(2)
        
        # Intentar enviar datos cuando el envío está pausado
        shared.data_queue.put({"type": "temperatures", "data": [
            {'termopar': 1, 'nombre': 'TP1', 'temperatura': 20.0, 'estado': 'conectado'}
        ]})
        print("Paquete encolado con envío pausado.")
        time.sleep(2)


    except KeyboardInterrupt:
        print("\nPrueba de WebSocketManager interrumpida.")
    finally:
        manager.stop()
        print("Fin de la prueba.")