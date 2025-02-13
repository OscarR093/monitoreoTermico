import socket
import random
import time

# Configuración del servidor
HOST = '192.168.0.50'  # Dirección IP del Arduino simulado
PORT = 80              # Puerto usado por el servidor del Arduino

def generar_temperatura():
    """Generar una temperatura aleatoria entre 20°C y 100°C."""
    return round(random.uniform(20, 100), 2)

def iniciar_servidor():
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as server_socket:
        server_socket.bind((HOST, PORT))
        server_socket.listen(1)
        print(f"Servidor iniciado en {HOST}:{PORT}")
        
        while True:
            print("Esperando cliente...")
            client_socket, client_address = server_socket.accept()
            with client_socket:
                print(f"Conexión establecida con {client_address}")
                while True:
                    # Generar una temperatura aleatoria y enviarla
                    temperatura = generar_temperatura()
                    client_socket.sendall(f"{temperatura}\n".encode())
                    time.sleep(1)  # Simula el envío de datos cada segundo

if __name__ == "__main__":
    iniciar_servidor()
