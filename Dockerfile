# ── Stage 1: Build Angular ──────────────────────────────────
# Usamos Node.js 20 para compilar la app Angular
FROM node:20-alpine AS builder

# Variable que recibe la URL del backend en tiempo de build.
# Valor por defecto: localhost:8000 (funciona con el túnel SSH)
# Se puede sobreescribir con: --build-arg API_URL=http://otraurl/api
ARG API_URL=http://localhost:8000/api

WORKDIR /app

# Herramientas necesarias para compilar módulos nativos (mapbox-gl, etc.)
RUN apk add --no-cache python3 make g++

# Instalar dependencias npm
COPY package*.json ./
RUN npm install --legacy-peer-deps

# Copiar el código fuente del proyecto Angular
COPY . .

# Inyectar la URL del backend en el archivo de entorno de producción
# antes de compilar, para que Angular sepa dónde está la API
RUN sed -i "s|http://localhost:8000/api|${API_URL}|g" src/environments/environment.ts

# Compilar Angular (genera archivos estáticos en /app/dist/)
RUN npm run build

# ── Stage 2: Serve with Nginx ────────────────────────────────
# Imagen ligera de Nginx para servir los archivos compilados
FROM nginx:1.25-alpine

# Copiar solo los archivos compilados del stage anterior (no el código fuente)
COPY --from=builder /app/dist/frontend-app/browser /usr/share/nginx/html

# Configuración personalizada de Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# El contenedor escucha en el puerto 80
EXPOSE 80