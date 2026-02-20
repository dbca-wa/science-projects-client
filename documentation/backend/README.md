# Backend Documentation

## Overview

Welcome to the Science Projects Management System (SPMS) backend documentation. This documentation is organised by topic to help you quickly find what you need.

## Quick Start

**New to the project?**

1. [Getting Started](development/getting-started.md) - Get up and running in under 30 minutes
2. [Local Setup](development/local-setup.md) - Detailed setup instructions
3. [Seeding Guide](development/seeding-guide.md) - Set up with production-like data
4. [Testing Guide](development/testing-guide.md) - Run your first tests

## Documentation Structure

### Development

**Location**: `development/`

Guides for setting up, developing, and testing the application.

- Getting started and local setup
- Feature development workflow
- Code style and quality standards
- Testing strategy and commands
- Performance and database optimization

**[Browse Development Docs →](development/)**

### Architecture

**Location**: `architecture/`

Architectural decisions, design patterns, and system structure.

- Application overview and design patterns
- Architectural Decision Records (ADRs)
- API design principles
- Caching and background jobs strategy

**[Browse Architecture Docs →](architecture/)**

### Deployment

**Location**: `../general/deployment/`

Deployment guides, CI/CD workflows, and infrastructure documentation are shared across the monorepo.

- Kubernetes setup and configuration
- CI/CD pipelines
- Monitoring and logging
- Version management

**[Browse Deployment Docs →](../general/deployment/)**

### Security

**Location**: `../general/security/`

Security tools, review processes, and vulnerability management.

- GitHub security tools (CodeQL, Dependabot, GitGuardian, Socket)
- Security review process and PR checklist
- Vulnerability triage and remediation
- Security baseline and compliance

**[Browse Security Docs →](../general/security/)**

### Operations

**Location**: `../general/operations/`

Operational procedures, monitoring, and troubleshooting for the entire system.

- Change management and deployment procedures
- Error tracking with Sentry (frontend and backend)
- Disaster recovery procedures

**[Browse Operations Docs →](../../general/operations/)**

## Common Workflows

### Setting Up Locally

1. [Getting Started](development/getting-started.md)
2. [Local Setup](development/local-setup.md)
3. [Seeding Guide](development/seeding-guide.md)

### Adding a Feature

1. [Feature Development](development/feature-development.md)
2. [Code Style](development/code-style.md)
3. [Testing Guide](development/testing-guide.md)
4. [Pre-commit Checks](development/pre-commit.md)

### Deploying

1. [CI/CD Overview](../general/deployment/ci-cd-overview.md)
2. [Kubernetes Overview](../general/deployment/kubernetes-overview.md)
3. [Monitoring](../general/operations/monitoring.md)

### Operations

1. [Change Management](../general/operations/change-management.md)
2. [Disaster Recovery](../general/operations/disaster-recovery.md)
3. [Error Tracking](../general/operations/error-tracking.md)

## External Resources

- **Django**: https://docs.djangoproject.com/en/stable/
- **Django REST Framework**: https://www.django-rest-framework.org/
- **Poetry**: https://python-poetry.org/docs/
- **pytest**: https://docs.pytest.org/
- **DBCA Developer Guidance**: https://github.com/dbca-wa/developer-guidance

## Contributing to Documentation

Documentation is code. When you update the application, update the docs too.

**When to update**:
- Adding a feature → Update architecture and development docs
- Changing deployment → Update deployment docs
- Fixing a common issue → Add to troubleshooting
- Making architectural decisions → Create an ADR

**Documentation standards**:
- Use practical, example-driven content
- Explain both "how" and "why"
- Include troubleshooting sections
- Use consistent formatting
- Link between related documents
- Keep it maintainable (avoid duplication)

## Getting Help

1. Check [Operations Documentation](../general/operations/) for common issues
2. Search this documentation
3. Ask the team in Microsoft Teams
4. Create an issue if documentation is missing or unclear
