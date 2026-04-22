# Lorens Nieto — Sistema de Gestión Integral

Sistema de gestión integral para empresa inmobiliaria en Valledupar, Colombia. Administra propiedades vacacionales, servicios complementarios, reservas, facturación y relación con clientes.

## Estado del Proyecto

**En desarrollo activo** — Backend API REST completado, Frontend administrativo en construcción.

## Stack Tecnológico

| Componente | Tecnología |
|------------|------------|
| Backend | Node.js + Express + TypeScript |
| Base de datos | PostgreSQL + Prisma ORM |
| Frontend Admin | React + TypeScript + Vite |
| Frontend Público | HTML/CSS/JavaScript |
| Autenticación | Sesiones PostgreSQL (express-session) |
| Validación | Zod |
| Testing | Jest + Supertest |
| Seguridad | Helmet, rate-limiting, CORS |

## Estructura del Proyecto

```
lorensnieto/
├── backend/                 # API REST
│   ├── src/
│   │   ├── api/            # Rutas (admin, public)
│   │   ├── controllers/    # Controladores
│   │   ├── services/       # Lógica de negocio
│   │   ├── repositories/   # Acceso a datos
│   │   ├── models/         # Schema Prisma + Zod
│   │   ├── middleware/     # Auth, upload, helpers
│   │   ├── jobs/           # Tareas programadas
│   │   ├── pdf/            # Generación de documentos
│   │   └── utils/          # Utilidades
│   ├── prisma/
│   │   └── schema.prisma   # Modelo de datos
│   └── tests/              # Tests de API
├── frontend-admin/          # Panel administrativo (React)
├── frontend-public/         # Sitio web público
└── docs/                    # Documentación técnica
```

## Funcionalidades Implementadas

### Backend API

- [x] **Autenticación y autorización** — Login con sesiones PostgreSQL, roles (admin, partner)
- [x] **Gestión de Propiedades** — CRUD completo (casas de campo, apartamentos)
- [x] **Gestión de Servicios** — CRUD completo (alimentación, limpieza, otros)
- [x] **Sistema de Leads** — Captura y seguimiento de solicitudes de clientes
- [x] **Reservas** — Control de estados (pendiente, confirmada, en servicio, finalizada, cancelada)
- [x] **Contrataciones** — Servicios contratados por clientes
- [x] **Pagos** — Registro de abonos y pagos totales
- [x] **Panel Socio Técnico** — Resumen financiero mensual con cálculos de comisiones
- [x] **Carga de Medios** — Upload de imágenes con procesamiento (sharp)
- [x] **Seguridad** — Helmet, rate limiting, validación Zod, sanitización de inputs
- [x] **Tests** — Suite de tests API con Jest y Supertest

### Frontend Admin (en desarrollo)

- [x] Estructura base del proyecto React + TypeScript + Vite
- [x] Sistema de rutas
- [x] Store de estado (Zustand)
- [x] Componentes base
- [ ] Conexión con API
- [ ] Vistas completas

### Frontend Público (en desarrollo)

- [x] Estructura base HTML/CSS/JS
- [ ] Páginas completas
- [ ] Formulario de contacto

## Modelo de Datos

```
User ─────┐
          │
Property ─┼──── Lead ──── Reservation ──── Payment
          │
Service ──┴──── Contracting ──── ContractingService
                      │
                 PartnerPeriod ──── AlertLog

Settings (configuración global)
Media (imágenes/videos de propiedades y servicios)
LeadNote (notas internas)
```

## Roles del Sistema

| Rol | Descripción | Acceso |
|-----|-------------|--------|
| **Admin** | Lorenda Nieto | Panel administrativo completo |
| **Partner** | Socio Técnico | Solo vista financiera/resumen |

## API Endpoints Principales

### Autenticación
- `POST /api/auth/login` — Iniciar sesión
- `POST /api/auth/logout` — Cerrar sesión
- `GET /api/auth/me` — Usuario actual

### Admin (requiere autenticación)
- `GET /api/admin/me` — Perfil del usuario
- `GET /api/admin/dashboard` — Métricas generales
- `GET/POST/PUT/DELETE /api/admin/properties` — CRUD propiedades
- `GET/POST/PUT/DELETE /api/admin/services` — CRUD servicios
- `GET /api/admin/leads` — Lista de solicitudes
- `GET /api/admin/reservations` — Lista de reservas
- `GET /api/admin/partner/summary` — Resumen financiero (solo partner)

## Licencia

Privado — Todos los derechos reservados
