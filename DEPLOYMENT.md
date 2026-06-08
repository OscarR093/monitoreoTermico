# Guía de Despliegue (Intranet / VPN)

## Arquitectura

```
┌──────────────────────┐     ┌──────────────────────┐
│   Servidor Docker     │     │  PC Gateway (PLC)     │
│                       │     │                       │
│  ┌────┐ ┌────┐ ┌───┐ │     │  ┌──────────────────┐ │
│  │Web │ │MDB │ │EMQ│ │     │  │ gateway_plc.py   │ │
│  │App │ │ 7.0│ │ X │ │     │  │ gateway_sim      │ │
│  └─┬──┘ └────┘ └───┘ │     │  └────────┬─────────┘ │
│    │ 172.19.0.x       │     │           │            │
│    └──────┬───────────┘     │     PLC   │ (TCP Snap7)
└───────────┼───────────────┘     │  Siemens S7        │
            │                     └──────────────────────┘
     :8420  │ HTTP
            ▼
   Navegador en intranet
```

- **Servidor Docker**: MongoDB + EMQX + App (NestJS + React)
- **PC Gateway** (separada): script Python que lee el PLC y publica en EMQX vía MQTT
- **Navegadores**: acceden via HTTP a `http://<IP_SERVIDOR>:8420`

---

## 🚀 Despliegue Rápido

### 1. Preparar .env

```bash
cd /home/oscarr093/proyectos/monitoreoTermico

cp .env.example .env
nano .env
```

Variables requeridas:

```env
# IP del servidor + puerto (intranet)
DOMAIN_URL=192.168.1.100:8420

# MongoDB
MONGO_USER=admin
MONGO_PASS=password_seguro
MONGO_DB_NAME=monitoreoTermico

# MQTT (EMQX)
MOSQUITTO_USER=fmex
MOSQUITTO_PASS=fmex456
EMQX_NODE_COOKIE=cookie_segura

# JWT
JWT_SECRET=secret_muy_seguro

# Super Admin
SUPER_USER_USERNAME=admin
SUPER_USER_PASSWORD=admin123

# Telegram (opcional, dejar vacío si no hay internet)
TELEGRAM_BOT_TOKEN=
TELEGRAM_CHANNEL_ID=
```

### 2. Build y levantar

```bash
# Build de la imagen (frontend + backend)
docker compose -f docker-compose.prod.yml build

# Levantar todos los servicios
docker compose -f docker-compose.prod.yml up -d

# Ver logs
docker compose -f docker-compose.prod.yml logs -f node-app
```

### 3. Verificar

```bash
# Contenedores activos
docker compose -f docker-compose.prod.yml ps

# API responde
curl http://localhost:8420/api/env

# SPA responde
curl -o /dev/null -w "%{http_code}" http://localhost:8420/
```

### 4. Gateway (PC del PLC)

En la PC conectada al PLC Siemens:

```bash
cd gateway
cp .env.example .env
nano .env
```

Configurar:

```env
PLC_IP=192.168.0.1               # IP del PLC Siemens
MQTT_BROKER_HOST=192.168.1.100   # IP del servidor Docker
MQTT_BROKER_PORT=1883
MQTT_USER=fmex
MQTT_PASSWORD=fmex456
```

Instalar dependencias y ejecutar:

```bash
pip install -r requirements.txt

# Con PLC real
python3 gateway_plc.py

# O con simulador (para pruebas)
python3 gateway_simulator.py
```

---

## 🔄 Actualización de Código

```bash
# Rebuild solo node-app
docker compose -f docker-compose.prod.yml build node-app

# Recrear el contenedor
docker compose -f docker-compose.prod.yml up -d node-app

# Verificar logs
docker compose -f docker-compose.prod.yml logs -f node-app
```

---

## 🛑 Rollback

```bash
# Volver a una imagen anterior
docker compose -f docker-compose.prod.yml down
git checkout <commit-anterior>
docker compose -f docker-compose.prod.yml build
docker compose -f docker-compose.prod.yml up -d
```

---

## 🔍 Troubleshooting

### MongoDB no arranca ("Detected Linux kernel...")

```bash
# Error: MongoDB 8.0+ refuses to start on kernel v6.19+
# Solución: usar mongo:7.0 en lugar de mongodb/mongodb-community-server
# Ya está corregido en docker-compose.prod.yml, pero si usas otra imagen:

# Verificar versión de la imagen
docker compose -f docker-compose.prod.yml images mongodb
```

### Build falla: "can't stat '/mongo-data/.mongodb'"

```bash
# El directorio mongo-data/ interfiere con el build context.
# Solución: incluir .dockerignore con mongo-data/ (ya creado).

# Si el error persiste:
echo "mongo-data/" >> .dockerignore
```

### Frontend no recibe datos en tiempo real

```bash
# 1. Verificar que el simulador/gateway está conectado al broker
#    Debe mostrar: "Gateway conectado exitosamente al Broker MQTT"

# 2. Verificar que el WebSocket se conecta (consola del navegador)
#    Debe mostrar: "Conectado al servidor WebSocket"

# 3. Si el WebSocket intenta wss:// en vez de ws://:
#    - Es porque NODE_ENV=production y la lógica antigua usaba wss://
#    - Solución: ya corregido en frontend/src/services/webSocketService.js
#      (usa ws:// siempre en intranet sin TLS)

# 4. Verificar que el backend envía START:
docker compose -f docker-compose.prod.yml logs node-app | grep START

# 5. Probar MQTT manualmente desde la PC del gateway:
pip install paho-mqtt
python3 -c "
import paho.mqtt.client as mqtt
c = mqtt.Client(mqtt.CallbackAPIVersion.VERSION2)
c.connect('192.168.1.100', 1883, 60)
print('MQTT OK')
c.disconnect()
"
```

### Error de decoradores TypeScript al buildear

```
error TS1240: Unable to resolve signature of property decorator when called as an expression.
```

```bash
# Causa: sintaxis incorrecta en un decorador @ApiResponse
# Solución: verificar que los cierres de llaves/parentesis estén correctos
#   en backend/src/config/env.controller.ts

# Alternativa: limpiar cache y rebuildear
docker compose -f docker-compose.prod.yml build --no-cache node-app
```

### Build lento o falla por espacio

```bash
# Limpiar imágenes y caché de Docker
docker system prune -a

# Ver espacio usado
docker system df
```

### Contenedor node-app no inicia

```bash
# Revisar logs
docker compose -f docker-compose.prod.yml logs node-app

# Verificar variables de entorno dentro del contenedor
docker compose -f docker-compose.prod.yml exec node-app env | grep -E "MONGO|JWT|MQTT|PORT"
```

### Conexión a MongoDB fallida

```bash
# Verificar que MongoDB está saludable
docker compose -f docker-compose.prod.yml ps mongodb

# Healthcheck directo
docker compose -f docker-compose.prod.yml exec mongodb mongosh --quiet --eval "db.runCommand('ping').ok"
```

---

## 📊 Monitoreo

```bash
# Logs en tiempo real de todos los servicios
docker compose -f docker-compose.prod.yml logs -f

# Solo node-app
docker compose -f docker-compose.prod.yml logs -f node-app

# Solo EMQX
docker compose -f docker-compose.prod.yml logs -f emqx

# Estadísticas de recursos
docker stats

# Dashboard EMQX (si está habilitado)
# Abrir http://<IP_SERVIDOR>:18083 en el navegador
```

---

## 🔐 Backup de Base de Datos

```bash
# Crear backup
docker compose -f docker-compose.prod.yml exec mongodb \
  mongodump --uri="mongodb://${MONGO_USER}:${MONGO_PASS}@localhost:27017/${MONGO_DB_NAME}?authSource=admin" \
  --out=/tmp/backup

docker cp mi-database-mongo:/tmp/backup ./backup-$(date +%Y%m%d)

# Restaurar
docker cp ./backup-20250123 mi-database-mongo:/tmp/restore
docker compose -f docker-compose.prod.yml exec mongodb \
  mongorestore --uri="mongodb://${MONGO_USER}:${MONGO_PASS}@localhost:27017/${MONGO_DB_NAME}?authSource=admin" \
  /tmp/restore
```

---

## ✅ Checklist Pre-Despliegue

- [ ] Archivo `.env` configurado (especialmente `DOMAIN_URL` con IP correcta)
- [ ] `docker compose -f docker-compose.prod.yml build` sin errores
- [ ] `docker compose -f docker-compose.prod.yml up -d` levanta todo
- [ ] `curl http://localhost:8420/api/env` responde OK
- [ ] Navegador abre `http://<IP>:8420` sin errores
- [ ] Gateway `.env` configurado con IP del servidor
- [ ] Gateway se conecta a EMQX (`python3 gateway_simulator.py`)
- [ ] Al abrir la web, el simulador recibe START y publica datos en tiempo real
- [ ] Si se usa Telegram, probar que las alertas llegan
