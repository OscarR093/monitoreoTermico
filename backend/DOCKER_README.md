# Backend NestJS - Monitoreo Térmico

Backend migrado de Express a NestJS con todas las funcionalidades del backend original.

## 🚀 Despliegue con Docker

### Requisitos

- Docker Engine
- Docker Compose
- Archivo `.env` con las variables de entorno

### Variables de entorno

Crea un archivo `.env` en el directorio raíz con las siguientes variables:

```bash
MONGO_USER=devuser
MONGO_PASS=devpassword
MONGO_DB_NAME=monitoreoTermico
JWT_SECRET=fmex456ed_11032025_firstEd
MOSQUITTO_USER=admin
MOSQUITTO_PASS=public
EMQX_NODE_COOKIE=defaultcookie
SUPER_USER_USERNAME=admin
SUPER_USER_PASSWORD=admin123
DOMAIN_URL=monitoreo.local
LETSENCRYPT_EMAIL=correo@ejemplo.com
```

### Despliegue en modo desarrollo

```bash
# Construir y levantar los servicios
docker-compose up --build

# O en modo detached
docker-compose up --build -d
```

### Despliegue en modo producción

```bash
# Construir y levantar los servicios en producción
docker-compose -f docker-compose.prod.yml up --build

# O en modo detached
docker-compose -f docker-compose.prod.yml up --build -d
```

## 🏗️ Arquitectura

La imagen Docker incluye:

- **Backend NestJS**: API REST y WebSocket Gateway
- **Cliente MQTT**: Conexión al broker EMQX
- **Frontend build**: Archivos estáticos del frontend
- **Servicios adicionales**: MongoDB y EMQX broker

## 🔐 Configuración de seguridad

- Tokens JWT almacenados en cookies httpOnly
- Super usuario creado automáticamente si no existen usuarios
- Control de acceso basado en roles
- Registro automático de errores

## 📡 Comunicación

- Puerto 8420: API REST y WebSocket
- Puerto 1883: MQTT (EMQX)
- Puerto 18083: Dashboard EMQX
- Puerto 27017: MongoDB

## 🛠️ Carpetas

- `dist/`: Código compilado del backend NestJS
- `frontend_dist/`: Archivos estáticos del frontend
- `node_modules/`: Dependencias de Node.js

## 🔄 Actualización

Para actualizar la imagen:

```bash
# Descargar últimos cambios
git pull

# Reconstruir imagen
docker-compose build --no-cache

# Levantar servicios
docker-compose up -d
```

## 🐙 Docker Hub

La imagen está disponible en Docker Hub:

```bash
docker pull tu-usuario/monitoreo-termico-backend:latest
```