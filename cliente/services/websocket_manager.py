import websocket
import json
import threading
import time
from config.config import websocket_url  # Importación absolutas
import services.shared as shared

class WebSocketManager:
    def __init__(self, url):
        self.url = url
        self.ws_app = None

    def on_message(self, ws, message):
        try:
            data = json.loads(message)
            print(f"Notificación recibida: {data}")

            with shared.lock:
                if data.get("action") == "start":
                    shared.enviar_datos = True
                elif data.get("action") == "stop":
                    shared.enviar_datos = False
        except json.JSONDecodeError:
            print(f"Error al decodificar mensaje: {message}")

    def on_error(self, ws, error):
        print(f"Error en WebSocket: {error}")

    def on_close(self, ws, close_status_code, close_msg):
        print("WebSocket cerrado. Intentando reconectar...")

    def on_open(self, ws):
        print("Conectado al WebSocket")
        ws.send("python-client")

    def start(self):
        while True:
            try:
                self.ws_app = websocket.WebSocketApp(
                    self.url,
                    on_message=self.on_message,
                    on_error=self.on_error,
                    on_close=self.on_close
                )
                self.ws_app.on_open = self.on_open
                self.ws_app.run_forever()
            except Exception as e:
                print(f"Error en WebSocketApp: {e}")
            time.sleep(3)  # Esperar antes de intentar reconectar

def websocket_sender():
    ws_manager = WebSocketManager(websocket_url)
    ws_thread = threading.Thread(target=ws_manager.start, daemon=True)
    ws_thread.start()

    while True:
        if not shared.data_queue.empty():
            label, data = shared.data_queue.get()
            try:
                ws_manager.ws_app.send(data)
                print(f"Datos enviados: {label} - {data}")
            except Exception as e:
                print(f"Error enviando datos: {e}")
