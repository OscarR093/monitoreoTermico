#!/bin/bash

# Script para construir y publicar la imagen Docker del backend NestJS

set -e

echo "📦 Iniciando construcción de la imagen Docker para el backend NestJS..."

# Verificar que existan los archivos necesarios
if [ ! -f "Dockerfile" ]; then
    echo "❌ Dockerfile no encontrado"
    exit 1
fi

if [ ! -f "package.json" ]; then
    echo "❌ package.json no encontrado"
    exit 1
fi

# Obtener la versión del package.json
VERSION=$(node -p "require('./package.json').version")
IMAGE_NAME="monitoreo-termico-backend"
DOCKER_REGISTRY=${DOCKER_REGISTRY:-"docker.io"}
DOCKER_USERNAME=${DOCKER_USERNAME:-"tu-usuario"}

echo "🏷️  Versión: $VERSION"
echo "🐳 Registry: $DOCKER_REGISTRY"
echo "👤 Username: $DOCKER_USERNAME"

# Construir la imagen
echo "🔨 Construyendo la imagen Docker..."
docker build -t $DOCKER_USERNAME/$IMAGE_NAME:$VERSION .
docker build -t $DOCKER_USERNAME/$IMAGE_NAME:latest .

echo "✅ Imagen construida exitosamente"

# Si se pasa el argumento 'push', subir la imagen a Docker Hub
if [ "$1" = "push" ]; then
    echo "📤 Subiendo imagen a Docker Hub..."
    
    # Login a Docker Hub (solo si no está logueado)
    if ! docker info | grep -q "Username:"; then
        echo "🔐 Por favor, inicia sesión en Docker Hub:"
        docker login
    fi
    
    # Subir imágenes
    docker push $DOCKER_USERNAME/$IMAGE_NAME:$VERSION
    docker push $DOCKER_USERNAME/$IMAGE_NAME:latest
    
    echo "🎉 Imágenes subidas exitosamente a Docker Hub"
    echo "🐳 $DOCKER_USERNAME/$IMAGE_NAME:$VERSION"
    echo "🐳 $DOCKER_USERNAME/$IMAGE_NAME:latest"
fi

echo "✅ Proceso completado exitosamente"