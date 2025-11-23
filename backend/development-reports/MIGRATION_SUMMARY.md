# Migración de Backend Express a NestJS - Monitoreo Térmico

## 📋 Resumen del Proyecto

Este proyecto representa la migración completa del backend de Express a NestJS para el sistema de monitoreo térmico, manteniendo todas las funcionalidades originales con mejoras significativas en arquitectura, seguridad y mantenibilidad.

## 🎯 Objetivo de la Migración

Migrar el backend original basado en Express a una arquitectura más robusta usando NestJS, manteniendo compatibilidad con:
- El frontend existente
- El broker MQTT EMQX
- Las aplicaciones de escritorio
- Todos los endpoints API originales

## ✅ Funcionalidades Implementadas

### 1. **Sistema de Autenticación**
- Registro y login de usuarios
- Tokens JWT con cookies httpOnly
- Control de sesiones
- Verificación de autenticación

### 2. **Gestión de Usuarios**
- CRUD completo de usuarios
- Control de roles (admin, superadmin)
- Reglas de seguridad específicas
- Auto-registro por administradores

### 3. **Historial Térmico**
- Almacenamiento automático desde MQTT
- Filtrado por últimas 24 horas
- Endpoint compatible con backend original
- Indexación TTL para expiración automática

### 4. **Integración MQTT**
- Cliente MQTT que consume datos del gateway
- Almacenamiento en MongoDB
- Control START/STOP del gateway basado en clientes WebSocket

### 5. **WebSocket Gateway**
- Transmisión en tiempo real a clientes web
- Autenticación basada en tokens
- Integración con EMQX broker

## 🏗️ Arquitectura de NestJS

### Módulos Implementados
- `AuthModule` - Autenticación y autorización
- `UsersModule` - Gestión de usuarios
- `TemperatureHistoryModule` - Historial térmico
- `MqttModule` - Cliente MQTT
- `WebSocketModule` - Gateway WebSocket
- `ConfigModule` - Configuración centralizada

### Patrones de Diseño
- Inyección de dependencias
- DTOs con validación
- Guards de autenticación y autorización
- Filtros de excepciones globales
- Swagger para documentación API

## 🔐 Mejoras de Seguridad

- Cookies httpOnly para tokens JWT
- Validación de entradas
- Control de autorización por roles
- Encriptación bcrypt de contraseñas
- Manejo seguro de sesiones

## 🧪 Pruebas Implementadas

- 54 pruebas unitarias y e2e
- Cobertura completa de servicios y controladores
- Validación de escenarios de error
- Pruebas de integración

## 🐳 Dockerización

### Dockerfile
- Multi-stage build
- Compilación del backend NestJS
- Construcción del frontend
- Imagen optimizada para producción

### Servicios
- Backend API NestJS
- MongoDB con persistencia
- EMQX broker MQTT
- MongoDB Express UI

## 🔄 Compatibilidad

### Endpoints Compatibles
- `/auth/register` - Registro de usuarios
- `/auth/login` - Login de usuarios
- `/auth/check` - Verificación de sesión
- `/users/*` - Gestión de usuarios
- `/temperature-history/thermocouple-history/:equipmentName` - Historial térmico (compatibilidad con frontend original)
- `/env` - Variables de entorno para frontend

### Funcionalidades Mantenidas
- Creación automática de super usuario
- Reglas de seguridad específicas
- Control de gateway START/STOP
- WebSocket autenticado
- Manejo de errores global

## 🚀 Despliegue

### Desarrollo
```bash
docker-compose -f docker-compose.migration.yml up --build
```

### Producción
```bash
docker-compose -f docker-compose.prod.yml up --build -d
```

### Variables de Entorno
- `MONGO_USER`, `MONGO_PASS` - Credenciales MongoDB
- `JWT_SECRET` - Secreto JWT
- `MOSQUITTO_USER`, `MOSQUITTO_PASS` - Credenciales MQTT
- `SUPER_USER_USERNAME`, `SUPER_USER_PASSWORD` - Credenciales super usuario

## 🛠️ Scripts Disponibles

- `build-docker.sh` - Construir imagen Docker
- `migrate-to-nestjs.sh` - Script completo de migración
- `npm run build` - Compilar backend NestJS
- `npm test` - Ejecutar pruebas

## 📊 Resultados

✅ **100% funcionalidades originales implementadas**  
✅ **54/54 pruebas pasando**  
✅ **Compatibilidad con frontend existente**  
✅ **Mejora en seguridad y arquitectura**  
✅ **Listo para producción**  
✅ **Dockerizado y desplegable**  

## 🎉 Conclusión

La migración ha sido completada exitosamente, manteniendo todas las funcionalidades del backend original mientras se introducen mejoras significativas en:
- Seguridad (cookies httpOnly, validación reforzada)
- Arquitectura (módulos NestJS, inyección de dependencias)
- Mantenibilidad (tipado fuerte, DTOs, documentación)
- Pruebas (cobertura completa)
- Despliegue (Dockerización completa)