#!/bin/bash

# =================================================================
# Script Robusto para la Configuración Inicial del Broker Mosquitto
# =================================================================
# Versión 2.0 - Incorpora verificaciones de seguridad y dependencias.
#
# Este script automatiza la configuración de Mosquitto de forma segura:
# 1. Verifica dependencias y la existencia del archivo .env.
# 2. Carga la configuración desde el .env.
# 3. Genera certificados autofirmados si no existen.
# 4. Crea el archivo de configuración de Mosquitto.
# 5. Establece los permisos correctos en todos los archivos.
#
# Uso:
# 1. Copia '.env.example' a '.env' y rellena tus variables.
# 2. Ejecuta en el servidor VPS con sudo: sudo bash setup_mosquitto.sh
# =================================================================

# --- Opciones de Seguridad del Script ---
# set -e: El script saldrá inmediatamente si un comando falla.
# set -u: Trata las variables no definidas como un error y sale.
# set -o pipefail: El código de salida de una tubería es el del último comando que falló.
set -euo pipefail

# --- Colores para la Salida ---
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # Sin Color

# --- 1. Verificaciones Previas ---
echo -e "${YELLOW}Iniciando verificaciones previas...${NC}"

# Verificar si 'openssl' está instalado
if ! command -v openssl &> /dev/null; then
  echo -e "${RED}Error: La dependencia 'openssl' no está instalada. Por favor, instálala e inténtalo de nuevo.${NC}"
  exit 1
fi

# Verificar si el archivo .env existe
if [ ! -f .env ]; then
  echo -e "${RED}Error: El archivo de configuración '.env' no se encontró.${NC}"
  echo "Por favor, copia '.env.example' a '.env' y rellena tus variables."
  exit 1
fi

# --- 2. Cargar Configuración desde .env ---
echo "-> Cargando configuración desde el archivo .env..."
# Exporta las variables del .env para que estén disponibles en el script
export $(grep -v '^#' .env | xargs)

# Verificar que la variable DOMAIN_URL está definida
if [ -z "${DOMAIN_URL-}" ]; then
  echo -e "${RED}Error: La variable 'DOMAIN_URL' no está definida en tu archivo .env.${NC}"
  exit 1
fi
echo -e "${GREEN}Configuración cargada.${NC}\n"

# --- Variables de Script (definidas después de cargar .env) ---
MOSQUITTO_DIR="mosquitto"
CONFIG_DIR="$MOSQUITTO_DIR/config"
CERTS_DIR="$MOSQUITTO_DIR/certs"
CONF_FILE="$CONFIG_DIR/mosquitto.conf"

# --- 3. Crear Estructura de Directorios ---
echo "-> Creando directorios: $CONFIG_DIR y $CERTS_DIR..."
mkdir -p "$CONFIG_DIR"
mkdir -p "$CERTS_DIR"
echo -e "${GREEN}Directorios creados.${NC}\n"

# --- 4. Generar Certificados SSL Autofirmados ---
if [ ! -f "$CERTS_DIR/server.key" ]; then
  echo "-> No se encontraron certificados. Generando nuevos certificados autofirmados..."
  
  # Construye el "subject" del certificado usando las variables del .env
  CERT_SUBJECT="/C=${CERT_COUNTRY}/ST=${CERT_STATE}/L=${CERT_CITY}/O=${CERT_ORG}/CN=${DOMAIN_URL}"

  openssl req -x509 -newkey rsa:4096 \
    -keyout "$CERTS_DIR/server.key" \
    -out "$CERTS_DIR/server.crt" \
    -days 365 -nodes \
    -subj "$CERT_SUBJECT"
  
  cp "$CERTS_DIR/server.crt" "$CERTS_DIR/ca.crt"
  echo -e "${GREEN}Certificados generados para el dominio: $DOMAIN_URL.${NC}\n"
else
  echo -e "-> Los certificados ya existen. Saltando generación.${NC}\n"
fi

# --- 5. Crear Archivo de Configuración de Mosquitto ---
echo "-> Creando archivo de configuración en $CONF_FILE..."
cat <<EOF > "$CONF_FILE"
# --- Configuración General ---
persistence true
persistence_location /mosquitto/data
log_dest file /mosquitto/log/mosquitto.log
allow_anonymous false
password_file /mosquitto/config/password.txt

# --- Listener INTERNO (para el backend) ---
listener 1883

# --- Listener EXTERNO (para gateways/IoT) ---
listener 8883
cafile /mosquitto/certs/ca.crt
certfile /mosquitto/certs/server.crt
keyfile /mosquitto/certs/server.key
EOF
echo -e "${GREEN}Archivo de configuración creado.${NC}\n"

# --- 6. Ajustar Permisos ---
echo "-> Ajustando permisos de los archivos y directorios..."
# Usamos $SUDO_USER para que el dueño sea el usuario que ejecutó 'sudo'
OWNER_USER=${SUDO_USER:-$(whoami)}
chown -R "$OWNER_USER:$OWNER_USER" "$MOSQUITTO_DIR"
chmod 755 "$MOSQUITTO_DIR" "$CONFIG_DIR" "$CERTS_DIR"
chmod 644 "$CONFIG_DIR"/* "$CERTS_DIR"/*
echo -e "${GREEN}Permisos ajustados correctamente.${NC}\n"

echo -e "${GREEN}🎉 Configuración de Mosquitto completada con éxito.${NC}"

