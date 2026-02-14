# General Documentation

## Overview

This section contains monorepo-wide documentation covering operations, deployment, and cross-cutting concerns that apply to both frontend and backend components.

## Contents

### Operations

Operational procedures, monitoring, and troubleshooting for the entire SPMS.

- [Change Management](operations/change-management.md) - Change request process, deployment windows, rollback procedures
- [Error Tracking](operations/error-tracking.md) - Sentry configuration for both frontend and backend
- [Disaster Recovery](operations/disaster-recovery.md) - Recovery procedures for frontend and backend
- [Monitoring](operations/monitoring.md) - Monitoring strategy for frontend and backend

### Deployment

Monorepo-wide deployment strategies and infrastructure.

- [CI/CD Overview](deployment/ci-cd-overview.md) - GitHub Actions workflows and monorepo CI/CD strategy
- [Docker Overview](deployment/docker-overview.md) - Docker strategy for frontend and backend containers
- [Kubernetes Overview](deployment/kubernetes-overview.md) - AKS cluster architecture and deployment patterns
- [Version Management](deployment/version-management.md) - Semantic versioning and release process
- [Environment Strategy](deployment/environment-strategy.md) - Environment variables and configuration management

### Security

Security practices and tools that apply to both frontend and backend.

- [Security Documentation](security/) - GitHub security tools, review processes, vulnerability management

> **Note**: Security documentation is located in the backend directory but applies to both frontend and backend components.

## Related Documentation

- [Frontend Documentation](../frontend/) - Frontend-specific architecture, development, and deployment
- [Backend Documentation](../backend/) - Backend-specific architecture, development, and deployment

## Navigation

- [Back to Main Documentation](../README.md)
- [Frontend Documentation](../frontend/)
- [Backend Documentation](../backend/)
