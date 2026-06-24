<div align="center">

# 🗺️ RutaShare — Plataforma de Carpooling para Madrid

**SPA Angular 21 · Mapbox GL · JWT · Docker · Bootstrap 5**

[![Angular](https://img.shields.io/badge/Angular-21-DD0031?style=for-the-badge&logo=angular&logoColor=white)](https://angular.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Mapbox](https://img.shields.io/badge/Mapbox_GL-3.x-000000?style=for-the-badge&logo=mapbox&logoColor=white)](https://mapbox.com)
[![Bootstrap](https://img.shields.io/badge/Bootstrap-5.3-7952B3?style=for-the-badge&logo=bootstrap&logoColor=white)](https://getbootstrap.com)
[![Docker](https://img.shields.io/badge/Docker-ready-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://docker.com)

> Aplicación web full-featured de **carpooling urbano** que conecta conductores y pasajeros en Madrid. Planificación de rutas en tiempo real con Mapbox, sistema de reservas, viajes compartidos, alertas y panel de administración — todo sobre Angular Signals y JWT.

</div>

---

## ✨ Funcionalidades principales

| Módulo | Descripción |
|---|---|
| 🗺️ **Rutas inteligentes** | Calcula el itinerario con Mapbox Directions API, detecta automáticamente si pasa por la M-30 y guarda la ruta para reutilizarla |
| 🚗 **Viajes compartidos** | Publica o busca plazas en viajes ya planificados; plazas disponibles actualizadas en tiempo real |
| 📅 **Reservas** | Reserva asiento en cualquier viaje activo con un solo clic y gestiona tus reservas pasadas y futuras |
| ⭐ **Favoritos** | Marca rutas y viajes como favoritos para acceder a ellos rápidamente |
| 🔔 **Alertas** | Sistema de notificaciones de la app (cambios de estado de reservas, nuevos viajes en tus rutas habituales…) |
| 🔐 **Autenticación JWT** | Login / registro seguro con token Bearer; modo invitado para explorar la app sin cuenta |
| 🛡️ **Panel de administración** | Vista exclusiva para admins: gestión de usuarios y roles directamente desde la interfaz |

---

## 🏗️ Arquitectura y stack técnico

```
src/
├── app/
│   ├── core/
│   │   ├── guards/          # Auth guard con roles (admin / user / guest)
│   │   ├── interceptors/    # HTTP interceptor que inyecta el token JWT
│   │   ├── models/          # Interfaces TypeScript estrictas
│   │   └── services/        # Capa de datos (Auth, Rutas, Reservas, Mapbox…)
│   ├── pages/               # Componentes de página (lazy-ready)
│   └── shared/              # Componentes reutilizables (Header, AlertaPopup…)
└── environments/            # Config de entorno (dev / prod)
```

### Decisiones técnicas destacadas

- **Angular Signals** para estado reactivo sin necesidad de NgRx, reduciendo complejidad.
- **HTTP Interceptor** centraliza la inyección del Bearer token en cada petición autenticada.
- **Route Guards** con verificación de rol (`admin` vs `user` vs `invitado`) para proteger vistas sensibles.
- **Mapbox Directions + Geocoding API** para autocompletar direcciones y trazar rutas con detección de vías de alta capacidad (M-30).
- **Multi-stage Docker build** (Node 20 → Nginx 1.25 Alpine): imagen final de producción < 50 MB.

---

## 🚀 Inicio rápido

### Prerrequisitos

- Node.js 20+
- Angular CLI 21 (`npm i -g @angular/cli`)
- Token de Mapbox (gratuito en [mapbox.com](https://mapbox.com))

### Instalación local

```bash
# 1. Clona el repositorio
git clone https://github.com/flavia512/fronted-pc2.git
cd fronted-pc2

# 2. Instala dependencias
npm install --legacy-peer-deps

# 3. Añade tu token de Mapbox en src/environments/environment.development.ts
#    mapboxToken: 'pk.eyJ1...'

# 4. Arranca el servidor de desarrollo
npm start
# → http://localhost:4200
```

### Con Docker (producción)

```bash
docker build \
  --build-arg API_URL=http://<IP_BACKEND>:8000/api \
  -t rutashare-frontend .

docker run -p 80:80 rutashare-frontend
# → http://localhost
```

> La URL del backend se inyecta en tiempo de compilación mediante `--build-arg`, por lo que no se expone ninguna configuración sensible en la imagen final.

---

## 🛠️ Scripts disponibles

| Comando | Acción |
|---|---|
| `npm start` | Servidor de desarrollo con hot-reload |
| `npm run build` | Build de producción optimizado |
| `npm test` | Tests unitarios con **Vitest** |
| `npm run watch` | Build en modo observación (development) |

---

## 📐 Flujo de la aplicación

```
Home (público)
   ├── Login / Registro  →  JWT guardado en localStorage
   ├── Continuar como invitado  →  acceso de sólo lectura
   └── [Autenticado]
         ├── Rutas  →  Crear · Ver · Guardar
         │     └── Viajes compartidos  →  Publicar · Reservar
         ├── Mis reservas
         ├── Favoritos
         ├── Alertas
         ├── Perfil
         └── [Admin]  →  Gestión de usuarios
```

---

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Abre un *issue* para proponer cambios o un *pull request* directamente.

---

<div align="center">

Hecho con ❤️ y ☕ · Angular 21 · Madrid 🇪🇸

</div>
