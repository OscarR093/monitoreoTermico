# --- Etapa 1: "Frontend Builder" ---
FROM node:24-slim AS frontend-builder
WORKDIR /usr/src/app
# Corregido: Especificamos la ruta al package.json del frontend
COPY frontend/package*.json ./
RUN npm install --legacy-peer-deps
# Corregido: Especificamos la ruta al código fuente del frontend
COPY frontend/ ./
RUN npm run build


# --- Etapa 2: "Backend Builder" ---
FROM node:24-slim AS backend-builder
WORKDIR /usr/src/app
# Instalar dependencias necesarias para compilar módulos nativos
RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*
# Corregido: Especificamos la ruta al package.json del backend
COPY backend/package*.json ./
RUN npm install
# Corregido: Especificamos la ruta al código fuente del backend
COPY backend/ ./


# --- Etapa 3: "Production" ---
FROM node:24-slim
WORKDIR /usr/src/app

# Copiamos las dependencias del backend
COPY --from=backend-builder /usr/src/app/node_modules ./node_modules
# Copiamos el código del backend
COPY --from=backend-builder /usr/src/app .

# Copiamos la carpeta 'dist' construida del frontend
COPY --from=frontend-builder /usr/src/app/dist ./dist

EXPOSE 3000
CMD [ "node", "index.js" ]