# Guía de Contribución - Lorens Nieto

## Configuración del Entorno

### Requisitos Previos
- Node.js >= 20
- PostgreSQL 16
- Docker (opcional)

### Instalación Local

```bash
# Clonar el repo
git clone git@github.com:JulioN02/lorensnieto.git
cd lorensnieto

# Instalar dependencias
npm install

# Configurar variables de entorno
cp backend/.env.example backend/.env
# Editar backend/.env con tus valores

# Crear base de datos
docker compose up -d postgres
# O usar PostgreSQL local si ya está instalado

# Correr migraciones
cd backend
npm run db:migrate

# Seed de datos de prueba
npm run db:seed

# Arrancar en desarrollo
npm run dev
```

## Convenciones de Commits

Usamos commits convencionales para mantener un historial legible.

### Formato
```
<tipo>(<alcance>): <descripción>

[body opcional]
```

### Tipos
- `feat` - Nueva funcionalidad
- `fix` - Corrección de bug
- `docs` - Documentación
- `style` - Formateo, sin cambios en lógica
- `refactor` - Refactorización de código
- `perf` - Mejoras de rendimiento
- `test` - Agregar o modificar tests
- `chore` - Tareas de mantenimiento

### Ejemplos
```bash
git commit -m "feat(backend): agregar endpoint de propiedades"
git commit -m "fix(auth): corregir logout en sesión expirada"
git commit -m "docs: actualizar README con nuevas instrucciones"
```

## Ramas (Branches)

- `main` - Código de producción
- `feature/nombre-descripcion` - Nuevas funcionalidades
- `fix/nombre-del-bug` - Correcciones
- `hotfix/nombre` - Correcciones urgentes

### Crear una Rama
```bash
git checkout main
git pull origin main
git checkout -b feature/agregar-propiedades
```

## Pull Requests

1. Hacer commit de los cambios siguiendo las convenciones
2. Push a la rama
3. Crear PR con el template
4. Esperar revisión
5. Hacer los cambios solicitados si hay feedback

## Testing

```bash
# Tests del backend
cd backend
npm test

# Con coverage
npm test -- --coverage

# Tests en watch mode
npm run test:watch
```

## Estándares de Código

- TypeScript strict mode
- ESLint para linting
- Prettier para formateo
- Commits en español

## Checklist antes de PR

- [ ] Tests agregados para nueva funcionalidad
- [ ] Todos los tests pasan
- [ ] Código formateado con Prettier
- [ ] Sin errores de TypeScript (`tsc --noEmit`)
- [ ] Documentación actualizada si aplica
