# Documentación del Servicio de Login de Usuarios

## Descripción General

El servicio de login de usuarios es un componente crítico del backend del sistema de monitoreo térmico que se encarga de la autenticación, gestión de sesiones y control de autorización. Implementa un sistema seguro basado en tokens JWT con almacenamiento de sesión en cookies HTTP-only.

## Arquitectura del Servicio

### Componentes Principales

#### 1. Punto de Entrada Principal (`index.js`)
- Gestiona las rutas HTTP y middleware
- Implementa autenticación JWT para el frontend
- Maneja la autenticación de WebSockets
- Proporciona controles de autorización basados en roles

#### 2. Repositorio de Usuarios (`user-repository.js`)
- Contiene la lógica de negocio para operaciones de usuario
- Maneja creación, login, actualización y eliminación de usuarios
- Implementa hashing de contraseñas con bcrypt
- Proporciona validación de entradas

#### 3. Modelo de Usuario (`models/user-model.js`)
- Define el esquema de usuario en MongoDB
- Incluye campos: username, password, email, fullName, admin, isSuperAdmin, cellPhone, mustChangePassword
- Aplica validaciones y valores por defecto

#### 4. Configuración de Seguridad (`config.js`)
- Almacena el secreto JWT
- Define las rondas de sal para bcrypt
- Configura otros parámetros de seguridad

## Flujo de Autenticación

### Proceso de Login

#### 1. Solicitud de Autenticación
- **Endpoint**: `POST /api/login`
- **Cuerpo de la solicitud**: `{ username: String, password: String }`
- **Respuesta**: Objeto de usuario con cookie JWT establecida

#### 2. Proceso de Validación
1. Se validan username y password por formato y longitud
2. Se recupera el usuario de la base de datos por nombre de usuario
3. Se verifica la contraseña mediante comparación bcrypt
4. Si las credenciales son válidas, se crea un token JWT

#### 3. Creación de Token JWT
- Si la autenticación es exitosa, se genera un token JWT con la siguiente carga útil:
  ```javascript
  {
    id: user.id,
    username: user.username,
    fullName: user.fullName,
    admin: user.admin,
    isSuperAdmin: user.isSuperAdmin,
    mustChangePassword: user.mustChangePassword
  }
  ```
- El token expira después de 1 hora (`expiresIn: '1h'`)

#### 4. Gestión de Sesión
- El token JWT se almacena en una cookie HTTP-only llamada `access_token`
- Configuración de la cookie:
  - `httpOnly: true` (previene ataques XSS)
  - `secure: true` en producción (solo HTTPS)
  - `sameSite: 'strict'` (protección CSRF)
  - `maxAge: 1 hora`

## Roles de Usuario y Permisos

### Tipos de Usuarios
1. **Usuario Regular**: Acceso básico a datos de monitoreo térmico
2. **Administrador**: Puede gestionar otros usuarios (excepto super admins)
3. **Super Administrador**: Acceso completo al sistema

### Middleware de Autorización
- **`authenticateToken`**: Verifica JWT y carga `req.user`
- **`authorizeAdmin`**: Verifica que el usuario sea administrador
- **`authorizeSuperUser`**: Verifica que el usuario sea super administrador

## Características de Seguridad

### Seguridad de Contraseñas
- Las contraseñas se hash con bcrypt usando 10 rondas de sal
- Las contraseñas en texto plano nunca se almacenan
- La comparación de contraseñas se realiza de forma segura con `bcrypt.compare`

### Seguridad de Sesión
- Cookies HTTP-only que impiden acceso desde scripts del cliente
- Bandera de seguridad que asegura transmisión solo sobre HTTPS en producción
- Validación del token en cada ruta protegida
- Expiración automática del token después de 1 hora

### Validación de Entradas
- Username: mínimo 3 caracteres
- Password: mínimo 3 caracteres
- Email: formato de email válido usando regex
- FullName: mínimo 2 caracteres

## Endpoints de la API

### Autenticación
- `POST /api/login` - Iniciar sesión de usuario
- `POST /api/logout` - Cerrar sesión de usuario
- `GET /api/auth/check` - Verificar estado de autenticación

### Gestión de Usuarios (Solo Admins)
- `GET /api/users` - Listar todos los usuarios
- `GET /api/users/:id` - Obtener usuario específico
- `PUT /api/users/:id` - Actualizar usuario
- `DELETE /api/users/:id` - Eliminar usuario
- `POST /api/register` - Registrar nuevo usuario (solo admins)

## Gestión de Sesión

### Login
1. Las credenciales de usuario se validan
2. Se genera un token JWT con la información del usuario
3. El token se almacena en cookie HTTP-only
4. Se devuelve la información del usuario (excluyendo contraseña)

### Logout
1. La cookie de access_token se elimina
2. El usuario recibe confirmación de éxito

### Creación Automática de Super Usuario
- Al iniciar la aplicación, si no existen usuarios:
  - Se crea un super usuario desde variables de entorno (`SUPER_USER_USERNAME`, `SUPER_USER_PASSWORD`)
  - El super usuario tiene todos los privilegios y debe cambiar contraseña en primer login

## Manejo de Errores

### Respuestas de Error Comunes
- `401 Unauthorized`: Credenciales inválidas o token faltante
- `403 Forbidden`: Permisos insuficientes
- `404 Not Found`: Usuario/recurso no encontrado
- `409 Conflict`: Username/email ya existe

### Validación de Errores
- Mensajes de error genéricos para prevenir divulgación de información
- Validación de entradas en nivel de repositorio y controlador

## Autenticación de WebSocket

- Las conexiones WebSocket se autentican mediante cookie de access token
- El token se extrae de los encabezados de solicitud de upgrade
- La conexión se rechaza si el token es inválido o no existe
- Se adjunta la información del usuario al objeto de solicitud para uso posterior

## Modelo de Datos

### Esquema de Usuario
```javascript
{
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // hash bcrypt
  email: { type: String, required: true, unique: true },
  fullName: { type: String, required: true },
  admin: { type: Boolean, default: false },
  isSuperAdmin: { type: Boolean, default: false },
  cellPhone: { type: String, required: false, default: '' },
  mustChangePassword: { type: Boolean, default: true },
  timestamps: true // createdAt, updatedAt
}
```

## Características Especiales

### Requisito de Cambio de Contraseña
- Los nuevos usuarios deben cambiar la contraseña (`mustChangePassword: true` por defecto)
- El requisito de cambio de contraseña se restablece cuando se actualiza la contraseña

### Auto-registro por Admins
- Los administradores pueden registrar nuevos usuarios con contraseñas temporales
- Se crean datos de relleno con valores por defecto
- Los nuevos usuarios deben actualizar su información de perfil

## Variables de Entorno Utilizadas

- `JWT_SECRET` - Clave secreta para firmar tokens JWT
- `SALT_ROUNDS` - Número de rondas bcrypt para sal (por defecto: 10)
- `NODE_ENV` - Determina la configuración de seguridad de cookies
- `SUPER_USER_USERNAME` - Nombre de usuario inicial del super admin
- `SUPER_USER_PASSWORD` - Contraseña inicial del super admin

## Consideraciones de Seguridad

1. **Mejores Prácticas JWT**: Expiración corta de tokens (1 hora) para minimizar riesgos
2. **Hash de Contraseñas**: Uso de bcrypt estándar de la industria con rondas apropiadas
3. **Seguridad de Cookies**: HTTP-only, banderas seguras y política estricta de mismo sitio
4. **Validación de Entradas**: Múltiples capas de validación para prevenir ataques de inyección
5. **Control de Acceso Basado en Roles**: Permisos detallados basados en roles de usuario
6. **Divulgación de Información**: Mensajes de error genéricos para evitar revelar detalles del sistema
7. **Gestión de Sesiones**: Limpieza adecuada de sesión durante logout