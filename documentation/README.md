# Science Projects Management System - Documentation

## Overview

Welcome to the SPMS monorepo documentation. This documentation covers the entire system including frontend and backend architecture, development guides, and operational procedures.

## Quick Reference

For quick access to common workflows, see the [root README](../README.md):

- **[Deployment](../README.md#branching--deployment)** - How to deploy to UAT and production
- **[Branching Strategy](../README.md#branch-strategy)** - Git workflow and CI/CD processes
- **[Pre-commit Hooks](../README.md#pre-commit-hooks)** - Code quality checks and setup
- **[Common Tasks](../README.md#common-tasks)** - Migrations, superuser, logs, dependencies
- **[Troubleshooting](../README.md#troubleshooting)** - Common issues and solutions

## Comprehensive Documentation

### Frontend Documentation

**Location**: `frontend/`

React application with Tailwind CSS, shadcn/ui, MobX, and TanStack Query.

- Architecture and design patterns
- Development workflow and standards
- Testing strategy and best practices
- Component organisation

**[Browse Frontend Docs →](frontend/)**

### Backend Documentation

**Location**: `backend/`

Django REST API with PostgreSQL, Redis, and comprehensive testing.

- [Getting Started](backend/development/getting-started.md) - Setup in under 30 minutes
- [Architecture](backend/architecture/) - ADRs and design patterns
- [Development](backend/development/) - Development workflow and standards
- [Deployment](backend/deployment/) - Kubernetes and CI/CD
- [Security](backend/security/) - Security tools and processes
- [Operations](backend/operations/) - Monitoring and troubleshooting

**[Browse Backend Docs →](backend/)**

## Monorepo Structure

```
science-projects/
├── frontend/              # React application
│   ├── src/              # Source code
│   ├── public/           # Static assets
│   └── tests/            # Test files
├── backend/              # Django REST API
│   ├── config/           # Django settings
│   ├── apps/             # Django apps
│   └── tests/            # Test files
├── documentation/        # Comprehensive documentation
│   ├── frontend/         # Frontend architecture and guides
│   └── backend/          # Backend architecture and guides
├── kustomize/            # Kubernetes configurations
└── .github/workflows/    # CI/CD workflows
```

## Common Workflows

### Local Development

**Frontend**:
```bash
cd frontend
bun install
bun run dev
```

**Backend**:
```bash
cd backend
poetry install
poetry run python manage.py migrate
poetry run python manage.py runserver
```

**Full Stack**:
```bash
docker-compose -f docker-compose.dev.yml up
```

### Running Tests

**Frontend**:
```bash
cd frontend
bun run test              # Run once
bun run test:watch        # Watch mode
bun run test:coverage     # With coverage
```

**Backend**:
```bash
cd backend
poetry run pytest                    # All tests
poetry run pytest --cov              # With coverage
poetry run pytest apps/users/tests/  # Specific app
```

### Deployment

See the [root README deployment section](../README.md#branching--deployment) for complete deployment procedures.

### Pre-commit Hooks

See the [root README pre-commit section](../README.md#pre-commit-hooks) for setup and usage.

## Key Architectural Decisions

### Frontend

- **React** with TypeScript for type safety
- **Tailwind CSS** + **shadcn/ui** for styling
- **MobX** for client state (UI, auth, preferences)
- **TanStack Query** for server state (API calls, caching)
- **React Router** (Data Mode) for routing
- **Bun** as package manager and test runner

### Backend

- **Django** + **Django REST Framework** for API
- **PostgreSQL** for database
- **Redis** for caching
- **Poetry** for dependency management
- **pytest** for testing
- **Azure Kubernetes Service** for deployment

### CI/CD

See the [root README CI/CD section](../README.md#cicd-workflows) for complete CI/CD workflow documentation.

## Documentation Standards

### When to Update Documentation

- **Adding a feature** → Update architecture and development docs
- **Changing deployment** → Update deployment docs
- **Fixing a common issue** → Add to troubleshooting
- **Making architectural decisions** → Create an ADR
- **Changing CI/CD** → Update workflow docs

### Writing Style

- Use **Australian English** spelling (organise, colour, behaviour)
- Write **practical, example-driven** content
- Explain both **"how" and "why"**
- Include **troubleshooting** sections
- Use **consistent formatting**
- **Link between** related documents
- Keep it **maintainable** (avoid duplication)

### Documentation Format

- Use **Markdown** for all documentation
- Use **code blocks** with language tags
- Use **relative links** for internal references
- Use **absolute URLs** for external references
- Include **examples** and **commands**

## External Resources

### Frontend

- **React**: https://react.dev/
- **Tailwind CSS**: https://tailwindcss.com/
- **shadcn/ui**: https://ui.shadcn.com/
- **MobX**: https://mobx.js.org/
- **TanStack Query**: https://tanstack.com/query/latest
- **Bun**: https://bun.sh/

### Backend

- **Django**: https://docs.djangoproject.com/en/stable/
- **Django REST Framework**: https://www.django-rest-framework.org/
- **Poetry**: https://python-poetry.org/docs/
- **pytest**: https://docs.pytest.org/

### DevOps

- **GitHub Actions**: https://docs.github.com/en/actions
- **Kubernetes**: https://kubernetes.io/docs/
- **Kustomize**: https://kustomize.io/
- **DBCA Developer Guidance**: https://github.com/dbca-wa/developer-guidance

## Getting Help

1. **Check quick reference docs** in `docs/` folder
2. **Check comprehensive docs** for your area (frontend/backend)
3. **Search this documentation** for keywords
4. **Ask the team** in Microsoft Teams
5. **Create an issue** if documentation is missing or unclear

## Related Documentation

- **[Root README](../README.md)** - Quick start, deployment, branching, troubleshooting
- **[Frontend README](../frontend/README.md)** - Frontend quick start
- **[Backend README](../backend/README.md)** - Backend quick start
