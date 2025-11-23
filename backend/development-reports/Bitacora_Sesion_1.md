# Bitácora de Desarrollo - Primera Sesión

## Fecha: 15-16 de Noviembre de 2025

## 1. Resolución de problemas iniciales

### 1.1. Error de autenticación con MongoDB
- **Problema**: `MongoServerError: Authentication failed` al intentar registrar usuarios
- **Causa**: Discrepancia entre variables de entorno usadas en el código y definidas en `.env`
- **Solución**: Ajuste de variables de entorno para que coincidan con los nombres usados en el código

### 1.2. Problemas con el nombre de la base de datos
- **Problema**: Se estaban almacenando datos de usuarios en la base de datos `admin` de MongoDB
- **Solución**: Cambio del nombre de la base de datos a `monitoreoTermico` para seguir mejores prácticas

## 2. Implementación de sistema de autenticación

### 2.1. Registro de usuarios
- Creación de endpoint POST `/auth/register`
- Validación de campos con DTOs
- Encriptación de contraseñas con bcrypt
- Valores por defecto para campos de rol

### 2.2. Login de usuarios
- Creación de endpoint POST `/auth/login`  
- Generación de JWT tokens
- Validación de credenciales
- Manejo de errores de autenticación

### 2.3. Documentación con Swagger
- Documentación completa de endpoints de autenticación
- Ejemplos de solicitudes y respuestas
- Códigos de estado documentados
- Descripciones claras de los campos

## 3. Optimización del sistema de configuración

### 3.1. Módulo de configuración centralizado
- Creación de módulo `ConfigAppModule`
- Validación de variables de entorno
- Tipado fuerte para configuración
- Compatibilidad con variables originales
- Agrupación lógica de variables (mongo.*, jwt.*, etc.)

## 4. Mejora de la estructura de datos

### 4.1. Esquema de usuario
- Campos obligatorios: `username` y `password`
- Campos opcionales: `email`, `fullName`, `cellPhone`
- Valores por defecto para roles: `admin: false`, `isSuperAdmin: false`, `mustChangePassword: true`

### 4.2. Manejo de datos duplicados
- Validación para evitar usuarios duplicados
- Manejo de emails nulos con índice sparse
- Manejo de usuarios con emails vacíos

## 5. Implementación de pruebas unitarias

### 5.1. Pruebas para UsersService
- Prueba de creación de usuarios
- Prueba de manejo de conflictos (usuarios duplicados)
- Prueba de búsqueda por username e ID
- Mockeo de dependencias (bcrypt, ConfigService, modelo de usuario)

### 5.2. Pruebas para AuthService
- Prueba de validación de credenciales
- Prueba de login exitoso
- Prueba de credenciales inválidas
- Mockeo de dependencias (bcrypt, JwtService, UsersService)

### 5.3. Pruebas para AuthController
- Prueba de registro de usuarios
- Prueba de login
- Prueba de manejo de errores
- Mockeo de dependencias (UsersService, AuthService)

## 6. Mejoras de seguridad

### 6.1. Manejo seguro de contraseñas
- Encriptación con bcrypt
- No se devuelve contraseña en respuestas
- Control de salt rounds configurable

### 6.2. Autenticación con JWT
- Tokens con expiración configurable
- Estrategia Passport JWT
- Validación de tokens

## 7. Modularización del código

### 7.1. Estructura de módulos
- `config/`: Módulo centralizado de configuración
- `auth/`: Módulo de autenticación
- `users/`: Módulo de gestión de usuarios
- Separación clara de responsabilidades

## Próximos pasos a implementar:

1. **Seguridad de tokens JWT**: Configurar tokens como httponly cookies
2. **Endpoint de autenticación**: Verificar si el usuario está autenticado con datos básicos
3. **CRUD completo de usuarios**: Read, Update y Delete para usuarios
4. **Middleware de autenticación**: Identificar quién ejecuta cada endpoint

La base de autenticación de usuarios está completamente funcional con pruebas unitarias, documentación y buenas prácticas de seguridad implementadas.