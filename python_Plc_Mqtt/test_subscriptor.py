import paho.mqtt.client as mqtt
import ssl
import certifi

# --- CONFIGURA TUS DATOS AQUÍ ---
MQTT_BROKER_HOST = "monitoreotermico.duckdns.org"
MQTT_BROKER_PORT = 8883
MQTT_USER = "fmex"
MQTT_PASSWORD = "fmex456" # <-- LA CONTRASEÑA QUE YA CORREGISTE
MQTT_TOPIC = "plc/datos/sensor1"

# --- Función que se ejecuta al recibir un mensaje ---
def on_message(client, userdata, msg):
    print(f"Mensaje recibido en el topic '{msg.topic}': {msg.payload.decode()}")

# --- Función para conectar al Broker (VERSIÓN FINAL Y DEFINITIVA) ---
def on_connect(client, userdata, flags, reason_code, properties):
    # --- ESTA ES LA LÍNEA CORRECTA ---
    if reason_code.value == 0:
        print("✅ ¡Conexión exitosa! El broker está funcionando y es seguro.")
        client.subscribe(MQTT_TOPIC)
        print(f"Suscrito al topic: {MQTT_TOPIC}")
    else:
        print(f"❌ Fallo en la conexión: {reason_code}\n")

# --- Configuración del Cliente MQTT ---
client = mqtt.Client(mqtt.CallbackAPIVersion.VERSION2)
client.username_pw_set(MQTT_USER, MQTT_PASSWORD)
client.on_connect = on_connect
client.on_message = on_message

# --- Habilitar TLS/SSL ---
client.tls_set(ca_certs=certifi.where(), tls_version=ssl.PROTOCOL_TLS)

# --- Conexión ---
try:
    client.connect(MQTT_BROKER_HOST, MQTT_BROKER_PORT, 60)
except Exception as e:
    print(f"Error al intentar conectar: {e}")
    exit()

# --- Bucle Principal ---
print("📡 Esperando mensajes...")
client.loop_forever()