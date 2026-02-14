# Frontend Documentation

## Overview

The SPMS frontend is a modern React application built with TypeScript, Tailwind CSS, shadcn/ui, MobX, and TanStack Query.

## Quick Start

**New to the project?**

1. [Getting Started](development/getting-started.md) - Get up and running quickly
2. [Code Style](development/code-style.md) - Coding standards and conventions
3. [Testing Guide](development/testing-guide.md) - Run your first tests

## Documentation Structure

### Development

**Location**: `development/`

Guides for setting up, developing, and testing the frontend application.

- Getting started and installation
- Feature development workflow
- Code style and TypeScript standards
- Testing strategy and commands
- Pre-commit hooks and validation

**[Browse Development Docs →](development/)**

### Architecture

**Location**: `architecture/`

Architectural decisions, design patterns, and system structure.

- Application overview and technology stack
- Architectural Decision Records (ADRs)
- State management patterns (MobX + TanStack Query)
- Component organisation and feature structure

**[Browse Architecture Docs →](architecture/)**

### Performance

**Location**: `performance/`

Performance optimisation strategies and best practices.

- Code splitting and lazy loading
- Bundle optimisation and tree shaking
- Memoisation patterns (React + MobX)
- Memory management and cleanup

**[Browse Performance Docs →](performance/)**

### Deployment

**Location**: `../general/deployment/`

Frontend deployment is covered in the monorepo-wide deployment documentation.

- Vite build configuration (see ADR-004)
- CI/CD workflows for frontend
- Environment variables and configuration
- Docker setup for frontend

**[Browse Deployment Docs →](../general/deployment/)**

### Security

**Location**: `../general/security/`

Security tools, review processes, and vulnerability management apply to both frontend and backend.

- GitHub security tools (CodeQL, Dependabot, GitGuardian, Socket)
- Security review process and PR checklist
- Vulnerability triage and remediation
- Secrets management

**[Browse Security Docs →](../general/security/)**

> **Note**: Security practices documented in backend security apply to frontend development as well.

### Operations

**Location**: `../general/operations/`

Shared operational procedures, monitoring, and troubleshooting for the entire application.

- Error tracking and monitoring (Sentry for both frontend and backend)
- Disaster recovery procedures
- Change management process
- Monitoring strategy

**[Browse Operations Docs →](../general/operations/)**

### Deployment

**Shared deployment documentation**: See [../general/deployment/](../general/deployment/) for monorepo-wide deployment strategies including CI/CD, Docker, Kubernetes, and environment configuration.

## Common Workflows

### Setting Up Locally

1. [Getting Started](development/getting-started.md)
2. [Code Style](development/code-style.md)

### Adding a Feature

1. [Feature Development](development/feature-development.md)
2. [Component Organisation](architecture/component-organisation.md)
3. [Testing Guide](development/testing-guide.md)
4. [Pre-commit Checks](development/pre-commit.md)

### Deploying

1. [CI/CD Overview](../general/deployment/ci-cd-overview.md)
2. [Docker Overview](../general/deployment/docker-overview.md)
3. [Environment Strategy](../general/deployment/environment-strategy.md)

### Performance Optimisation

1. [Code Splitting](performance/code-splitting.md)
2. [Bundle Optimisation](performance/bundle-optimisation.md)
3. [Memoisation](performance/memoisation.md)

## Technology Stack

- **React 19** with TypeScript
- **Vite** for build tooling
- **Tailwind CSS v4** + shadcn/ui for styling
- **MobX** for client state management
- **TanStack Query** for server state management
- **React Router** (Data Mode) for routing
- **Bun** as package manager and test runner
- **Vitest** for testing

## Key Principles

### State Management

- **MobX for client state**: UI state, auth, preferences
- **TanStack Query for server state**: API calls, caching, invalidation
- **Never mix**: MobX stores never make API calls

### Component Organisation

- **Feature-based**: Group by feature, not by type
- **Shared components**: Used by 2+ features
- **Platform features**: auth, users (can be imported)
- **Domain features**: projects, caretakers (isolated)

### TypeScript Standards

- **Never use `any`**: Use proper types or `unknown`
- **Never use `@ts-ignore`**: Fix the underlying issue
- **Type guards**: For runtime validation
- **Strict mode**: Enabled in tsconfig.json

### Testing Philosophy

- **90% unit tests**: Utils, hooks, services, stores
- **10% page tests**: User flows + accessibility
- **No component tests**: Components tested via pages

## External Resources

- **React**: https://react.dev/
- **TypeScript**: https://www.typescriptlang.org/
- **Tailwind CSS**: https://tailwindcss.com/
- **shadcn/ui**: https://ui.shadcn.com/
- **MobX**: https://mobx.js.org/
- **TanStack Query**: https://tanstack.com/query/latest
- **Vitest**: https://vitest.dev/
- **Bun**: https://bun.sh/


## External Resources

- **React**: https://react.dev/
- **TypeScript**: https://www.typescriptlang.org/
- **Tailwind CSS**: https://tailwindcss.com/
- **shadcn/ui**: https://ui.shadcn.com/
- **MobX**: https://mobx.js.org/
- **TanStack Query**: https://tanstack.com/query/latest
- **Vitest**: https://vitest.dev/
- **Bun**: https://bun.sh/

## Contributing to Documentation

Documentation is code. When you update the application, update the docs too.

**When to update**:
- Adding a feature → Update architecture and development docs
- Changing build configuration → Update deployment docs
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

1. Search this documentation
2. Check [Architecture Overview](architecture/overview.md) for system understanding
3. Ask the team in Microsoft Teams
4. Create an issue if documentation is missing or unclear
