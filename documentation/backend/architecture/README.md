# Architecture Documentation

## Overview

This directory contains architectural documentation for the Science Projects Management System backend, including architectural decision records (ADRs) and detailed design documentation.

## Contents

### Architectural Overview

- **[overview.md](overview.md)** - Application structure, design patterns, and architectural layers

### Architectural Decision Records (ADRs)

ADRs document significant architectural decisions made during development:

- **[ADR-001: Single Maintainer Philosophy](ADR-001-single-maintainer-philosophy.md)** - Design principles for maintainability
- **[ADR-002: Django REST Framework](ADR-002-django-rest-framework.md)** - Why Django REST Framework
- **[ADR-003: PostgreSQL Database](ADR-003-postgresql-database.md)** - Database choice and rationale
- **[ADR-004: Poetry Dependency Management](ADR-004-poetry-dependency-management.md)** - Dependency management approach
- **[ADR-005: pytest Testing Framework](ADR-005-pytest-testing-framework.md)** - Testing framework selection
- **[ADR-006: Azure Kubernetes Deployment](ADR-006-azure-kubernetes-deployment.md)** - Deployment platform choice
- **[ADR-007: No Application Nginx](ADR-007-no-application-nginx.md)** - HTTP caching approach
- **[ADR-008: Redis Application Caching](ADR-008-redis-application-caching.md)** - Caching strategy and implementation
- **[ADR-009: Application Logging and Monitoring](ADR-009-application-logging-monitoring.md)** - Development team logging and monitoring strategy
- **[ADR-010: File Upload Validation](ADR-010-file-upload-validation.md)** - Security approach for file uploads

### Design Documentation

- **[api-design.md](api-design.md)** - REST API design principles, versioning, and patterns
- **[background-jobs.md](background-jobs.md)** - Background job processing strategy
- **[caching-strategy.md](caching-strategy.md)** - Application-level caching implementation

### Creating New ADRs

Use the [ADR-TEMPLATE.md](ADR-TEMPLATE.md) when documenting new architectural decisions.

## Related Documentation

- **Development**: `../development/` - Development guides and workflows
- **Deployment**: `../../general/deployment/` - Deployment and infrastructure
- **Operations**: `../../general/operations/` - Operational procedures
- **Security**: `../../general/security/` - Security documentation
