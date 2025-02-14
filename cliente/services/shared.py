# services/shared.py
import threading
from queue import Queue

# Variables globales compartidas
enviar_datos = False
lock = threading.Lock()  # Para sincronizar el acceso a enviar_datos
data_queue = Queue()  # Cola para enviar datos al WebSocket
