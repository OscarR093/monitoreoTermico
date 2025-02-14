import flet as ft
import threading
from config.config import equipos
from services.arduino_connection import ArduinoConnection
from services.websocket_manager import websocket_sender

def main(page: ft.Page):
    page.title = "Monitor de temperatura"
    page.horizontal_alignment = ft.CrossAxisAlignment.CENTER
    page.vertical_alignment = ft.MainAxisAlignment.CENTER

    labels = {}
    for equipo in equipos:
        label = ft.Text(f"Conectando a {equipo['nombre']}...", size=24)
        labels[equipo['nombre']] = label
        page.add(label)

    # Iniciar hilos para cada equipo
    for equipo in equipos:
        equipo_conn = ArduinoConnection(
            equipo["ip"], equipo["port"], labels[equipo['nombre']], page, equipo['nombre']
        )
        threading.Thread(target=equipo_conn.get_temperature, daemon=True).start()

    # Iniciar hilo para el WebSocket
    threading.Thread(target=websocket_sender, daemon=True).start()

ft.app(target=main)
