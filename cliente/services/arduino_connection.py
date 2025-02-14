import socket
import time
import services.shared as shared

class ArduinoConnection:
    def __init__(self, ip, port, label, page, nombre):
        self.ip = ip
        self.port = port
        self.label = label
        self.page = page
        self.nombre = nombre
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
                self.update_label(f"Error: {e}. Reconectando a {self.nombre}...")
                time.sleep(5)

    def get_temperature(self):
        while True:
            try:
                self.connect()
                while True:
                    mensaje = b"GET /Temperatura\r\n"
                    self.sock.sendall(mensaje)
                    respuesta = self.sock.recv(1024).decode().strip()
                    self.update_label(f"Temperatura de {self.nombre}: {respuesta} °C")

                    # Enviar al WebSocket si está activo
                    with shared.lock:
                        if shared.enviar_datos:
                            shared.data_queue.put((self.nombre, respuesta))
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
