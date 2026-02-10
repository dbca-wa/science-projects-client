# Backend Documentation

## Overview

Welcome to the Science Projects Management System (SPMS) backend documentation. This documentation is organised by topic to help you quickly find what you need.

## Quick Start

**New to the project?**

1. [Getting Started](development/getting-started.md) - Get up and running in under 30 minutes
2. [Local Setup](development/local-setup.md) - Detailed setup instructions
3. [Testing Guide](development/testing-guide.md) - Run your first tests

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

**Location**: `deployment/`

Deployment guides, CI/CD workflows, and infrastructure documentation.

- Kubernetes setup and configuration
- CI/CD pipelines
- Monitoring and logging
- Version management

**[Browse Deployment Docs →](deployment/)**

### Security

**Location**: `security/`

Security tools, review processes, and vulnerability management.

- GitHub security tools (CodeQL, Dependabot, GitGuardian, Socket)
- Security review process and PR checklist
- Vulnerability triage and remediation
- Security baseline and compliance

**[Browse Security Docs →](security/)**

### Operations

**Location**: `operations/`

Operational procedures, monitoring, and troubleshooting.

- Error tracking and monitoring
- Disaster recovery procedures
- Troubleshooting common issues

**[Browse Operations Docs →](operations/)**

## Common Workflows

### Setting Up Locally

1. [Getting Started](development/getting-started.md)
2. [Local Setup](development/local-setup.md)

### Adding a Feature

1. [Feature Development](development/feature-development.md)
2. [Code Style](development/code-style.md)
3. [Testing Guide](development/testing-guide.md)
4. [Pre-commit Checks](development/pre-commit.md)

### Deploying

1. [CI/CD](deployment/ci-cd.md)
2. [Kubernetes Setup](deployment/kubernetes-setup.md)
3. [Monitoring](deployment/monitoring-setup.md)

### Operations

1. [Change Management](operations/change-management.md)
2. [Disaster Recovery](operations/disaster-recovery.md)
3. [Error Tracking](operations/error-tracking.md)

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

1. Check [Troubleshooting](operations/troubleshooting.md) for common issues
2. Search this documentation
3. Ask the team in Microsoft Teams
4. Create an issue if documentation is missing or unclear
