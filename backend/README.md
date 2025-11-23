# Backend de Monitoreo Térmico

Sistema backend para la aplicación de monitoreo térmico con funcionalidades completas de autenticación, gestión de usuarios, historial de temperaturas y comunicación en tiempo real.

## Características

- **Autenticación JWT**: Sistema completo de login y registro de usuarios
- **Gestión de usuarios**: CRUD optimizado para la administración de usuarios
- **Historial de temperaturas**: Almacenamiento automático con expiración de 30 días
- **Comunicación en tiempo real**: WebSocket Gateway para datos de temperatura en vivo
- **Conexión MQTT**: Integración con broker EMQX para comunicación con gateways PLC
- **Seguridad robusta**: 
    - Encriptación de contraseñas con bcrypt
    - Tokens JWT para autenticación
    - **RBAC (Role-Based Access Control)**: Control de acceso basado en roles (Admin, SuperAdmin)
    - Protección de rutas críticas
- **Documentación API**: Swagger integrado para documentación interactiva
- **Validación de configuración**: Sistema centralizado de configuración con validación
- **Pruebas unitarias**: Cobertura completa de pruebas para servicios y controladores
- **Validación de datos**: Validación completa de entrada con class-validator

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
│   └── legacy-temperature-history.controller.ts # Controlador de compatibilidad
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
- `TELEGRAM_BOT_TOKEN`: Token del bot de Telegram para alertas (opcional)
- `TELEGRAM_CHANNEL_ID`: ID del canal de Telegram donde se enviarán las alertas (opcional)

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

### Registro de usuario (Protegido)
- `POST /auth/register` (alias `/register`)
- **Seguridad**: Requiere rol de **Administrador**.
- **Nota**: Para crear un usuario con rol de administrador, se requiere ser **SuperAdmin**.
- Campos requeridos: `username`, `password`
- Campos opcionales: `email`, `fullName`, `cellPhone`, `admin`

### Login de usuario
- `POST /auth/login` (alias `/login`)
- Campos requeridos: `username`, `password`
- Retorna JWT token y establece cookie `access_token`.

### Logout (Protegido)
- `POST /auth/logout` (alias `/logout`)
- **Seguridad**: Requiere estar autenticado.
- Limpia la cookie de sesión.

## Endpoints de usuarios

### Gestión de usuarios

#### Crear usuario
- `POST /users`
- **Seguridad**: Requiere rol de **Administrador**.
- Campos requeridos: `username`, `password`

#### Listar usuarios
- `GET /users`
- **Seguridad**: Requiere estar autenticado.
- Retorna: Array de usuarios (sin contraseñas)

#### Actualizar usuario
- `PUT /users/:id`
- **Seguridad**: Un usuario puede actualizarse a sí mismo. Un **Administrador** puede actualizar a cualquier usuario.
- Campos actualizables: `username`, `password`, `email`, `fullName`, `cellPhone`, `admin`, `isSuperAdmin`, `mustChangePassword`

#### Eliminar usuario
- `DELETE /users/:id`
- **Seguridad**:
    - **SuperAdmin**: Puede eliminar a cualquier usuario (excepto a sí mismo).
    - **Admin**: Puede eliminar usuarios normales. No puede eliminar a otros administradores.
- Retorna: Mensaje de confirmación.

## Endpoints de historial de temperaturas

### Consulta de historial
- `GET /thermocouple-history/:equipmentName`
- **Seguridad**: Requiere estar autenticado.
- Retorna: Array de registros históricos para el equipo solicitado.

## Sistema de Alertas por Telegram

El sistema incluye alertas automáticas por Telegram que se envían cuando las temperaturas de los equipos salen de los rangos configurados.

### Configuración de Alertas

Las alertas se configuran en el archivo `config/alerts.config.yaml`:

```yaml
alerts:
  enabled: true
  telegram:
    botToken: ${TELEGRAM_BOT_TOKEN}
    channelId: ${TELEGRAM_CHANNEL_ID}
  
  equipments:
    - name: "Horno 1"
      minTemp: 150
      maxTemp: 250
      enabled: true
      description: "Horno principal"
```

### Configurar Bot de Telegram

1. **Crear bot**: Habla con [@BotFather](https://t.me/botfather) en Telegram
   - Envía `/newbot`
   - Sigue las instrucciones
   - Guarda el token que te proporciona

2. **Crear canal**: Crea un canal público o privado en Telegram
   - Añade el bot como administrador del canal
   - Obtén el ID del canal (ej: `@mi_canal_alertas` o `-1001234567890`)

3. **Configurar variables de entorno**:
   ```bash
   TELEGRAM_BOT_TOKEN=1234567890:ABCdefGHIjklMNOpqrsTUVwxyz
   TELEGRAM_CHANNEL_ID=@mi_canal_alertas
   ```

4. **Editar rangos**: Modifica `config/alerts.config.yaml` según tus equipos

5. **Reiniciar backend**: Las alertas se activarán automáticamente

### Funcionamiento

- Las alertas se verifican cada vez que se guarda un dato de temperatura (~5 minutos)
- Si la temperatura está fuera del rango configurado, se envía una alerta al canal
- El cooldown es automático (intervalo de guardado)
- Las alertas son efímeras (no se guardan en base de datos)

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

## Seguridad

- **Encriptación**: Las contraseñas son encriptadas usando bcrypt.
- **JWT**: Tokens firmados con expiración configurable.
- **Cookies HttpOnly**: Almacenamiento seguro del token para prevenir XSS.
- **RBAC**: Control de acceso estricto para operaciones sensibles (crear/eliminar usuarios).
- **Validación**: `class-validator` y `class-transformer` para sanitización de entrada.
- **Manejo de Errores**: Excepciones HTTP estandarizadas.

## Contribución

1. Haz un fork del repositorio
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Haz commit de tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Haz push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request