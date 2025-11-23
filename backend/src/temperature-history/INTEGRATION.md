# Integración del Módulo de Historiales con el Frontend

## Descripción

Este documento describe cómo el módulo de historiales de temperatura en NestJS se integra con el frontend existente.

## Endpoints Compatibles

### Endpoint de compatibilidad para el frontend
- **Ruta**: `GET /temperature-history/thermocouple-history/:equipmentName`
- **Descripción**: Endpoint de compatibilidad con el frontend existente en `HistoryPage.jsx`
- **Uso en frontend**: `api.get('/thermocouple-history/:nombreEquipo')` 
- **Parámetros**:
  - `:equipmentName` (string): Nombre del equipo (ej. "Torre Fusora", "Linea 1")
  - `limit` (opcional, query): Límite de registros a devolver (máximo 1000)

### Endpoint estándar de NestJS
- **Ruta**: `GET /temperature-history/equipment/:equipmentName`
- **Descripción**: Endpoint estándar de NestJS para historiales por equipo
- **Parámetros**:
  - `:equipmentName` (string): Nombre del equipo
  - `limit` (opcional, query): Límite de registros a devolver

## Estructura de datos

El backend devuelve un array de objetos con la siguiente estructura:

```javascript
[
  {
    "_id": "string",
    "timestamp": "Date", // Formato ISO 8601
    "temperatura": "number", // Valor de temperatura
    "equipo": "string", // Nombre del equipo
    "createdAt": "Date", // Fecha de creación del registro
    "updatedAt": "Date" // Fecha de actualización del registro
  }
]
```

Esta estructura es compatible con las expectativas del frontend:

1. `timestamp`: Se utiliza para mostrar la fecha y hora en el gráfico y la tabla
2. `temperatura`: Se utiliza para mostrar el valor de temperatura
3. `equipo`: Nombre del equipo (aunque no se usa directamente en HistoryPage.jsx)

## Uso en el frontend

El frontend en `HistoryPage.jsx` realiza la siguiente llamada:

```javascript
const data = await api.get(`/thermocouple-history/${encodeURIComponent(nombreEquipo)}`)
```

Y espera recibir:
- Un array de objetos con propiedades `timestamp` y `temperatura`
- Los datos están ordenados cronológicamente (más recientes primero)

## Consideraciones importantes

1. **Compatibilidad**: El endpoint `/thermocouple-history/:equipmentName` mantiene compatibilidad con el frontend existente
2. **Datos expirados**: Los datos de historial se eliminan automáticamente después de 30 días mediante índices TTL
3. **Validación**: El sistema valida que todos los datos recibidos tengan valores válidos de temperatura
4. **Conversión de timestamp**: El sistema convierte automáticamente los timestamps Unix del gateway PLC a formato Date

## Migración futura

Cuando se actualice el frontend para usar NestJS completamente, se recomienda cambiar:
- De: `api.get('/thermocouple-history/:nombreEquipo')`
- A: `api.get('/temperature-history/equipment/:equipmentName')`

Pero el endpoint de compatibilidad seguirá funcionando para mantener la retrocompatibilidad.