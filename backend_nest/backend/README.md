# Backend de Monitoreo Térmico

Sistema backend para la aplicación de monitoreo térmico con funcionalidades completas de autenticación y gestión de usuarios.

## Características

- **Autenticación JWT**: Sistema completo de login y registro de usuarios
- **Gestión de usuarios**: CRUD completo para la administración de usuarios
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
├── config/            # Configuración centralizada
│   ├── config.module.ts
│   ├── configuration.ts
│   └── validation.ts
└── app.module.ts      # Módulo principal
```

## Prerrequisitos

- Node.js 16.x o superior
- MongoDB
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
- **Servicios**: Pruebas completas con mocks adecuados
- **Controladores**: Pruebas de integración con servicios

## Seguridad

- Las contraseñas son encriptadas usando bcrypt con salt configurable
- Tokens JWT con expiración configurable
- Validación de entrada de datos
- Manejo seguro de errores

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