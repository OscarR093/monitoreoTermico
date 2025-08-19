# settings.py

import os

# Configuración del PLC
PLC_IP = '192.168.0.1'  # ¡IMPORTANTE! Reemplaza con la IP de tu PLC
RACK = 0
SLOT = 1
DB_NUMBER = 1

# --- CAMBIO: Se ajusta el tamaño del DB para leer hasta el último dato necesario ---
# El último dato es T9_Conectado en el offset 52. Para leer el byte 52, necesitamos
# un tamaño de 53 (se leen bytes del 0 al 52). Usamos 54 por seguridad.
DB_SIZE = 54

# --- CAMBIO: Mapa de equipos que define qué se lee, cómo se llama y dónde está ---
# Esta es ahora la configuración central para los termopares.
# El formato es: 'Nombre del Equipo': {'channel': ID, 'temp_offset': byte, 'conn_offset': byte}
EQUIPMENT_MAP = {
    'Torre Fusora': {'channel': 1, 'temp_offset': 0, 'conn_offset': 4},
    'Linea 1':      {'channel': 2, 'temp_offset': 6, 'conn_offset': 10},
    'Linea 2':      {'channel': 3, 'temp_offset': 12, 'conn_offset': 16},
    'Linea 3':      {'channel': 4, 'temp_offset': 18, 'conn_offset': 22},
    'Linea 4':      {'channel': 5, 'temp_offset': 24, 'conn_offset': 28},
    'E. P. 1':      {'channel': 6, 'temp_offset': 36, 'conn_offset': 40},
    'E. P. 2':      {'channel': 7, 'temp_offset': 42, 'conn_offset': 46},
    'Linea 7':      {'channel': 9, 'temp_offset': 48, 'conn_offset': 52},
}

# Umbrales de temperatura para alertas (ejemplo)
TEMP_ALERT_THRESHOLD = 80.0

# Constante para el retraso de estabilización
STABILIZATION_DELAY_SECONDS = 5 # Retraso para cuando un termopar se conecta

# El archivo JSON ya no es necesario para los nombres, pero lo mantenemos por si se usa para la IP
SETTINGS_FILE_PATH = os.path.join(os.path.dirname(__file__), 'settings.json')