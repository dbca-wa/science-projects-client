# Science Projects Management System

[![CodeQL](https://github.com/dbca-wa/science-projects/actions/workflows/github-code-scanning/codeql/badge.svg)](https://github.com/dbca-wa/science-projects/actions/workflows/github-code-scanning/codeql)
[![Tests](https://github.com/dbca-wa/science-projects/actions/workflows/test.yml/badge.svg)](https://github.com/dbca-wa/science-projects/actions/workflows/test.yml)
![Frontend Coverage](https://img.shields.io/badge/frontend--coverage-66%25-orange)
![Backend Coverage](https://img.shields.io/badge/backend--coverage-83%25-green)
![WCAG 2.2 AA](https://img.shields.io/badge/WCAG%202.2-AA%20Compliant-green)


A project management and approval system for scientific research projects.

## Key Features

- **Annual Report Generation** - PDF generation of annual reports with customisable templates (key deliverable)
- **Rich Text Editor** - Bespoke editor for project documentation with formatting and media support
- **Document Management** - Project wizard with related document generation and PDF export capabilities
- **Caretaker System** - Workflow for temporary project ownership delegation with approval processes
- **Email Notifications** - Automated notifications for project updates, tasks, and approvals workflow
- **Team Collaboration** - Manage internal teams, external collaborators, and stakeholder relationships
- **Role-Based Access Control** - Granular permissions for different user types and project roles
- **Audit Trails** - Complete history of all project changes and activities

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
feature/* → staging (Staging) → main (production) → v* tags
```

- **staging**: Auto-deploys to Staging on push
- **main**: Production-ready code (merge from staging)
- **v\* tags**: Triggers production deployment

### Workflow

```bash
# 1. Create feature branch from staging
git checkout staging
git pull origin staging
git checkout -b feature/my-feature

# 2. Make changes and commit
git add .
git commit -m "feat: add new feature"
git push origin feature/my-feature

# 3. Create PR to staging
# Tests run automatically on PR

# 4. After merge to staging
# Staging auto-deploys within 5 minutes

# 5. When ready for production
git checkout main
git merge staging --no-ff
git push origin main

# 6. Create version tag
git tag v1.0.0
git push origin v1.0.0
# Production images build automatically
```

### Deployment

**Staging** (automatic):

- Trigger: Push to `staging`
- URL: https://scienceprojects-test.dbca.wa.gov.au
- Images: `latest`, `test` tags

**Production** (manual):

- Trigger: Version tag (e.g., `v1.0.0`)
- URL: https://scienceprojects.dbca.wa.gov.au
- Images: `v1.0.0`, `stable` tags
- Deploy: Update Kubernetes via Rancher UI or kubectl

**Rollback**:

```bash
# Staging: Revert commit on staging and push
git revert <commit-hash>
git push origin staging

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

### Workflow Structure

The CI/CD pipeline uses a modular approach with reusable workflows:

**test.yml** (reusable workflow):
- Called by deploy-staging.yml and deploy-prod.yml
- Frontend tests (2-way sharding, ~2 min) - includes accessibility tests
- Backend tests (4-way sharding, ~10 min)
- Coverage combining and validation
- Path-based execution (only test changed code)

**deploy-staging.yml** (on push to staging):
- Detects changes (frontend/backend)
- Runs tests via test.yml (test gating)
- Builds and pushes `test` images (only if tests pass)
- Total time: ~12 minutes

**deploy-prod.yml** (on version tags):
- Always tests and builds both frontend and backend
- Runs tests via test.yml (test gating)
- Builds and pushes versioned + `stable` images
- Updates coverage badges in README
- Updates Kustomize configs automatically

**sync-staging.yml** (on push to main):
- Syncs staging branch with main
- Uses `[skip ci]` to prevent unnecessary builds

### Image Tagging Strategy

**Staging** (test environment):
- Frontend: `test` tag with `VITE_SENTRY_ENVIRONMENT=test`
- Backend: `test` tag
- Note: Frontend test and production images are different builds (Vite bakes environment variables)

**Production** (tagged releases):
- Frontend: `v1.0.0` + `stable` tags with `VITE_SENTRY_ENVIRONMENT=production`
- Backend: `v1.0.0` + `stable` tags
- `stable` tag always points to latest production release

### Skipping CI

Add `[skip ci]` to commit message to skip workflows:

```bash
git commit -m "docs: update README [skip ci]"
```

Use cases:
- Documentation-only changes
- README updates
- Non-code changes that don't require testing/building

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
