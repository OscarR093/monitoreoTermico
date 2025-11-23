# Guía de Despliegue en Producción

## 🚀 Despliegue Rápido

### 1. Preparación
```bash
cd /home/oscarr093/proyectos/monitoreoTermico

# Verificar que el archivo .env existe y tiene todas las variables
cat .env
```

### 2. Build y Deploy
```bash
# Build de la imagen (primera vez o después de cambios)
docker-compose -f docker-compose.prod.yml build node-app

# Levantar todos los servicios
docker-compose -f docker-compose.prod.yml up -d

# Ver logs en tiempo real
docker-compose -f docker-compose.prod.yml logs -f node-app
```

### 3. Verificación
```bash
# Verificar que todos los contenedores estén corriendo
docker-compose -f docker-compose.prod.yml ps

# Verificar salud de MongoDB
docker-compose -f docker-compose.prod.yml exec mongodb mongosh --quiet --eval "db.runCommand('ping')"

# Probar endpoint público
curl https://${DOMAIN_URL}/api/env

# Verificar Swagger docs
curl https://${DOMAIN_URL}/docs
```

---

## 📦 Opción Alternativa: Push a Docker Hub

Si prefieres usar una imagen pre-construida en Docker Hub:

```bash
# 1. Build con tag específico
cd backend
docker build -t oscarr093/monitoreotermico:3.0 .

# 2. Push a Docker Hub
docker login
docker push oscarr093/monitoreotermico:3.0

# 3. Actualizar docker-compose.prod.yml
# Cambiar:
#   build:
#     context: ./backend
# Por:
#   image: oscarr093/monitoreotermico:3.0

# 4. Deploy en servidor
docker-compose -f docker-compose.prod.yml pull
docker-compose -f docker-compose.prod.yml up -d
```

---

## 🔄 Actualización de Código

Cuando hagas cambios al código:

```bash
# 1. Rebuild solo el servicio node-app
docker-compose -f docker-compose.prod.yml build node-app

# 2. Recrear el contenedor
docker-compose -f docker-compose.prod.yml up -d node-app

# 3. Verificar logs
docker-compose -f docker-compose.prod.yml logs -f node-app
```

---

## 🛑 Rollback a Versión Anterior

Si necesitas volver al backend legacy:

```bash
# 1. Editar docker-compose.prod.yml
# Cambiar la sección node-app de:
#   build:
#     context: ./backend
# A:
#   image: oscarr093/monitoreotermico:2.5

# 2. Aplicar cambios
docker-compose -f docker-compose.prod.yml up -d node-app
```

---

## 🔍 Troubleshooting

### El contenedor no inicia
```bash
# Ver logs completos
docker-compose -f docker-compose.prod.yml logs node-app

# Verificar variables de entorno
docker-compose -f docker-compose.prod.yml exec node-app env | grep -E "MONGO|JWT|MQTT"
```

### Error de conexión a MongoDB
```bash
# Verificar que MongoDB esté saludable
docker-compose -f docker-compose.prod.yml ps mongodb

# Probar conexión manual
docker-compose -f docker-compose.prod.yml exec node-app \
  node -e "console.log(process.env.MONGODB_URI)"
```

### Frontend no carga
```bash
# Verificar que frontend_dist existe en el contenedor
docker-compose -f docker-compose.prod.yml exec node-app ls -la frontend_dist

# Verificar logs de Traefik
docker logs mi-traefik-proxy
```

---

## 📊 Monitoreo

### Logs en tiempo real
```bash
# Todos los servicios
docker-compose -f docker-compose.prod.yml logs -f

# Solo backend
docker-compose -f docker-compose.prod.yml logs -f node-app

# Solo MongoDB
docker-compose -f docker-compose.prod.yml logs -f mongodb
```

### Estadísticas de recursos
```bash
docker stats
```

### Espacio en disco
```bash
# Ver tamaño de volúmenes
docker system df -v

# Limpiar recursos no usados (CUIDADO)
docker system prune -a
```

---

## 🔐 Backup de Base de Datos

### Crear backup
```bash
# Backup completo
docker-compose -f docker-compose.prod.yml exec mongodb \
  mongodump --uri="mongodb://${MONGO_USER}:${MONGO_PASS}@localhost:27017/${MONGO_DB_NAME}?authSource=admin" \
  --out=/tmp/backup

# Copiar backup al host
docker cp mi-database-mongo:/tmp/backup ./backup-$(date +%Y%m%d)
```

### Restaurar backup
```bash
# Copiar backup al contenedor
docker cp ./backup-20250123 mi-database-mongo:/tmp/restore

# Restaurar
docker-compose -f docker-compose.prod.yml exec mongodb \
  mongorestore --uri="mongodb://${MONGO_USER}:${MONGO_PASS}@localhost:27017/${MONGO_DB_NAME}?authSource=admin" \
  /tmp/restore
```

---

## ✅ Checklist Pre-Despliegue

- [ ] Archivo `.env` configurado con todas las variables
- [ ] Frontend compilado (`frontend/dist` existe)
- [ ] Backup de base de datos creado
- [ ] Red Docker `monitoreotermico_mi-red` creada
- [ ] Certificados SSL configurados (Traefik + Let's Encrypt)
- [ ] Puertos 80, 443, 8883 disponibles
- [ ] Variables `JWT_SECRET` coinciden con producción actual

---

## 📝 Variables de Entorno Requeridas

Asegúrate de que tu archivo `.env` contenga:

```env
# MongoDB
MONGO_USER=admin
MONGO_PASS=<tu-password-seguro>
MONGO_DB_NAME=monitoreoTermico
MONGO_PORT=27017

# MQTT
MOSQUITTO_USER=<mqtt-user>
MOSQUITTO_PASS=<mqtt-password>

# JWT
JWT_SECRET=<tu-secret-muy-seguro>
JWT_EXPIRES_IN=1h

# Aplicación
NODE_ENV=production
DOMAIN_URL=<tu-dominio.com>
PORT=3000

# Super Admin
SUPER_USER_USERNAME=<admin-username>
SUPER_USER_PASSWORD=<admin-password>

# EMQX
EMQX_NODE_COOKIE=<emqx-cookie>

# Let's Encrypt
LETSENCRYPT_EMAIL=<tu-email@example.com>
```
