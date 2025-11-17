# Backend de Monitoreo Térmico

Sistema backend para la aplicación de monitoreo térmico con funcionalidades completas de autenticación, gestión de usuarios, historial de temperaturas y comunicación en tiempo real.

## Características

- **Autenticación JWT**: Sistema completo de login y registro de usuarios
- **Gestión de usuarios**: CRUD completo para la administración de usuarios
- **Historial de temperaturas**: Almacenamiento automático con expiración de 30 días
- **Comunicación en tiempo real**: WebSocket Gateway para datos de temperatura en vivo
- **Conexión MQTT**: Integración con broker EMQX para comunicación con gateways PLC
- **Seguridad robusta**: Encriptación de contraseñas con bcrypt y tokens JWT
- **Documentación API**: Swagger integrado para documentación interactiva
- **Validación de configuración**: Sistema centralizado de configuración con validación
- **Pruebas unitarias**: Cobertura completa de pruebas para servicios y controladores
- **Validación de datos**: Validación completa de entrada con class-validator
- **Gestión de roles**: Soporte para roles de usuario (admin, superadmin)
- **Seguridad de contraseñas**: Filtros automáticos para evitar exposición de contraseñas

## Tecnologías usadas

- **NestJS**: Framework principal de backend
- **TypeScript**: Lenguaje de programación
- **MongoDB**: Base de datos NoSQL
- **Mongoose**: ODM para MongoDB
- **Passport**: Autenticación
- **Socket.IO**: WebSocket para comunicación en tiempo real
- **MQTT.js**: Cliente MQTT para comunicación con EMQX
- **Swagger**: Documentación de API
- **Jest**: Pruebas unitarias

## Estructura del proyecto

```
src/
├── auth/              # Módulo de autenticación
│   ├── dto/           # DTOs para login y registro
│   ├── auth.module.ts
│   ├── auth.service.ts
│   ├── auth.controller.ts
│   └── jwt.strategy.ts
├── users/             # Módulo de usuarios
│   ├── dto/           # DTOs para creación, actualización y lectura de usuarios
│   ├── schemas/       # Esquemas de Mongoose
│   ├── users.module.ts
│   ├── users.service.ts
│   └── users.controller.ts
├── temperature-history/ # Módulo de historial de temperaturas
│   ├── dto/           # DTOs para consultas de historial
│   ├── schemas/       # Esquemas de Mongoose
│   ├── temperature-history.module.ts
│   ├── temperature-history.service.ts
│   └── temperature-history.controller.ts
├── mqtt/              # Módulo de conexión MQTT
│   ├── mqtt.module.ts
│   └── mqtt-consumer.service.ts
├── websocket/         # Módulo de comunicación en tiempo real
│   ├── websocket.module.ts
│   └── websocket.gateway.ts
├── config/            # Configuración centralizada
│   ├── config.module.ts
│   ├── configuration.ts
│   └── validation.ts
└── app.module.ts      # Módulo principal
```

## Prerrequisitos

- Node.js 16.x o superior
- MongoDB
- EMQX Broker (para comunicación MQTT)
- npm o yarn

## Instalación

1. Clonar el repositorio
```bash
git clone <url-del-repositorio>
cd <nombre-del-repositorio>
```

2. Instalar dependencias
```bash
npm install
```

3. Configurar variables de entorno
```bash
cp .env.example .env
```

4. Editar el archivo `.env` con tus propias configuraciones

## Variables de entorno

- `DOMAIN_URL`: URL del dominio (por defecto: localhost)
- `MONGO_USER`: Usuario de MongoDB
- `MONGO_PASS`: Contraseña de MongoDB
- `MONGO_DB_NAME`: Nombre de la base de datos (por defecto: monitoreoTermico)
- `MONGO_PORT`: Puerto de MongoDB (por defecto: 27017)
- `MOSQUITTO_USER`: Usuario del broker MQTT (por defecto: admin)
- `MOSQUITTO_PASS`: Contraseña del broker MQTT (por defecto: public)
- `EMQX_NODE_COOKIE`: Cookie para clúster de EMQX
- `JWT_SECRET`: Secreto para JWT
- `JWT_EXPIRES_IN`: Tiempo de expiración de JWT (por defecto: 3600s)
- `BCRYPT_SALT_ROUNDS`: Número de rondas para encriptación bcrypt (por defecto: 10)
- `NODE_ENV`: Entorno de ejecución (production, development, test)
- `PORT`: Puerto de la aplicación (por defecto: 3000)

## Iniciar la aplicación

### Desarrollo
```bash
npm run start:dev
```

### Producción
```bash
npm run build
npm run start:prod
```

## Endpoints de autenticación

### Registro de usuario
- `POST /auth/register`
- Campos requeridos: `username`, `password`
- Campos opcionales: `email`, `fullName`, `cellPhone`

### Login de usuario
- `POST /auth/login`
- Campos requeridos: `username`, `password`
- Retorna JWT token

## Endpoints de usuarios

### Gestión de usuarios (CRUD completo)

#### Crear usuario
- `POST /users`
- Campos requeridos: `username`, `password`
- Campos opcionales: `email`, `fullName`, `cellPhone`
- Retorna: El usuario creado (sin contraseña)

#### Listar usuarios
- `GET /users`
- Retorna: Array de usuarios (sin contraseñas)

#### Obtener usuario por ID
- `GET /users/:id`
- Retorna: Usuario específico (sin contraseña)

#### Actualizar usuario
- `PATCH /users/:id`
- Campos actualizables: `username`, `password`, `email`, `fullName`, `cellPhone`, `admin`, `isSuperAdmin`, `mustChangePassword`
- Valida unicidad de username y email
- Retorna: Usuario actualizado (sin contraseña)

#### Eliminar usuario
- `DELETE /users/:id`
- Retorna: Código 204 sin contenido

## Endpoints de historial de temperaturas

### Consulta de historial

#### Consultar historial general
- `GET /temperature-history`
- Parámetros: `equipment`, `limit`, `sort`
- Retorna: Array de registros de temperatura

#### Filtrar historial
- `GET /temperature-history/filter`
- Parámetros: `equipment`, `startDate`, `endDate`, `minTemperature`, `maxTemperature`, `limit`
- Retorna: Array de registros filtrados

#### Consultar historial por equipo
- `GET /temperature-history/equipment/:equipmentName`
- Parámetros: `limit`
- Retorna: Array de registros para un equipo específico

#### Endpoint de compatibilidad (frontend)
- `GET /temperature-history/thermocouple-history/:equipmentName`
- Parámetros: `limit`
- Retorna: Array de registros para compatibilidad con frontend existente

#### Listar equipos
- `GET /temperature-history/equipment-list`
- Retorna: Array de nombres de equipos únicos

#### Estadísticas de equipo
- `GET /temperature-history/equipment/:equipmentName/stats`
- Retorna: Estadísticas (conteo, promedio, min, max, última lectura) para un equipo específico

## WebSocket y comunicación en tiempo real

### Eventos WebSocket disponibles

#### Conexión
- El gateway WebSocket se inicia automáticamente con la aplicación
- Se conecta al broker MQTT configurado
- Envía comandos START/STOP al gateway cuando clientes se conectan/desconectan

#### Recepción de datos en tiempo real
- `plcData`: Evento que transmite datos de temperatura en tiempo real desde el PLC
- Datos recibidos del tópico `plcTemperaturas/tiemporeal/+`

#### Comandos de control
- `react-client`: Mensaje de handshake inicial desde clientes React
- START/STOP: Comandos automáticos al tópico `gatewayTemperaturas/control/tiemporeal`

## Documentación de API

La documentación interactiva de la API está disponible en `/docs` cuando la aplicación está en ejecución.

## Pruebas

### Ejecutar todas las pruebas
```bash
npm run test
```

### Ejecutar pruebas en modo watch
```bash
npm run test:watch
```

### Cobertura de pruebas
```bash
npm run test:cov
```

### Cobertura actual
- **Usuarios**: CRUD completo con pruebas unitarias (create, findAll, findById, update, remove)
- **Autenticación**: Registro, login y validación de credenciales
- **Historial de temperaturas**: Pruebas unitarias y e2e para servicio y controlador
- **WebSocket**: Pruebas unitarias para gateway de comunicación en tiempo real
- **Servicios**: Pruebas completas con mocks adecuados
- **Controladores**: Pruebas de integración con servicios

## Seguridad

- Las contraseñas son encriptadas usando bcrypt con salt configurable
- Tokens JWT con expiración configurable
- Validación de entrada de datos
- Manejo seguro de errores
- Conexión segura con EMQX Broker (MQTTS para conexiones externas)

## Contribución

1. Haz un fork del repositorio
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Haz commit de tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Haz push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## Licencia

Este proyecto está licenciado bajo [TU LICENCIA AQUÍ]

## Contacto

Equipo de desarrollo - [tu-email@ejemplo.com]

Proyecto Link: [https://github.com/tu-usuario/tu-proyecto](https://github.com/tu-usuario/tu-proyecto)