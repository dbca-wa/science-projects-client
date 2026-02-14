# Deployment Documentation

## Overview

This section contains monorepo-wide deployment strategies and infrastructure documentation. For component-specific deployment details, see the frontend and backend deployment sections.

## Contents

### CI/CD Overview

**[CI/CD Strategy](./ci-cd-overview.md)**

Monorepo-wide CI/CD strategy:
- GitHub Actions workflows
- Monorepo CI/CD approach
- Branch strategy and deployment triggers
- Testing strategy in CI/CD
- Links to component-specific CI/CD

### Docker Overview

**[Docker Strategy](./docker-overview.md)**

Docker strategy for the monorepo:
- Multi-stage build patterns
- Frontend container (Bun)
- Backend container (gunicorn + Django)
- Docker Compose for local development
- Image tagging and versioning
- Links to component-specific Docker docs

### Kubernetes Overview

**[Kubernetes Strategy](./kubernetes-overview.md)**

AKS cluster architecture and deployment:
- AKS cluster architecture
- Namespace strategy
- Deployment patterns
- Service mesh and ingress
- ConfigMaps and Secrets
- Kustomize overlays strategy
- Links to backend Kubernetes setup

### Environment Strategy

**[Environment Configuration](./environment-strategy.md)**

Environment variables and configuration:
- Environment variables across components
- Configuration management approach
- Secrets management (Azure Key Vault)
- Environment-specific configuration
- Links to component-specific environment docs

### Version Management

**[Version Management Strategy](./version-management.md)**

Versioning strategy for the monorepo:
- Semantic versioning approach
- Version bumping process
- Release tagging
- Changelog management

## Component-Specific Deployment

### Frontend Deployment

**Location**: This directory

All deployment documentation is centralised here in `general/deployment/`:
- [CI/CD Overview](ci-cd-overview.md) - Complete CI/CD workflows for frontend and backend
- [Docker Overview](docker-overview.md) - Docker setup for both applications
- [Kubernetes Overview](kubernetes-overview.md) - Kubernetes deployment guide
- [Environment Strategy](environment-strategy.md) - Environment configuration
- [Version Management](version-management.md) - Version control and releases

**[Browse All Deployment Docs →](./)**

## Related Documentation

- [Operations Documentation](../operations/) - Operational procedures and monitoring
- [Security Documentation](../security/) - Security tools and processes
- [Frontend Architecture](../../frontend/architecture/) - Frontend architecture decisions
- [Backend Architecture](../../backend/architecture/) - Backend architecture decisions

## External Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Docker Documentation](https://docs.docker.com/)
- [Kubernetes Documentation](https://kubernetes.io/docs/)
- [Semantic Versioning](https://semver.org/)
