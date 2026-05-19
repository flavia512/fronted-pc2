# ── Stage 1: Build Angular ──────────────────────────────────
FROM node:20-alpine AS builder

# URL del backend — se pasa con: --build-arg API_URL=http://IP:8000/api
ARG API_URL=http://localhost:8000/api

WORKDIR /app

# Herramientas para compilar módulos nativos (mapbox-gl, etc.)
RUN apk add --no-cache python3 make g++

COPY package*.json ./
RUN npm install --legacy-peer-deps

COPY . .

# Inyectar la URL en el environment de producción antes de compilar
RUN sed -i "s|http://localhost:8000/api|${API_URL}|g" src/environments/environment.ts

RUN npm run build

# ── Stage 2: Serve with Nginx ────────────────────────────────
FROM nginx:1.25-alpine

COPY --from=builder /app/dist/frontend-app/browser /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
