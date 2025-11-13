# Backend del Sistema de Monitoreo Térmico

El backend es una aplicación Node.js basada en Express que gestiona la lógica de negocio del sistema de monitoreo térmico. Se encarga de procesar los datos de temperatura recibidos del gateway PLC, gestionar la autenticación de usuarios y proporcionar una API REST para el frontend.

## 📋 Tabla de Contenidos

- [Arquitectura](#arquitectura)
- [Tecnologías Utilizadas](#tecnologías-utilizadas)
- [Estructura de Directorios](#estructura-de-directorios)
- [Configuración del Entorno](#configuración-del-entorno)
- [Endpoints API](#endpoints-api)
- [WebSocket Real-time](#websocket-real-time)
- [Gestión de Usuarios](#gestión-de-usuarios)
- [Modelos de Datos](#modelos-de-datos)
- [Variables de Entorno](#variables-de-entorno)
- [Instalación y Ejecución](#instalación-y-ejecución)

## 🏗️ Arquitectura

El backend sigue una arquitectura modular donde cada componente tiene responsabilidades bien definidas:

- **Servidor Express**: Gestión de rutas HTTP y middleware
- **WebSocket Server**: Comunicación bidireccional en tiempo real con frontend
- **Cliente MQTT**: Conexión con el broker EMQX para recibir datos térmicos
- **Repositorio de Usuarios**: Lógica de negocio relacionada con usuarios
- **Modelos de Datos**: Esquemas y operaciones para MongoDB
- **Base de Datos**: MongoDB para almacenamiento persistente

## ⚙️ Tecnologías Utilizadas

| Tecnología | Versión | Descripción |
|------------|---------|-------------|
| Node.js | 18+ | Runtime para JavaScript |
| Express | Latest | Framework web |
| ws | Latest | WebSocket para comunicación real-time |
| MQTT.js | Latest | Cliente MQTT para conexión con EMQX |
| MongoDB | 7.0 | Base de datos NoSQL |
| Mongoose | Latest | ODM para MongoDB |
| JSON Web Token | Latest | Autenticación y autorización |
| Bcrypt | Latest | Hashing de contraseñas |
| Cookie Parser | Latest | Manejo de cookies HTTP |

## 📁 Estructura de Directorios

```
backend/
├── index.js              # Punto de entrada principal
├── config.js             # Configuración del entorno
├── websocketServer.js    # Servidor WebSocket y cliente MQTT
├── user-repository.js    # Lógica de negocio de usuarios
├── db/                   # Conexión a base de datos
│   └── db.js             # Configuración de conexión MongoDB
├── models/               # Modelos de datos
│   ├── user-model.js     # Modelo de usuario
│   └── thermocouple-history.js # Modelo de datos térmicos
└── package.json          # Dependencias y scripts
```

## 🔧 Configuración del Entorno

El backend se configura principalmente a través de variables de entorno definidas en el archivo `.env`:

### Variables Requeridas

- `MONGODB_URI`: URI de conexión a MongoDB
- `JWT_SECRET`: Secreto para firmar tokens JWT
- `MQTT_BROKER_URL`: URL del broker MQTT
- `MQTT_USER`: Usuario para autenticación MQTT
- `MQTT_PASS`: Contraseña para autenticación MQTT
- `PORT`: Puerto en el que escucha el servidor (por defecto 3000)
- `DOMAIN_URL`: Dominio del sistema (para WebSocket)
- `NODE_ENV`: Entorno (production/development)
- `SUPER_USER_USERNAME`: Nombre de usuario para el super admin
- `SUPER_USER_PASSWORD`: Contraseña para el super admin

## 🌐 Endpoints API

El backend expone una API REST protegida con tokens JWT para autenticación:

### Autenticación

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/login` | Iniciar sesión de usuario |
| POST | `/api/logout` | Cerrar sesión de usuario |
| GET | `/api/auth/check` | Verificar autenticación |

### Usuarios

| Método | Endpoint | Descripción | Requiere Admin |
|--------|----------|-------------|----------------|
| GET | `/api/users` | Listar todos los usuarios | ✅ |
| GET | `/api/users/:id` | Obtener usuario específico | ✅ |
| PUT | `/api/users/:id` | Actualizar usuario | ❌ (propio) / ✅ (otros) |
| DELETE | `/api/users/:id` | Eliminar usuario | ✅ |
| POST | `/api/register` | Crear nuevo usuario | ✅ |

### Datos Térmicos

| Método | Endpoint | Descripción | Requiere Autenticación |
|--------|----------|-------------|----------------------|
| GET | `/api/thermocouple-history/:nombre` | Obtener datos históricos de temperatura | ✅ |

### Otros Endpoints

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/env` | Obtener variables de entorno |
| POST | `/protected` | Ruta protegida |

## 🔌 WebSocket Real-time

El sistema utiliza WebSockets para enviar datos en tiempo real desde el gateway al frontend:

### Características

- **Protocolo**: WebSocket seguro (WSS en producción)
- **Autenticación**: Requiere token JWT en cookies
- **Flujo de datos**: Mensajes MQTT se retransmiten a clientes WebSocket

### Flujo de Mensajes

1. El gateway envía datos térmicos al broker EMQX
2. El backend se suscribe a los tópicos MQTT relevantes
3. Al recibir mensajes, los retransmite a todos los clientes WebSocket conectados
4. El frontend recibe y visualiza los datos en tiempo real

### Comandos de Control

El backend puede enviar comandos al gateway a través del tópico `gatewayTemperaturas/control/tiemporeal`:
- `START`: Iniciar envío de datos en tiempo real
- `STOP`: Detener envío de datos en tiempo real

## 👥 Gestión de Usuarios

El sistema incluye un modelo de permisos jerárquico con diferentes roles:

### Roles de Usuario

- **Usuario Normal**: Acceso a datos y configuración básica
- **Administrador**: Gestión de usuarios (excepto super admins)
- **Super Administrador**: Acceso total al sistema

### Características del Modelo

- Contraseñas almacenadas con hashing bcrypt
- Tokens JWT con expiración de 1 hora
- Soporte para cambio de contraseña obligatorio
- Validaciones de seguridad para campos

### Reglas de Seguridad

- Solo admins pueden registrar nuevos usuarios
- Solo super admins pueden eliminar otros admins
- Los usuarios pueden actualizarse a sí mismos
- El super admin no puede ser eliminado

## 📊 Modelos de Datos

### Usuario (User)

```javascript
{
  username: String,
  password: String, // hash bcrypt
  fullName: String,
  email: String,
  admin: Boolean, // default: false
  isSuperAdmin: Boolean, // default: false
  cellPhone: String,
  mustChangePassword: Boolean // default: true
}
```

### Historial Térmico (Thermocouple History)

Modelo dinámico que crea colecciones para cada equipo:
- Nombre de colección: `{nombreEquipo}_history`
- Campos: `timestamp`, `temperatura`, `equipo`

## 🌍 Variables de Entorno

| Variable | Descripción | Valor por defecto |
|----------|-------------|-------------------|
| `MONGODB_URI` | Conexión a MongoDB | mongodb://localhost:27017/monitoreoTermico |
| `JWT_SECRET` | Secreto para JWT | mysecretkey |
| `MQTT_BROKER_URL` | URL del broker MQTT | mqtt://localhost:1883 |
| `MQTT_USER` | Usuario MQTT | '' |
| `MQTT_PASS` | Contraseña MQTT | '' |
| `PORT` | Puerto del servidor | 3000 |
| `NODE_ENV` | Entorno | development |
| `SALT_ROUNDS` | Rounds bcrypt | 10 |

## 🚀 Instalación y Ejecución

### Requisitos

- Node.js 18+
- MongoDB
- Broker MQTT (EMQX recomendado)

### Instalación

```bash
# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con configuración real
```

### Ejecución

```bash
# En modo desarrollo
npm run dev

# En modo producción
npm start
```

## 🔐 Seguridad

- Validación de entrada en todos los endpoints
- Tokens JWT con expiración
- Cookies HTTPOnly para tokens
- Autenticación WebSocket con tokens
- Protección contra inyección (validación Mongoose)
- Contraseñas con hash bcrypt

## 📈 Monitoreo y Logging

- Manejo de errores global con stack traces
- Logging detallado de conexiones WebSocket
- Validación de tokens JWT
- Health checks de servicios externos