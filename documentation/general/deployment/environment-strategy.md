# Environment Strategy

## Overview

This document outlines the environment configuration strategy for the Science Projects Management System (SPMS), covering environment variables, configuration management, and secrets management across both frontend and backend components.

## Environments

### Development

**Purpose**: Local development
**Infrastructure**: Docker Compose
**Database**: Local PostgreSQL
**Secrets**: Local `.env` files (not committed)

### Staging/Test

**Purpose**: Pre-production testing
**Infrastructure**: Azure Kubernetes Service
**Database**: Azure Database for PostgreSQL (staging instance)
**Secrets**: Azure Key Vault

### Production

**Purpose**: Live system
**Infrastructure**: Azure Kubernetes Service
**Database**: Azure Database for PostgreSQL (Production instance)
**Secrets**: Azure Key Vault

## Environment Variables

### Frontend Environment Variables

**Build-time variables** (baked into JavaScript bundle during Vite build):

**Why build-time?**
Vite processes environment variables during the build step and replaces them with their actual values in the compiled JavaScript. This means:
- Values become part of the bundle and cannot be changed after build
- Must be set before `bun run build` command
- In CI/CD, injected via GitHub Secrets during Docker build
- In local development, read from `.env` files

**Required variables:**

```bash
# Production URLs (set in GitHub Secrets: VITE_PRODUCTION_*)
VITE_PRODUCTION_BASE_URL=<production-frontend-url>
VITE_PRODUCTION_BACKEND_API_URL=<production-backend-api-url>
VITE_PRODUCTION_PROFILES_BASE_URL=<production-profiles-url>

# Staging URLs (set in GitHub Secrets: VITE_TEST_*)
VITE_TEST_BASE_URL=<staging-frontend-url>
VITE_TEST_BACKEND_API_URL=<staging-backend-api-url>
VITE_TEST_PROFILES_BASE_URL=<staging-profiles-url>

# Error Tracking (set in GitHub Secrets)
VITE_SENTRY_DSN=<sentry-dsn>
VITE_SENTRY_ENVIRONMENT=production  # or staging (set by workflow)

# Feature Flags (optional)
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_DEBUG_TOOLS=false
```

**Security note:** All `VITE_*` variables are exposed in the client-side JavaScript bundle. Never put sensitive secrets (API keys, passwords) in frontend environment variables.

**File**: `frontend/.env.production` (template only, actual values in GitHub Secrets)

```bash
# These values are injected during CI/CD build via GitHub Secrets
# See GitHub repository Settings → Secrets and variables → Actions
VITE_PRODUCTION_BASE_URL=<from-github-secrets>
VITE_PRODUCTION_BACKEND_API_URL=<from-github-secrets>
VITE_PRODUCTION_PROFILES_BASE_URL=<from-github-secrets>
VITE_SENTRY_DSN=<from-github-secrets>
VITE_SENTRY_ENVIRONMENT=production  # Set by workflow
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_DEBUG_TOOLS=false
```

**File**: `frontend/.env.staging` (template only, actual values in GitHub Secrets)

```bash
# These values are injected during CI/CD build via GitHub Secrets
# See GitHub repository Settings → Secrets and variables → Actions
VITE_TEST_BASE_URL=<from-github-secrets>
VITE_TEST_BACKEND_API_URL=<from-github-secrets>
VITE_TEST_PROFILES_BASE_URL=<from-github-secrets>
VITE_SENTRY_DSN=<from-github-secrets>
VITE_SENTRY_ENVIRONMENT=staging  # Set by workflow
VITE_ENABLE_ANALYTICS=false
VITE_ENABLE_DEBUG_TOOLS=true
```

**File**: `frontend/.env.development` (local only, not committed)

```bash
# Local development - create this file manually
# Copy from .env.example and fill in values
VITE_API_BASE_URL=http://localhost:8000/api/v1
VITE_SENTRY_DSN=  # Leave empty for local dev
VITE_SENTRY_ENVIRONMENT=development
VITE_ENABLE_ANALYTICS=false
VITE_ENABLE_DEBUG_TOOLS=true
```

### Backend Environment Variables

**Runtime variables** (injected at container startup):

```bash
# Django Configuration
SECRET_KEY=<secret-key>
DEBUG=False
ALLOWED_HOSTS=scienceprojects.dbca.wa.gov.au

# Database
DATABASE_URL=postgresql://user:password@host:5432/dbname

# Redis (optional)
REDIS_URL=redis://redis:6379/0

# Error Tracking
SENTRY_DSN=https://xxx@sentry.io/xxx
SENTRY_ENVIRONMENT=production

# Email (optional)
EMAIL_HOST=smtp.office365.com
EMAIL_PORT=587
EMAIL_HOST_USER=noreply@dbca.wa.gov.au
EMAIL_HOST_PASSWORD=<password>
EMAIL_USE_TLS=True

# Azure Storage (optional)
AZURE_STORAGE_ACCOUNT_NAME=<account-name>
AZURE_STORAGE_ACCOUNT_KEY=<account-key>
AZURE_STORAGE_CONTAINER=media

# Feature Flags (optional)
ENABLE_CELERY=False
ENABLE_CACHE=True
```

**File**: `backend/.env.production` (template only, actual values in Rancher Secrets)

```bash
# Backend secrets are injected at runtime via Kubernetes Secrets
# Configured via Rancher GUI by infrastructure team
SECRET_KEY=<from-rancher-secrets>
DEBUG=False
ALLOWED_HOSTS=<from-rancher-secrets>
DATABASE_URL=<from-rancher-secrets>
SENTRY_URL=<from-rancher-secrets>
ENVIRONMENT=production
```

**File**: `backend/.env.staging` (template only, actual values in Rancher Secrets)

```bash
# Backend secrets are injected at runtime via Kubernetes Secrets
# Configured via Rancher GUI by infrastructure team
SECRET_KEY=<from-rancher-secrets>
DEBUG=False
ALLOWED_HOSTS=<from-rancher-secrets>
DATABASE_URL=<from-rancher-secrets>
SENTRY_URL=<from-rancher-secrets>
ENVIRONMENT=staging
```

**File**: `backend/.env.development` (local only, not committed)

```bash
SECRET_KEY=dev-secret-key-change-in-production
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/spms
SENTRY_DSN=
SENTRY_ENVIRONMENT=development
```

## Configuration Management

### Frontend Configuration

**Build-time configuration:**
- Environment variables injected during Vite build
- Different `.env` files for each environment
- Variables prefixed with `VITE_` are exposed to client

**Runtime configuration:**
- No runtime configuration (static files)
- All configuration baked into build

**Access in code:**
```typescript
// frontend/src/config/environment.ts
export const config = {
  // These are baked into the bundle at build time
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL,
  sentryDsn: import.meta.env.VITE_SENTRY_DSN,
  sentryEnvironment: import.meta.env.VITE_SENTRY_ENVIRONMENT,
  enableAnalytics: import.meta.env.VITE_ENABLE_ANALYTICS === 'true',
  enableDebugTools: import.meta.env.VITE_ENABLE_DEBUG_TOOLS === 'true',
};

// Note: All VITE_* variables are visible in browser DevTools
// Never put sensitive secrets (API keys, passwords) here
```

### Backend Configuration

**Runtime configuration:**
- Environment variables injected at container startup
- Django settings module per environment
- Secrets from Azure Key Vault

**Settings structure:**
```
backend/config/settings/
├── __init__.py
├── base.py          # Base settings
├── development.py   # Development overrides
├── staging.py       # Staging overrides
└── production.py    # Production overrides
```

**Access in code:**
```python
# backend/config/settings/production.py
import os
from .base import *

# These are injected at runtime via Kubernetes Secrets
DEBUG = False
ALLOWED_HOSTS = os.environ.get('ALLOWED_HOSTS', '').split(',')

DATABASES = {
    'default': dj_database_url.parse(os.environ.get('DATABASE_URL'))
}

# Sentry (backend uses SENTRY_URL, not SENTRY_DSN)
import sentry_sdk
sentry_sdk.init(
    dsn=os.environ.get('SENTRY_URL'),
    environment=os.environ.get('ENVIRONMENT', 'production'),
)
```

## Secrets Management

### GitHub Secrets (Frontend Build-Time)

**Why GitHub Secrets for frontend?**
Frontend environment variables must be set in GitHub Secrets because Vite bakes them into the JavaScript bundle at build time during Docker image creation. These values become part of the compiled code and cannot be changed after the image is built.

**Where to configure:**
1. Navigate to: `https://github.com/dbca-wa/science-projects`
2. Go to: Settings → Secrets and variables → Actions
3. Click: "New repository secret"
4. Add each secret with its name and value

**Required GitHub Secrets (names only):**

| Secret Name | Purpose | Used By |
|------------|---------|---------|
| `VITE_PRODUCTION_BASE_URL` | Production frontend base URL | Production build |
| `VITE_PRODUCTION_BACKEND_API_URL` | Production backend API URL | Production build |
| `VITE_PRODUCTION_PROFILES_BASE_URL` | Production profiles service URL | Production build |
| `VITE_TEST_BASE_URL` | Staging frontend base URL | Staging build |
| `VITE_TEST_BACKEND_API_URL` | Staging backend API URL | Staging build |
| `VITE_TEST_PROFILES_BASE_URL` | Staging profiles service URL | Staging build |
| `VITE_SENTRY_DSN` | Sentry error tracking DSN | Both environments |
| `KUBE_CONFIG` | Kubernetes cluster configuration | Deployment |

**Security notes:**
- Never commit these values to Git
- Values are injected during CI/CD build process
- Frontend secrets are visible in browser (by design) - never put sensitive API keys here
- Backend secrets use different mechanism (see below)

### Rancher Secrets (Backend Runtime)

**Backend secrets** are managed differently because they are injected at runtime (when container starts) via Kubernetes Secrets, not baked into the Docker image.

**Where to configure:**
- Production: https://rancher.dbca.wa.gov.au (Namespace: `spms`, Deployment: `spms-deployment-prod`)
- Staging: https://rancher-uat.dbca.wa.gov.au (Namespace: `spms`, Deployment: `spms-deployment-test`)

**Backend secrets (managed by infrastructure team):**
- Database credentials (`DATABASE_URL`)
- Django secret key (`SECRET_KEY`)
- Backend Sentry configuration (`SENTRY_URL`, `ENVIRONMENT`)
- Allowed hosts (`ALLOWED_HOSTS`)
- External API keys
- OAuth credentials

**Why different from frontend?**
Backend secrets can be changed without rebuilding the Docker image. Simply update the secret in Rancher and restart the pod.

### Azure Key Vault

Infrastructure team manages Azure Key Vault as the backend for Rancher secrets. Developers interact with secrets via Rancher GUI, not directly with Azure Key Vault.

### Local Development Secrets

**Frontend** (`frontend/.env.local` - not committed):
```bash
# Create this file manually for local development
# Copy from .env.example and fill in values
VITE_API_BASE_URL=http://localhost:8000/api/v1
VITE_SENTRY_DSN=  # Leave empty for local dev
VITE_SENTRY_ENVIRONMENT=development
```

**Backend** (`backend/.env.local` - not committed):
```bash
# Create this file manually for local development
# Copy from .env.example and fill in values
SECRET_KEY=dev-secret-key-change-in-production
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/spms
SENTRY_URL=  # Leave empty for local dev
ENVIRONMENT=development
```

**Template files** (committed to Git):
- `frontend/.env.example` - Documents required frontend variables
- `backend/.env.example` - Documents required backend variables

**Security:** Never commit `.env.local` files. They are in `.gitignore` to prevent accidental commits.

## Environment-Specific Configuration

### Development

**Frontend:**
- Hot module replacement enabled
- Source maps enabled
- Debug tools enabled
- No analytics

**Backend:**
- DEBUG=True
- Local database
- No email sending (console backend)
- No Sentry

### Staging/Test

**Frontend:**
- Production build
- Source maps enabled
- Debug tools enabled
- Analytics disabled

**Backend:**
- DEBUG=False
- Azure Database for PostgreSQL (staging)
- Email sending enabled
- Sentry enabled

### Production

**Frontend:**
- Production build
- Source maps disabled (or uploaded to Sentry)
- Debug tools disabled
- Analytics enabled

**Backend:**
- DEBUG=False
- Azure Database for PostgreSQL (Production)
- Email sending enabled
- Sentry enabled
- Performance monitoring enabled

## Configuration Validation

### Frontend Validation

**Build-time validation:**
```typescript
// frontend/src/config/validate.ts
function validateConfig() {
  const required = ['VITE_API_URL', 'VITE_ENVIRONMENT'];

  for (const key of required) {
    if (!import.meta.env[key]) {
      throw new Error(`Missing required environment variable: ${key}`);
    }
  }

  // Validate API URL format
  try {
    new URL(import.meta.env.VITE_API_URL);
  } catch {
    throw new Error('Invalid VITE_API_URL format');
  }
}

validateConfig();
```

### Backend Validation

**Runtime validation:**
```python
# backend/config/settings/base.py
import os

def validate_settings():
    required = ['SECRET_KEY', 'DATABASE_URL', 'ALLOWED_HOSTS']

    for key in required:
        if not os.environ.get(key):
            raise ValueError(f'Missing required environment variable: {key}')

    # Validate SECRET_KEY length
    if len(os.environ.get('SECRET_KEY', '')) < 50:
        raise ValueError('SECRET_KEY must be at least 50 characters')

validate_settings()
```

## Best Practices

### Security

1. **Never commit secrets** - Use `.gitignore` for `.env.local` files
2. **Use Azure Key Vault** - Store all production secrets in Key Vault
3. **Rotate secrets regularly** - Update secrets every 90 days
4. **Limit secret access** - Use managed identities and RBAC
5. **Audit secret access** - Enable Azure Key Vault logging

### Configuration

1. **Use environment-specific files** - `.env.production`, `.env.staging`, `.env.development`
2. **Provide example files** - `.env.example` for documentation
3. **Validate configuration** - Check required variables at startup
4. **Document all variables** - Maintain list of all environment variables
5. **Use sensible defaults** - Provide defaults for optional variables

### Deployment

1. **Inject at build time (frontend)** - Bake configuration into build
2. **Inject at runtime (backend)** - Use environment variables
3. **Use ConfigMaps for non-secrets** - Store non-sensitive config in ConfigMaps
4. **Use Secrets for sensitive data** - Store sensitive data in Kubernetes Secrets
5. **Test configuration** - Verify configuration in each environment

## Troubleshooting

### Frontend Issues

**Issue**: `VITE_API_URL is undefined`
**Solution**: Ensure `.env` file exists and variable is prefixed with `VITE_`

**Issue**: API calls fail with CORS error
**Solution**: Verify `VITE_API_URL` matches backend ALLOWED_HOSTS

### Backend Issues

**Issue**: `SECRET_KEY not set`
**Solution**: Ensure environment variable is set in Kubernetes Secret

**Issue**: Database connection fails
**Solution**: Verify `DATABASE_URL` format and database accessibility

**Issue**: Sentry not capturing errors
**Solution**: Verify `SENTRY_DSN` is set and valid

## Component-Specific Environment Documentation

### Frontend Environment Variables

**Frontend-specific:**
- Vite environment variable handling
- Build-time vs runtime configuration
- Feature flags

### Backend Environment Variables

For backend-specific environment details, see:
- [Backend Deployment Documentation](./)

**Backend-specific:**
- Django settings modules
- Database configuration
- Email configuration
- Azure Storage configuration

## Related Documentation

- [CI/CD Overview](./ci-cd-overview.md) - CI/CD strategy for monorepo
- [Docker Overview](./docker-overview.md) - Docker strategy
- [Kubernetes Overview](./kubernetes-overview.md) - AKS cluster architecture
- [Backend Deployment](./) - Backend-specific deployment

## External Resources

- [Vite Environment Variables](https://vitejs.dev/guide/env-and-mode.html)
- [Django Settings](https://docs.djangoproject.com/en/4.2/topics/settings/)
- [Azure Key Vault](https://docs.microsoft.com/en-us/azure/key-vault/)
- [Kubernetes Secrets](https://kubernetes.io/docs/concepts/configuration/secret/)
- [12-Factor App Config](https://12factor.net/config)
