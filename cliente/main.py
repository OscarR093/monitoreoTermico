import socket
import flet as ft
import threading
import time

# IP y puerto de Arduino
ino_ip = "192.168.0.50"
ino_port = 80

# Función para conectar al servidor
def conectar(label, page):
    while True:
        try:
            sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            sock.settimeout(5)  # Establecer un tiempo de espera para la conexión
            sock.connect((ino_ip, ino_port))  # Conectar al Arduino
            label.value = f"Conectado a {ino_ip}"
            page.update()
            return sock
        except Exception as e:
            label.value = f"Error de conexión: {e}. Reconectando..."
            page.update()
            time.sleep(5)  # Esperar antes de intentar reconectar

# Función para verificar la conexión
def verificar(sock, label, page):
    try:
        sock.send(b'')  # Intentar enviar algo vacío para comprobar la conexión
        return True
    except Exception as e:
        label.value = f"Error de conexión: {e}"
        page.update()
        return False

# Función para obtener la temperatura
def obtener_temperatura(label, page):
    while True:
        sock = conectar(label, page)
        try:
            while True:
                if verificar(sock, label, page):
                    # Recibir datos
                    mensaje = b"GET /Temperatura\r\n"
                    sock.sendall(mensaje)
                    respuesta = sock.recv(1024).decode().strip()
                    # Actualizar el label con el valor recibido
                    label.value = f"Temperatura: {respuesta} °C"
                    page.update()
                else:
                    print("La conexión se perdió. Reconectando...")
                    break  # Salir del bucle interno para reconectar
        except Exception as e:
            label.value = f"Error: {e}. Reconectando..."
            page.update()
        finally:
            sock.close()
        time.sleep(3)  # Esperar antes de intentar reconectar

# Interfaz
def main(page: ft.Page):
    page.title = "Monitor de temperatura"
    page.vertical_alignment = ft.MainAxisAlignment.CENTER
    # Label de temperatura
    label = ft.Text(f"Conectando a {ino_ip}...", size=24)
    page.add(label)
    # Ejecutar la función de obtener temperatura en un hilo separado
    threading.Thread(target=obtener_temperatura, args=(label, page), daemon=True).start()

ft.app(target=main)