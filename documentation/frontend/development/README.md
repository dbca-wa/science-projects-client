# Frontend Development Documentation

## Overview

This section contains guides and standards for developing the Science Projects Management System frontend application.

## Contents

### Getting Started

- [Getting Started](./getting-started.md) - Setup and installation guide

### Development Standards

- [Code Style](./code-style.md) - TypeScript standards and ESLint configuration
- [Testing Guide](./testing-guide.md) - Testing philosophy and implementation
- [Feature Development](./feature-development.md) - Feature development workflow
- [Pre-commit Hooks](./pre-commit.md) - Pre-commit checks and validation

## Development Workflow

1. **Setup**: Follow the [Getting Started](./getting-started.md) guide
2. **Code Style**: Adhere to [Code Style](./code-style.md) standards
3. **Testing**: Write tests following the [Testing Guide](./testing-guide.md)
4. **Feature Development**: Use the [Feature Development](./feature-development.md) workflow
5. **Pre-commit**: Ensure [Pre-commit Hooks](./pre-commit.md) pass before committing

## Quick Reference

### Common Commands

```bash
# Install dependencies
bun install

# Run development server
bun run dev

# Run tests
bun run test
bun run test:watch
bun run test:coverage

# Lint and format
bun run lint
bun run format

# Type checking
bun run type-check

# Build for production
bun run build
```

### Project Structure

```
frontend/src/
├── app/stores/              # MobX stores
├── features/[feature]/      # Feature-specific code
│   ├── components/          # Feature components
│   ├── hooks/               # Feature hooks
│   ├── services/            # Feature API services
│   └── types/               # Feature types
├── pages/                   # Route pages
└── shared/                  # Cross-feature code
    ├── components/ui/       # shadcn components
    ├── hooks/queries/       # Shared TanStack Query hooks
    ├── services/            # Shared API services
    └── types/               # Shared types
```

## Related Documentation

- [Architecture Guide](../architecture/README.md) - Architectural decisions and patterns
- [Performance Guide](../performance/README.md) - Performance optimisation strategies
- [Deployment Guide](../deployment/README.md) - Build and deployment configuration

## External Resources

- [React Documentation](https://react.dev/)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [Bun Documentation](https://bun.sh/docs)
- [ESLint Documentation](https://eslint.org/docs/latest/)
- [Prettier Documentation](https://prettier.io/docs/en/)
