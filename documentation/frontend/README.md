# Frontend Documentation

## Overview

The SPMS frontend is a modern React application built with TypeScript, Tailwind CSS, shadcn/ui, MobX, and TanStack Query.

## Quick Start

See [Frontend README](../../frontend/README.md) for setup and getting started.

## Documentation Structure

This section contains comprehensive frontend documentation covering:

- **Architecture** - Application structure and design patterns
- **Development** - Development workflow and coding standards
- **Testing** - Testing strategy and best practices
- **Components** - Component organisation and patterns

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
