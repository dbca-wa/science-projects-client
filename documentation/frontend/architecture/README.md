# Frontend Architecture Documentation

## Overview

This section contains architectural decision records (ADRs) and design documentation for the Science Projects Management System frontend application.

## Contents

### Architectural Decision Records (ADRs)

ADRs document key architectural decisions made during the development of the frontend application:

- [ADR-001: React 19 + TypeScript](./ADR-001-react-typescript.md) - Framework and language choice
- [ADR-002: MobX for Client State](./ADR-002-mobx-client-state.md) - Client state management
- [ADR-003: TanStack Query for Server State](./ADR-003-tanstack-query-server-state.md) - Server state management
- [ADR-004: Vite Build Tool](./ADR-004-vite-build-tool.md) - Build tooling selection
- [ADR-005: Tailwind CSS + shadcn/ui](./ADR-005-tailwind-shadcn.md) - Styling approach
- [ADR-006: Vitest Testing Framework](./ADR-006-vitest-testing.md) - Testing framework choice
- [ADR-007: Feature-Based Architecture](./ADR-007-feature-architecture.md) - Code organisation pattern
- [ADR-008: Web Workers and CSP](./ADR-008-web-workers-csp.md) - Web Workers strategy and security

### Architecture Guides

- [Overview](./overview.md) - System architecture overview and technology stack
- [State Management](./state-management.md) - MobX and TanStack Query patterns
- [Component Organisation](./component-organisation.md) - Feature-based directory structure

### ADR Template

Use the [ADR Template](./ADR-TEMPLATE.md) when creating new architectural decision records.

## Related Documentation

- [Development Guide](../development/README.md) - Development workflow and standards
- [Performance Guide](../performance/README.md) - Performance optimisation strategies
- [Deployment Guide](../deployment/README.md) - Build and deployment configuration
- [Backend Architecture](../../backend/architecture/README.md) - Backend architectural decisions

## External Resources

- [React Documentation](https://react.dev/)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [MobX Documentation](https://mobx.js.org/)
- [TanStack Query Documentation](https://tanstack.com/query/latest)
- [Vite Documentation](https://vitejs.dev/)
- [Tailwind CSS Documentation](https://tailwindcss.com/)
- [shadcn/ui Documentation](https://ui.shadcn.com/)
- [Vitest Documentation](https://vitest.dev/)
