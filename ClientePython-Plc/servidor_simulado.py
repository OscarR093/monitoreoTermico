import ctypes
import os

# Ruta donde se encuentra snap7.dll
dll_path = r"C:\Users\Dell\.conda\envs\pyPlc\Lib\site-packages\snap7\snap7.dll"

if not os.path.exists(dll_path):
    print(f"Error: DLL no encontrada en {dll_path}")
else:
    try:
        # Intenta cargar la DLL
        snap7_lib = ctypes.CDLL(dll_path)
        print(f"DLL de Snap7 cargada exitosamente desde: {dll_path}")

        # Opcional: Intenta llamar a una función muy básica si conoces alguna.
        # Por ejemplo, una función para obtener la versión del cliente si existiera.
        # Esto es solo para verificar que se puede llamar a una función.
        # Si no hay una función simple y segura, omite esta parte.
        # snap7_lib.S7_GetLastError.argtypes = []
        # snap7_lib.S7_GetLastError.restype = ctypes.c_int
        # error_code = snap7_lib.S7_GetLastError()
        # print(f"Código de último error (solo test): {error_code}")


        # Ahora intenta inicializar un servidor si la carga funcionó
        # Necesitas saber el tipo exacto del puntero S7Server y S7Object
        # Esto es más complejo, pero si la carga base fallara, lo sabríamos aquí.
        server_ptr = ctypes.c_void_p() # Placeholder para el puntero al servidor
        res = snap7_lib.S7_CreateServer() # Esto crearía el objeto servidor en la DLL
        print(f"Resultado de S7_CreateServer (esperamos un puntero o un código): {res}")

        if res != 0: # Si res es un puntero válido (no 0), significa que se creó
             print("Servidor S7 creado en la DLL.")
             # Si llegamos aquí, la DLL funciona. El problema es en register_area.
        else:
             print("Fallo al crear servidor S7 en la DLL (res es 0 o un código de error inesperado).")


    except OSError as e:
        print(f"Error cargando la DLL o interactuando: {e}")
        print("Posible problema con la DLL (corrupta, permisos, falta dependencia de VC++ runtime).")
    except Exception as e:
        print(f"Ocurrió un error inesperado: {e}")