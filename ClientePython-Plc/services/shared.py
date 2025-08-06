# services/shared.py
import queue
import threading

# Cola para enviar datos al WebSocketManager
# Ahora almacenará una lista de diccionarios con el estado de los 8 termopares
data_queue = queue.Queue()

# Bloqueo para operaciones compartidas
lock = threading.Lock()

# Variable para controlar si se deben enviar datos (controlada por mensajes del WS)
enviar_datos = False