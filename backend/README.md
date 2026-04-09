# Backend — Lorens Nieto API

API REST del Sistema de Gestión Integral Lorens Nieto.

## Requisitos

- Node.js >= 20
- PostgreSQL 16
- Docker (opcional, para la base de datos)

## Instalación

```bash
# Instalar dependencias
npm install

# Copiar variables de entorno
cp .env.example .env
# Editar .env con tus valores

# Crear la base de datos con Docker
docker-compose up -d postgres

# Correr migraciones
npm run db:migrate

# Seed: crear usuarios de prueba
npm run db:seed
```

## Desarrollo

```bash
npm run dev        # Iniciar con hot-reload (tsx watch)
npm run build     # Compilar TypeScript
npm start         # Producción
```

## Tests

```bash
npm run test          # Correr todos los tests
npm run test:watch    # Modo watch
```

## Estructura

```
src/
├── api/
│   ├── public/       # Rutas públicas (catálogo, auth, leads)
│   ├── admin/         # Rutas del panel admin
│   └── partner/       # Rutas del panel socio técnico
├── services/          # Lógica de negocio
├── repositories/     # Acceso a datos
├── models/            # Tipos y esquemas
├── middleware/        # Auth, errores, rate-limit
├── pdf/               # Generación de PDFs
├── jobs/              # Tareas programadas (cron)
└── config/            # Configuración global
```

## Endpoints principales

| Método | Ruta | Descripción | Auth |
|--------|------|-------------|------|
| GET | `/api/health` | Health check | No |
| POST | `/api/auth/login` | Iniciar sesión | No |
| POST | `/api/auth/logout` | Cerrar sesión | Sí |
| GET | `/api/auth/me` | Usuario actual | Sí |
| GET | `/api/public/properties` | Listar propiedades | No |
| GET | `/api/public/properties/:id` | Detalle propiedad | No |
| GET | `/api/public/services` | Listar servicios | No |
| GET | `/api/public/services/:id` | Detalle servicio | No |
| POST | `/api/public/leads` | Crear solicitud | No |

## Credenciales de prueba (desarrollo)

- **Admin**: `lorena@lorensnieto.com` / `admin123`
- **Partner**: `julio@jsoftsolutions.com` / `partner123`

⚠️ Cambiar contraseñas antes de desplegar a producción.
