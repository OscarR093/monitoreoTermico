from dotenv import load_dotenv
load_dotenv()
import os

# --- 1. Configuración del PLC ---
PLC_IP = os.environ.get('PLC_IP', '192.168.0.1')
RACK = int(os.environ.get('PLC_RACK', 0))
SLOT = int(os.environ.get('PLC_SLOT', 1))
DB_NUMBER = int(os.environ.get('PLC_DB_NUMBER', 1))
DB_SIZE = int(os.environ.get('PLC_DB_SIZE', 54))

# Mapa de equipos que define qué se lee, cómo se llama y dónde está
EQUIPMENT_MAP = {
    'Torre Fusora': {'channel': 1, 'temp_offset': 0, 'conn_offset': 4},
    'Linea 1':      {'channel': 2, 'temp_offset': 6, 'conn_offset': 10},
    'Linea 2':      {'channel': 3, 'temp_offset': 12, 'conn_offset': 16},
    'Linea 3':      {'channel': 4, 'temp_offset': 18, 'conn_offset': 22},
    'Linea 4':      {'channel': 5, 'temp_offset': 24, 'conn_offset': 28},
    'Estacion 1':   {'channel': 6, 'temp_offset': 36, 'conn_offset': 40},
    'Estacion 2':   {'channel': 7, 'temp_offset': 42, 'conn_offset': 46},
    'Linea 7':      {'channel': 9, 'temp_offset': 48, 'conn_offset': 52},
}

# --- 2. Configuración del Broker MQTT ---
MQTT_BROKER_HOST = os.environ.get('MQTT_BROKER_HOST', 'localhost')
MQTT_BROKER_PORT = int(os.environ.get('MQTT_BROKER_PORT', 1883))
MQTT_USER = os.environ.get('MQTT_USER', '')
MQTT_PASSWORD = os.environ.get('MQTT_PASSWORD', '')
MQTT_CA_CERTS = os.environ.get('MQTT_CA_CERTS', '')

# --- 3. Configuración de Tópicos MQTT ---
TOPIC_HISTORY_BASE = os.environ.get('TOPIC_HISTORY_BASE', 'plcTemperaturas/historial/{equipo}')
TOPIC_REALTIME_BASE = os.environ.get('TOPIC_REALTIME_BASE', 'plcTemperaturas/tiemporeal/{equipo}')
TOPIC_CONTROL = os.environ.get('TOPIC_CONTROL', 'gatewayTemperaturas/control/tiemporeal')

# --- 4. Configuración de Intervalos ---
HISTORY_INTERVAL_SECONDS = int(os.environ.get('HISTORY_INTERVAL_SECONDS', 1200))  # 20 minutos
REALTIME_INTERVAL_SECONDS = int(os.environ.get('REALTIME_INTERVAL_SECONDS', 2))   # 2 segundos

# --- 5. Configuración de Reconexión ---
MQTT_RECONNECT_MIN_DELAY = int(os.environ.get('MQTT_RECONNECT_MIN_DELAY', 1))
MQTT_RECONNECT_MAX_DELAY = int(os.environ.get('MQTT_RECONNECT_MAX_DELAY', 120))
MQTT_CONNECTION_RETRIES = int(os.environ.get('MQTT_CONNECTION_RETRIES', 5))