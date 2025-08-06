import snap7
from snap7.util import get_real, get_bool
from os import system, name
from time import sleep

# 👉 CONFIGURACIÓN
PLC_IP = '192.168.0.1'  # Reemplaza con la IP de tu PLC
RACK = 0
SLOT = 1
DB_NUMBER = 1           # Número de tu DB_Temperaturas
DB_SIZE = 47           # Tamaño total en bytes del DB (puedes ajustarlo)

# 👉 FUNCIONES

def limpiar_consola():
    if name == 'nt':
        system('cls')  # Windows
    else:
        system('clear')  # Unix/Linux/Mac

def leer_temperaturas(data):
    for i in range(8):
        temp_offset = i * 6  # REAL: 4 bytes, +2 bytes de espacio entre cada uno
        conn_offset = temp_offset + 4
        conectado = get_bool(data, conn_offset, 0)

        if conectado:
            temp = get_real(data, temp_offset)
            print(f"Termopar {i+1}: {temp:.1f} °C")
        else:
            print(f"⚠️  Termopar {i+1} no está conectado")

# 👉 MAIN LOOP

client = snap7.client.Client()
client.connect(PLC_IP, RACK, SLOT)

try:
    while True:
        data = client.db_read(DB_NUMBER, 0, DB_SIZE)
        limpiar_consola()
        print("=== Temperaturas actuales ===\n")
        leer_temperaturas(data)
        sleep(1)

except KeyboardInterrupt:
    print("\nCerrando conexión...")
    client.disconnect()
