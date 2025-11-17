# Suite de Pruebas - Backend de Monitoreo Térmico

## Descripción

Este directorio contiene la suite completa de pruebas para el backend de monitoreo térmico. La estructura de pruebas está dividida en diferentes categorías para garantizar la calidad y funcionalidad de todos los componentes del sistema.

## Estructura de Pruebas

```
test/
├── app.e2e-spec.ts                    # Prueba e2e básica de la aplicación
├── temperature-history.e2e-spec.ts    # Pruebas e2e para el módulo de historial
├── jest-e2e.json                      # Configuración de Jest para pruebas e2e
├── auth/
│   ├── auth.controller.spec.ts        # Pruebas unitarias para controlador de autenticación
│   ├── auth.service.spec.ts           # Pruebas unitarias para servicio de autenticación
│   └── auth.e2e-spec.ts               # Pruebas e2e para endpoints de autenticación
├── users/
│   ├── users.controller.spec.ts       # Pruebas unitarias para controlador de usuarios
│   ├── users.service.spec.ts          # Pruebas unitarias para servicio de usuarios
│   └── users.e2e-spec.ts              # Pruebas e2e para endpoints de usuarios
├── temperature-history/
│   ├── temperature-history.controller.spec.ts  # Pruebas unitarias para controlador de historial
│   ├── temperature-history.service.spec.ts     # Pruebas unitarias para servicio de historial
│   └── temperature-history.e2e-spec.ts         # Pruebas e2e para endpoints de historial
├── mqtt/
│   └── mqtt-consumer.service.spec.ts  # Pruebas unitarias para servicio MQTT
├── websocket/
│   └── websocket.gateway.spec.ts      # Pruebas unitarias para WebSocket Gateway
└── config/
    └── config.service.spec.ts         # Pruebas unitarias para servicio de configuración
```

## Tipos de Pruebas

### 1. Pruebas Unitarias (`.spec.ts`)

- **Objetivo**: Verificar la funcionalidad individual de cada componente
- **Cobertura**: Servicios, controladores, DTOs, módulos
- **Estructura**: Cada componente tiene su archivo de pruebas correspondiente
- **Mocks**: Uso de mocks para dependencias externas (bases de datos, servicios de terceros)

### 2. Pruebas End-to-End (`.e2e-spec.ts`)

- **Objetivo**: Verificar la integración completa de los componentes
- **Cobertura**: Endpoints HTTP, flujos completos de negocio
- **Entorno**: Ejecución en entorno simulado de aplicación real

## Cobertura de Pruebas

### Módulo de Autenticación (`auth/`)
- Registro de usuarios
- Login y generación de tokens JWT
- Validación de credenciales
- Middleware de autenticación

### Módulo de Usuarios (`users/`)
- CRUD completo de usuarios
- Validación de unicidad de username/email
- Actualización de perfiles
- Eliminación de usuarios

### Módulo de Historial de Temperaturas (`temperature-history/`)
- Almacenamiento automático de datos de temperatura
- Consulta de historiales por equipo
- Filtrado de datos por fecha y temperatura
- Estadísticas de equipos
- Endpoint de compatibilidad con frontend

### Módulo MQTT (`mqtt/`)
- Conexión al broker EMQX
- Suscripción a tópicos MQTT
- Procesamiento de mensajes del gateway PLC
- Almacenamiento automático de datos de historial

### WebSocket Gateway (`websocket/`)
- Conexión/desconexión de clientes
- Transmisión de datos en tiempo real
- Manejo de mensajes MQTT
- Control de gateway (START/STOP)

### Configuración (`config/`)
- Validación de variables de entorno
- Carga de configuraciones
- Manejo de valores por defecto

## Scripts de Ejecución

### Ejecutar todas las pruebas
```bash
npm run test
```

### Ejecutar pruebas en modo observación
```bash
npm run test:watch
```

### Obtener reporte de cobertura
```bash
npm run test:cov
```

### Ejecutar solo pruebas unitarias
```bash
npm run test -- --testPathPattern=".(spec).ts$" --testPathIgnorePatterns="e2e"
```

### Ejecutar solo pruebas e2e
```bash
npm run test:e2e
```

## Estrategia de Pruebas

### 1. Pruebas de Servicio
- Verificación de lógica de negocio
- Validación de datos de entrada y salida
- Manejo de errores y excepciones
- Simulación de dependencias externas

### 2. Pruebas de Controlador
- Verificación de mapeo de endpoints
- Validación de parámetros de entrada
- Verificación de códigos de estado HTTP
- Prueba de middleware de autenticación

### 3. Pruebas de Integración
- Prueba de flujos completos de negocio
- Validación de interacciones entre módulos
- Prueba de endpoints reales con base de datos simulada

## Configuración de Jest

### Archivos de Configuración
- `jest.config.js`: Configuración principal de Jest para pruebas unitarias
- `test/jest-e2e.json`: Configuración específica para pruebas e2e

### Características
- Transformación de TypeScript a JavaScript
- Cobertura de código con `--coverage`
- Configuración de entorno de pruebas
- Configuración de mocks globales

## Buenas Prácticas Implementadas

1. **Pruebas aisladas**: Cada prueba es independiente y no depende del estado de otras
2. **Mocks apropiados**: Uso de mocks para dependencias externas
3. **Datos predecibles**: Uso de datos de prueba consistentes
4. **Cobertura completa**: Pruebas para todos los caminos posibles del código
5. **Nomenclatura clara**: Nombres de pruebas descriptivos y entendibles
6. **Limpieza de recursos**: Restauración del estado original después de cada prueba

## Mantenimiento

### Actualización de Pruebas
- Agregar nuevas pruebas cuando se implementan funcionalidades
- Actualizar pruebas existentes cuando se modifican componentes
- Eliminar pruebas obsoletas o duplicadas

### Monitoreo de Cobertura
- Verificar que la cobertura de pruebas no disminuya
- Asegurar cobertura mínima del 80% para nuevas funcionalidades
- Revisar los informes de cobertura para identificar áreas sin testear