# Environments

Este repositorio usa GitHub Environments para configurar secrets y variables de entorno
para diferentes ambientes de despliegue.

## Ambientes Disponibles

### 1. Production (`production`)
Ambiente de producción. Solo cambios en `main` hacen deploy aquí.
**Secrets requeridos:**
- `RAILWAY_TOKEN` - Token de API de Railway
- `RAILWAY_DATABASE_URL` - URL de la base de datos en Railway

### 2. Staging (`staging`)
Ambiente de staging para pruebas.
**Secrets requeridos:**
- `RAILWAY_TOKEN` - Token de API de Railway
- `RAILWAY_DATABASE_URL` - URL de la base de datos staging

## Configurar Secrets

```bash
# Configurar secrets para producción
gh secret set RAILWAY_TOKEN --body "tu-railway-token"
gh secret set RAILWAY_DATABASE_URL --body "postgresql://..."

# Ver secrets configurados
gh secret list --env production
```

## Environments via API

```bash
# Crear environment de producción
gh api repos/JulioN02/lorensnieto/environments -X POST \
  -f name="production" \
  -f protection_rules='{"wait_timer":0,"required_reviewers":[],"branch_policy":"all"}'

# Agregar secrets al environment
gh secret set SECRET_NAME --env production --body "secret-value"
```
