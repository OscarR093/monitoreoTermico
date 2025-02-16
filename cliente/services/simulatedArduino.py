import socket
import time
import services.shared as shared

class SimulatedArduinoConnection:
    def __init__(self, ip, port, label, page, nombre, tag):
        self.ip = ip
        self.port = port
        self.label = label
        self.page = page
        self.nombre = nombre
        self.tag=tag
        self.sock = None
        

    def Simget_temperature(self):
        respuesta=0
        while True:
            try:
                while True:
                    respuesta=respuesta+1
                    time.sleep(2)
                    self.update_label(f"Temperatura de {self.nombre}: {respuesta} °C")

                    # Enviar al WebSocket si está activo
                    with shared.lock:
                        if shared.enviar_datos:
                            shared.data_queue.put((self.tag, respuesta))
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
