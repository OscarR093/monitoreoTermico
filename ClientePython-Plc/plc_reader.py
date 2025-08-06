# plc_reader.py
import snap7
from snap7.util import get_real, get_bool
import time
import math

# Para tu versión de la librería snap7, parece que las excepciones
# se lanzan directamente como 'RuntimeError' o están en un lugar
# que no es 'snap7.exceptions' ni 'snap7.snap7exceptions'.
# Por lo tanto, capturamos 'RuntimeError' y 'Exception' de manera genérica.

class PLCReader:
    def __init__(self, ip, rack, slot, db_number, db_size):
        """
        Inicializa el lector de PLC.
        """
        self.ip = ip
        self.rack = rack
        self.slot = slot
        self.db_number = db_number
        self.db_size = db_size
        self.client = None
        self.is_connected = False
        self.reconnect_interval = 5

    def _create_new_client(self):
        """Crea y retorna una nueva instancia limpia del cliente Snap7."""
        return snap7.client.Client()

    def connect(self):
        """Intenta establecer conexión con el PLC, creando una nueva instancia del cliente."""
        self.disconnect()
        self.client = self._create_new_client()

        try:
            print(f"Intentando conectar al PLC en {self.ip}...")
            self.client.connect(self.ip, self.rack, self.slot)
            self.is_connected = self.client.get_connected()
            if self.is_connected:
                print("Conectado exitosamente al PLC.")
            else:
                print("Fallo al conectar al PLC: la conexión no se estableció.")
            return self.is_connected
        except (RuntimeError, Exception) as e: # Capturamos RuntimeError y cualquier otra excepción
            print(f"Fallo al conectar al PLC: {e}")
            self.is_connected = False
            self.client = None
            return False

    def disconnect(self):
        """Cierra la conexión con el PLC si está abierta y limpia el objeto cliente."""
        if self.client and self.is_connected:
            try:
                self.client.disconnect()
                print("Desconectado del PLC.")
            except Exception as e:
                print(f"Error al desconectar del PLC: {e}")
            finally:
                self.is_connected = False
                self.client = None

    def read_temperatures(self):
        """
        Lee los datos de temperatura y estado de conexión desde el PLC.
        """
        # Verificamos la conexión antes de leer
        if not self.is_connected or not self.client or not self.client.get_connected():
            print("No conectado al PLC. Abortando lectura.")
            self.is_connected = False
            return None

        try:
            data = self.client.db_read(self.db_number, 0, self.db_size)
            temperatures = []
            for i in range(8):
                temp_offset = i * 6
                conn_offset = temp_offset + 4
                connected = get_bool(data, conn_offset, 0)

                if connected:
                    temp = get_real(data, temp_offset)
                    if not math.isnan(temp):
                        temperatures.append({'termopar': i + 1, 'temperatura': round(temp, 1), 'conectado': True})
                    else:
                        print(f"Advertencia: El termopar {i + 1} devolvió un valor no numérico (NaN).")
                        temperatures.append({'termopar': i + 1, 'temperatura': None, 'conectado': False})
                else:
                    temperatures.append({'termopar': i + 1, 'temperatura': None, 'conectado': False})
            return temperatures
        except (RuntimeError, Exception) as e: # Capturamos RuntimeError y cualquier otra excepción
            print(f"Error de comunicación con el PLC: {e}. Marcando como desconectado para forzar reconexión.")
            self.is_connected = False
            self.client = None
            return None

    def ensure_connection(self):
        """Asegura que la conexión esté activa. Intenta conectar si no lo está."""
        if not self.is_connected:
            print("Conexión perdida. Intentando reconectar...")
            self.connect()

# Ejemplo de uso (para probar el módulo independientemente)
if __name__ == "__main__":
    PLC_IP = '192.168.0.1'
    RACK = 0
    SLOT = 1
    DB_NUMBER = 1
    DB_SIZE = 47

    reader = PLCReader(PLC_IP, RACK, SLOT, DB_NUMBER, DB_SIZE)
    reader.connect()

    try:
        while True:
            reader.ensure_connection()
            temps = reader.read_temperatures()
            if temps:
                print("\n=== Temperaturas Actuales ===")
                for t in temps:
                    if t['conectado']:
                        print(f"Termopar {t['termopar']}: {t['temperatura']} °C")
                    else:
                        print(f"⚠️ Termopar {t['termopar']} no conectado")
            else:
                print("No se pudieron recuperar las temperaturas.")
            time.sleep(reader.reconnect_interval)
    except KeyboardInterrupt:
        print("\nSaliendo y desconectando...")
        reader.disconnect()