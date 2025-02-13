import socket
import flet as ft
import threading
import time
import websocket
import json
from queue import Queue

# Configuración
arduinos = [
    {"ip": "192.168.0.50", "port": 80, "label": "Arduino 1"},
    {"ip": "192.168.0.51", "port": 80, "label": "Arduino 2"},
    # Agrega más Arduinos aquí
]
websocket_url = "ws://localhost:8080"

# Variables globales
enviar_datos = False
lock = threading.Lock()  # Para sincronizar el acceso a enviar_datos
data_queue = Queue()  # Cola para enviar datos al WebSocket

class ArduinoConnection:
    def __init__(self, ip, port, label, page):
        self.ip = ip
        self.port = port
        self.label = label
        self.page = page
        self.sock = None

    def connect(self):
        while True:
            try:
                self.sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
                self.sock.settimeout(5)
                self.sock.connect((self.ip, self.port))
                self.update_label(f"Conectado a {self.ip}")
                return self.sock
            except Exception as e:
                self.update_label(f"Error: {e}. Reconectando...")
                time.sleep(5)

    def get_temperature(self):
        while True:
            try:
                self.connect()
                while True:
                    mensaje = b"GET /Temperatura\r\n"
                    self.sock.sendall(mensaje)
                    respuesta = self.sock.recv(1024).decode().strip()
                    self.update_label(f"Temperatura: {respuesta} °C")

                    # Enviar al WebSocket si está activo
                    with lock:
                        if enviar_datos:
                            data_queue.put((self.label, respuesta))
            except Exception as e:
                print(f"Error general: {e}")
            finally:
                if self.sock:
                    self.sock.close()
                time.sleep(5)

    def update_label(self, text):
        # Actualizar la etiqueta en el hilo principal de Flet
        self.label.value = text
        self.page.update()

class WebSocketManager:
    def __init__(self, url):
        self.url = url
        self.ws_app = None

    def on_message(self, ws, message):
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
        if not data_queue.empty():
            label, data = data_queue.get()
            try:
                ws_manager.ws_app.send(data)
                print(f"Datos enviados: {label} - {data}")
            except Exception as e:
                print(f"Error enviando datos: {e}")

# Interfaz
def main(page: ft.Page):
    page.title = "Monitor de temperatura"
    page.horizontal_alignment = ft.CrossAxisAlignment.CENTER
    page.vertical_alignment = ft.MainAxisAlignment.CENTER

    labels = {}
    for arduino in arduinos:
        label = ft.Text(f"Conectando a {arduino['label']}...", size=24)
        labels[arduino['label']] = label
        page.add(label)

    # Iniciar hilos para cada Arduino
    for arduino in arduinos:
        arduino_conn = ArduinoConnection(
            arduino["ip"], arduino["port"], labels[arduino['label']], page
        )
        threading.Thread(target=arduino_conn.get_temperature, daemon=True).start()

    # Iniciar hilo para el WebSocket
    threading.Thread(target=websocket_sender, daemon=True).start()

ft.app(target=main)