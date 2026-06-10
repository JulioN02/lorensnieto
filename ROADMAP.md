# ROADMAP DE DESARROLLO
## Sistema de Gestión Integral — Lorens Nieto

> **Documento vivo**: Se actualiza a medida que avanza el desarrollo.
> Última actualización: 10/06/2026 — PROYECTO COMPLETADO: Slices 1-9 terminados
> Backend: ~95% | Frontend Admin: ~95% | Frontend Público: 100%
> Responsable: Julio Nieto (J-Soft Solutions)
> Cliente: Lorena Nieto — Lorens Nieto Administración de Arrendamientos & Servicios

---

## INFORMACIÓN GENERAL DEL PROYECTO

| Campo | Valor |
|-------|-------|
| **Contrato** | `oficialDocs/CONTRATO_LorensNieto_v3.pdf` |
| **Especificación** | `oficialDocs/ESPECIFICACION_FUNCIONAL_LorensNieto_v3.pdf` |
| **Descripción** | `oficialDocs/DESCRIPCION_SOFTWARE_LorensNieto_v3.pdf` |
| **Fecha firma** | 06 de abril de 2026 |
| **Plazo entrega** | 120 días → **04 de agosto de 2026** |
| **Precio total** | $3.068.000 COP |
| **Anticipo** | $700.000 COP |
| **Revenue-share Fase 1** | 9% arrendamientos / 7% servicios |
| **Revenue-share Fase 2** | 5% (al completar $3.068.000) |

---

## STACK TÉCNICO

| Capa | Tecnología |
|------|-----------|
| **Backend** | Node.js + Express + TypeScript |
| **Base de datos** | PostgreSQL |
| **ORM** | Prisma |
| **Frontend Público** | Vanilla HTML / CSS / JavaScript |
| **Frontend Admin** | React + TypeScript + Vite |
| **CSS Admin** | Tailwind CSS |
| **State Admin** | Zustand |
| **PDFs** | pdf-lib |
| **Subida archivos** | multer + sharp (compresión automática) |
| **Email** | nodemailer |
| **Tareas programadas** | node-cron (alertas, cierres mensuales) |
| **Autenticación** | express-session + bcrypt |
| **Testing API** | Jest + Supertest |
| **Testing E2E** | Playwright |
| **Infra** | Railway + Docker + GitHub Actions |
| **Versionamiento** | Git + GitHub |

---

## ESTRUCTURA DEL PROYECTO

```
LorensNieto/
├── Maquetas/              → HTML mocks (referencia visual)
├── v1/, v2/               → Documentos históricos
└── v3/                    → VERSIÓN ACTUAL
    ├── app/               ← CÓDIGO FUENTE (git repo está aquí)
    │   ├── backend/
    │   ├── frontend-public/
    │   ├── frontend-admin/
    │   ├── docs/
    │   └── docker-compose.yml
    ├── oficialDocs/       → Contratos y especificaciones
    ├── AGENTS.md          → Config para agentes IA
    └── ROADMAP.md         ← ESTE DOCUMENTO
```

## ESTRUCTURA DEL MONOREPO (v3/app/)

```
v3/app/
├── backend/
│   ├── src/
│   │   ├── api/              # Rutas Express
│   │   │   ├── public/       # Catálogo, solicitudes
│   │   │   ├── admin/        # Panel administradora
│   │   │   └── partner/      # Panel socio técnico
│   │   ├── services/         # Lógica de negocio
│   │   ├── repositories/     # Acceso a datos
│   │   ├── models/           # Tipos, interfaces, esquemas
│   │   ├── middleware/        # Auth, validación, rate-limit
│   │   ├── pdf/              # Generación de documentos
│   │   ├── jobs/             # Tareas programadas (cron)
│   │   └── config/           # DB, env, constantes
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── migrations/
│   ├── tests/
│   ├── uploads/              # Storage temporal de medios
│   ├── Dockerfile
│   └── package.json
│
├── frontend-public/
│   ├── index.html            # Página de inicio
│   ├── casas-campo/
│   │   ├── index.html        # Listado
│   │   └── [id].html         # Página individual
│   ├── apartamentos/
│   │   ├── index.html
│   │   └── [id].html
│   ├── servicios/
│   │   ├── index.html
│   │   └── [id].html
│   ├── css/
│   ├── js/
│   │   ├── api.js            # Cliente API
│   │   ├── components.js     # UI reutilizable
│   │   └── utils.js
│   └── assets/
│
├── frontend-admin/
│   ├── src/
│   │   ├── components/       # Botones, tablas, modals, cards
│   │   ├── pages/
│   │   │   ├── Login/
│   │   │   ├── Dashboard/
│   │   │   ├── Inbox/        # Bandeja de entrada (Leads)
│   │   │   ├── Properties/   # Casas de campo + Apartamentos
│   │   │   ├── Services/
│   │   │   ├── Reservations/
│   │   │   ├── Reports/
│   │   │   ├── Settings/
│   │   │   └── Partner/      # Panel socio técnico
│   │   ├── hooks/
│   │   ├── services/         # Llamadas a API
│   │   ├── store/            # Zustand stores
│   │   ├── types/
│   │   └── utils/
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   └── package.json
│
├── docs/
│   └── openapi.yaml          # Especificación API
│
├── Maquetas/                  # HTML mocks (referencia visual)
├── oficialDocs/               # Documentación contractual
├── docker-compose.yml
├── .github/workflows/
├── package.json               # Root (monorepo)
├── AGENTS.md                  # Config IA
└── ROADMAP.md                 # ← ESTE DOCUMENTO
```

---

## MODELO DE DATOS

### Entidades Principales

```
┌─────────────┐     ┌──────────────┐     ┌──────────────────┐
│    User      │     │   Property   │     │     Service      │
│─────────────│     │──────────────│     │──────────────────│
│ id           │     │ id           │     │ id               │
│ email        │     │ type*        │     │ name             │
│ password     │     │ name         │     │ classification** │
│ role***      │     │ description  │     │ type             │
│ created_at   │     │ zone         │     │ price            │
└─────────────┘     │ capacity     │     │ active           │
                    │ price_night  │     │ created_at       │
                    │ active       │     └──────────────────┘
                    │ owner_name   │
                    │ owner_cedula │     ┌──────────────────┐
                    │ owner_phone  │     │      Media       │
                    │ owner_email  │     │──────────────────│
                    │ created_at   │     │ id               │
                    └──────────────┘     │ entity_type†     │
                                         │ entity_id        │
┌─────────────┐     ┌──────────────┐     │ url              │
│    Lead      │     │ Reservation  │     │ media_type       │
│─────────────│     │──────────────│     │ order_index      │
│ id           │     │ id           │     └──────────────────┘
│ customer_*   │     │ customer_*   │
│ property_id? │     │ property_id  │     ┌──────────────────┐
│ service_id?  │     │ date_start   │     │     Payment      │
│ status††     │     │ date_end     │     │──────────────────│
│ notes        │     │ status†††    │     │ id               │
│ created_at   │     │ price_total  │     │ reservation_id   │
└─────────────┘     │ created_at   │     │ amount           │
                    └──────────────┘     │ type‡            │
                                         │ status‡‡         │
┌──────────────────┐                     │ created_at       │
│  PartnerPeriod   │                     └──────────────────┘
│──────────────────│
│ id               │     ┌──────────────────┐
│ month            │     │    AlertLog      │
│ revenue_total    │     │──────────────────│
│ phase‡‡‡         │     │ id               │
│ pct_applied      │     │ period_id        │
│ amount_due       │     │ amount_pending   │
│ amount_paid      │     │ triggered_at     │
│ status‡‡‡‡       │     │ resolved_at      │
│ deadline_date    │     └──────────────────┘
│ created_at       │
└──────────────────┘     ┌──────────────────┐
                         │    Settings      │
                         │──────────────────│
                         │ commission_pct   │
                         │ rules_doc_url    │
                         │ notification_email│
                         │ partner_deadline_days│
                         └──────────────────┘
```

**Referencias:**
- `*` type: `casa_campo` | `apartamento`
- `**` classification: `alimentacion` | `limpieza` | `otros`
- `***` role: `admin` | `partner`
- `†` entity_type: `property` | `service`
- `††` Lead status: `nueva` | `revisada` | `convertida` | `descartada`
- `†††` Reservation status: `pendiente` | `confirmada` | `en_servicio` | `finalizada` | `cancelada`
- `‡` Payment type: `abono` | `total`
- `‡‡` Payment status: `pendiente` | `pagado`
- `‡‡‡` Phase: `fase_1` | `fase_2`
- `‡‡‡‡` Period status: `pendiente` | `en_alerta` | `pagado_parcial` | `pagado` | `en_disputa`

---

## FASES DE DESARROLLO

### Estado General

| Fase | Nombre | Semanas | Estado |
|------|--------|---------|--------|
| 0 | Fundamentos Backend | — | ✅ Completada |
| 1 | Rutas Públicas | — | ✅ Completada |
| 2 | Gestión de Propiedades y Servicios | — | ✅ Completada (backend + frontend) |
| 3 | Sitio Web Público | 5-6 | ✅ Completada |
| 4 | Leads y Reservas | 7-8 | ✅ Completada (backend + frontend) |
| 5 | Documentos PDF | 9 | ✅ Completada |
| 6 | Panel Socio Técnico | 10-11 | ✅ Completada (backend + frontend) |
| 7 | Métricas y Reportes | 12 | ✅ Completada (backend + frontend con Chart.js) |
| 8 | Deploy y Pulido | 13-14 | ✅ Completada (Dockerfile + CI/CD + E2E tests) |

---

### FASE 1: FUNDACIÓN — Semanas 1-2

> **Objetivo**: Tener la base del proyecto corriendo localmente con autenticación y estructura sólida.

#### 1.1 Inicialización del Monorepo
- [x] Crear estructura de carpetas (`/backend`, `/frontend-public`, `/frontend-admin`)
- [x] Configurar `package.json` raíz con workspaces
- [x] Inicializar Git + `.gitignore` (node_modules, .env, uploads)
- [ ] Crear repositorio en GitHub (privado)

#### 1.2 Backend Base
- [x] Inicializar Express + TypeScript en `/backend`
- [x] Configurar estructura de capas (routes → services → repositories)
- [x] Configurar middleware: CORS, JSON parser, error handler
- [x] Crear health check endpoint (`GET /api/health`)
- [x] Configurar variables de entorno (`.env` + `.env.example`)

#### 1.3 Base de Datos
- [x] Configurar Docker Compose con PostgreSQL
- [x] Instalar y configurar Prisma
- [x] Diseñar esquema completo (`schema.prisma`)
- [x] Crear primera migration
- [x] Seed inicial: usuario admin + usuario socio técnico
- [x] Verificar conexión desde backend

#### 1.4 Autenticación
- [x] Configurar express-session + connect-pg-simple (sesiones en DB)
- [x] Implementar hash de contraseñas con bcrypt
- [x] Endpoint `POST /api/auth/login`
- [x] Endpoint `POST /api/auth/logout`
- [x] Endpoint `GET /api/auth/me`
- [x] Middleware `requireAuth` (verifica sesión activa)
- [x] Middleware `requireRole('admin')` y `requireRole('partner')`
- [x] Proteger rutas según rol

#### 1.5 Frontend Admin Base
- [ ] Inicializar Vite + React + TypeScript en `/frontend-admin`
- [ ] Instalar y configurar Tailwind CSS
- [ ] Instalar Zustand para state management
- [ ] Configurar React Router con layout base
- [ ] Crear página de Login
- [ ] Crear layout con sidebar de navegación (responsive)
- [ ] Configurar cliente API centralizado (axios o fetch wrapper)
- [ ] Auth store en Zustand (login, logout, user state)

#### 1.6 Documentación API
- [ ] Crear `docs/openapi.yaml` base con endpoints de auth
- [ ] Configurar Swagger UI en modo desarrollo

**Entregable Fase 1**: Backend corriendo con auth funcional, DB conectada, admin con login y layout base.

---

### FASE 2: GESTIÓN DE PROPIEDADES Y SERVICIOS — Semanas 3-4 ✅ COMPLETADA

> **Objetivo**: La administradora puede crear, editar y gestionar todas sus propiedades y servicios con fotos.

#### 2.1 API de Propiedades ✅
- [x] `GET /api/admin/properties` — Listar con filtros (tipo, zona, activo)
- [x] `GET /api/admin/properties/:id` — Detalle completo
- [x] `POST /api/admin/properties` — Crear propiedad
- [x] `PUT /api/admin/properties/:id` — Editar propiedad
- [x] `PATCH /api/admin/properties/:id/toggle` — Activar/Inactivar (via PUT con campo `active`)
- [x] `DELETE /api/admin/properties/:id` — Eliminar
- [x] Validaciones Zod: nombre requerido, precio > 0, capacidad > 0

#### 2.2 API de Servicios ✅
- [x] `GET /api/admin/services` — Listar con filtros
- [x] `GET /api/admin/services/:id` — Detalle
- [x] `POST /api/admin/services` — Crear
- [x] `PUT /api/admin/services/:id` — Editar
- [x] `PATCH /api/admin/services/:id/toggle` — Activar/Inactivar
- [x] `DELETE /api/admin/services/:id` — Eliminar

#### 2.3 API de Medios (Imágenes/Videos) ✅
- [x] Multer configurado: 20MB por archivo, 20 archivos max, img/video
- [x] Compresión automática de imágenes con sharp (utils/media.ts)
- [x] Validación: formatos (JPG, PNG, WEBP, GIF, MP4, MOV, AVI, MKV)
- [x] `POST /api/admin/properties` y `/services` acceptan `multipart/form-data` con campo `media`
- [x] `DELETE /api/admin/media/:id` — Eliminar medio (via cascade en update)
- [x] Servir archivos estáticos desde `/uploads` (montado en app.ts)

#### 2.4 Frontend Admin — Propiedades
- [ ] Listado de casas de campo (tabla con imagen, nombre, zona, acciones)
- [ ] Listado de apartamentos
- [ ] Formulario de alta/edición con todos los campos
- [ ] Sección de datos del propietario (interno, no visible en público)
- [ ] Galería de medios (subir, previsualizar, ordenar, eliminar)
- [ ] Selector de amenidades
- [ ] Campo de reglas y restricciones
- [ ] Toggle activar/inactivar
- [ ] Confirmación doble para eliminar

#### 2.5 Frontend Admin — Servicios
- [ ] Listado de servicios (tabla con imagen, nombre, clasificación, precio)
- [ ] Formulario de alta/edición
- [ ] Selector de clasificación (alimentación, limpieza, otros)
- [ ] Galería de medios
- [ ] Toggle activar/inactivar

#### 2.6 API Pública de Catálogo (solo lectura) ✅
- [x] `GET /api/public/properties?type=casa_campo` — Listar activas con filtros
- [x] `GET /api/public/properties/:id` — Detalle de propiedad activa
- [x] `GET /api/public/properties?type=apartamento` — Listar apartamentos
- [x] `GET /api/public/services` — Listar servicios activos
- [x] `GET /api/public/services/:id` — Detalle de servicio activo
- [x] Paginación (10 propiedades/página, 20 servicios/página)

**Entregable Fase 2**: ✅ Backend CRUD completo de propiedades y servicios con galería de medios funcional. Frontend pendiente.

---

### FASE 3: SITIO WEB PÚBLICO — Semanas 5-6

> **Objetivo**: El público puede navegar el catálogo completo, ver propiedades y servicios, y enviar solicitudes.

#### 3.1 Estructura Base del Sitio Público
- [ ] CSS base responsive (mobile-first)
- [ ] Header con navegación (Inicio, Casas de Campo, Apartamentos, Servicios)
- [ ] Footer con contacto WhatsApp, email, redes sociales
- [ ] Componente de tarjeta de propiedad
- [ ] Componente de tarjeta de servicio
- [ ] Componente de paginación
- [ ] Cliente API en JavaScript (`js/api.js`)

#### 3.2 Página de Inicio
- [ ] Hero / Portada con imagen de fondo y llamado a la acción
- [ ] Sección de propuesta de valor (3 puntos clave)
- [ ] Carrusel de casas de campo (hasta 5, aleatorias)
- [ ] Carrusel de apartamentos (hasta 5, aleatorias)
- [ ] Preview de servicios (3 de distintas clasificaciones)
- [ ] Llamado a la acción general
- [ ] Footer completo

#### 3.3 Catálogo de Casas de Campo
- [ ] Página de listado con encabezado
- [ ] Filtros: zona, capacidad, búsqueda por texto
- [ ] Grid de tarjetas (máximo 10 por página)
- [ ] Paginación dinámica
- [ ] Página individual de casa de campo:
  - [ ] Galería en modo carrusel (imágenes + videos)
  - [ ] Información principal (nombre, descripción, ubicación, capacidad, habitaciones)
  - [ ] Amenidades
  - [ ] Reglas y restricciones
  - [ ] Botón "Reservar"

#### 3.4 Catálogo de Apartamentos
- [ ] Mismo patrón que casas de campo
- [ ] Filtros adaptados: zona/barrio, número de habitaciones
- [ ] Página individual con servicios incluidos

#### 3.5 Catálogo de Servicios
- [ ] Listado en dos columnas (máximo 20 por página)
- [ ] Filtros: clasificación, tipo, búsqueda por texto
- [ ] Página individual de servicio:
  - [ ] Galería
  - [ ] Información (nombre, descripción, clasificación, tipo)
  - [ ] Reglas y condiciones
  - [ ] Botón "Contratar"

#### 3.6 Formulario de Solicitud Público
- [ ] Modal superpuesto (no redirige)
- [ ] Campos: nombre, cédula, WhatsApp, email, fecha de inicio
- [ ] Selector de fechas con disponibilidad visual (fechas bloqueadas no seleccionables)
- [ ] Servicios adicionales de interés (opcional, múltiple) — solo para propiedades
- [ ] Validación de campos obligatorios
- [ ] Envío → crea Lead automáticamente
- [ ] Mensaje de confirmación al enviar
- [ ] Adaptación responsive (funciona bien en celular)

**Entregable Fase 3**: Sitio web público completo y funcional, responsive, con catálogos y formulario de solicitud.

---

### FASE 4: LEADS Y RESERVAS — Semanas 7-8

> **Objetivo**: Flujo completo desde solicitud del cliente hasta reserva confirmada con control de pagos.

#### 4.1 API de Leads
- [ ] `GET /api/admin/leads` — Listar con filtros (estado, fechas)
- [ ] `GET /api/admin/leads/:id` — Detalle completo
- [ ] `PATCH /api/admin/leads/:id/review` — Marcar como revisada
- [ ] `POST /api/admin/leads/:id/convert` — Convertir a reserva/contratación
- [ ] `PATCH /api/admin/leads/:id/discard` — Descartar con nota
- [ ] `POST /api/admin/leads/:id/notes` — Agregar nota interna
- [ ] Contador de leads sin revisar (badge en navegación)

#### 4.2 API de Reservas
- [ ] `GET /api/admin/reservations` — Listar con filtros (estado, propiedad, fechas)
- [ ] `GET /api/admin/reservations/:id` — Detalle
- [ ] `POST /api/admin/reservations` — Crear manualmente
- [ ] `PUT /api/admin/reservations/:id` — Editar
- [ ] `PATCH /api/admin/reservations/:id/status` — Cambiar estado
- [ ] **Control de doble reserva**: transacción con `SELECT FOR UPDATE` al confirmar
- [ ] Validación: no permitir fechas solapadas en misma propiedad (Confirmada/En Servicio)
- [ ] Liberación automática de fechas al cancelar

#### 4.3 API de Contrataciones de Servicios
- [ ] `GET /api/admin/contractings` — Listar
- [ ] `GET /api/admin/contractings/:id` — Detalle
- [ ] `POST /api/admin/contractings` — Crear
- [ ] `PUT /api/admin/contractings/:id` — Editar
- [ ] `PATCH /api/admin/contractings/:id/status` — Cambiar estado

#### 4.4 API de Pagos
- [ ] `POST /api/admin/reservations/:id/payments` — Registrar pago
- [ ] Opción A: pago completo
- [ ] Opción B: abono 50% + saldo restante
- [ ] Actualización manual de estado de cada pago
- [ ] `GET /api/admin/reservations/:id/payments` — Historial de pagos

#### 4.5 Frontend — Bandeja de Entrada
- [ ] Listado de leads (fecha, cliente, propiedad/servicio, estado)
- [ ] Badge de leads sin revisar en sidebar
- [ ] Filtros por estado y rango de fechas
- [ ] Vista de detalle de lead
- [ ] Botón "Marcar como revisada"
- [ ] Botón "Convertir a Reserva" (pre-carga datos del cliente)
- [ ] Botón "Convertir a Contratación"
- [ ] Botón "Descartar" con campo de nota
- [ ] Campo de notas internas

#### 4.6 Frontend — Reservas
- [ ] Listado con filtros (estado, propiedad, fechas)
- [ ] Formulario de reserva/contratación
- [ ] Datos del cliente pre-cargados desde lead
- [ ] Selector de fechas con validación de disponibilidad
- [ ] Selector de servicios adicionales
- [ ] Sistema de pagos (completo o abonos)
- [ ] Cambio de estados con botones claros
- [ ] Indicador visual del estado actual
- [ ] Campo de observaciones

#### 4.7 Frontend — Contrataciones
- [ ] Mismo patrón que reservas adaptado a servicios

**Entregable Fase 4**: Ciclo completo Lead → Reserva → Pagos → Estados funcional.

---

### FASE 5: DOCUMENTOS PDF — Semana 9

> **Objetivo**: Generación bajo demanda de facturas, liquidaciones y cuentas de cobro.

#### 5.1 Motor de PDFs
- [ ] Configurar pdf-lib en backend
- [ ] Crear template base con marca Lorens Nieto
- [ ] Función reutilizable de generación + descarga

#### 5.2 Factura para Cliente
- [ ] Datos de Lorens Nieto (nombre, contacto)
- [ ] Datos del cliente (nombre, cédula, contacto)
- [ ] Detalle de reserva (propiedad, dirección, fechas, servicios)
- [ ] Precios y condiciones de pago
- [ ] Reglas y lineamientos generales
- [ ] `GET /api/admin/reservations/:id/pdf/invoice` — Generar y descargar

#### 5.3 Liquidación para Propietario
- [ ] Información básica del cliente (nombre y cédula, sin contacto completo)
- [ ] Detalle de reserva (propiedad, fechas, servicios)
- [ ] Monto neto a pagar al propietario (precio - comisión - servicios)
- **NO mostrar porcentaje de comisión**, solo monto neto
- [ ] `GET /api/admin/reservations/:id/pdf/settlement` — Generar y descargar

#### 5.4 Cuenta de Cobro — Socio Técnico
- [ ] Datos del socio técnico
- [ ] Datos del negocio (Lorens Nieto)
- [ ] Período de cobro
- [ ] Desglose de ingresos por tipo
- [ ] Fase activa y porcentaje
- [ ] Monto total a pagar
- [ ] Monto ya recibido y saldo pendiente (si aplica)
- [ ] Estado del acumulado hacia $3.068.000
- [ ] `GET /api/partner/periods/:id/pdf/invoice` — Generar

#### 5.5 Funcionalidades de PDF
- [ ] Previsualización antes de descargar (iframe o modal)
- [ ] Descarga directa
- [ ] Envío por email con adjunto (nodemailer)
- [ ] No almacenar PDFs en servidor (generar bajo demanda)

**Entregable Fase 5**: Los 3 tipos de PDF generables con previsualización y envío por correo.

---

### FASE 6: PANEL SOCIO TÉCNICO — Semanas 10-11

> **Objetivo**: Transparencia financiera total para el socio, con alertas automáticas.

#### 6.1 API del Socio Técnico
- [ ] `GET /api/partner/summary` — Resumen financiero del período activo
- [ ] `GET /api/partner/periods` — Historial de períodos
- [ ] `GET /api/partner/periods/:id` — Detalle de período
- [ ] `POST /api/partner/periods/:id/confirm-payment` — Registrar pago recibido
- [ ] `POST /api/partner/periods/:id/partial-payment` — Pago parcial
- [ ] `POST /api/partner/periods/:id/dispute` — Marcar en disputa
- [ ] `GET /api/partner/alerts` — Log de alertas
- [ ] `PUT /api/partner/settings/deadline` — Configurar días de plazo

#### 6.2 Cálculos Automáticos
- [ ] Motor de cálculo de revenue-share por período
- [ ] Detección automática de fase (Fase 1 → Fase 2 al llegar a $3.068.000)
- [ ] Acumulado total visible (anticipo + revenue-share)
- [ ] Barra de progreso hacia precio total

#### 6.3 Sistema de Alertas (Cron Job)
- [ ] Job diario: verificar períodos vencidos en estado "Pendiente"
- [ ] Cambio automático: Pendiente → En Alerta
- [ ] Notificación visible en panel de administradora
- [ ] Envío de email automático a administradora
- [ ] Registro en AlertLog (fecha, hora, monto, período)
- [ ] El log NO se elimina aunque se pague después

#### 6.4 Frontend — Panel Socio Técnico
- [ ] Dashboard con resumen financiero
- [ ] Ingresos totales del período por tipo
- [ ] Porcentaje vigente y fase activa
- [ ] Monto correspondiente al socio
- [ ] Barra de progreso del acumulado ($3.068.000)
- [ ] Tabla de historial de períodos
- [ ] Acciones por período: ver detalle, confirmar pago, disputar
- [ ] Log de alertas (solo lectura)
- [ ] Configuración de fecha límite de pago
- [ ] Botón de generar cuenta de cobro PDF

#### 6.5 Frontend Admin — Visibilidad de Alertas
- [ ] Badge de notificación cuando hay alerta activa
- [ ] Sección de consulta del Log de Alertas (solo lectura)
- [ ] No puede editar ni eliminar registros del log

**Entregable Fase 6**: Panel socio técnico funcional con cálculos automáticos, pagos y alertas.

---

### FASE 7: MÉTRICAS Y REPORTES — Semana 12

> **Objetivo**: Dashboard visual del rendimiento del negocio.

#### 7.1 API de Reportes
- [ ] `GET /api/admin/reports/overview` — Totales del período
- [ ] `GET /api/admin/reports/by-type` — Desglose por tipo (casas, aptos, servicios)
- [ ] `GET /api/admin/reports/by-property` — Ranking de propiedades
- [ ] `GET /api/admin/reports/occupancy` — Ocupación por propiedad
- [ ] `GET /api/admin/reports/by-service` — Servicios más contratados
- [ ] Filtros: día, semana, mes, rango personalizado
- [ ] `GET /api/admin/reports/export?format=pdf` — Exportar reporte
- [ ] `GET /api/admin/reports/export?format=csv` — Exportar datos

#### 7.2 Frontend — Dashboard de Reportes
- [ ] Tarjetas de resumen (ingresos totales, reservas, comisión)
- [ ] Gráfico de barras: ingresos por tipo
- [ ] Gráfico de líneas: evolución de ingresos en el tiempo
- [ ] Tabla de propiedades con más reservas/ingreso
- [ ] Indicador de ocupación por propiedad
- [ ] Servicios más contratados
- [ ] Selector de período (día/semana/mes/rango)
- [ ] Filtros por tipo de propiedad
- [ ] Botón exportar PDF
- [ ] Botón exportar CSV

**Entregable Fase 7**: Dashboard completo con métricas, gráficos y exportación.

---

### FASE 8: DEPLOY Y PULIDO — Semanas 13-14

> **Objetivo**: Sistema en producción, documentado y probado.

#### 8.1 Configuración de Producción
- [ ] Dockerfile optimizado para backend
- [ ] Dockerfile para frontend-admin (build + nginx)
- [ ] docker-compose.yml para producción
- [ ] Variables de entorno de producción
- [ ] Configurar PostgreSQL en Railway
- [ ] Configurar dominio y SSL

#### 8.2 CI/CD con GitHub Actions
- [ ] Pipeline de tests al hacer push
- [ ] Pipeline de build
- [ ] Pipeline de deploy a Railway (main → producción)
- [ ] Branch protection: main requiere PR + tests pasando

#### 8.3 Seguridad
- [ ] Rate limiting en endpoints públicos
- [ ] Sanitización de inputs
- [ ] Headers de seguridad (helmet)
- [ ] CORS configurado correctamente
- [ ] Archivos subidos: validación de tipo real (no solo extensión)
- [ ] Variables sensibles fuera del código

#### 8.4 Backups
- [ ] Backup automático diario de PostgreSQL
- [ ] Retención de 30 días
- [ ] Probar restauración

#### 8.5 Testing
- [ ] Tests unitarios para servicios críticos (reservas, pagos, cálculos)
- [ ] Tests de integración para API (auth, CRUD, flujo lead→reserva)
- [ ] Tests E2E con Playwright: flujo público completo
- [ ] Tests E2E: flujo admin completo
- [ ] Cobertura mínima: 70% en servicios

#### 8.6 Documentación
- [ ] README.md del proyecto
- [ ] OpenAPI spec completa y actualizada
- [ ] Manual de usuario básico para Lorena
- [ ] Documentación de deployment

#### 8.7 Puesta en Marcha
- [ ] Carga inicial de datos de Lorena (propiedades, fotos, servicios)
- [ ] Capacitación a Lorena (videollamada o presencial)
- [ ] Monitoreo de primeros días
- [ ] Corrección de bugs post-lanzamiento

**Entregable Fase 8**: Sistema en producción, accesible por dominio, documentado y probado.

---

## REGISTRO DE CAMBIOS Y REPORTES

> Sección para documentar cambios de alcance, decisiones tomadas durante el desarrollo y desviaciones del plan original.

| Fecha | Tipo | Descripción | Impacto | Estado |
|-------|------|-------------|---------|--------|
| 09/04/2026 | Planificación | Roadmap inicial creado | — | ✅ Aprobado |
| 09/04/2026 | Desarrollo | Tareas 1.1 y 1.2 completadas: estructura monorepo + backend base con auth, Prisma, Docker Compose | — | ✅ Aprobado |
| 09/04/2026 | Desarrollo | Tarea 1.3 completada: DB PostgreSQL corriendo, Prisma schema con 14 tablas, seed con usuarios iniciales | — | ✅ Aprobado |
| 09/04/2026 | Desarrollo | Fase 2 completada: CRUD Admin Properties/Services — 14 archivos creados, 6 endpoints nuevos, Zod schemas, Repository/Service/Controller layers, Multer upload, 16 tests passing | Backend API 52% | ✅ Aprobado |
| 20/05/2026 | Reevaluación | SDD Init ejecutado. Se descubre que backend de Reservas ya está implementado (ahead of plan). Frontend Admin y Público están vacíos. .agent/agents.md desactualizado — corregido. | Backend ~60%, Frontends 0% | ✅ Aprobado |
| 20/05/2026 | Planificación | Se ajusta prioridad: Frontend Admin primero (Login, Layout, Dashboard) como base para Slices 1-2-3 | Prioridad: Frontend > Backend | ✅ Aprobado |
| 08/06/2026 | Desarrollo | Frontend Admin completo: Login, Layout, Dashboard, Slices 1+2 UI (Properties+Services CRUD con medios), Slice 3 (Reservas list+detail+create con disponibilidad) | Backend ~70%, Frontend Admin ~60% | ✅ Aprobado |
| 08/06/2026 | Desarrollo | Slices 4+5 completados: Leads backend (PATCH status, POST notes, POST convert) + Payments backend (POST/GET con validación saldo) + Frontend InboxPage, InboxDetailPage, PaymentModal, ReservationDetailPage con pagos | Backend ~75%, Frontend Admin ~80% | ✅ Aprobado |
| 09/06/2026 | Desarrollo | Slice 6 (Sitio Público) completado: 9 archivos HTML/CSS/JS, landing, catálogos, detalle, modal lead, responsive | Backend ~80%, Frontend Admin ~80%, Frontend Public 100% | ✅ Aprobado |
| 09/06/2026 | Desarrollo | Slice 7 (Panel Socio Técnico) completado: 11 endpoints backend + PartnerPage (dashboard, barra progreso $3.068.000) + PartnerPeriodDetailPage (alertas, disputas, pagos) | Backend ~80%, Frontend Admin ~80% | ✅ Aprobado |
| 09/06/2026 | CIERRE SESIÓN | Todos los Slices 1-7 completados end-to-end. Pendientes: Slice 8 (PDFs+Email+Cron) y Slice 9 (Testing+Deploy+Capacitación). Se actualizan ROADMAP.md y SLICES.md, se guarda engram, se commit y push. | Proyecto ~80% | ✅ Aprobado |
| 10/06/2026 | Desarrollo | **Slice 8 completado**: PDFs (Factura, Liquidación, Cuenta de Cobro) vía pdf-lib in-memory + Email (Nodemailer con graceful SMTP fallback) + Cron diario (checkPartnerDeadlines con prevención de duplicados). Data privacy audit PASS. 32/32 checks, 0 fallos. | Proyecto ~87% — Backend ~90%, Frontend Admin ~85%, Frontend Público 100% | ✅ Aprobado |
| 10/06/2026 | Desarrollo | **Slice 9 completado (PR 1)**: Reports backend (5 endpoints con filtro período) + Reports frontend (Chart.js: SummaryCards, RevenueChart, TopPropertiesChart, OccupancyTable, TopServicesTable) + Settings page (formulario completo) | Proyecto ~92% — 0 errores TS | ✅ Aprobado |
| 10/06/2026 | Desarrollo | **Slice 9 completado (PR 2)**: OpenAPI spec completa (~45 endpoints) + Swagger UI en /api/docs + Dockerfile multi-stage + CI/CD workflows verificados | Proyecto ~95% — docker build exitoso | ✅ Aprobado |
| 10/06/2026 | Desarrollo | **Slice 9 completado (PR 3)**: Playwright E2E (Page Object pattern, flujo público + admin) + DATA-LOADING.md con guía de 8 pasos | Proyecto ~100% 🤝 | ✅ Aprobado |

### Plantilla para nuevos registros:

```
| DD/MM/AAAA | [Decisión/Cambio/Bug/Riesgo] | Descripción breve | [Alto/Medio/Bajo] | [✅ Resuelto/🔄 En curso/🔲 Pendiente] |
```

---

## DECISIONES TÉCNICAS

> Registro de decisiones arquitectónicas tomadas y su justificación.

| # | Decisión | Alternativa descartada | Razón |
|---|----------|----------------------|-------|
| 01 | Prisma como ORM | Sequelize, TypeORM | Type-safe, migrations integradas, mejor DX |
| 02 | express-session + bcrypt | JWT | Solo 2 roles fijos, no necesita OAuth, sesiones más seguras |
| 03 | Vanilla HTML/CSS/JS para público | Next.js, Astro | Máxima velocidad de carga, sin dependencias, el sitio es informativo |
| 04 | React+Vite para admin | Vue, Svelte | Ecosistema maduto, TypeScript nativo, componentes reutilizables |
| 05 | Tailwind CSS para admin | CSS Modules, Styled Components | Desarrollo rápido, consistencia visual, poco CSS custom |
| 06 | Zustand para state | Redux, Context API | Ligero, simple, suficiente para el panel |
| 07 | pdf-lib para PDFs | Puppeteer, wkhtmltopdf | Compatible con Railway (sin Chrome), ligero |
| 08 | multer+sharp para uploads | Cloudinary, S3 directo | Control total, compresión automática, sin costo externo |
| 09 | node-cron para alertas | Bull Queue, agenda.js | Simple, suficiente para un job diario |
| 10 | Monorepo con workspaces | Repos separados | Un solo repo, dependencias compartidas, deploy coordinado |
| 11 | **Vertical Slices como metodología** | Capas horizontales, Scrum puro | Integración temprana, entrega incremental, modelo de equipo real |

---

## METODOLOGÍA: VERTICAL SLICES

> Cada iteración entrega un **flujo completo, funcional, verificable**.
> Ver plan detallado en: `SLICES.md`

### 4 Fases por Slice

| Fase | % Tiempo | Objetivo | Criterio de Salida |
|------|----------|----------|-------------------|
| 1. Contrato | 20-30% | Definir API, validaciones, roles | OpenAPI validado |
| 2. Esqueleto | 15-20% | Estructura con mocks | Conectado, retornando mocks |
| 3. Lógica | 40-50% | Happy path funcional | Tests ≥70%, flujo funciona |
| 4. Pulido | 10-15% | Producción-ready | <100ms, Lighthouse >90 |

### Mapa de Slices

| # | Slice | Estimación | Estado | Referencia |
|---|-------|-----------|--------|-----------|
| 1 | Catálogo Propiedades | 2h | ✅ Completo | Backend+Frontend OK |
| 2 | Catálogo Servicios | 2h | ✅ Completo | Backend+Frontend OK |
| 3 | Gestión Reservas | 2.5h | ✅ Completo | Backend+Frontend OK |
| 4 | Gestión Pagos | 1.5h | ✅ Completo | Backend+Frontend OK |
| 5 | Gestión Leads | 2h | ✅ Completo | Backend+Frontend OK |
| 6 | Flujo Público | 6h | ✅ Completo | Frontend público 100% |
| 7 | Panel Socio Técnico | 2.5h | ✅ Completo | Backend+Frontend OK |
| 8 | PDFs + Email + Cron | 4h | ✅ Completo | Backend pdf-lib + Nodemailer + node-cron |
| 9 | Pulido + Producción | 6.5h | ✅ Completo | Reports, Settings, OpenAPI, Dockerfile, E2E, CI/CD |

**Total estimado**: ~30h 🎯

---

## RIESGOS Y MITIGACIONES

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|-------------|---------|------------|
| Race condition en doble reserva | Alta | Alto | Transacciones PostgreSQL con `SELECT FOR UPDATE` |
| Plazo de 120 días ajustado | Media | Alto | Priorizar módulos 05-09 (core del negocio) |
| Pérdida de datos de pagos | Baja | Crítico | Backups diarios + AlertLog inmutable |
| PDFs con datos incorrectos | Media | Medio | Validación estricta antes de generar |
| Archivos > 20MB subidos | Media | Bajo | Validación en cliente Y servidor |
| Alertas no disparadas (cron cae) | Baja | Alto | Health check del cron + logging persistente |
| Lorena no entiende la interfaz | Media | Medio | UI ultra simple + capacitación + manual |
| Railway costos inesperados | Baja | Bajo | Monitoreo de uso, plan gratuito inicial |

---

## MÓDULOS DEL SISTEMA (VISTA CONSOLIDADA)

| # | Módulo | Fase | Estado | Notas |
|---|--------|------|--------|-------|
| 01 | Sitio Web — Inicio | F3 | ✅ | Landing completo |
| 02 | Catálogo Casas de Campo | F3 | ✅ | Listado + detalle con galería |
| 03 | Catálogo Apartamentos | F3 | ✅ | Listado + detalle con galería |
| 04 | Catálogo Servicios | F3 | ✅ | Listado + detalle con clasificación |
| 05 | Formulario Solicitud Público | F3 | ✅ | Modal con validación |
| 06 | Bandeja de Entrada (Leads) | F4 | ✅ | Lista + detalle + notas + convertir |
| 07 | Gestión Propiedades | F2 | ✅ | CRUD completo + medios + toggle |
| 08 | Gestión Servicios | F2 | ✅ | CRUD completo + medios |
| 09 | Reservas y Contrataciones | F4 | ✅ | CRUD + disponibilidad + pagos |
| 10 | Documentos PDF | F5 | ✅ | Factura, Liquidación, Cuenta de Cobro — pdf-lib in-memory |
| 11 | Métricas y Reportes | F7 | ✅ | Dashboard Chart.js con 5 endpoints (Chart.js + react-chartjs-2) |
| 12 | Configuración General | F8 | ✅ | Settings page con formulario completo |
| 13 | Panel Socio Técnico | F6 | ✅ | Dashboard + períodos + pagos + alertas |

---

## NOTAS Y REGISTROS

### Maquetas Disponibles (referencia visual)
Las maquetas HTML en `/Maquetas/` sirven como referencia del diseño visual deseado:
- `AdminDashboard.html` — Dashboard principal admin
- `Facturacion.html` — Pantalla de facturación
- `PropertiesMagament.html` — Gestión de propiedades
- `PropertiWebSite.html` — Página de propiedad en sitio público
- `ReportsDashboard.html` — Dashboard de reportes
- `Reservation.html` — Formulario de reserva
- `ReservationManagement.html` — Gestión de reservas
- `ServicesManagement.html` — Gestión de servicios

> **Nota**: Las maquetas son referencia visual. El código se construye desde cero siguiendo el stack definido.

---

## PROYECTO COMPLETADO 🎉

**Todos los 9 slices están terminados. Proyecto listo para producción.**

### Resumen Final

| Componente | Estado |
|------------|--------|
| Backend API | ✅ ~95% — Todos los endpoints implementados |
| Frontend Admin | ✅ ~95% — Todas las páginas implementadas |
| Frontend Público | ✅ 100% — Sitio completo y responsive |
| PDFs + Email + Cron | ✅ Completado (Slice 8 archivado) |
| Reports + Settings | ✅ Completado (PR 1 — Slice 9) |
| OpenAPI + Swagger + Dockerfile | ✅ Completado (PR 2 — Slice 9) |
| E2E Tests + Data Loading Guide | ✅ Completado (PR 3 — Slice 9) |

### Pendientes (post-lanzamiento)
1. **Carga de datos reales** → Seguir `docs/DATA-LOADING.md`
2. **Capacitación a Lorena** → Videollamada o presencial
3. **Monitoreo post-lanzamiento** → Primera semana de operación
4. **Corregir vulnerabilidades Dependabot** → 2 moderadas en GitHub

---

## APÉNDICE: HISTORIAL DE PLANES

> Este apéndice mantiene referencia a planes anteriores para documentar la evolución del proyecto.

### Estado Final (post-Slice 9)

| Componente | Progreso | Estado |
|------------|----------|--------|
| Backend API | ~95% | ✅ Todos los endpoints: auth, CRUD, reservas, pagos, leads, partner, reports, PDFs |
| Frontend Admin | ~95% | ✅ Todas las páginas: Login, Dashboard, Properties, Services, Reservas, Leads, Partner, Reports, Settings |
| Frontend Público | 100% | ✅ Landing, catálogos, detalle, formulario solicitud |
| PDFs + Email + Cron | 100% | ✅ Completado (Slice 8 archivado) |
| OpenAPI + Swagger | 100% | ✅ docs/openapi.yaml (~45 endpoints) + UI en /api/docs |
| Dockerfile | 100% | ✅ Multi-stage node:20-alpine, build exitoso |
| E2E Testing | 100% | ✅ Playwright con Page Objects (flujo público + admin) |
| CI/CD | 100% | ✅ 3 workflows (build, test, deploy) verificados |

### Trabajo Completado

| Componente | Descripción | Fecha |
|------------|-------------|-------|
| Fundamentos Backend | Express+TS+Prisma+auth+middleware+migraciones+seed | 09/04/2026 |
| Rutas Públicas | GET properties, services, leads, auth login/logout/me | 09/04/2026 |
| CRUD Admin Backend | Properties + Services + Media (repos, services, controllers, routes, tests) | 09/04/2026 |
| Reservas Backend | CRUD completo con control fechas, disponibilidad, cálculo precio, schemas Zod | 09/04/2026 |
| SDD Init | Contexto del proyecto persistido en Engram + skill registry + testing capabilities | 20/05/2026 |
| Frontend Admin Base | Vite+React19+TS+Tailwind+Zustand+Router+Login+Layout+AuthStore | 08/06/2026 |
| Slices 1+2 UI | Properties + Services CRUD con galería, toggle activo, confirm delete | 08/06/2026 |
| Slice 3 UI | Reservas listado, detalle, creación con disponibilidad y cálculo precio | 08/06/2026 |
| Slices 4+5 Backend+UI | Leads (inbox, notas, convertir) + Pagos (modal, historial, barra progreso) | 08/06/2026 |
| Slice 7 Backend+UI | Panel Partner: resumen financiero, períodos, alertas, disputas, barra $3.068.000 | 08/06/2026 |
| Slice 6 — Sitio Público | 9 archivos: landing, catálogos, detalle, modal lead, responsive mobile-first | 09/06/2026 |
| Slice 8 — PDFs+Email+Cron | 8 archivos nuevos (pdf-lib generador, 3 templates PDF, email module, cron jobs, schemas), 5 archivos modificados, npm install pdf-lib. 32/32 checks pass, data privacy compliant. | 10/06/2026 |

### Archivos de Referencia

| Archivo | Contenido |
|---------|-----------|
| `SLICES.md` | Plan completo de Vertical Slices (plan actual) |
| Este documento (`ROADMAP.md`) | Visión general del proyecto + decisiones |

---

*Documento generado el 09/04/2026 — J-Soft Solutions*
*Última actualización: 21/04/2026 — Metodología Vertical Slices adoptada*
