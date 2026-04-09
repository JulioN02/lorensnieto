# Política de Seguridad - Lorens Nieto

## Configuración de Secrets

Este repositorio maneja información sensible a través de GitHub Secrets y Environments.

### Secrets Configurados

| Secret | Descripción | Ambiente |
|--------|-------------|----------|
| `RAILWAY_TOKEN` | Token de API de Railway para deploy | Production, Staging |
| `RAILWAY_DATABASE_URL` | URL de PostgreSQL en Railway | Production, Staging |
| `SMTP_PASSWORD` | Contraseña de aplicación Gmail | Production |

### Configurar un Secret

```bash
# Usando GitHub CLI
gh secret set SECRET_NAME --body "valor-del-secret"

# Para environment específico
gh secret set SECRET_NAME --env production --body "valor"
```

### Requisitos para Secrets

- Nunca hacer commit de secrets en el código
- Usar `.env.example` como plantilla (sin valores reales)
- Rotar secrets periódicamente
- Si un secret se filtra, rotationarlo inmediatamente

## Dependabot

El repositorio está configurado para recibir alertas de seguridad de Dependabot.
Responde a las alertas de Dependabot lo antes posible.

## Reportar Vulnerabilidades

Si descubres una vulnerabilidad de seguridad:
1. **NO** crear un issue público
2. Enviar email a: jsoftsolutions1@gmail.com
3. Incluir detalles de la vulnerabilidad
4. Esperar respuesta antes de hacer público el hallazgo

## Escaneo de Secrets

GitHub automáticamente escanea commits en busca de secrets accidentalmente subidos.
Si GitHub detecta un secret:
1. Recibirás una alerta
2. Rotationalo inmediatamente
3. Revisa los logs de acceso del servicio afectado
