# Carga de Datos — Lorens Nieto

> Guía para cargar los datos reales del negocio de Lorena en el sistema.

## Prerrequisitos

- Backend corriendo (puerto 3000)
- Base de datos con migraciones aplicadas
- Usuario admin creado (`lorena@lorensnieto.com`)
- Cookies de sesión (login primero)

### Login para obtener cookie

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -d '{"email":"lorena@lorensnieto.com","password":"admin123"}'
```

---

## Paso 1: Cargar Propiedades (Casas de Campo y Apartamentos)

```bash
curl -X POST http://localhost:3000/api/admin/properties \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "type": "casa_campo",
    "name": "Finca El Encanto",
    "description": "Hermosa finca campestre con piscina y zona de BBQ",
    "zone": "Norte",
    "address": "Km 5 Vía La Paz",
    "capacity": 8,
    "rooms": 4,
    "priceNight": 350000,
    "amenities": ["Piscina", "BBQ", "Parqueadero", "Wifi"],
    "rules": ["No mascotas", "No eventos", "Check-in 3PM"],
    "ownerName": "Carlos Mendoza",
    "ownerCedula": "123456789",
    "ownerPhone": "3001112233",
    "ownerEmail": "carlos@email.com",
    "active": true
  }'
```

Repetir por cada propiedad variando `type` entre `casa_campo` y `apartamento`.

---

## Paso 2: Subir Imágenes de Propiedades

```bash
# Obtener el ID de la propiedad primero
PROP_ID="ID-DE-LA-PROPIEDAD"

curl -X PUT "http://localhost:3000/api/admin/properties/${PROP_ID}" \
  -b cookies.txt \
  -F "media=@/ruta/a/foto1.jpg" \
  -F "media=@/ruta/a/foto2.jpg"
```

---

## Paso 3: Cargar Servicios

```bash
curl -X POST http://localhost:3000/api/admin/services \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "name": "Servicio de limpieza diaria",
    "description": "Limpieza completa de la propiedad durante tu estadía",
    "classification": "limpieza",
    "type": "por_dia",
    "price": 80000,
    "rules": ["Se requiere aviso con 24h de anticipación"],
    "active": true
  }'
```

Clasificaciones: `alimentacion`, `limpieza`, `otros`

---

## Paso 4: Configurar Settings

```bash
curl -X PUT http://localhost:3000/api/admin/settings \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "commissionPct": 0.10,
    "notificationEmail": "lorena@lorensnieto.com",
    "partnerDeadlineDays": 5,
    "rulesDocUrl": ""
  }'
```

---

## Paso 5: Verificar Datos

```bash
# Ver propiedades
curl -s http://localhost:3000/api/admin/properties -b cookies.txt | python3 -m json.tool | head -50

# Ver servicios
curl -s http://localhost:3000/api/admin/services -b cookies.txt | python3 -m json.tool | head -30

# Ver dashboard
curl -s http://localhost:3000/api/admin/dashboard -b cookies.txt | python3 -m json.tool
```

---

## Paso 6: Crear Periodo de Prueba (Partner)

```bash
curl -X POST http://localhost:3000/api/admin/partner/periods \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "month": "2026-06",
    "revenueTotal": 0,
    "phase": "fase_1",
    "pctApplied": 9.00,
    "amountDue": 0,
    "amountPaid": 0,
    "status": "pendiente",
    "deadlineDate": "2026-07-10"
  }'
```

---

## Verificación Final

1. Abrir Frontend Admin: http://localhost:5173
2. Ver que el Dashboard muestre datos reales
3. Ir a Propiedades → verificar que aparezcan con imágenes
4. Ir a Servicios → verificar que aparezcan
5. Ir a Reportes → verificar métricas
6. Abrir Frontend Público: http://localhost:3001
7. Ver propiedades visibles en el catálogo
8. Probar formulario de solicitud
