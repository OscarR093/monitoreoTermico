# settings.py

import os

# Configuración del PLC
PLC_IP = '192.168.0.1'  # ¡IMPORTANTE! Reemplaza con la IP de tu PLC
RACK = 0
SLOT = 1
DB_NUMBER = 1
DB_SIZE = 47

# Umbrales de temperatura para alertas (ejemplo)
TEMP_ALERT_THRESHOLD = 80.0

# Constante para el retraso de estabilización
STABILIZATION_DELAY_SECONDS = 5 # Retraso para cuando un termopar se conecta

# Nombres de los equipos para cada termopar
# El índice 0 no se usa; los termopares van del 1 al 8.
TERMOPAR_NAMES = [ # Índice 0 no usado
    "Torre Fusora",
    "Linea 1",
    "Linea 2",
    "Linea 3",
    "Linea 4",
    "Linea 7",
    "E. P. 1",
    "E. p. 2"
]

# 👉 RUTA DEL ARCHIVO DE AJUSTES JSON
SETTINGS_FILE_PATH = os.path.join(os.path.dirname(__file__), 'settings.json')