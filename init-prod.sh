#!/bin/bash
# Este script prepara la configuración, ajusta los permisos y
# lanza el sistema de producción completo.
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
cp $TEMPLATE_FILE $CONFIG_FILE

echo "-> Actualizando configuración con el dominio: $DOMAIN_URL"
sed -i "s|{\$DOMAIN_URL}|$DOMAIN_URL|g" $CONFIG_FILE

# 3. Ajuste de Permisos (NUEVA SECCIÓN)
# --------------------------------------------------------------------
# Esto es crucial para que el contenedor de Mosquitto pueda leer los
# archivos de configuración y certificados montados desde el host.
echo "-> Ajustando permisos de la configuración de Mosquitto..."

# Hacemos a root el propietario para mayor seguridad
sudo chown -R root:root mosquitto

# Asignamos permisos de lectura/ejecución a los directorios
sudo chmod 755 mosquitto/ mosquitto/config/ mosquitto/certs/

# Asignamos permisos de lectura a los archivos para que el contenedor pueda leerlos
sudo chmod 644 mosquitto/config/mosquitto.conf mosquitto/certs/*
# --------------------------------------------------------------------
# 3.1. Crear archivo de contraseñas para Mosquitto
# 3.1. Crear archivo de contraseñas para Mosquitto
echo "-> Creando archivo de contraseñas para Mosquitto..."
if [ -n "$MOSQUITTO_USER" ]; then
  if command -v mosquitto_passwd >/dev/null 2>&1; then
    mosquitto_passwd -c mosquitto/config/password.txt "$MOSQUITTO_USER"
  else
    echo "   mosquitto_passwd no está disponible en el host, usando contenedor temporal..."
  docker run --rm -v "$PWD/mosquitto/config:/data" eclipse-mosquitto:2.0.22-openssl mosquitto_passwd -b -c /data/password.txt "$MOSQUITTO_USER" "$MOSQUITTO_PASS"
  fi
  sudo chmod 600 mosquitto/config/password.txt
  sudo chown root:root mosquitto/config/password.txt
else
  echo "❌ Error: MOSQUITTO_USER no está definido en .env"
  exit 1
fi
# --------------------------------------------------------------------

# 4. Limpiar Entorno Anterior (Buena práctica)
echo "-> Limpiando cualquier instancia anterior..."
docker compose -f docker-compose.prod.yml down --remove-orphans

# 5. Lanzar todo el sistema con Docker Compose
echo "-> Lanzando todos los servicios..."
docker compose -f docker-compose.prod.yml up -d

echo "✅ ¡Despliegue completado! El sistema está arrancando."
echo "Puedes monitorear los logs con: docker ps y docker logs <nombre_contenedor>"

