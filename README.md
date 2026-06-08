# Sistema de Monitoreo Térmico Industrial (IIoT) 🌡️

Sistema de monitoreo térmico en tiempo real para la industria manufacturera, especialmente diseñado para el control de procesos térmicos en plantas como FAGOR EDERLAN MEXICO. El sistema captura datos de temperatura desde sensores de termopares conectados a un PLC, procesa la información y proporciona interfaces para visualización, análisis y control.

## 📋 Tabla de Contenidos

- [Descripción General](#descripción-general)
- [Arquitectura del Sistema](#arquitectura-del-sistema)
- [Tecnologías Utilizadas](#tecnologías-utilizadas)
- [Flujo de Datos](#flujo-de-datos)
- [Despliegue en Producción](#despliegue-en-producción)
- [Configuración del Entorno](#configuración-del-entorno)
- [Configuración de Docker Compose Producción](#configuración-de-docker-compose-producción)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Licencia](#licencia)

## 📝 Descripción General

El sistema de monitoreo térmico es una aplicación completa de Internet Industrial de las Cosas (IIoT) que permite:

- **Lectura en tiempo real**: Captura de datos de temperatura cada 2 segundos desde sensores conectados a un PLC
- **Almacenamiento histórico**: Datos guardados cada 20 minutos en base de datos MongoDB para análisis
- **Visualización en tiempo real**: Interfaz web con actualización instantánea de temperaturas
- **Control remoto**: Activación y desactivación del flujo de datos térmicos
- **Autenticación y autorización**: Sistema de usuarios con roles de administrador
- **Seguridad SSL/TLS**: Comunicación cifrada mediante MQTTS y HTTPS

El sistema está diseñado para operar en entornos industriales con requisitos de alta disponibilidad y seguridad, permitiendo el monitoreo continuo de procesos térmicos críticos.

## 🏗️ Arquitectura del Sistema

La arquitectura del sistema se compone de los siguientes componentes:

```
[Sensores Termopares] → [PLC] → [Gateway Python] → [MQTTS Broker EMQX] → [Node.js Backend] → [MongoDB] → [Frontend React]
```

### Componentes Principales:

- **Gateway (Python)**: Interfaz entre el PLC y el sistema IIoT, lectura de datos de termopares
- **Broker EMQX**: Gestión de mensajes MQTT con soporte para MQTTS (SSL/TLS)
- **Backend Node.js**: Procesamiento de datos, autenticación JWT y WebSocket real-time
- **Base de Datos MongoDB**: Almacenamiento de datos históricos de temperatura
- **Frontend React**: Interfaz de usuario web moderna con visualización en tiempo real
- **Traefik**: Proxy inverso con certificados SSL Let's Encrypt

## ⚙️ Tecnologías Utilizadas

| Componente | Tecnología | Versión |
|------------|------------|---------|
| Frontend | React + Vite | Moderno |
| Backend | **NestJS** (TypeScript) | **v10** |
| WebSockets | ws (nativo) | Latest |
| Base de Datos | MongoDB Community Server | 7.0 |
| Broker Mensajes | EMQX | 5.7.0 |
| Gateway | Python + Snap7 | 3.x |
| Despliegue | Docker, Docker Compose | Latest |
| Proxy Inverso | Traefik | **v3.6** |
| Protocolo Comunicación | MQTT/MQTTS | Standard |
| Alertas | Telegram Bot API | Latest |

## 🆕 Novedades v3.0

### Migración a NestJS

La versión 3.0 representa una **migración completa del backend** de Express a NestJS, manteniendo 100% de compatibilidad con el frontend existente mientras se introducen mejoras significativas:

**Mejoras de Arquitectura:**
- ✅ **Inyección de dependencias** - Código más modular y testeable
- ✅ **DTOs con validación** - Validación automática de datos de entrada
- ✅ **Guards de autenticación** - Control de acceso robusto
- ✅ **Tipado fuerte** - TypeScript en todo el backend
- ✅ **Documentación Swagger** - API autodocumentada

**Mejoras de Seguridad:**
- 🔐 Cookies httpOnly para tokens JWT
- 🔐 Validación de entradas con class-validator
- 🔐 Control de autorización por roles mejorado
- 🔐 Manejo seguro de sesiones

**Sistema de Alertas por Telegram:**
- 📱 Notificaciones push cuando temperaturas salen de rango
- 📱 Configuración YAML para rangos por equipo
- 📱 Alertas efímeras (no se guardan en BD)
- 📱 Cooldown automático basado en intervalo de guardado

**Optimizaciones Móviles:**
- 📱 Filtros de tiempo (6h, 12h, 24h) en gráficas
- 📱 Sampling automático de datos en móvil
- 📱 Pinch zoom y gestos táctiles mejorados
- 📱 UI adaptativa para pantallas pequeñas

**Calidad de Código:**
- ✅ 45+ pruebas unitarias pasando
- ✅ Cobertura completa de servicios y controladores
- ✅ Integración continua lista
- ✅ Código mantenible y escalable

## 🔄 Flujo de Datos

El sistema opera en tres modos principales:

1. **Tiempo Real**: Datos leídos cada 2 segundos y retransmitidos vía WebSocket para visualización instantánea
2. **Histórico**: Datos almacenados cada 20 minutos en MongoDB para análisis posterior
3. **Control**: Comandos de activación/desactivación enviados desde el backend al gateway

El flujo comienza con la lectura de sensores en el PLC, pasa por el gateway Python que envía la información al broker EMQX mediante MQTTS, donde el backend Node.js procesa los datos y los distribuye según sea necesario.

## 🚀 Despliegue en Producción

### Requisitos del Sistema

- Servidor o VPS (Ubuntu 22.04 o similar) con IP pública y acceso sudo
- Nombre de dominio configurado en DNS apuntando a la IP del servidor
- Acceso a repositorio privado en GitHub y imagen en Docker Hub
- Git, Docker y Docker Compose instalados

## 🔧 Configuración del Entorno

### Variables de Entorno

Copia y completa el archivo `.env` con tus credenciales:

```bash
cp .env.example .env
```

**Parámetros requeridos:**

- `DOMAIN_URL`: Dominio del sistema (ej. midominio.com)
- `LETSENCRYPT_EMAIL`: Email para certificados SSL
- `MONGO_USER` / `MONGO_PASS`: Credenciales MongoDB
- `MOSQUITTO_USER` / `MOSQUITTO_PASS`: Credenciales EMQX
- `JWT_SECRET`: Secreto para tokens JWT (cadena segura)
- `EMQX_NODE_COOKIE`: Clave para comunicación entre nodos EMQX
- `SUPER_USER_USERNAME` / `SUPER_USER_PASSWORD`: Credenciales de super usuario
- `TELEGRAM_BOT_TOKEN`: Token del bot de Telegram para alertas (opcional)
- `TELEGRAM_CHANNEL_ID`: ID del canal de Telegram (opcional)

### Estructura de Archivos .env

El proyecto utiliza **un único archivo `.env` en la raíz** para toda la configuración:

```
monitoreoTermico/
├── .env                    ← Archivo principal (backend + docker-compose)
├── .env.example           ← Plantilla con todas las variables
├── backend/
│   └── (NO .env aquí)     ← El backend usa el .env de la raíz
└── gateway/
    └── .env               ← Configuración específica del gateway (separada)
```

**Importante:**
- El backend **NO** debe tener su propio `.env`
- En desarrollo, el backend lee el `.env` de la raíz
- En producción, Docker Compose pasa las variables desde el `.env` de la raíz
- El gateway sí tiene su propio `.env` porque se ejecuta en un entorno diferente

### Preparación del Despliegue

1. **Clonar el repositorio:**
   ```bash
   git clone git@github.com:OscarR093/monitoreoTermico.git
   cd monitoreoTermico
   ```

2. **Configurar entorno:**
   ```
   cp .env.example .env
   # Editar .env con credenciales reales
   ```

3. **Preparar volúmenes para Traefik:**
   ```bash
   mkdir traefik-data
   touch traefik-data/acme.json
   chmod 600 traefik-data/acme.json
   ```

4. **Iniciar sesión en Docker Hub:**
   ```bash
   docker login
   ```

5. **Levantar servicios:**
   ```bash
   docker compose -f docker-compose.prod.yml up -d
   ```

### Verificación

- Verificar contenedores: `docker ps`
- Revisar logs de Traefik: `docker logs mi-traefik-proxy`
- Acceder a la aplicación: `https://<TU_DOMINIO>`

## 📦 Configuración de Docker Compose Producción

El archivo `docker-compose.prod.yml` define la configuración de producción con los siguientes servicios:

```yaml
services:
  # ----------------------------------------------------
  # Traefik (Manejando HTTPS y MQTTS)
  # ----------------------------------------------------
  traefik:
    image: traefik:v3.6
    container_name: mi-traefik-proxy
    restart: unless-stopped
    command:
      - "--providers.docker=true"
      - "--providers.docker.exposedbydefault=false"
      - "--entrypoints.web.address=:80"
      - "--entrypoints.websecure.address=:443"
      - "--entrypoints.mqtts.address=:8883"
      - "--certificatesresolvers.letsencrypt.acme.email=${LETSENCRYPT_EMAIL}"
      - "--certificatesresolvers.letsencrypt.acme.storage=/data/acme.json"
      - "--certificatesresolvers.letsencrypt.acme.httpchallenge.entrypoint=web"
      - "--entrypoints.web.http.redirections.entrypoint.to=websecure"
      - "--entrypoints.web.http.redirections.entrypoint.scheme=https"
    ports:
      - "80:80"
      - "443:443"
      - "8883:8883"
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock:ro
      - ./traefik-data:/data
    networks:
      - mi-red

  # ----------------------------------------------------
  # Aplicación Node.js (NestJS v3.0)
  # ----------------------------------------------------
  node-app:
    image: oscarr093/monitoreotermico:3.0
    container_name: mi-aplicacion-nodejs
    restart: unless-stopped
    depends_on:
      mongodb:
        condition: service_healthy
    environment:
      - MONGODB_URI=mongodb://${MONGO_USER}:${MONGO_PASS}@mongodb:27017/${MONGO_DB_NAME}?authSource=admin
      - MQTT_BROKER_URL=mqtt://emqx
      - MQTT_USER=${MOSQUITTO_USER}
      - MQTT_PASS=${MOSQUITTO_PASS}
      - JWT_SECRET=${JWT_SECRET}
      - DOMAIN_URL=${DOMAIN_URL}
      - NODE_ENV=production
      - SUPER_USER_USERNAME=${SUPER_USER_USERNAME}
      - SUPER_USER_PASSWORD=${SUPER_USER_PASSWORD}
    networks:
      - mi-red
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.node-app.rule=Host(`${DOMAIN_URL}`)"
      - "traefik.http.routers.node-app.entrypoints=websecure"
      - "traefik.http.routers.node-app.tls.certresolver=letsencrypt"
      - "traefik.http.services.node-app.loadbalancer.server.port=8420"

  # ----------------------------------------------------
  # Base de Datos MongoDB (sin cambios)
  # ----------------------------------------------------
  mongodb:
    image: mongodb/mongodb-community-server:7.0-ubi8
    container_name: mi-database-mongo
    restart: unless-stopped
    environment:
      - MONGO_INITDB_ROOT_USERNAME=${MONGO_USER}
      - MONGO_INITDB_ROOT_PASSWORD=${MONGO_PASS}
    volumes:
      - datos-mongo:/data/db
    networks:
      - mi-red
    healthcheck:
      test: ["CMD", "mongosh", "--quiet", "--eval", "db.runCommand('ping').ok"]
      interval: 10s
      timeout: 5s
      retries: 5
      start_period: 30s

  # ----------------------------------------------------
  # Broker EMQX (Corregido)
  # ----------------------------------------------------
  emqx:
    image: emqx/emqx:5.7.0
    container_name: mi-broker-emqx
    restart: unless-stopped
    environment:
      - "EMQX_LISTENERS__TCP__DEFAULT__BIND=1883"
      - "EMQX_AUTH__USER__1__USERNAME=${MOSQUITTO_USER}"
      - "EMQX_AUTH__USER__1__PASSWORD=${MOSQUITTO_PASS}"
      - "EMQX_NODE__COOKIE=${EMQX_NODE_COOKIE}"
    ports:
      - "1883:1883" # Opcional, para pruebas en la red local sin SSL
      - "18083:18083" # Dashboard de EMQX
    networks:
      - mi-red
    labels:
      - "traefik.enable=true"
      # --- ✅ Corrección: Usar el dominio definido en DOMAIN_URL ---
      - "traefik.tcp.routers.emqx-secure.rule=HostSNI(`${DOMAIN_URL}`)"
      - "traefik.tcp.routers.emqx-secure.entrypoints=mqtts"
      - "traefik.tcp.routers.emqx-secure.tls.certresolver=letsencrypt"
      - "traefik.tcp.services.emqx-secure.loadbalancer.server.port=1883"

networks:
  mi-red:
    external: true
    name: monitoreotermico_mi-red

volumes:
  datos-mongo: {}
```

La configuración incluye:

- **Traefik**: Proxy inverso con soporte para HTTPS y MQTTS, gestión automática de certificados SSL Let's Encrypt
- **Node App**: Aplicación principal que procesa datos térmicos y gestiona autenticación
- **MongoDB**: Base de datos para almacenamiento de datos históricos con health check
- **EMQX**: Broker MQTT con autenticación y soporte para conexiones seguras MQTTS

## 🔌 Configuración del Gateway (PLC)

El gateway Python requiere un archivo `.env` en la carpeta `gateway/` con la siguiente configuración:

```ini
# Configuración del PLC
PLC_IP=192.168.0.1
PLC_RACK=0
PLC_SLOT=1
PLC_DB_NUMBER=1
PLC_DB_SIZE=54

# Configuración MQTT
MQTT_BROKER_HOST=tudominio.com
MQTT_BROKER_PORT=8883
MQTT_USER=usuario
MQTT_PASSWORD=contraseña

# Tópicos MQTT
TOPIC_HISTORY_BASE=plcTemperaturas/historial/{equipo}
TOPIC_REALTIME_BASE=plcTemperaturas/tiemporeal/{equipo}
TOPIC_CONTROL=gatewayTemperaturas/control/tiemporeal

# Intervalos de tiempo
HISTORY_INTERVAL_SECONDS=1200
REALTIME_INTERVAL_SECONDS=2

# Reintentos MQTT
MQTT_RECONNECT_MIN_DELAY=1
MQTT_RECONNECT_MAX_DELAY=120
MQTT_CONNECTION_RETRIES=5
```

## 📁 Estructura del Proyecto

```
monitoreoTermico/
├── backend/                # Servidor Node.js (Express + WebSocket)
├── frontend/               # Aplicación React
├── gateway/                # Gateway Python para conexión PLC
├── diagrams/               # Diagramas del sistema
├── docker-compose.prod.yml # Configuración de producción Docker
├── .env.example           # Variables de entorno de ejemplo
├── README.md              # Documentación principal
└── LICENSE.md             # Licencia de uso restringido
```

## 📜 Licencia

Este proyecto está protegido por una **Licencia de Uso Restringido**.  
Se autoriza únicamente a **FAGOR EDERLAN MEXICO** a ejecutar este software en sus instalaciones.  

El uso, distribución o implementación en otras plantas, filiales o localizaciones sin autorización expresa del autor está estrictamente prohibido.  
Consulta el archivo [LICENSE.md](./LICENSE.md) para más detalles.

## 📞 Contacto

- **Autor**: Oscar Rosales (Oscarr093)
- **GitHub**: [OscarR093](https://github.com/OscarR093)
- **Email**: oscar0931996@gmail.com