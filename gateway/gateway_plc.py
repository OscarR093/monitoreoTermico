# gateway_plc.py

import paho.mqtt.client as mqtt
import ssl
import certifi
import time
import threading
import json
import settings  # Importa toda nuestra configuración
from plc_reader import PLCReader # Importa tu clase

# --- 1. LÓGICA DE LOS BUCLES DE PUBLICACIÓN ---

# Evento para controlar el bucle de tiempo real
realtime_active = threading.Event()

def publish_loop(client, plc_reader, is_realtime):
    """Bucle genérico para publicar datos del PLC."""
    
    interval = settings.REALTIME_INTERVAL_SECONDS if is_realtime else settings.HISTORY_INTERVAL_SECONDS
    topic_base = settings.TOPIC_REALTIME_BASE if is_realtime else settings.TOPIC_HISTORY_BASE
    retain = False if is_realtime else True
    mode_name = "TIEMPO REAL" if is_realtime else "HISTORIAL"

    while True:
        # En modo tiempo real, el bucle se pausa aquí si no está activo
        if is_realtime:
            realtime_active.wait()

        # Asegura la conexión con el PLC antes de leer
        plc_reader.ensure_connection()
        
        # Lee las temperaturas desde tu clase PLCReader
        readings = plc_reader.read_temperatures()

        if readings:
            for reading in readings:
                # Solo publica si el equipo está conectado y tiene una temperatura válida
                if reading['conectado'] and reading['temperatura'] is not None:
                    equipo = reading['equipo'].replace(" ", "_") # Reemplaza espacios para un topic válido
                    topic = topic_base.format(equipo=equipo)
                    
                    payload = json.dumps({
                        "timestamp": time.time(),
                        "equipo": reading['equipo'],
                        "temperatura": reading['temperatura']
                    })
                    
                    client.publish(topic, payload, retain=retain)
                    print(f"{mode_name}: Publicado en '{topic}': {payload}")
        else:
            print(f"{mode_name}: No se pudieron leer datos del PLC. Reintentando en {interval}s.")

        time.sleep(interval)


# --- 2. LÓGICA DE CONEXIÓN Y CONTROL MQTT ---

def on_connect(client, userdata, flags, reason_code, properties):
    """Se ejecuta al conectar/reconectar con el broker."""
    if reason_code.value == 0:
        print("✅ Gateway conectado exitosamente al Broker MQTT.")
        client.subscribe(settings.TOPIC_CONTROL)
        print(f"Suscrito al tópico de control: '{settings.TOPIC_CONTROL}'")
    else:
        print(f"❌ Fallo en la conexión del gateway: {reason_code}")

def on_message(client, userdata, msg):
    """Se ejecuta al recibir un mensaje en el tópico de control."""
    if msg.topic == settings.TOPIC_CONTROL:
        command = msg.payload.decode()
        print(f"Comando recibido en '{settings.TOPIC_CONTROL}': {command}")
        
        if command == "START":
            print("▶️ Activando modo tiempo real...")
            realtime_active.set()
        elif command == "STOP":
            print("⏹️ Desactivando modo tiempo real...")
            realtime_active.clear()

# --- 3. EJECUCIÓN PRINCIPAL ---
if __name__ == "__main__":
    # Inicializa tu lector de PLC
    plc = PLCReader(
        ip=settings.PLC_IP,
        rack=settings.RACK,
        slot=settings.SLOT,
        db_number=settings.DB_NUMBER,
        db_size=settings.DB_SIZE
    )
    plc.connect()

    # Inicializa el cliente MQTT
    client = mqtt.Client(mqtt.CallbackAPIVersion.VERSION2)
    client.username_pw_set(settings.MQTT_USER, settings.MQTT_PASSWORD)
    client.on_connect = on_connect
    client.on_message = on_message
    client.tls_set(ca_certs=certifi.where(), tls_version=ssl.PROTOCOL_TLS)

    # Conecta al broker
    try:
        client.connect(settings.MQTT_BROKER_HOST, settings.MQTT_BROKER_PORT, 60)
    except Exception as e:
        print(f"Error al conectar con el broker: {e}")
        exit()

    # Iniciar los hilos para los bucles de publicación
    history_thread = threading.Thread(target=publish_loop, args=(client, plc, False), daemon=True) # False para modo historial
    realtime_thread = threading.Thread(target=publish_loop, args=(client, plc, True), daemon=True)   # True para modo tiempo real

    history_thread.start()
    realtime_thread.start()

    # Inicia el bucle de red de Paho-MQTT, manteniendo el script vivo
    client.loop_forever()