# Science Projects Management System

[![Tests](https://github.com/dbca-wa/science-projects/actions/workflows/test.yml/badge.svg)](https://github.com/dbca-wa/science-projects/actions/workflows/test.yml)
![Frontend Coverage](https://img.shields.io/badge/frontend--coverage-50%25-orange)
![Backend Coverage](https://img.shields.io/badge/backend--coverage-83%25-green)
[![CodeQL](https://github.com/dbca-wa/science-projects/actions/workflows/github-code-scanning/codeql/badge.svg)](https://github.com/dbca-wa/science-projects/actions/workflows/github-code-scanning/codeql)
[![Issues](https://img.shields.io/static/v1?label=docs&message=Issues&color=brightgreen)](https://github.com/dbca-wa/science-projects/issues)

A comprehensive project management system for scientific research projects, developed by the Department of Biodiversity, Conservation and Attractions (DBCA), Western Australia.

<!-- Test change for CI/CD workflow verification -->

## Test Coverage

- **Frontend**: Minimum 50% coverage (Vitest with 2-way sharding)
- **Backend**: Minimum 80% coverage (pytest with 4-way sharding)

### Running Tests Locally

**Frontend**:
```bash
cd frontend
bun install
bun run test              # Run tests once
bun run test:watch        # Watch mode
bun run test:coverage     # With coverage report
```

**Backend**:
```bash
cd backend
poetry install
poetry run pytest                    # Run all tests
poetry run pytest --cov=. --cov-report=html  # With coverage
```

## Repository Structure

This is a monorepo containing both frontend and backend applications:

```
science-projects/
├── frontend/          # React/TypeScript frontend
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── README.md
├── backend/           # Django/Python backend
│   ├── config/
│   ├── [apps]/
│   ├── pyproject.toml
│   └── README.md
├── docker-compose.dev.yml
└── README.md
```

## Technical Architecture

### Frontend
- **React 19** with TypeScript
- **Vite** for build tooling
- **TanStack Query** for server state management
- **MobX** for client state management
- **Tailwind CSS v4** + shadcn/ui for styling
- **Bun 1.3.9** as package manager

### Backend
- **Django** REST framework
- **Python 3.14.3**
- **PostgreSQL 17** database
- **Poetry** for dependency management
- **pytest** for testing with 4-way sharding

## Getting Started

### Prerequisites

**Local Machine**:
- **Bun**: v1.3.9+ ([install](https://bun.sh/))
- **Python**: 3.14.3+ ([download](https://www.python.org/downloads/))
- **Poetry**: Latest ([install](https://python-poetry.org/docs/#installation))
- **Docker Desktop**: For containerised development (optional, [download](https://www.docker.com/products/docker-desktop/))

**Windows Setup**:

1. **Install Python 3.14.3**:
   - Download from [python.org](https://www.python.org/downloads/)
   - During installation, check "Add Python to PATH"
   - Verify: Open PowerShell and run `python --version`

2. **Install Bun**:
   ```powershell
   # PowerShell (Run as Administrator)
   powershell -c "irm bun.sh/install.ps1 | iex"
   ```
   - Verify: `bun --version`

3. **Install Poetry**:
   ```powershell
   # PowerShell
   (Invoke-WebRequest -Uri https://install.python-poetry.org -UseBasicParsing).Content | python -
   ```
   - Add Poetry to PATH: `%APPDATA%\Python\Scripts`
   - Verify: `poetry --version`

4. **Install Docker Desktop** (optional):
   - Download from [docker.com](https://www.docker.com/products/docker-desktop/)
   - Enable WSL 2 backend for better performance

**macOS/Linux Setup**:

```bash
# Install Bun
curl -fsSL https://bun.sh/install | bash

# Install Python 3.14 (macOS with Homebrew)
brew install python@3.14

# Add Python aliases to ~/.bashrc or ~/.zshrc
echo 'alias python="python3"' >> ~/.bashrc
echo 'alias py="python3"' >> ~/.bashrc
echo 'alias pip="pip3"' >> ~/.bashrc
echo 'export PATH="/opt/homebrew/opt/python@3.14/libexec/bin:$PATH"' >> ~/.bashrc
source ~/.bashrc

# Install Poetry
curl -sSL https://install.python-poetry.org | python3 -
```

**Verify Installation**:
```bash
bun --version      # Should show 1.3.9+
python --version   # Should show 3.14.3+
poetry --version   # Should show latest
```

### Local Development (Docker Compose - Recommended)

The easiest way to run the full stack locally with hot-reloading:

**Windows (PowerShell)**:
```powershell
# Start all services (frontend, backend, database)
docker-compose -f docker-compose.dev.yml up

# Or run in background
docker-compose -f docker-compose.dev.yml up -d

# View logs
docker-compose -f docker-compose.dev.yml logs -f

# Stop services
docker-compose -f docker-compose.dev.yml down
```

**macOS/Linux (Bash/Zsh)**:
```bash
# Same commands work on macOS/Linux
docker-compose -f docker-compose.dev.yml up
```

**Services**:
- Frontend: http://127.0.0.1:3000 (Vite dev server with hot-reload)
- Backend: http://127.0.0.1:8000 (Django dev server)
- Database: PostgreSQL on port 54320

**Run Migrations** (first time):

Windows (PowerShell):
```powershell
docker-compose -f docker-compose.dev.yml exec backend python manage.py migrate
```

macOS/Linux:
```bash
docker-compose -f docker-compose.dev.yml exec backend python manage.py migrate
```

**Create Superuser** (optional):
```bash
docker-compose -f docker-compose.dev.yml exec backend python manage.py createsuperuser
```

### Local Development (Manual)

**Frontend**:

Windows (PowerShell):
```powershell
cd frontend
bun install
copy .env.example .env
bun run dev
# Available at http://127.0.0.1:3000
```

macOS/Linux:
```bash
cd frontend
bun install
cp .env.example .env
bun run dev
# Available at http://127.0.0.1:3000
```

**Backend**:

Windows (PowerShell):
```powershell
cd backend

# Setup Python environment
poetry env use python
poetry install

# Configure environment
copy .env.example .env
# Edit .env with your database credentials

# Run migrations
poetry run python manage.py migrate

# Create superuser (optional)
poetry run python manage.py createsuperuser

# Start dev server
poetry run python manage.py runserver
# Available at http://127.0.0.1:8000
```

macOS/Linux:
```bash
cd backend

# Setup Python environment
poetry env use python3.14  # or: poetry env use /opt/homebrew/bin/python3.14
poetry install

# Configure environment
cp .env.example .env
# Edit .env with your database credentials

# Run migrations
poetry run python manage.py migrate

# Create superuser (optional)
poetry run python manage.py createsuperuser

# Start dev server
poetry run python manage.py runserver
# Available at http://127.0.0.1:8000
```

**Database** (if not using Docker):

Windows:
- Download and install [PostgreSQL 17](https://www.postgresql.org/download/windows/)
- Use pgAdmin or command line to create database:
  ```sql
  CREATE DATABASE science_projects;
  ```

macOS:
```bash
# Install PostgreSQL 17
brew install postgresql@17

# Start PostgreSQL
brew services start postgresql@17

# Create database
createdb science_projects
```

## Documentation

- **[Frontend Documentation](frontend/README.md)** - React app setup, architecture, and development
- **[Backend Documentation](backend/README.md)** - Django API, models, and deployment

## CI/CD

GitHub Actions automatically:

- **On Pull Requests** (test.yml):
  - Runs frontend tests with coverage (2-way sharding)
  - Runs backend tests with coverage (4-way sharding)
  - Enforces coverage thresholds (50% frontend, 80% backend)
  - Updates coverage badges on merge to main

- **On Push to Develop** (deploy-uat.yml):
  - Builds frontend Docker image with UAT config
  - Builds backend Docker image
  - Pushes images tagged as `latest` and `test`
  - UAT environment auto-deploys from `latest` tag

- **On Tagged Releases** (deploy-prod.yml):
  - Builds frontend Docker image with production config
  - Builds backend Docker image
  - Pushes images tagged with version and `stable`
  - Automatically updates Kustomize configurations with new version
  - Production deployment requires manual kubectl apply

## Deployment

### Deployment Environments

**UAT (User Acceptance Testing)**:
- **Trigger**: Push to `develop` branch
- **Images**: `latest` and `test` tags
- **Deployment**: Manual via Rancher UI (click "Redeploy" to pull latest image)
- **Kustomize**: `kustomize/overlays/test/`
- **Purpose**: Testing before production

**Production**:
- **Trigger**: Tagged release (e.g., `v1.2.3`)
- **Images**: Version tag (e.g., `v1.2.3`) and `stable`
- **Deployment**: Manual via Rancher UI or by infrastructure team
- **Kustomize**: `kustomize/overlays/prod/`
- **Purpose**: Live user-facing application

### Deploying to UAT

1. Merge your PR to `develop` branch
2. Push to GitHub: `git push origin develop`
3. GitHub Actions builds and pushes images with `latest` and `test` tags
4. Go to Rancher UI → UAT namespace → Select deployment → Click "Redeploy"
5. Rancher pulls the latest image and restarts the pods

### Deploying to Production

1. Ensure `develop` is tested and stable in UAT
2. Merge `develop` to `main`
3. Create and push a version tag:
   ```bash
   git tag v1.2.3
   git push origin v1.2.3
   ```
4. GitHub Actions builds and pushes versioned images
5. Kustomize configurations are automatically updated with the new version
6. Infrastructure team deploys to production using updated Kustomize configs
   - Or manually via Rancher UI: Select deployment → Update image tag to `v1.2.3` → Redeploy

### Rollback Procedures

**UAT Rollback**:
1. Revert the problematic commit on `develop`
2. Push to GitHub
3. New `latest` image builds automatically
4. Go to Rancher UI → UAT namespace → Click "Redeploy" to pull reverted version

**Production Rollback**:
1. Identify the previous working version (e.g., `v1.2.2`)
2. Via Rancher UI: Update image tag to `v1.2.2` and redeploy
3. Or infrastructure team can use Kustomize to deploy previous version

### Docker Images

Images are automatically built and pushed to GitHub Container Registry:

**Frontend**:
- `ghcr.io/dbca-wa/science-projects-frontend:latest` (UAT)
- `ghcr.io/dbca-wa/science-projects-frontend:test` (UAT)
- `ghcr.io/dbca-wa/science-projects-frontend:v1.2.3` (Production)
- `ghcr.io/dbca-wa/science-projects-frontend:stable` (Production)

**Backend**:
- `ghcr.io/dbca-wa/science-projects-backend:latest` (UAT)
- `ghcr.io/dbca-wa/science-projects-backend:v1.2.3` (Production)
- `ghcr.io/dbca-wa/science-projects-backend:stable` (Production)

### Environment Variables

**Frontend** (baked at build time):
- `VITE_PRODUCTION_BACKEND_API_URL` - Backend Django API URL (for example, something like `https://spms-api.dbca.wa.gov.au/api/v1/`)

**Backend** (runtime configuration):
- `DATABASE_URL` - PostgreSQL connection string
- `SECRET_KEY` - Django secret key
- `DEBUG` - Debug mode (False in production)
- See `backend/.env.example` for full list

## Contributing

1. Create a feature branch from `develop`
2. Make your changes
3. Ensure tests pass and coverage meets thresholds
4. Create a pull request to `develop`

## License

Copyright © 2024-2026 Department of Biodiversity, Conservation and Attractions, Western Australia
