# plc_reader.py
import snap7
from snap7.util import get_real, get_bool
import time
import math
import settings # <-- CAMBIO: Importamos el archivo de configuración

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
        """Intenta establecer conexión con el PLC."""
        self.disconnect()
        self.client = self._create_new_client()
        try:
            print(f"Intentando conectar al PLC en {self.ip}...")
            self.client.connect(self.ip, self.rack, self.slot)
            self.is_connected = self.client.get_connected()
            if self.is_connected:
                print("Conectado exitosamente al PLC.")
            else:
                print("Fallo al conectar al PLC.")
            return self.is_connected
        except (RuntimeError, Exception) as e:
            print(f"Fallo al conectar al PLC: {e}")
            self.is_connected = False
            self.client = None
            return False

    def disconnect(self):
        """Cierra la conexión con el PLC."""
        if self.client and self.is_connected:
            try:
                self.client.disconnect()
            finally:
                self.is_connected = False
                self.client = None

    def read_temperatures(self):
        """
        Lee los datos desde el PLC basándose en el EQUIPMENT_MAP de settings.
        """
        if not self.is_connected or not self.client.get_connected():
            self.is_connected = False
            return None

        try:
            data = self.client.db_read(self.db_number, 0, self.db_size)
            readings = []
            
            # --- CAMBIO: Usamos el mapa de settings para saber qué leer ---
            for equipment_name, info in settings.EQUIPMENT_MAP.items():
                temp_offset = info['temp_offset']
                conn_offset = info['conn_offset']
                
                connected = get_bool(data, conn_offset, 0)

                if connected:
                    temp = get_real(data, temp_offset)
                    if not math.isnan(temp):
                        # Devolvemos el nombre del equipo, no el número de termopar
                        readings.append({'equipo': equipment_name, 'temperatura': round(temp, 1), 'conectado': True})
                    else:
                        readings.append({'equipo': equipment_name, 'temperatura': None, 'conectado': False})
                else:
                    readings.append({'equipo': equipment_name, 'temperatura': None, 'conectado': False})
            return readings
            
        except (RuntimeError, Exception) as e:
            print(f"Error de comunicación con el PLC: {e}.")
            self.is_connected = False
            self.client = None
            return None

    def ensure_connection(self):
        """Asegura que la conexión esté activa."""
        if not self.is_connected:
            self.connect()