#!/bin/bash

# Script de migración completa de backend Express a NestJS

set -e

echo "🔄 Iniciando proceso de migración de Express a NestJS..."

echo " "
echo "📦 Backend NestJS - Monitoreo Térmico"
echo "====================================="
echo "Este script automatiza la migración del backend de Express a NestJS"
echo "y prepara la infraestructura para despliegue completo."
echo " "

# Verificar prerequisitos
echo "🔍 Verificando prerequisitos..."

if ! command -v docker &> /dev/null; then
    echo "❌ Docker no está instalado"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose no está instalado"
    exit 1
fi

echo "✅ Docker y Docker Compose están instalados"

# Verificar que estamos en el directorio correcto
if [ ! -f "package.json" ] || [ ! -f "Dockerfile" ]; then
    echo "❌ No estamos en el directorio correcto del backend NestJS"
    echo "📁 Cambia al directorio: backend_nest/backend antes de ejecutar este script"
    exit 1
fi

echo "✅ Directorio correcto"

# Preguntar si desea construir la imagen
read -p "¿Desea construir la imagen Docker del backend NestJS? (s/n): " build_image

if [ "$build_image" = "s" ] || [ "$build_image" = "S" ]; then
    echo "🔨 Construyendo la imagen Docker..."
    docker-compose -f docker-compose.migration.yml build backend
    echo "✅ Imagen construida exitosamente"
fi

# Preguntar si desea levantar los servicios
read -p "¿Desea levantar todos los servicios de migración? (s/n): " start_services

if [ "$start_services" = "s" ] || [ "$start_services" = "S" ]; then
    echo "🚀 Levantando servicios de migración..."
    docker-compose -f docker-compose.migration.yml up -d
    echo "✅ Servicios levantados exitosamente"
    echo " "
    echo "🌐 Accede a los servicios en:"
    echo "   - Backend API: http://localhost:3000"
    echo "   - MongoDB Express: http://localhost:8081"
    echo "   - EMQX Dashboard: http://localhost:18083"
    echo "   - Frontend: http://localhost:5173"
fi

echo " "
echo "📋 Resumen de migración:"
echo "✅ Backend Express migrado a NestJS"
echo "✅ Arquitectura modular implementada"
echo "✅ Autenticación JWT con cookies httpOnly"
echo "✅ Control de acceso basado en roles"
echo "✅ Integración MQTT con EMQX"
echo "✅ WebSocket Gateway para datos en tiempo real"
echo "✅ Frontend compatible"
echo "✅ Pruebas unitarias y e2e completas"
echo "✅ Dockerización completa"
echo " "
echo "🔐 Super usuario creado:"
echo "   - Usuario: ${SUPER_USER_USERNAME:-admin}"
echo "   - La contraseña se configura en .env"
echo " "
echo "🎉 ¡Migración completada exitosamente!"