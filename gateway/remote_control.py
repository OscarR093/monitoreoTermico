# remote_control.py

import paho.mqtt.client as mqtt
import ssl
import certifi
import settings

# --- SCRIPT PARA ENVIAR COMANDOS START/STOP ---

def send_command(command):
    """Conecta, envía un comando y se desconecta."""
    
    client = mqtt.Client(mqtt.CallbackAPIVersion.VERSION2)
    client.username_pw_set(settings.MQTT_USER, settings.MQTT_PASSWORD)
    client.tls_set(ca_certs=certifi.where(), tls_version=ssl.PROTOCOL_TLS)

    try:
        client.connect(settings.MQTT_BROKER_HOST, settings.MQTT_BROKER_PORT, 60)
        client.loop_start()
        
        # Publica el comando en el tópico de control
        result = client.publish(settings.TOPIC_CONTROL, payload=command, retain=False)
        result.wait_for_publish() # Espera a que se envíe
        
        if result.rc == mqtt.MQTT_ERR_SUCCESS:
            print(f"Comando '{command}' enviado exitosamente al topic '{settings.TOPIC_CONTROL}'.")
        else:
            print(f"Error al enviar el comando.")
            
        client.loop_stop()
        client.disconnect()
        
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    while True:
        cmd = input("Introduce el comando (START o STOP), o 'exit' para salir: ").upper()
        if cmd in ["START", "STOP"]:
            send_command(cmd)
        elif cmd == "EXIT":
            break
        else:
            print("Comando no válido. Inténtalo de nuevo.")