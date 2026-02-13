# Frontend Deployment Documentation

## Overview

This section contains guides for building and deploying the Science Projects Management System frontend application.

## Contents

### Deployment Guides

- [Build Configuration](./build-configuration.md) - Vite production build settings
- [CI/CD](./ci-cd.md) - GitHub Actions workflows
- [Environment Variables](./environment-variables.md) - Configuration management
- [Docker](./docker.md) - Docker configuration and deployment

## Deployment Workflow

1. **Build**: Configure production build settings
2. **Test**: Run tests and linting in CI/CD
3. **Deploy to UAT**: Deploy to User Acceptance Testing environment
4. **Deploy to Production**: Deploy to production environment

## Quick Reference

### Build Commands

```bash
# Production build
bun run build

# Preview production build locally
bun run preview

# Type checking
bun run type-check

# Linting
bun run lint
```

### Environment Variables

Required environment variables for deployment:

```bash
# API Configuration
VITE_API_URL=https://api.example.com

# Environment
VITE_ENV=production

# Feature Flags (optional)
VITE_ENABLE_ANALYTICS=true
```

### Docker Commands

```bash
# Build Docker image
docker build -t spms-frontend:latest .

# Run Docker container
docker run -p 80:80 spms-frontend:latest

# Docker Compose
docker-compose up -d
```

## Deployment Environments

### Development
- **URL**: http://localhost:5173
- **API**: http://localhost:8000
- **Purpose**: Local development

### UAT (User Acceptance Testing)
- **URL**: https://uat.example.com
- **API**: https://api-uat.example.com
- **Purpose**: Testing before production

### Production
- **URL**: https://spms.example.com
- **API**: https://api.example.com
- **Purpose**: Live application

## Related Documentation

- [Architecture Guide](../architecture/README.md) - Architectural decisions and patterns
- [Development Guide](../development/README.md) - Development workflow and standards
- [Performance Guide](../performance/README.md) - Performance optimisation strategies

## External Resources

- [Vite Build Guide](https://vitejs.dev/guide/build.html)
- [Docker Documentation](https://docs.docker.com/)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Nginx Documentation](https://nginx.org/en/docs/)
