# Documentación de Integración Backend NestJS - Frontend Original

## Resumen del Problema

Durante la migración del backend de Express a NestJS, hemos encontrado problemas de compatibilidad en las rutas de la API. El frontend original fue desarrollado para trabajar con el backend Express y espera ciertos patrones de URL que no coinciden exactamente con la estructura de rutas de NestJS.

## Errores Recurrentes

### Errores en el Servidor
```
ERROR [GlobalExceptionFilter] <<<<< UNCAUGHT EXCEPTION >>>>>
Caught exception: NotFoundException: Cannot GET /login
Exception origin: GET /login
```

### Errores en el Cliente (Frontend)
```
GET http://localhost:3000/api/auth/check 404 (Not Found)
POST http://localhost:3000/api/login 404 (Not Found)
```

## Arquitectura Actual

### Backend NestJS
- **Rutas de API**: `/auth/login`, `/auth/check`, `/users`, `/temperature-history`, etc.
- **Servicio estático**: Sirve el frontend desde `/frontend_dist`
- **Rutas catch-all**: Maneja rutas desconocidas para React Router

### Frontend Original
- **Configuración de API**: Usa `baseURL: '/api'`
- **Llamadas de ejemplo**:
  - `api.get('/auth/check')` → `/api/auth/check`
  - `api.post('/login')` → `/api/login`
  - `api.get('/users')` → `/api/users`

## Soluciones Implementadas

### 1. Middleware de Prefijo API
Creamos `ApiPrefixMiddleware` para redirigir solicitudes que comienzan con `/api/`:
- `/api/auth/check` → `/auth/check`
- `/api/login` → `/login`

### 2. Controladores de Rutas Legado
Creamos `LegacyAuthController` para manejar rutas sin prefijo:
- `@Post('login')` → `/login` (alias para `/auth/login`)
- `@Get('auth/check')` → `/auth/check` (ruta estándar pero como alias)
- `@Post('register')` → `/register` (alias para `/auth/register`)

### 3. Controlador de Autenticación Estándar
Mantuvimos `AuthController` con rutas estándar:
- `@Controller('auth')` + `@Post('login')` → `/auth/login`
- `@Controller('auth')` + `@Get('check')` → `/auth/check`

## Estado Actual

### Funcionalidades que funcionan:
✅ **Login**: `/api/login` → middleware → `/login` → `LegacyAuthController`  
✅ **Verificación de sesión**: `/api/auth/check` → middleware → `/auth/check` → `LegacyAuthController`  
✅ **Registro de usuarios**: `/api/register` → middleware → `/register` → `LegacyAuthController`  
✅ **Acceso al frontend**: Correctamente servido desde `frontend_dist`  
✅ **WebSockets**: Funcionando correctamente con MQTT  
✅ **Historial de temperaturas**: `/api/thermocouple-history` accesible  

### Problemas pendientes:
❌ **Middleware inconsistente**: A veces las rutas no se redirigen correctamente  
❌ **Errores 404 intermitentes**: Dependiendo del estado de la sesión del usuario  
❌ **Doble mapeo de rutas**: Posible confusión entre rutas estándar y alias  

## Configuración Requerida

### Frontend (services/api.js)
```javascript
const api = axios.create({
  baseURL: '/api',  // ← Importante: usar prefijo /api
  withCredentials: true
})
```

### Backend (Middleware)
```typescript
// api-prefix.middleware.ts
if (req.url.startsWith('/api/')) {
  const newUrl = req.url.substring(4);  // Quita '/api'
  req.url = newUrl;
  req.originalUrl = newUrl;
}
```

## Conclusión

El sistema está en proceso de integración completa. La mayoría de las funcionalidades ya están operativas, pero se requiere un ajuste final para estabilizar completamente el middleware de redirección y asegurar que todas las rutas del frontend se mapeen correctamente a las del backend NestJS.