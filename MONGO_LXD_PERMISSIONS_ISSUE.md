# Reporte: Corrupción de MongoDB en Entorno LXD

## Resumen

El contenedor MongoDB (`mi-database-mongo`) dejó de iniciar debido a corrupción en los archivos del motor de almacenamiento WiredTiger. La raíz del problema fue una combinación de:

1. **Apagado no limpio previo** de MongoDB (reinicio del VPS, OOM kill, etc.)
2. **Mapeo de namespaces de LXD** que impidió la recuperación de permisos correctos

## Error Principal

```
"Detected unclean shutdown - Lock file is not empty"
"Unable to read the storage engine metadata file"
"Failed to read metadata from /data/db/storage.bson"
```

Seguido de:

```
"WiredTiger error message", "error": 13, "Permission denied"
"WiredTiger error message", "error": 1, "Operation not permitted"
```

## Causa Raíz

### 1. Corrupción Inicial

MongoDB detectó un apagado no limpio. Los archivos `mongod.lock` y `storage.bson` quedaron en estado inconsistente.

### 2. Imposibilidad de Recuperación por LXD

El VPS corre dentro de un contenedor **LXD**, que utiliza **mapeo de namespaces de usuario** (user namespace mapping). Esto causa que:

- Los archivos del volumen Docker aparecen con propietario `lxd:docker` (UID 1000) en lugar del UID interno de MongoDB (999)
- `chown -R 999:999` **no tiene efecto** porque el host de LXD no mapea ese UID al contenedor
- `chmod 777` resuelve parcialmente pero WiredTiger requiere operaciones a nivel de kernel que LXD bloquea (`Operation not permitted`)

### 3. Volúmenes Docker vs Bind Mounts en LXD

| Aspecto | Volumen Docker | Bind Mount |
|---------|---------------|------------|
| Mapeo de permisos | Gestionado por Docker, conflictivo en LXD | Usa el filesystem directamente |
| Namespace de usuario | Afectado por LXD | No afectado |
| `chown` funciona | No en LXD | Sí |
| Recomendado en LXD | No | Sí |

## Solución Aplicada

### Cambio de Volumen Docker a Bind Mount

```yaml
# ANTES (volumen Docker)
volumes:
  - datos-mongo:/data/db

# DESPUÉS (bind mount local)
volumes:
  - ./mongo-data:/data/db
```

### Mejoras Adicionales

```yaml
mongodb:
  stop_grace_period: 60s  # Tiempo para cierre limpio
  # Variables actualizadas (sin deprecación)
  environment:
    - MONGODB_INITDB_ROOT_USERNAME=${MONGO_USER}
    - MONGODB_INITDB_ROOT_PASSWORD=${MONGO_PASS}
```

Se eliminaron:
- `privileged: true`
- `security_opt: [apparmor:unconfined, seccomp:unconfined]`
- Volumen nombrado `datos-mongo`

## Por Qué los Bind Mounts Funcionan Mejor en LXD

1. **Evitan la capa de abstracción de volúmenes Docker** que interactúa mal con el namespace de LXD
2. **Usan el filesystem directamente** del contenedor LXD, sin mapeos intermedios
3. **Los permisos son consistentes** entre el host LXD y el contenedor Docker
4. **WiredTiger puede operar normalmente** porque las operaciones de archivo no son bloqueadas por seccomp

## Cómo Prevenir Recurrencia

### 1. Siempre detener MongoDB limpiamente

```bash
docker compose down  # Correcto
docker kill          # NUNCA usar
```

### 2. El `stop_grace_period: 60s` da tiempo a MongoDB para:
- Cerrar conexiones activas
- Flush de datos a disco
- Liberar locks correctamente

### 3. Backups automáticos

```bash
# Cronjob diario a las 3:00 AM
0 3 * * * docker exec mi-database-mongo mongodump --archive=/tmp/backup-$(date +\%Y\%m\%d).gz --gzip && docker cp mi-database-mongo:/tmp/backup-$(date +\%Y\%m\%d).gz /home/ubuntu/backups/
```

### 4. Verificar espacio en disco periódicamente

```bash
df -h /home/ubuntu/monitoreoTermico
```

### 5. Monitorear logs de MongoDB

```bash
docker logs mi-database-mongo --tail 50
```

## Línea de Tiempo del Incidente

| Hora | Evento |
|------|--------|
| ~01:11 | MongoDB detecta corrupción al iniciar |
| ~01:11-01:25 | Múltiples reintentos automáticos fallidos |
| ~01:25 | Se intenta `chmod 777` y `chown 999:999` - sin efecto por LXD |
| ~01:35 | Se intenta `privileged: true` - sin efecto |
| ~01:35 | Se intenta `security_opt` - sin efecto |
| ~01:37 | `chmod -R 777` permite inicio parcial pero falla en `WiredTiger.wt` |
| ~01:41 | Error cambia a "Operation not permitted" (bloqueo de kernel LXD) |
| ~01:48 | Se descubre que el volumen está vacío (datos perdidos) |
| ~01:48 | Se recrea volumen y se levanta MongoDB desde cero |
| ~01:48 | Se aplica bind mount como solución definitiva |

## Conclusión

Los volúmenes nombrados de Docker **no son compatibles de forma fiable** con contenedores LXD debido al mapeo de namespaces de usuario. Los **bind mounts** son la solución recomendada para persistencia de datos en este tipo de entornos.
