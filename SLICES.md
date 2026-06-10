# 📊 PLAN DE DESARROLLO — Vertical Slices

> **Metodología**: Vertical Slices (cada iteración = flujo completo funcional)
> **Actualizado**: 10/06/2026 | **Progreso**: 9/9 slices completados 🎉
> **Referencia**: vertical-slices SKILL.md

---

## PRINCIPIO

Cada slice entrega un **flujo completo, funcional, verificable**:
- Backend + Frontend + Tests + Contrato API
- No se acumula deuda de integración
- Cada slice es usable por el usuario final

---

## MAPA DE SLICES

```
SLICE 1 ✅  Catálogo de Propiedades        → Completo (Backend + Frontend)
SLICE 2 ✅  Catálogo de Servicios          → Completo (Backend + Frontend)
SLICE 3 ✅  Gestión de Reservas            → Completo (Backend + Frontend)
SLICE 4 ✅  Gestión de Pagos               → Completo (Backend + Frontend)
SLICE 5 ✅  Gestión de Leads               → Completo (Backend + Frontend)
SLICE 6 ✅  Flujo Público (Catálogo + Form) → Completo (100%)
SLICE 7 ✅  Panel Socio Técnico             → Completo (Backend + Frontend)
SLICE 8 ✅  Documentos y Comunicación       → Completo (Backend PDFs + Email + Cron)
SLICE 9 ✅  Pulido y Producción             → Completo (Reports + Settings + OpenAPI + Dockerfile + E2E + CI/CD)
```

**Leyenda**: 🔴 Crítico (necesario para operar) | 🟡 Importante | 🟢 Deseable

---

## SLICE 1: Catálogo de Propiedades ✅ COMPLETO

**Objetivo**: Loren puede ver y gestionar su catálogo de propiedades en el panel admin

| Componente | Estado | Detalle |
|------------|--------|---------|
| DB | ✅ | Tabla `properties` + `media` existen |
| Backend | ✅ | GET/POST/PUT/DELETE `/api/admin/properties` + media |
| API Contract | ⚠️ | Implementado, OpenAPI pendiente (Slice 9) |
| UI | ✅ | PropertiesPage + PropertyForm + galería medios + toggle activo |
| Tests | ✅ | 16 tests Zod pasando |

### Notas
- Backend completo (Fase 2) con repos/services/controllers/Multer uploads/Sharp compression
- Frontend implementado: listado con tabla, formulario crear/editar, galería con preview, toggle activo, confirmación doble eliminar

---

## SLICE 2: Catálogo de Servicios ✅ COMPLETO

**Objetivo**: Loren puede ver y gestionar sus servicios en el panel admin

| Componente | Estado | Detalle |
|------------|--------|---------|
| DB | ✅ | Tabla `services` + `media` existen |
| Backend | ✅ | GET/POST/PUT/DELETE `/api/admin/services` |
| API Contract | ⚠️ | Implementado, OpenAPI pendiente (Slice 9) |
| UI | ✅ | ServicesPage + ServiceForm + galería medios + toggle activo |
| Tests | ✅ | Tests Zod existentes |

### Notas
- Backend completo con repos/services/controllers
- Frontend implementado: listado con tabla, formulario crear/editar, galería, selector clasificación, toggle activo

---

## SLICE 3: Gestión de Reservas ✅ COMPLETO

**Objetivo**: Loren puede crear y gestionar reservas con control de fechas + pagos

**Estado actual**: Backend + Frontend completos ✅

### Backend implementado ✅
- ✅ `reservationCreateSchema`, `reservationUpdateSchema`, `availabilityCheckSchema` (Zod) con tests
- ✅ Repository: create, update, delete, findById, findConflictingReservations, countReservationsByStatus
- ✅ Service: createReservation, updateReservation, cancelReservation, removeReservation, checkAvailability, calculatePrice
- ✅ Controller: listReservations, getReservation, createReservation, updateReservation, cancelReservation, deleteReservation, checkAvailability, calculatePrice
- ✅ Routes cableadas en admin/index.ts:
- ✅ Control de conflictos de fechas (OR lógico en query)
- ✅ Cálculo de precio (noches × priceNight)
- ✅ Transición de estados validada (solo pendiente/confirmada pueden modificar fechas)
- ✅ `POST /api/admin/reservations/:id/payments` — Registrar pago con validación saldo
- ✅ `GET /api/admin/reservations/:id/payments` — Historial pagos

### Frontend Admin — Implementado ✅
- ✅ **ReservationsPage**: Listado con filtros (estado, propiedad, fechas), StatusBadge
- ✅ **ReservationCreatePage**: Formulario con selector propiedad, fechas, check disponibilidad + cálculo precio automático
- ✅ **ReservationDetailPage**: Detalle completo, acciones de estado (pendiente→confirmada→en_servicio→finalizada/cancelada), panel de pagos, observaciones
- ✅ **PaymentModal**: Registrar abono o pago total con barra de progreso
- ✅ **StatusBadge**: Componente reusable con colores por estado
- ✅ **ReservationService**: API client completo

### Decisiones Tomadas

| Decisión | Opciones | Elección | Razón |
|----------|----------|----------|-------|
| Control de conflictos | Lock optimistic / Lock pessimistic / Validación simple | Validación simple con query | Suficiente para volumen esperado |
| Cálculo precio | En backend / En frontend / Híbrido | Backend (source of truth) | Evita manipulación |

---

## SLICE 4: Gestión de Pagos ✅ COMPLETO

**Objetivo**: Loren puede registrar pagos (abonos y totales) contra una reserva

### Componentes

#### DB ✅
- ✅ Modelo `Payment` en schema.prisma
- ✅ Relación con Reservation (cascade delete)

#### Backend ✅
- ✅ **DTO**: `paymentCreateSchema` (Zod) con tests
- ✅ **Repository**: createPayment, getPaymentsByReservation
- ✅ **Service**: `registerPayment` (validar saldo, actualizar estado reserva)
- ✅ **Controller**: POST /api/admin/reservations/:id/payments, GET payments
- ✅ **Routes**: Cableadas en admin/index.ts

#### Frontend Admin ✅
- ✅ **Componente**: Panel de pagos en detalle de reserva
- ✅ **Modal**: PaymentModal (monto, tipo abono/total, barra progreso)
- ✅ **Indicador**: Saldo pendiente vs pagado con barra de progreso visual
- ✅ **Historial**: Lista de pagos de la reserva
- ✅ **Servicio API**: getPayments, registerPayment

### Criterios de Aceptación ✅

- ✅ Puede registrar abono parcial
- ✅ Puede registrar pago total
- ✅ **NO** puede registrar monto mayor al saldo pendiente
- ✅ Historial de pagos visible

---

## SLICE 5: Gestión de Leads ✅ COMPLETO

**Objetivo**: Loren puede gestionar solicitudes entrantes (inbox)

### Componentes

#### Backend ✅
- ✅ **Repository**: findMany, findById
- ✅ **DTO**: leadStatusUpdateSchema, leadNoteSchema (Zod)
- ✅ **Service**: `updateLeadStatus`, `addLeadNote`, `convertLeadToReservation`
- ✅ **Controller**: PATCH /leads/:id/status, POST /leads/:id/notes, POST /leads/:id/convert
- ✅ **Routes**: Cableadas en admin/index.ts
- ✅ **Badge**: GET /api/admin/leads/unread-count — conteo leads no leídos

#### Frontend Admin ✅
- ✅ **InboxPage**: Lista leads con filtros (estado, fechas), badge no leídos con auto-refresh 30s
- ✅ **InboxDetailPage**: Vista completa lead, notas, acciones (marcar revisada, descartar, convertir)
- ✅ **ConvertModal**: Pre-carga datos cliente al convertir a reserva
- ✅ **NotesField**: Campo de notas internas
- ✅ **LeadService**: API client completo

### Criterios de Aceptación ✅

- ✅ Ve lista de leads con badge de no leídos
- ✅ Puede marcar lead como revisada
- ✅ Puede agregar notas internas
- ✅ Puede convertir lead a reserva (datos pre-cargados)
- ✅ Puede descartar lead con nota

---

## SLICE 6: Flujo Público ✅ COMPLETO

**Objetivo**: Clientes pueden ver catálogo y enviar solicitudes

### Componentes

#### Frontend Público (Vanilla HTML/CSS/JS) ✅
- ✅ **Landing Page** (index.html): Hero, propuesta valor, featured properties/services, CTA WhatsApp
- ✅ **Catálogo Casas de Campo** (casas-campo.html): Grid con filtros (zona, capacidad, búsqueda), paginación
- ✅ **Catálogo Apartamentos** (apartamentos.html): Grid con filtros, paginación
- ✅ **Catálogo Servicios** (servicios.html): Grid con filtro clasificación, paginación
- ✅ **Detalle Propiedad** (property.html): Galería imágenes con thumbs, amenities, reglas, modal lead
- ✅ **Detalle Servicio** (service.html): Galería, clasificación, reglas, modal lead
- ✅ **Modal Solicitud**: Formulario validación client-side, crea lead automáticamente
- ✅ **CSS** (css/styles.css): Mobile-first, brand colors #1e3a5f / #c9a84c
- ✅ **JS API Client** (js/api.js): Fetch wrapper, formateo precios/fechas, auto-detección backend URL
- ✅ **JS App** (js/app.js): Card renderers, modal system, toast, paginación, header/footer injectors, menú mobile
- ✅ **WhatsApp Float**: Botón flotante de contacto

#### Backend
- ✅ **Endpoints**: GET public properties (paginated+filtered), GET services, GET property detail, GET service detail
- ✅ **POST**: /api/public/leads

### Criterios de Aceptación ✅

- ✅ Puede ver listado de propiedades activas con filtros
- ✅ Puede ver detalle de propiedad con galería
- ✅ Puede filtrar por zona y capacidad
- ✅ Puede enviar solicitud de información
- ✅ Formulario funciona en móvil

---

## SLICE 7: Panel Socio Técnico ✅ COMPLETO

**Objetivo**: Julio puede ver resumen financiero y períodos de facturación

### Componentes

#### Backend ✅
- ✅ **11 endpoints** bajo `/api/partner`:
  - `GET /api/partner/summary` — Resumen financiero, fase activa, barra progreso
  - `GET /api/partner/periods` — Historial de períodos
  - `GET /api/partner/periods/:id` — Detalle de período
  - `POST /api/partner/periods/:id/confirm-payment` — Confirmar pago
  - `POST /api/partner/periods/:id/partial-payment` — Pago parcial
  - `POST /api/partner/periods/:id/dispute` — Marcar en disputa
  - `GET /api/partner/alerts` — Log de alertas
  - `GET/PUT /api/partner/settings` — Configuración días plazo
- ✅ **Modelos**: partner schemas (Zod)
- ✅ **Middleware**: role 'partner' protegido

#### Frontend Admin ✅
- ✅ **PartnerPage**: Dashboard financiero con cards de resumen, barra progreso $3.068.000 con detección automática de fase, tabla períodos con acciones por estado
- ✅ **PartnerPeriodDetailPage**: Desglose financiero, historial alertas, acciones pago/disputa
- ✅ **Alertas**: Log consultable desde detalle de período

### Criterios de Aceptación ✅

- ✅ Julio puede ver su resumen financiero
- ✅ Ve lista de períodos con estados y acciones
- ✅ Ve barra de progreso del acumulado hacia $3.068.000
- ✅ Solo puede ver (no editar registros contables)
- ✅ Puede disputar o confirmar pagos

---

## SLICE 8: Documentos y Comunicación ✅ COMPLETO

**Objetivo**: Generación de PDFs + notificaciones por email + cron de alertas

### Componentes

#### PDFs (pdf-lib in-memory)
- [x] **PdfGenerator**: Clase base compartida con `createDocument()`, `addHeader()`, `addFooter()`, `addTable()`, `drawSectionTitle()`, `drawField()`
- [x] **Factura**: Datos cliente, reserva, precio breakdown, reglas — `GET /api/admin/pdf/factura/:reservationId`
- [x] **Liquidación**: Datos propietario (solo nombre), monto neto (sin % comisión), cliente enmascarado — `GET /api/admin/pdf/liquidacion/:reservationId`
- [x] **Cuenta de Cobro Socio**: Desglose ingresos, fase, %, barra progreso $3.068.000 — `GET /api/partner/pdf/cuenta-cobro/:periodId`
- [x] **Data Privacy**: Liquidación nunca incluye ownerPhone/ownerEmail/ownerCedula/commission%

#### Email (Nodemailer)
- [x] **Config**: Transporter singleton con lazy init, graceful SMTP fallback
- [x] **Template**: Alerta vencimiento período socio (buildAlertSubject + buildAlertBody)
- [x] **Confirmación de pago**: Enviada al cliente cuando payment.status = 'pagado'
- [x] **Graceful degradation**: Si SMTP no configurado, log warning y skip — nunca crash

#### Cron Jobs (node-cron)
- [x] **initCronJobs()**: Registrado desde app.ts, salta en test env
- [x] **checkPartnerDeadlines()**: Diario 9AM Bogota, verifica períodos vencidos (pendiente/en_alerta)
- [x] **Duplicate prevention**: No crea AlertLog duplicado para mismo periodId + mismo día
- [x] **Status update**: pendiente → en_alerta automático
- [x] **Error isolation**: DB fallos no crash el servidor, error catch por período

### Fastos Técnicos

- **Archivos creados**: 8 nuevos — `src/pdf/index.ts`, `src/pdf/templates/factura.ts`, `src/pdf/templates/liquidacion.ts`, `src/pdf/templates/cuenta-cobro.ts`, `src/email/index.ts`, `src/email/templates/partner-alert.ts`, `src/jobs/index.ts`, `src/jobs/partner-alert.ts`, `src/models/schemas/pdf.ts`
- **Archivos modificados**: 5 — `src/config/index.ts`, `src/models/schemas/index.ts`, `src/api/admin/index.ts`, `src/api/partner/index.ts`, `src/app.ts`
- **Dependencia nueva**: `pdf-lib`
- **Build**: `npm run build` → 0 TypeScript errors
- **Verificación**: 32/32 checks pass, data privacy audit fully compliant

### Fases de Desarrollo

| Fase | Estimación | Real |
|------|-----------|------|
| 1. Contrato | 30 min | — |
| 2. Esqueleto | 30 min | — |
| 3. Lógica | 2.5h | — |
| 4. Pulido | 30 min | — |
| **Total** | **~4h** | ✅ Archivado |

---

## SLICE 9: Pulido y Producción ✅ COMPLETO

**Objetivo**: Documentación, tests E2E, deployment — COMPLETADO

### Componentes

#### Reports + Settings (PR 1)
- [x] **Reports Backend**: 5 endpoints (overview, by-type, by-property, occupancy, by-service)
- [x] **Reports Frontend**: Chart.js + SummaryCards + RevenueChart + TopPropertiesChart + tables
- [x] **Settings Page**: Formulario completo con validación y toasts

#### OpenAPI + Docs (PR 2)
- [x] **openapi.yaml**: Especificación completa (~45 endpoints)
- [x] **Swagger UI**: Montado en /api/docs

#### Dockerfile (PR 2)
- [x] **Dockerfile**: Multi-stage node:20-alpine (build + prod, non-root user)

#### E2E Testing (PR 3)
- [x] **Playwright**: Page Object pattern (LoginPage, NavigationPage, PublicHomePage, PropertyDetailPage)
- [x] **Flujo público**: Landing → propiedad → solicitud
- [x] **Flujo admin**: Login → crear reserva → registrar pago

#### Data Loading Guide
- [x] **docs/DATA-LOADING.md**: 8 pasos con ejemplos curl

### Próximos Pasos Post-Lanzamiento
1. Carga de datos reales (seguir DATA-LOADING.md)
2. Capacitación a Lorena
3. Monitoreo primera semana

---

## ORDEN DE EJECUCIÓN (ACTUALIZADO 10/06/2026)

**Nota**: Slices 1-8 completados end-to-end. Solo queda Slice 9 (Producción). Proyecto ~87%.

```
✅ COMPLETADO — Slice 8: PDFs + Email + Cron (~4h)
├── PDF Factura (pdf-lib + datos reserva)                        ✅ Desarrollado
├── PDF Liquidación Propietario (monto neto, sin % comisión)     ✅ Desarrollado
├── PDF Cuenta de Cobro Socio (desglose ingresos, fase, %)       ✅ Desarrollado
├── Email Nodemailer (confirmación pago, alerta vencimiento)     ✅ Desarrollado
└── Cron Jobs (job diario verificación períodos vencidos)        ✅ Desarrollado

PRÓXIMA Y ÚLTIMA SESIÓN — Slice 9: Producción (~6.5h)
├── OpenAPI spec + Swagger UI                                    (1.5h)
├── Tests E2E Playwright (flujo público + admin)                 (2h)
├── Dockerfile + GitHub Actions + Deploy Railway                 (2h)
└── Carga datos reales + capacitación Lorena                     (1h)

TOTAL RESTANTE: ~6.5h
```

---

## ARCHIVOS CREADOS PREVIAMENTE (reutilizables)

Estos archivos ya existen y se usan en múltiples slices:

| Archivo | Usado en |
|---------|----------|
| `src/repositories/property.repository.ts` | Slice 1, 3 |
| `src/repositories/service.repository.ts` | Slice 2 |
| `src/repositories/media.repository.ts` | Slice 1, 2 |
| `src/services/property.service.ts` | Slice 1, 3 |
| `src/services/service.service.ts` | Slice 2 |
| `src/middleware/upload.ts` | Slice 1, 2 |
| `src/utils/media.ts` | Slice 1, 2 |
| `src/models/schemas/` | Todos |

---

## DECISIÓN: HÍBRIDO PARA SLICES 1 Y 2

Los Slices 1 y 2 tienen backend completo pero falta frontend. 

**Decisión**: Completar frontend de Slices 1 y 2 cuando sea natural (durante Slice 3 o antes de Slice 6), no como un slice separado.

Razón: El backend ya está hecho. El frontend es straightforward (tabla + formulario). No justifica un slice completo solo para UI.

---

## 📊 PLAN DE EJECUCIÓN

> Regla de oro: No se avanza al siguiente slice hasta que el actual sea funcional end-to-end.

### REGLA DE ORO

Cada slice se entrega como un **producto usable**. No se avanza al siguiente hasta que el actual:
- ✅ Tiene tests pasando
- ✅ Flujo completo funciona (entrada → proceso → salida)
- ✅ Se puede demostrar al usuario

---

### TIMELINE

```
SEMANA 1 — Core del negocio (Slices 3, 4, 5)
├── Lun-Mié: SLICE 3 — Reservas           (2.5h)
├── Jueves:  SLICE 4 — Pagos              (1.5h)
└── Viernes: SLICE 5 — Leads              (2h)

SEMANA 2 — Frontends (Slices 6, 7, 1+2)
├── Lun-Mié: SLICE 6 — Sitio Público      (6h)
├── Jueves:  Completar UI Slices 1+2      (4h)
└── Viernes: SLICE 7 — Panel Partner      (2.5h)

SEMANA 3 — Extras (Slice 8)
├── Lun-Mie: SLICE 8 — PDFs + Email + Cron (4h)
└── Resto:   Revisión y ajustes

SEMANA 4 — Producción (Slice 9)
├── Lun-Mié: Tests E2E + Deploy           (5h)
└── Jue-Vie: Capacitación Loren           (2h)
```

**Total estimado**: ~30.5h

---

### DECISIONES PREDEFINIDAS

Decisiones tomadas para evitar parálisis durante la implementación.

#### Slice 3 — Reservas

| Decisión | Opción Elegida | Razón |
|----------|---------------|-------|
| Control de conflictos | Validación simple con query | Volumen bajo, no hay concurrencia real |
| Cálculo de precio | Backend (source of truth) | No manipulable desde frontend |
| Estado inicial | Pendiente | Loren confirma manualmente |
| Mínimo de datos | cliente + propiedad + fechas | Resto se puede agregar después |

#### Slice 4 — Pagos

| Decisión | Opción Elegida | Razón |
|----------|---------------|-------|
| Tipos de pago | Abono + Total | Cubre todos los casos reales |
| Auto-actualización | Sí — al pagar completo cambia estado | Menos trabajo manual |
| Múltiples abonos | Sí | Cliente puede pagar en cuotas |

#### Slice 5 — Leads

| Decisión | Opción Elegida | Razón |
|----------|---------------|-------|
| Convertir lead | Pre-cargar datos en formulario | Menos errores, más rápido |
| Notas internas | Solo admin las ve | Datos sensibles del cliente |
| Notificación | Badge de count en sidebar | Suficiente para volumen actual |

#### Slice 6 — Sitio Público

| Decisión | Opción Elegida | Razón |
|----------|---------------|-------|
| CSS framework | Puro con variables | Sitio simple, sin dependencias |
| Galería | Grid + Lightbox simple | Funcional, no sobrecargado |
| Formulario | Modal overlay | No redirige, UX fluida |
| Responsive | Mobile-first | Mayoría de tráfico móvil |

#### Slice 7 — Panel Partner

| Decisión | Opción Elegida | Razón |
|----------|---------------|-------|
| Período de cálculo | Mensual | Coincide con contrato |
| Cálculo | Sistema calcula, Loren confirma | Semi-automático |
| Solo lectura | Julio solo ve, no edita | Seguridad + cumplimiento |

#### Slice 8 — PDFs + Email + Cron

| Decisión | Opción Elegida | Razón |
|----------|---------------|-------|
| Almacenar PDFs | Generar bajo demanda | No ocupar espacio en disco |
| Email provider | Gmail SMTP | Gratuito, suficiente para volumen |
| Frecuencia cron | Diario (alertas) + Semanal (recordatorios) | No saturar |

#### Slice 9 — Producción

| Decisión | Opción Elegida | Razón |
|----------|---------------|-------|
| Hosting | Railway | Ya está en el contrato |
| Tests E2E | Solo flujos críticos | 5-10% de cobertura |
| Cobertura tests | ≥70% en servicios | Suficiente, no parálisis |

---

### CHECKLIST DE ENTREGA POR SLICE

Usar al final de cada slice para verificar que está completo.

#### SLICE 3 — Reservas ✅ COMPLETED

- [x] Puedo crear una reserva con fechas válidas
- [x] **NO** puedo crear reserva con fechas solapadas
- [x] Veo lista de reservas con filtros (estado, propiedad, fechas)
- [x] Puedo cambiar estado de reserva
- [x] Tests unitarios de conflictos pasan
- [x] Tests de endpoints pasan

#### SLICE 4 — Pagos ✅ COMPLETED

- [x] Puedo registrar abono parcial
- [x] Puedo registrar pago total
- [x] Sistema avisa si pago excede saldo pendiente
- [x] Historial de pagos visible por reserva

#### SLICE 5 — Leads ✅ COMPLETED

- [x] Veo badge con count de leads no leídos
- [x] Puedo marcar lead como revisada
- [x] Puedo agregar notas internas
- [x] Puedo convertir lead a reserva (datos pre-cargados)
- [x] Puedo descartar lead con nota

#### SLICE 6 — Sitio Público ✅ COMPLETED

- [x] Veo propiedades activas en el catálogo
- [x] Puedo filtrar por zona y capacidad
- [x] Puedo ver detalle con galería de fotos
- [x] Puedo enviar solicitud desde el sitio
- [x] Funciona correctamente en celular

#### SLICE 7 — Panel Partner ✅ COMPLETED

- [x] Julio ve resumen de ingresos del mes
- [x] Ve barra de progreso acumulado ($X / $3.068.000)
- [x] Ve historial de períodos con estados
- [x] Solo puede ver, no puede editar nada

#### SLICE 8 — PDFs + Email + Cron ✅ COMPLETED

- [x] Puedo generar factura de reserva (`GET /api/admin/pdf/factura/:reservationId`)
- [x] Puedo generar liquidación de propietario (`GET /api/admin/pdf/liquidacion/:reservationId`)
- [x] Puedo generar cuenta de cobro de Julio (`GET /api/partner/pdf/cuenta-cobro/:periodId`)
- [x] Email de confirmación se envía al registrar pago (payment.status = 'pagado')
- [x] Email de alerta se envía cuando período pasa a vencido (si SMTP configurado)
- [x] Cron job de alertas diarias registrado (9AM Bogota, no crash en fallo DB)
- [x] Data privacy: liquidación no expone datos de contacto del propietario ni % comisión

#### SLICE 9 — Producción ✅

- [ ] OpenAPI spec con todos los endpoints
- [ ] Swagger UI en /api/docs
- [ ] Tests E2E de flujo público (ver propiedad + enviar solicitud)
- [ ] Tests E2E de flujo admin (login + crear reserva + registrar pago)
- [ ] Sistema corriendo en producción con SSL

---

### PRÓXIMO PASO INMEDIATO

**SLICE 9 — Pulido + Producción (~6.5h)**

1. OpenAPI spec + Swagger UI: Documentar todos los endpoints bajo `/api/docs`
2. Tests E2E Playwright: Flujo público (ver propiedad + enviar solicitud)
3. Tests E2E Playwright: Flujo admin (login + crear reserva + registrar pago)
4. Dockerfile: Backend optimizado multi-stage para producción
5. GitHub Actions: Pipeline test → build → deploy a Railway
6. Carga datos reales (propiedades, fotos, servicios de Lorena)
7. Capacitación a Lorena + puesta en marcha

### Proyecto Completo (después de Slice 9)

- **100% funcional** — Fin del contrato
- Entrega a Lorena Nieto
- Cierre del proyecto con J-Soft Solutions

---

*Plan ejecutivo actualizado el 10/06/2026 — J-Soft Solutions*
*Metodología: Vertical Slices v2.0*
*Próxima acción: Slice 9 — Pulido + Producción*
