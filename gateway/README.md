# Gateway del Sistema de Monitoreo Térmico

El gateway es una aplicación Python que actúa como intermediario entre el PLC industrial y el sistema IIoT. Lee datos de temperatura desde un PLC Siemens mediante el protocolo S7, y los envía al broker EMQX usando protocolo MQTT/MQTTS.

## 📋 Tabla de Contenidos

- [Descripción General](#descripción-general)
- [Tecnologías Utilizadas](#tecnologías-utilizadas)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Configuración del Entorno](#configuración-del-entorno)
- [Flujo de Operación](#flujo-de-operación)
- [Conexión al PLC](#conexión-al-plc)
- [Comunicación MQTT](#comunicación-mqtt)
- [Mensajes y Tópicos](#mensajes-y-tópicos)
- [Modos de Operación](#modos-de-operación)
- [Control Remoto](#control-remoto)
- [Instalación y Ejecución](#instalación-y-ejecución)
- [Configuración del Equipo](#configuración-del-equipo)

## 📝 Descripción General

El gateway es una aplicación Python que:

- Lee datos de temperatura desde un PLC industrial (Siemens S7)
- Se conecta al broker MQTT para enviar datos térmicos
- Opera en dos modos: tiempo real e histórico
- Responde a comandos de control remoto
- Maneja reconexiones automáticas y errores de comunicación

## ⚙️ Tecnologías Utilizadas

| Tecnología | Versión | Descripción |
|------------|---------|-------------|
| Python | 3.x | Lenguaje de programación principal |
| python-snap7 | 1.4.1 | Biblioteca para comunicarse con PLC Siemens |
| paho-mqtt | 2.1.0 | Cliente MQTT para comunicación con broker |
| python-dotenv | 1.1.1 | Gestión de variables de entorno |
| certifi | 2025.8.3 | Certificados SSL/TLS para conexiones seguras |

## 📁 Estructura del Proyecto

```
gateway/
├── gateway_plc.py          # Script principal del gateway
├── gateway_simulator.py    # Simulador para pruebas
├── plc_reader.py           # Clase para lectura del PLC
├── remote_control.py       # Interfaz de control remoto
├── settings.py             # Configuración del sistema
├── requirements.txt        # Dependencias Python
├── .env.example           # Variables de entorno de ejemplo
├── .env.production        # Variables para producción
└── gateway_plc.service    # Archivo de servicio systemd
```

## 🔧 Configuración del Entorno

### Variables de Entorno

| Variable | Descripción | Valor por defecto |
|----------|-------------|-------------------|
| `PLC_IP` | IP del PLC | 192.168.0.1 |
| `PLC_RACK` | Rack del PLC | 0 |
| `PLC_SLOT` | Slot del PLC | 1 |
| `PLC_DB_NUMBER` | Número de DB a leer | 1 |
| `PLC_DB_SIZE` | Tamaño del DB | 54 |
| `MQTT_BROKER_HOST` | Host del broker MQTT | localhost |
| `MQTT_BROKER_PORT` | Puerto del broker MQTT | 1883 |
| `MQTT_USER` | Usuario MQTT | '' |
| `MQTT_PASSWORD` | Contraseña MQTT | '' |
| `TOPIC_HISTORY_BASE` | Tópico base para histórico | plcTemperaturas/historial/{equipo} |
| `TOPIC_REALTIME_BASE` | Tópico base para tiempo real | plcTemperaturas/tiemporeal/{equipo} |
| `TOPIC_CONTROL` | Tópico de control | gatewayTemperaturas/control/tiemporeal |
| `HISTORY_INTERVAL_SECONDS` | Intervalo histórico (segundos) | 1200 (20 min) |
| `REALTIME_INTERVAL_SECONDS` | Intervalo tiempo real (segundos) | 2 |
| `MQTT_RECONNECT_MIN_DELAY` | Reintento MQTT mínimo (segundos) | 1 |
| `MQTT_RECONNECT_MAX_DELAY` | Reintento MQTT máximo (segundos) | 120 |
| `MQTT_CONNECTION_RETRIES` | Número de reintentos | 5 |

### Configuración de Equipos

El archivo `settings.py` define el mapeo de equipos que el gateway lee:

```python
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
```

Cada equipo tiene:
- `channel`: Canal del termopar
- `temp_offset`: Offset de DB donde está la temperatura
- `conn_offset`: Offset de DB donde está el estado de conexión

## 🔄 Flujo de Operación

El gateway opera en dos bucles paralelos:

1. **Bucle Histórico**: Lee y envía datos cada 20 minutos
2. **Bucle en Tiempo Real**: Lee y envía datos cada 2 segundos (cuando está activo)

### Diagrama de Flujo

```
Iniciar Gateway
    ↓
Conectar PLC → Conectar MQTT
    ↓
Iniciar hilos de lectura (histórico y tiempo real)
    ↓
Bucle histórico (constante)
    ↓
Bucle tiempo real (controlado por comando remoto)
    ↓
Recibir comandos de control
```

## 🔌 Conexión al PLC

### Protocolo de Comunicación

- **Protocolo**: S7 para comunicaciones con PLC Siemens
- **Biblioteca**: python-snap7
- **Conexión**: TCP/IP directa al PLC
- **Reconexión**: Automática si se pierde la conexión

### Lectura de Datos

El gateway lee un bloque de datos (DB) del PLC en formato binario:
- Temperaturas como valores reales (floats) en posiciones específicas
- Estados de conexión como booleanos
- El mapeo está definido en `EQUIPMENT_MAP` en el archivo de configuración

### Formato de Lectura

Cada lectura contiene:
- `equipo`: Nombre del equipo (según `EQUIPMENT_MAP`)
- `temperatura`: Valor de temperatura (°C, redondeado a 1 decimal)
- `conectado`: Estado de conexión del sensor

## 🌐 Comunicación MQTT

### Conexión al Broker

- **Protocolo**: MQTT 3.1.1 o 5.0
- **Seguridad**: Puede usar MQTTS (MQTT sobre TLS)
- **Autenticación**: Usuario y contraseña
- **Reconexión**: Automática con backoff exponencial

### Tópicos de Publicación

- **Histórico**: `plcTemperaturas/historial/{equipo}`
- **Tiempo Real**: `plcTemperaturas/tiemporeal/{equipo}`
- **Control**: `gatewayTemperaturas/control/tiemporeal` (solo suscripción)

### Formato de Mensajes

Todos los mensajes son JSON con la siguiente estructura:

```json
{
  "timestamp": 1634567890.123,
  "equipo": "Nombre del equipo",
  "temperatura": 25.6
}
```

## 📬 Mensajes y Tópicos

### Tópicos de Datos

- **Histórico**: `plcTemperaturas/historial/{equipo}`
  - Publicados cada 20 minutos (1200 segundos)
  - Mensajes con `retain=true` (mensaje retenido)
  - Para almacenamiento en base de datos

- **Tiempo Real**: `plcTemperaturas/tiemporeal/{equipo}`
  - Publicados cada 2 segundos cuando está activo
  - Mensajes con `retain=false`
  - Para visualización en tiempo real

### Tópico de Control

- **Control**: `gatewayTemperaturas/control/tiemporeal`
  - Suscrito por el gateway
  - Recibe comandos `START` y `STOP`

## 🎛️ Modos de Operación

### Modo Histórico

- **Frecuencia**: Cada 20 minutos (configurable)
- **Actividad**: Siempre activo
- **Destino**: Base de datos MongoDB
- **Mensaje**: Retenido en el broker

### Modo Tiempo Real

- **Frecuencia**: Cada 2 segundos (configurable)
- **Actividad**: Controlado remotamente
- **Destino**: WebSocket para frontend
- **Mensaje**: Publicado sin retención

## 🕹️ Control Remoto

### Comandos Disponibles

- **`START`**: Activa el modo tiempo real
- **`STOP`**: Desactiva el modo tiempo real

### Flujo de Control

1. El backend envía comandos al tópico `gatewayTemperaturas/control/tiemporeal`
2. El gateway recibe y procesa el comando
3. El gateway activa/desactiva el bucle de tiempo real según sea necesario
4. El sistema responde con cambios en la frecuencia de publicación

## 🚀 Instalación y Ejecución

### Requisitos del Sistema

- Python 3.7+
- Acceso al PLC Siemens (puertos S7 abiertos)
- Acceso al broker MQTT
- Sistema operativo compatible con python-snap7 (Linux, Windows, macOS)

### Instalación de Dependencias

```bash
pip install -r requirements.txt
```

### Configuración del Ambiente

```bash
# Copiar archivo de ejemplo
cp .env.example .env

# Editar variables de entorno
nano .env
```

### Ejecución Directa

```bash
# Ejecutar el gateway
python gateway_plc.py
```

### Ejecución como Servicio (Linux)

```bash
# Copiar archivo de servicio
sudo cp gateway_plc.service /etc/systemd/system/

# Recargar systemd
sudo systemctl daemon-reload

# Habilitar servicio
sudo systemctl enable gateway_plc

# Iniciar servicio
sudo systemctl start gateway_plc

# Verificar estado
sudo systemctl status gateway_plc
```

## ⚙️ Configuración del Equipo

### Variables del PLC

Asegúrese de que el PLC tenga configurado el DB con los offsets correctos:

- Temperaturas: Formato REAL (4 bytes) en posiciones específicas
- Estados de conexión: Formato BOOL (1 bit) en posiciones específicas

### Configuración de Red

- Asegurar conectividad con el PLC (firewall, puertos S7)
- Asegurar conectividad con el broker MQTT (puertos MQTT/MQTTS)
- Verificar configuración de DNS si se usan nombres de dominio

### Seguridad

- Usar credenciales seguras para MQTT
- Considerar el uso de MQTTS para conexiones externas
- Limitar acceso al puerto S7 del PLC a hosts confiables

## 🧪 Simulador de Pruebas

El archivo `gateway_simulator.py` permite probar la aplicación sin acceso a un PLC real:

- Genera datos térmicos simulados
- Permite probar la lógica de conexión MQTT
- Útil para desarrollo y pruebas

## 🔧 Solución de Problemas

### Problemas Comunes

- **No puede conectar al PLC**: Verificar IP, rack, slot y firewall
- **No puede conectar a MQTT**: Verificar credenciales y puerto
- **No envía datos**: Verificar mapeo de equipos y offsets
- **Errores de comunicación**: Revisar logs y reconexiones

### Logs

El gateway imprime mensajes detallados en consola:
- Conexiones exitosas/fallidas
- Datos leídos/enviados
- Errores de comunicación
- Comandos recibidos