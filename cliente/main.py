import socket
import flet as ft
import threading
import time
import websocket
import json

# Configuración
ino_ip = "192.168.0.50"
ino_port = 80
websocket_url = "ws://localhost:8080"

# Variables globales
enviar_datos = False
lock = threading.Lock()  # Para sincronizar el acceso a enviar_datos

# Función para conectar al Arduino
def conectar_arduino(label, page):
    while True:
        try:
            sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            sock.settimeout(5)
            sock.connect((ino_ip, ino_port))
            label.value = f"Conectado a {ino_ip}"
            page.update()
            return sock
        except Exception as e:
            label.value = f"Error: {e}. Reconectando..."
            page.update()
            time.sleep(5)

# Función para obtener temperatura
def obtener_temperatura(label, page):
    global enviar_datos

    while True:
        sock = None
        try:
            sock = conectar_arduino(label, page)
            while True:
                mensaje = b"GET /Temperatura\r\n"
                sock.sendall(mensaje)
                respuesta = sock.recv(1024).decode().strip()
                label.value = f"Temperatura: {respuesta} °C"
                page.update()

                # Enviar al WebSocket si está activo
                with lock:
                    if enviar_datos:
                        try:
                            ws_app.send(respuesta)
                            print(f"Temperatura enviada: {respuesta}")
                        except Exception as e:
                            print(f"Error enviando datos: {e}")
                            break
        except Exception as e:
            print(f"Error general: {e}")
        finally:
            if sock:
                sock.close()
            time.sleep(5)

# Callbacks del WebSocket
def on_message(ws, message):
    global enviar_datos
    try:
        data = json.loads(message)
        print(f"Notificación recibida: {data}")

        with lock:
            if data.get("action") == "start":
                enviar_datos = True
            elif data.get("action") == "stop":
                enviar_datos = False
    except json.JSONDecodeError:
        print(f"Error al decodificar mensaje: {message}")

def on_error(ws, error):
    print(f"Error en WebSocket: {error}")

def on_close(ws, close_status_code, close_msg):
    print("WebSocket cerrado. Intentando reconectar...")

def on_open(ws):
    print("Conectado al WebSocket")
    ws.send("python-client")

# Función para mantener la conexión WebSocket viva
def iniciar_websocket():
    global ws_app
    while True:
        try:
            ws_app = websocket.WebSocketApp(
                websocket_url,
                on_message=on_message,
                on_error=on_error,
                on_close=on_close
            )
            ws_app.on_open = on_open
            ws_app.run_forever()
        except Exception as e:
            print(f"Error en WebSocketApp: {e}")
        time.sleep(3)  # Esperar antes de intentar reconectar

# Interfaz
def main(page: ft.Page):
    page.title = "Monitor de temperatura"
    label = ft.Text("Conectando...", size=24)
    page.add(label)
    page.horizontal_alignment = ft.CrossAxisAlignment.CENTER
    page.vertical_alignment = ft.MainAxisAlignment.CENTER

    # Iniciar hilos
    threading.Thread(target=obtener_temperatura, args=(label, page), daemon=True).start()
    threading.Thread(target=iniciar_websocket, daemon=True).start()

ft.app(target=main)
