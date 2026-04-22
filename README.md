# Lorens Nieto — Sistema de Gestión Integral

Sistema de gestión integral para empresa inmobiliaria en Valledupar, Colombia. Administra propiedades vacacionales, servicios complementarios, reservas, facturación y relación con clientes.

## Estado del Proyecto

**Desarrollo activo** — Backend API funcional, Frontend Admin en construcción.

## Stack Tecnológico

| Capa | Tecnología |
|------|-----------|
| Backend | Node.js + Express + TypeScript |
| Base de datos | PostgreSQL + Prisma ORM |
| Frontend Admin | React + TypeScript + Vite |
| Frontend Público | HTML/CSS/JavaScript |
| CSS Admin | Tailwind CSS |
| State Admin | Zustand |
| Autenticación | express-session + bcrypt |
| Validación | Zod |
| Upload | multer + sharp |
| Testing | Jest + Supertest |

## Estructura del Proyecto

```
lorensnieto/
├── backend/
│   ├── src/
│   │   ├── api/           # Rutas (admin, public, auth)
│   │   ├── controllers/   # Controladores
│   │   ├── services/      # Lógica de negocio
│   │   ├── repositories/  # Acceso a datos
│   │   ├── models/schemas # Schemas Zod
│   │   ├── middleware/    # Auth, upload, errors, rate-limit
│   │   └── config/        # DB, env
│   ├── prisma/
│   │   └── schema.prisma  # 14 modelos de datos
│   └── tests/
├── frontend-admin/         # Panel administrativo (React)
├── frontend-public/        # Sitio web público
└── docs/
```

## Backend API — Funcional

### Autenticación
- `POST /api/auth/login` — Iniciar sesión
- `POST /api/auth/logout` — Cerrar sesión
- `GET /api/auth/me` — Usuario actual

### Catálogo Público (solo lectura)
- `GET /api/public/properties?type=casa_campo|apartamento` — Listar propiedades activas
- `GET /api/public/properties/:id` — Detalle de propiedad
- `GET /api/public/services` — Listar servicios activos
- `GET /api/public/services/:id` — Detalle de servicio
- `POST /api/public/leads` — Enviar solicitud

### Panel Admin (requiere autenticación)
- `GET /api/admin/me` — Perfil del usuario
- `GET /api/admin/dashboard` — Métricas generales
- `GET/POST/PUT/DELETE /api/admin/properties` — CRUD propiedades
- `GET/POST/PUT/DELETE /api/admin/services` — CRUD servicios
- `GET /api/admin/leads` — Lista de solicitudes
- `GET /api/admin/reservations` — Lista de reservas
- `GET /api/admin/partner/summary` — Resumen financiero (solo partner)

## Modelo de Datos

```
User
Property ──┬── Lead ──── Reservation ──── Payment
            │
Service ────┴── Contracting ──── ContractingService
                     │
                PartnerPeriod ──── AlertLog

Settings (configuración)
Media (imágenes/videos)
LeadNote (notas internas)
```

## Fases de Desarrollo

| Fase | Descripción | Estado |
|------|-------------|--------|
| 0 | Fundamentos Backend — Express, Prisma, auth, middleware | ✅ |
| 1 | Rutas Públicas — Catálogo de propiedades y servicios | ✅ |
| 2 | Gestión Admin — CRUD propiedades y servicios con upload | ✅ |
| 3 | Sitio Web Público | 🔲 |
| 4 | Leads y Reservas | 🔲 |
| 5 | Documentos PDF | 🔲 |
| 6 | Panel Socio Técnico | 🔲 |
| 7 | Métricas y Reportes | 🔲 |
| 8 | Deploy y Pulido | 🔲 |

## Frontend Admin

| Componente | Estado |
|------------|--------|
| Proyecto React + TypeScript + Vite | ✅ |
| Tailwind CSS configurado | ✅ |
| Zustand store | ✅ |
| React Router + layout base | ✅ |
| Conexión con API | 🔲 |
| Vistas completas | 🔲 |

## Frontend Público

| Componente | Estado |
|------------|--------|
| Estructura HTML/CSS/JS base | ✅ |
| Cliente API JavaScript | 🔲 |
| Páginas de catálogo | 🔲 |
| Formulario de solicitud | 🔲 |

## Licencia

Privado — Todos los derechos reservados
