# Science Projects Management System

[![Tests](https://github.com/dbca-wa/science-projects/actions/workflows/test.yml/badge.svg)](https://github.com/dbca-wa/science-projects/actions/workflows/test.yml)
![Frontend Coverage](https://img.shields.io/badge/frontend--coverage-66%25-orange)
![Backend Coverage](https://img.shields.io/badge/backend--coverage-83%25-green)
[![CodeQL](https://github.com/dbca-wa/science-projects/actions/workflows/github-code-scanning/codeql/badge.svg)](https://github.com/dbca-wa/science-projects/actions/workflows/github-code-scanning/codeql)
[![Issues](https://img.shields.io/static/v1?label=docs&message=Issues&color=brightgreen)](https://github.com/dbca-wa/science-projects/issues)

A comprehensive project management system for scientific research projects, developed by the Department of Biodiversity, Conservation and Attractions (DBCA), Western Australia.

## Quick Start

```bash
# Clone and start with Docker (recommended)
git clone https://github.com/dbca-wa/science-projects.git
cd science-projects
docker-compose -f docker-compose.dev.yml up

# Frontend: http://127.0.0.1:3000
# Backend: http://127.0.0.1:8000
```

## Repository Structure

```
science-projects/
├── frontend/              # React 19 + TypeScript + Tailwind + shadcn/ui
├── backend/               # Django + DRF + PostgreSQL
├── documentation/         # Comprehensive docs
├── kustomize/            # Kubernetes configs
└── docker-compose.dev.yml
```

## Tech Stack

**Frontend**: React 19, TypeScript, Vite, TanStack Query, MobX, Tailwind CSS v4, Bun  
**Backend**: Django, DRF, Python 3.14, PostgreSQL 17, Poetry, pytest  
**DevOps**: GitHub Actions, Docker, Kubernetes, Kustomize

## Development

### Prerequisites

- **Bun** 1.3.9+ - [install](https://bun.sh/)
- **Python** 3.14.3+ - [download](https://www.python.org/downloads/)
- **Poetry** - [install](https://python-poetry.org/docs/#installation)
- **Docker Desktop** (optional) - [download](https://www.docker.com/products/docker-desktop/)

### Docker Compose (Recommended)

```bash
# Start all services
docker-compose -f docker-compose.dev.yml up

# Run migrations (first time)
docker-compose -f docker-compose.dev.yml exec backend python manage.py migrate

# Create superuser (optional)
docker-compose -f docker-compose.dev.yml exec backend python manage.py createsuperuser
```

### Manual Setup

**Frontend**:

```bash
cd frontend
bun install
cp .env.example .env
bun run dev  # http://127.0.0.1:3000
```

**Backend**:

```bash
cd backend
poetry install
cp .env.example .env
poetry run python manage.py migrate
poetry run python manage.py runserver  # http://127.0.0.1:8000
```

### Testing

```bash
# Frontend
cd frontend
bun run test              # Run once
bun run test:watch        # Watch mode
bun run test:coverage     # With coverage

# Backend
cd backend
poetry run pytest                    # All tests
poetry run pytest --cov              # With coverage
```

## Branching & Deployment

### Branch Strategy

```
feature/* → develop (Staging) → main (production) → v* tags
```

- **develop**: Auto-deploys to staging on push
- **main**: Production-ready code (merge from develop)
- **v\* tags**: Triggers production deployment

### Workflow

```bash
# 1. Create feature branch from develop
git checkout develop
git pull origin develop
git checkout -b feature/my-feature

# 2. Make changes and commit
git add .
git commit -m "feat: add new feature"
git push origin feature/my-feature

# 3. Create PR to develop
# Tests run automatically on PR

# 4. After merge to develop
# Staging auto-deploys within 5 minutes

# 5. When ready for production
git checkout main
git merge develop --no-ff
git push origin main

# 6. Create version tag
git tag v1.0.0
git push origin v1.0.0
# Production images build automatically
```

### Deployment

**Staging** (automatic):

- Trigger: Push to `develop`
- URL: https://scienceprojects-test.dbca.wa.gov.au
- Images: `latest`, `test` tags

**Production** (manual):

- Trigger: Version tag (e.g., `v1.0.0`)
- URL: https://scienceprojects.dbca.wa.gov.au
- Images: `v1.0.0`, `stable` tags
- Deploy: Update Kubernetes via Rancher UI or kubectl

**Rollback**:

```bash
# Staging: Revert commit on develop and push
git revert <commit-hash>
git push origin develop

# Production: Update image tag to previous version
kubectl set image deployment/spms-deployment-prod \
  frontend=ghcr.io/dbca-wa/science-projects-frontend:v1.0.0 \
  backend=ghcr.io/dbca-wa/science-projects-backend:v1.0.0 \
  -n spms-prod
```

## Pre-commit Hooks

Hooks run automatically on commit and check only changed files.

**Install**:

```bash
pre-commit install
```

**What's checked**:

- **General**: Trailing whitespace, large files, merge conflicts
- **Frontend**: Prettier (auto-fix), ESLint, TypeScript, security
- **Backend**: Black (auto-fix), isort (auto-fix), flake8, bandit

**Bypass** (emergency only):

```bash
git commit --no-verify -m "emergency fix"
```

## CI/CD Workflows

**test.yml** (on PRs):

- Frontend tests (2-way sharding)
- Backend tests (4-way sharding)
- Coverage badges (auto-update on main)
- Path-based execution (only test changed code)

**deploy-uat.yml** (on push to develop):

- Build and push `latest`/`test` images
- Auto-deploy to staging

**deploy-prod.yml** (on version tags):

- Build and push versioned/`stable` images
- Auto-update Kustomize configs

## Documentation

- **[Complete Documentation](documentation/)** - Comprehensive docs for all aspects
    - [Frontend](documentation/frontend/) - Architecture, development, testing
    - [Backend](documentation/backend/) - API, deployment, operations
- **[Frontend README](frontend/README.md)** - Quick start
- **[Backend README](backend/README.md)** - Quick start

## Common Tasks

**Run migrations**:

```bash
# Docker
docker-compose -f docker-compose.dev.yml exec backend python manage.py migrate

# Manual
cd backend && poetry run python manage.py migrate
```

**Create superuser**:

```bash
# Docker
docker-compose -f docker-compose.dev.yml exec backend python manage.py createsuperuser

# Manual
cd backend && poetry run python manage.py createsuperuser
```

**View logs**:

```bash
# Docker
docker-compose -f docker-compose.dev.yml logs -f

# Kubernetes (Staging)
kubectl logs -f deployment/spms-deployment-test -n spms-test

# Kubernetes (Production)
kubectl logs -f deployment/spms-deployment-prod -n spms-prod
```

**Update dependencies**:

```bash
# Frontend
cd frontend && bun update

# Backend
cd backend && poetry update
```

## Troubleshooting

**Tests failing on CI but passing locally**:

- Check Node/Bun/Python versions match CI
- Use UTC for dates in tests
- Ensure import paths match file names exactly

**Staging not updating after deploy**:

- Check Rancher UI → Staging namespace → Click "Redeploy"
- Verify `imagePullPolicy: Always` in deployment

**Docker build failing**:

- Clean Docker cache: `docker system prune -a`
- Check Dockerfile syntax
- Verify all build args are provided

**Pre-commit hooks failing**:

- Run manually: `pre-commit run --all-files`
- Fix TypeScript errors: `cd frontend && bun run type-check`
- Fix Python formatting: `cd backend && black .`

## License

Copyright © 2023-2026 Department of Biodiversity, Conservation and Attractions, Western Australia
