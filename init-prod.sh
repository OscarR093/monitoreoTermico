#!/bin/bash
# Este script prepara la configuración y lanza el sistema de producción.
set -e

echo "### Iniciando despliegue de producción... ###"

# 1. Cargar variables de entorno
if [ ! -f .env ]; then
  echo "❌ Error: El archivo .env no existe."
  exit 1
fi
export $(grep -v '^#' .env | xargs)

# 2. Preparar el archivo de configuración de Mosquitto
TEMPLATE_FILE="./mosquitto/config/mosquitto.conf.template"
CONFIG_FILE="./mosquitto/config/mosquitto.conf"

echo "-> Creando archivo de configuración para Mosquitto..."
# Copia la plantilla al archivo final
cp $TEMPLATE_FILE $CONFIG_FILE

# Reemplaza el marcador de posición con el dominio real
echo "-> Actualizando configuración con el dominio: $DOMAIN_URL"
sed -i "s|{\$DOMAIN_URL}|$DOMAIN_URL|g" $CONFIG_FILE

# 3. Lanzar todo el sistema con Docker Compose
echo "-> Lanzando todos los servicios..."
docker compose -f docker-compose.prod.yml up -d

echo "✅ ¡Despliegue completado! El sistema está arrancando."
echo "Puedes monitorear los logs de Caddy con: docker logs mi-caddy-proxy -f"
