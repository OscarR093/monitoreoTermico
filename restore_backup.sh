#!/bin/bash

# Script para restaurar backup de MongoDB
# Configuración
CONTAINER_NAME="mi-mongo-dev"
DB_NAME="monitoreoTermico"
USERNAME="devuser"
PASSWORD="devpassword"
BACKUP_PATH="/tmp/backup"

echo "🔄 Iniciando restauración de backup de MongoDB..."

# Función para restaurar una colección
restore_collection() {
    local collection=$1
    echo "📂 Restaurando colección: $collection"
    
    docker exec $CONTAINER_NAME mongorestore \
        --host localhost:27017 \
        --username $USERNAME \
        --password $PASSWORD \
        --authenticationDatabase admin \
        --db $DB_NAME \
        --collection $collection \
        --drop \
        $BACKUP_PATH/${collection}.bson
        
    if [ $? -eq 0 ]; then
        echo "✅ $collection restaurada exitosamente"
    else
        echo "❌ Error al restaurar $collection"
    fi
}

# Restaurar todas las colecciones
echo "📋 Colecciones a restaurar:"
collections=(
    "users"
    "thermocouplehistories"
    "e_p_1"
    "e_p_2"
    "estacion_1"
    "estacion_2"
    "linea_1"
    "linea_2"
    "linea_3"
    "linea_4"
    "linea_7"
    "torre_fusoras"
)

for collection in "${collections[@]}"; do
    restore_collection $collection
    echo ""
done

echo "🎉 ¡Restauración completa!"
echo "🔍 Verificando datos restaurados..."

# Verificar que las colecciones se restauraron
docker exec $CONTAINER_NAME mongosh \
    -u $USERNAME \
    -p $PASSWORD \
    --authenticationDatabase admin \
    --eval "
        use $DB_NAME;
        db.getCollectionNames().forEach(function(collection) {
            var count = db[collection].countDocuments();
            print(collection + ': ' + count + ' documentos');
        });
    "
