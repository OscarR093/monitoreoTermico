# gateway_simulator.py (Versión Mejorada)

import paho.mqtt.client as mqtt
import ssl
import certifi
import time
import threading
import random
import json
import settings

# --- LÓGICA DE LOS BUCLES DE PUBLICACIÓN ---

realtime_active = threading.Event()

def publish_history_loop(client):
    """Bucle lento: Publica datos para TODOS los equipos cada 20 minutos con retención."""
    while True:
        print(f"--- Ciclo de HISTORIAL (cada {settings.HISTORY_INTERVAL_SECONDS}s) ---")
        # --- CAMBIO: Iteramos sobre el mapa de equipos ---
        for equipment_name in settings.EQUIPMENT_MAP.keys():
            temp = round(random.uniform(700.0, 750.0), 1)
            equipo_topic_name = equipment_name.replace(" ", "_")
            topic = settings.TOPIC_HISTORY_BASE.format(equipo=equipo_topic_name)
            
            payload = json.dumps({"timestamp": time.time(), "equipo": equipment_name, "temperatura": temp})
            
            client.publish(topic, payload, retain=True)
            print(f"  -> Publicado {payload} en '{topic}'")
        
        time.sleep(settings.HISTORY_INTERVAL_SECONDS)

def realtime_loop(client):
    """Bucle rápido: Publica datos para TODOS los equipos cada 2 segundos mientras esté activo."""
    while True:
        realtime_active.wait()
        
        print("--- Ciclo de TIEMPO REAL ---")
        # --- CAMBIO: Iteramos sobre el mapa de equipos ---
        for equipment_name in settings.EQUIPMENT_MAP.keys():
            temp = round(random.uniform(715.0, 735.0), 1)
            equipo_topic_name = equipment_name.replace(" ", "_")
            topic = settings.TOPIC_REALTIME_BASE.format(equipo=equipo_topic_name)
            
            payload = json.dumps({"timestamp": time.time(), "equipo": equipment_name, "temperatura": temp})
            
            client.publish(topic, payload, retain=False)
            print(f"  -> Publicado {payload} en '{topic}'")
        
        time.sleep(settings.REALTIME_INTERVAL_SECONDS)

# --- LÓGICA DE CONEXIÓN Y CONTROL MQTT (Sin cambios) ---

def on_connect(client, userdata, flags, reason_code, properties):
    if reason_code.value == 0:
        print("✅ Gateway SIMULADOR conectado exitosamente al Broker MQTT.")
        client.subscribe(settings.TOPIC_CONTROL)
        print(f"Suscrito al tópico de control: '{settings.TOPIC_CONTROL}'")
    else:
        print(f"❌ Fallo en la conexión del gateway: {reason_code}")

def on_message(client, userdata, msg):
    if msg.topic == settings.TOPIC_CONTROL:
        command = msg.payload.decode()
        print(f"\nComando recibido en '{settings.TOPIC_CONTROL}': {command}\n")
        
        if command == "START":
            print("▶️ Activando modo tiempo real...")
            realtime_active.set()
        elif command == "STOP":
            print("⏹️ Desactivando modo tiempo real...")
            realtime_active.clear()

# --- EJECUCIÓN PRINCIPAL (Sin cambios) ---
if __name__ == "__main__":
    client = mqtt.Client(mqtt.CallbackAPIVersion.VERSION2)
    client.username_pw_set(settings.MQTT_USER, settings.MQTT_PASSWORD)
    client.on_connect = on_connect
    client.on_message = on_message
    #client.tls_set(ca_certs=certifi.where(), tls_version=ssl.PROTOCOL_TLS)

    try:
        client.connect(settings.MQTT_BROKER_HOST, settings.MQTT_BROKER_PORT, 60)
    except Exception as e:
        print(f"Error al conectar con el broker: {e}")
        exit()

    history_thread = threading.Thread(target=publish_history_loop, args=(client,), daemon=True)
    realtime_thread = threading.Thread(target=realtime_loop, args=(client,), daemon=True)

    history_thread.start()
    realtime_thread.start()

    client.loop_forever()