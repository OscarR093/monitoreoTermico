# settings.py

# --- 1. Configuración del PLC ---
PLC_IP = '192.168.0.1'  # ¡IMPORTANTE! Reemplaza con la IP de tu PLC
RACK = 0
SLOT = 1
DB_NUMBER = 1
DB_SIZE = 54

# Mapa de equipos que define qué se lee, cómo se llama y dónde está
EQUIPMENT_MAP = {
    'Torre Fusora': {'channel': 1, 'temp_offset': 0, 'conn_offset': 4},
    'Linea 1':      {'channel': 2, 'temp_offset': 6, 'conn_offset': 10},
    'Linea 2':      {'channel': 3, 'temp_offset': 12, 'conn_offset': 16},
    'Linea 3':      {'channel': 4, 'temp_offset': 18, 'conn_offset': 22},
    'Linea 4':      {'channel': 5, 'temp_offset': 24, 'conn_offset': 28},
    'Estacion 1':      {'channel': 6, 'temp_offset': 36, 'conn_offset': 40},
    'Estacion 2':      {'channel': 7, 'temp_offset': 42, 'conn_offset': 46},
    'Linea 7':      {'channel': 9, 'temp_offset': 48, 'conn_offset': 52},
}

# --- 2. Configuración del Broker MQTT ---
MQTT_BROKER_HOST = "monitoreotermico.duckdns.org"
MQTT_BROKER_PORT = 8883
MQTT_USER = "fmex"
MQTT_PASSWORD = "fmex456" # <-- ¡PON TU CONTRASEÑA!

# --- 3. Configuración de Tópicos MQTT ---
# Usaremos un formato con {equipo} para crear tópicos dinámicos
TOPIC_HISTORY_BASE = "plcTemperaturas/historial/{equipo}"
TOPIC_REALTIME_BASE = "plcTemperaturas/tiemporeal/{equipo}"
TOPIC_CONTROL = "gatewayTemperaturas/control/tiemporeal"

# --- 4. Configuración de Intervalos ---
HISTORY_INTERVAL_SECONDS = 1200  # 20 minutos
REALTIME_INTERVAL_SECONDS = 2    # 2 segundos