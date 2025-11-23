# --- Etapa 1: "Frontend Builder" ---
FROM node:24-slim AS frontend-builder
WORKDIR /usr/src/app
# Copiamos el frontend para construirlo
COPY frontend/package*.json ./
RUN npm install --legacy-peer-deps
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

# Copiamos el package.json del nuevo backend NestJS
COPY backend/package*.json ./
RUN npm install

# Copiamos el código fuente del backend NestJS
COPY backend/ ./

# Compilamos el backend NestJS
RUN npm run build


# --- Etapa 3: "Production" ---
FROM node:24-slim
WORKDIR /usr/src/app

# Copiamos las dependencias del backend NestJS
COPY --from=backend-builder /usr/src/app/node_modules ./node_modules
# Copiamos el código compilado del backend NestJS
COPY --from=backend-builder /usr/src/app/dist ./dist
COPY --from=backend-builder /usr/src/app/package*.json ./
COPY --from=backend-builder /usr/src/app/nest-cli.json ./
COPY --from=backend-builder /usr/src/app/tsconfig*.json ./

# Copiamos la carpeta 'dist' construida del frontend
COPY --from=frontend-builder /usr/src/app/dist ./frontend_dist

EXPOSE 3000
CMD [ "node", "dist/main.js" ]