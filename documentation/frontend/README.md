# Frontend Documentation

## Overview

The SPMS frontend is a modern React application built with TypeScript, Tailwind CSS, shadcn/ui, MobX, and TanStack Query.

## Quick Start

See [Frontend README](../../frontend/README.md) for setup and getting started.

## Documentation Structure

This section contains comprehensive frontend documentation organised into four main areas:

### [Architecture](./architecture/README.md)

Architectural decisions and design patterns:
- [ADRs](./architecture/README.md#architectural-decision-records-adrs) - Architectural Decision Records
- [Overview](./architecture/overview.md) - System architecture overview
- [State Management](./architecture/state-management.md) - MobX and TanStack Query patterns
- [Component Organisation](./architecture/component-organisation.md) - Feature-based structure

### [Development](./development/README.md)

Development workflow and standards:
- [Getting Started](./development/getting-started.md) - Setup and installation
- [Code Style](./development/code-style.md) - TypeScript standards and ESLint
- [Testing Guide](./development/testing-guide.md) - Testing philosophy and implementation
- [Feature Development](./development/feature-development.md) - Feature development workflow
- [Pre-commit Hooks](./development/pre-commit.md) - Pre-commit checks

### [Performance](./performance/README.md)

Performance optimisation strategies:
- [Code Splitting](./performance/code-splitting.md) - Manual chunks and route-based splitting
- [Bundle Optimisation](./performance/bundle-optimisation.md) - Bundle analysis and tree shaking
- [Memoisation](./performance/memoisation.md) - React and MobX memoisation patterns
- [Memory Management](./performance/memory-management.md) - Store lifecycle and cleanup

### [Deployment](./deployment/README.md)

Build and deployment configuration:
- [Build Configuration](./deployment/build-configuration.md) - Vite production build settings
- [CI/CD](./deployment/ci-cd.md) - GitHub Actions workflows
- [Environment Variables](./deployment/environment-variables.md) - Configuration management
- [Docker](./deployment/docker.md) - Docker configuration

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
