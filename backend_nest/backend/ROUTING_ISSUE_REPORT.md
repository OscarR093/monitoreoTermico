# Reporte: Problema de Enrutamiento SPA + API en NestJS

**Fecha:** 23 de noviembre de 2025  
**Proyecto:** Sistema de Monitoreo Térmico  
**Versión:** NestJS Backend con React SPA

---

## 📋 Resumen Ejecutivo

Durante la integración del backend NestJS con el frontend React SPA, se presentaron múltiples problemas de enrutamiento que impedían el correcto funcionamiento de la aplicación. Los síntomas principales fueron:

- **404 en recarga de página**: Al recargar cualquier ruta del SPA (ej: `/dashboard`, `/history/:id`), el servidor devolvía 404.
- **Conflicto API/Frontend**: Las rutas de API (`/api/...`) eran interceptadas por el controlador de frontend.
- **Archivos estáticos no servidos**: Los archivos CSS y JS del frontend no se cargaban correctamente.
- **Error MIME type**: El navegador recibía HTML en lugar de JavaScript/CSS para los archivos estáticos.

---

## 🔍 Análisis del Problema

### Problema 1: Prefijo Global `/api` Ambiguo

**Síntoma:**
```
GET /dashboard → 404 (debería servir index.html)
GET /api/auth/check → 404 (debería responder con JSON)
```

**Causa Raíz:**

El uso de `app.setGlobalPrefix('api')` en `main.ts` creaba ambigüedad en el enrutamiento:

```typescript
// ❌ CONFIGURACIÓN PROBLEMÁTICA
app.setGlobalPrefix('api', {
  exclude: [
    { path: 'login', method: RequestMethod.GET }
  ],
});
```

**Problemas:**
1. Las exclusiones eran difíciles de mantener
2. No era claro qué rutas tenían el prefijo `/api` y cuáles no
3. El orden de evaluación de rutas no era predecible

---

### Problema 2: Orden de Registro de Controladores

**Síntoma:**
```
[GlobalExceptionFilter] NotFoundException: Cannot GET /api/auth/check
Exception origin: GET /api/auth/check
Stack: at FrontendController.serveSpa
```

**Causa Raíz:**

En NestJS, **el orden de registro de controladores importa**. Los controladores se registran en este orden:

1. Controladores del módulo raíz (`AppModule.controllers`)
2. Controladores de módulos importados (en orden de importación)

**Configuración Problemática:**

```typescript
@Module({
  imports: [
    AuthModule,      // Tiene AuthController con @Get('api/auth/check')
    UsersModule,
    // ... otros módulos
  ],
  controllers: [
    AppController,
    FrontendController  // ❌ @Get('*') se registra PRIMERO
  ]
})
export class AppModule {}
```

**Resultado:** El catch-all `@Get('*')` de `FrontendController` se registraba **antes** que las rutas de `AuthController`, interceptando todas las peticiones.

---

### Problema 3: Servicio de Archivos Estáticos

**Síntoma:**
```
GET /assets/index-D2tItZ7A.js → 404 (Not Found)
Failed to load module script: Expected JavaScript but got text/html
```

**Causa Raíz:**

El módulo `ServeStaticModule` no estaba configurado correctamente o se cargaba en el orden incorrecto, causando que:

1. Las peticiones de archivos estáticos llegaran al `FrontendController`
2. El controlador devolviera `index.html` para rutas con extensiones de archivo
3. El navegador intentara ejecutar HTML como JavaScript

---

## ✅ Solución Implementada

### 1. Rutas API Explícitas

**Cambio:** Eliminar el prefijo global y hacer explícitas todas las rutas de API.

**Antes:**
```typescript
// main.ts
app.setGlobalPrefix('api');

// auth.controller.ts
@Controller('auth')  // Resulta en /api/auth
export class AuthController {}
```

**Después:**
```typescript
// main.ts
// ✅ Sin prefijo global

// auth.controller.ts
@Controller('api/auth')  // ✅ Explícito y claro
export class AuthController {
  @Get('check')  // Resulta en /api/auth/check
  checkSession() {}
}

// Legacy controller para compatibilidad
@Controller('api')
export class LegacyAuthController {
  @Get('auth/check')  // Resulta en /api/auth/check
  checkSessionAlias() {}
}
```

**Beneficios:**
- ✅ Rutas completamente predecibles
- ✅ No hay ambigüedad sobre qué tiene prefijo `/api`
- ✅ Fácil de mantener y documentar

---

### 2. FrontendController en Módulo Separado

**Cambio:** Mover `FrontendController` a su propio módulo e importarlo al final.

**Estructura de Archivos:**
```
src/
├── frontend/
│   ├── frontend.module.ts      # ✅ Nuevo módulo
│   └── frontend.controller.ts  # Movido aquí
└── app.module.ts
```

**Código:**

```typescript
// frontend/frontend.module.ts
@Module({
  controllers: [FrontendController],
})
export class FrontendModule {}

// app.module.ts
@Module({
  imports: [
    ConfigAppModule,
    UsersModule,
    AuthModule,
    TemperatureHistoryModule,
    MqttModule,
    WebSocketModule,
    FrontendModule,  // ✅ ÚLTIMO para que sea catch-all real
  ],
  controllers: [EnvController, AppController],  // ✅ Sin FrontendController
})
export class AppModule {}
```

**Orden de Registro Resultante:**
1. `EnvController` → `/api/env`
2. `AppController` → `/env` (legacy)
3. `AuthController` → `/api/auth/*`
4. `UsersController` → `/api/users/*`
5. ... otros controladores de API ...
6. `FrontendController` → `*` (catch-all)

---

### 3. Servicio de Archivos Estáticos con `useStaticAssets`

**Cambio:** Usar el método nativo de Express para servir archivos estáticos.

```typescript
// main.ts
import { NestExpressApplication } from '@nestjs/platform-express';

const app = await NestFactory.create<NestExpressApplication>(AppModule);

// ✅ Servir archivos estáticos ANTES de las rutas
app.useStaticAssets(join(process.cwd(), 'frontend_dist'));
```

**Lógica del FrontendController:**

```typescript
@Controller()
export class FrontendController {
  @Get('*')
  serveSpa(@Req() req: Request, @Res() res: Response) {
    // 1. Si es ruta de API que llegó aquí → 404 real
    if (req.path.startsWith('/api')) {
      throw new NotFoundException(`Cannot GET ${req.path}`);
    }

    // 2. Si parece archivo estático (tiene extensión) → 404
    if (req.path.match(/\.[^/]+$/)) {
      throw new NotFoundException(`File not found: ${req.path}`);
    }

    // 3. Para rutas SPA → servir index.html
    res.sendFile(join(process.cwd(), 'frontend_dist', 'index.html'));
  }
}
```

---

## 🔄 Flujo de Peticiones Final

### Petición de Archivo Estático
```
GET /assets/index.js
  ↓
[Express Static Middleware]
  ↓ (archivo existe)
Servir archivo → 200 OK
```

### Petición de API
```
GET /api/auth/check
  ↓
[Express Static Middleware] (no es archivo)
  ↓
[NestJS Router]
  ↓
[AuthController] @Get('api/auth/check')
  ↓
Respuesta JSON → 200 OK
```

### Petición de Ruta SPA
```
GET /dashboard
  ↓
[Express Static Middleware] (no es archivo)
  ↓
[NestJS Router] (no coincide con API)
  ↓
[FrontendController] @Get('*')
  ↓
Servir index.html → 200 OK
  ↓
React Router maneja /dashboard
```

### Petición de API Inexistente
```
GET /api/nonexistent
  ↓
[Express Static Middleware] (no es archivo)
  ↓
[NestJS Router] (no coincide con ningún controlador)
  ↓
[FrontendController] @Get('*')
  ↓
req.path.startsWith('/api') → true
  ↓
throw NotFoundException → 404 JSON
```

---

## 📊 Comparación Antes/Después

| Escenario | Antes | Después |
|-----------|-------|---------|
| `GET /dashboard` | ❌ 404 | ✅ index.html |
| `GET /api/auth/check` | ❌ 404 (interceptado) | ✅ JSON response |
| `GET /assets/app.js` | ❌ HTML (MIME error) | ✅ JavaScript file |
| `GET /api/invalid` | ❌ HTML | ✅ 404 JSON |
| Recarga de página SPA | ❌ Falla | ✅ Funciona |

---

## 🎯 Lecciones Aprendidas

### 1. **Evitar Prefijos Globales Ambiguos**
Los prefijos globales con exclusiones son difíciles de mantener. Es mejor ser explícito en cada controlador.

### 2. **El Orden de Módulos Importa**
En NestJS, los controladores se registran en orden. Los catch-all (`@Get('*')`) deben estar en módulos importados al final.

### 3. **Separar Responsabilidades**
Mantener el `FrontendController` en su propio módulo facilita el control del orden de registro y la organización del código.

### 4. **Validar Extensiones de Archivo**
El catch-all debe rechazar rutas que parezcan archivos (con extensión) para evitar errores MIME type.

### 5. **Usar `useStaticAssets` Directamente**
Para aplicaciones Express/NestJS, `app.useStaticAssets()` es más directo y confiable que `ServeStaticModule`.

---

## 🔧 Archivos Modificados

### Archivos Principales
- [`src/main.ts`](file:///home/oscarr093/proyectos/monitoreoTermico/backend_nest/backend/src/main.ts) - Eliminado prefijo global, agregado `useStaticAssets`
- [`src/app.module.ts`](file:///home/oscarr093/proyectos/monitoreoTermico/backend_nest/backend/src/app.module.ts) - Importado `FrontendModule` al final
- [`src/frontend/frontend.module.ts`](file:///home/oscarr093/proyectos/monitoreoTermico/backend_nest/backend/src/frontend/frontend.module.ts) - Nuevo módulo
- [`src/frontend/frontend.controller.ts`](file:///home/oscarr093/proyectos/monitoreoTermico/backend_nest/backend/src/frontend/frontend.controller.ts) - Movido y mejorado

### Controladores Actualizados
- [`src/auth/auth.controller.ts`](file:///home/oscarr093/proyectos/monitoreoTermico/backend_nest/backend/src/auth/auth.controller.ts) - `@Controller('api/auth')`
- [`src/users/users.controller.ts`](file:///home/oscarr093/proyectos/monitoreoTermico/backend_nest/backend/src/users/users.controller.ts) - `@Controller('api/users')`
- [`src/temperature-history/legacy-temperature-history.controller.ts`](file:///home/oscarr093/proyectos/monitoreoTermico/backend_nest/backend/src/temperature-history/legacy-temperature-history.controller.ts) - `@Controller('api/thermocouple-history')`
- [`src/config/env.controller.ts`](file:///home/oscarr093/proyectos/monitoreoTermico/backend_nest/backend/src/config/env.controller.ts) - `@Controller('api/env')`

---

## ✨ Resultado Final

La aplicación ahora funciona correctamente con:

- ✅ **Recarga de página**: Funciona en cualquier ruta del SPA
- ✅ **API funcionando**: Todas las rutas `/api/*` responden correctamente
- ✅ **Archivos estáticos**: CSS, JS e imágenes se cargan sin errores
- ✅ **Errores claros**: Los 404 de API devuelven JSON, no HTML
- ✅ **Mantenibilidad**: Rutas explícitas y fáciles de entender

---

## 📚 Referencias

- [NestJS Serving Static Content](https://docs.nestjs.com/recipes/serve-static)
- [NestJS Global Prefix](https://docs.nestjs.com/faq/global-prefix)
- [Express Static Files](https://expressjs.com/en/starter/static-files.html)
- [React Router Browser History](https://reactrouter.com/en/main/routers/create-browser-router)
