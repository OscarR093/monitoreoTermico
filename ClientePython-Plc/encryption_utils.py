# encryption_utils.py
import json
from cryptography.fernet import Fernet
import os

# --- Configuración de la clave ---
KEY_FILENAME = "filekey.key" # Nombre del archivo donde se guarda la clave

def load_key(filename=KEY_FILENAME):
    """Carga la clave Fernet desde el archivo."""
    try:
        with open(filename, "rb") as key_file:
            key = key_file.read()
        return key
    except FileNotFoundError:
        print(f"Error: El archivo de clave '{filename}' no se encontró. ¡Genera la clave primero!")
        return None

def encrypt_json_file(filepath, data, key):
    """Cifra un diccionario de Python y lo guarda como JSON cifrado."""
    if not key:
        print("Error de cifrado: Clave no disponible.")
        return False

    fernet = Fernet(key)
    json_bytes = json.dumps(data, indent=4).encode('utf-8') # Serializar y codificar a bytes
    encrypted_bytes = fernet.encrypt(json_bytes)

    with open(filepath, "wb") as f: # Guardar en modo binario
        f.write(encrypted_bytes)
    print(f"Archivo '{filepath}' cifrado y guardado.")
    return True

def decrypt_json_file(filepath, key):
    """Descifra un archivo JSON y lo carga como un diccionario de Python."""
    if not key:
        print("Error de descifrado: Clave no disponible.")
        return None

    fernet = Fernet(key)
    try:
        with open(filepath, "rb") as f: # Leer en modo binario
            encrypted_bytes = f.read()

        decrypted_bytes = fernet.decrypt(encrypted_bytes) # Aquí se verifica la integridad
        json_data = json.loads(decrypted_bytes.decode('utf-8')) # Decodificar y deserializar
        print(f"Archivo '{filepath}' descifrado y cargado.")
        return json_data
    except FileNotFoundError:
        print(f"Error: El archivo cifrado '{filepath}' no se encontró.")
        return None
    except Exception as e:
        print(f"Error al descifrar el archivo '{filepath}': {e}. ¡Posible clave incorrecta o archivo modificado/corrupto!")
        return None

# --- Función para generar la clave (ejecutar una vez) ---
def generate_and_save_key(filename=KEY_FILENAME):
    """Genera una clave Fernet y la guarda en un archivo."""
    key = Fernet.generate_key()
    with open(filename, "wb") as key_file:
        key_file.write(key)
    print(f"Clave generada y guardada en {filename}")

if __name__ == "__main__":
    # Si ejecutas este archivo directamente, generará la clave.
    # Asegúrate de ejecutarlo una vez antes de usar la aplicación principal.
    generate_and_save_key()
    print("\nEjemplo de uso de cifrado/descifrado:")
    encryption_key = load_key()
    if encryption_key:
        test_data = {"message": "Hello, encrypted world!", "value": 123}
        encrypt_json_file("test_config.enc", test_data, encryption_key)
        decrypted_test_data = decrypt_json_file("test_config.enc", encryption_key)
        if decrypted_test_data:
            print(f"Descifrado: {decrypted_test_data}")
        # os.remove("test_config.enc") # Descomentar para limpiar
    # os.remove(KEY_FILENAME) # Descomentar para limpiar