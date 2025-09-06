#!/bin/bash
# Este script automatiza la obtención inicial de certificados SSL
# y la configuración de los servicios para producción.

# Detiene la ejecución si un comando falla
set -euo pipefail

# --- 1. Verificación de Dependencias y Configuración ---
echo "### Verificando configuración del sistema... ###"

# Comprueba si Docker está instalado y corriendo
if ! command -v docker &> /dev/null || ! docker info &> /dev/null; then
    echo "❌ Error: Docker no está instalado o el servicio no está corriendo."
    echo "Por favor, instala Docker y asegúrate de que el servicio esté activo."
    exit 1
fi

# Comprueba si el archivo .env existe
if [ ! -f .env ]; then
  echo "❌ Error: El archivo .env no existe."
  echo "Por favor, crea el archivo .env a partir de la plantilla .env.example."
  exit 1
fi

# Carga las variables desde el .env
export $(grep -v '^#' .env | xargs)

# Comprueba que las variables necesarias para el certificado estén definidas
if [ -z "$DOMAIN_URL" ] || [ -z "$CERT_EMAIL" ]; then
  echo "❌ Error: Las variables DOMAIN_URL y CERT_EMAIL deben estar definidas en .env"
  exit 1
fi

# --- 2. Preparación de Archivos de Configuración ---
echo "### Preparando archivos de configuración... ###"

# Define la ruta al archivo de configuración de Mosquitto
CONF_FILE="./mosquitto/config/mosquitto.conf"

if [ ! -f "$CONF_FILE" ]; then
    echo "❌ Error: No se encuentra el archivo de configuración en $CONF_FILE"
    exit 1
fi

# Reemplaza el marcador de posición del dominio en mosquitto.conf
echo "-> Actualizando '$CONF_FILE' con el dominio: $DOMAIN_URL"
# Usamos '|' como delimitador para sed por si el dominio contiene '/'
sed -i "s|{\$DOMAIN_URL}|$DOMAIN_URL|g" "$CONF_FILE"

# --- 3. Obtención del Certificado SSL ---
echo "### Obteniendo certificado para $DOMAIN_URL ###"

# Levantamos solo Caddy para que pueda servir los archivos de desafío de Certbot
echo "-> Iniciando Caddy temporalmente para la validación..."
docker compose -f docker-compose.prod.yml up -d caddy

# Comando para solicitar el certificado por primera vez
echo "-> Solicitando certificado a Let's Encrypt..."
docker compose -f docker-compose.prod.yml run --rm --entrypoint "\
  certbot certonly --webroot -w /var/www/html --email $CERT_EMAIL \
  --agree-tos --no-eff-email -d $DOMAIN_URL --non-interactive" certbot

# --- 4. Lanzamiento Final del Sistema ---
echo "### Certificado obtenido. Reiniciando todos los servicios... ###"
# 'up -d' aplicará los cambios a todos los contenedores, incluyendo el reinicio de Caddy y Mosquitto
# para que carguen los nuevos certificados.
docker compose -f docker-compose.prod.yml up -d

echo "✅ ¡Despliegue completado! Tu sistema debería estar en línea en https://$DOMAIN_URL"

