# Science Projects Management System

A comprehensive project management system for scientific research projects, developed by the Department of Biodiversity, Conservation and Attractions (DBCA), Western Australia.

## Test Coverage

[![Frontend Coverage](https://raw.githubusercontent.com/dbca-wa/science-projects/badges/frontend-coverage.svg)](https://github.com/dbca-wa/science-projects/actions)
[![Backend Coverage](https://raw.githubusercontent.com/dbca-wa/science-projects/badges/backend-coverage.svg)](https://github.com/dbca-wa/science-projects/actions)

- **Frontend**: Minimum 50% coverage (Vitest) WIP
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

- **On Pull Requests**:
  - Runs frontend tests with coverage
  - Runs backend tests with coverage (4-way sharding)
  - Enforces coverage thresholds
  - Comments coverage reports on PRs

- **On Tagged Releases**:
  - Builds frontend Docker images (test and production)
  - Builds backend Docker image
  - Pushes images to GitHub Container Registry
  - Updates coverage badges

## Deployment

### Docker Images

Images are automatically built and pushed to GitHub Container Registry on tagged releases:

- `ghcr.io/dbca-wa/science-projects-frontend:latest` (production)
- `ghcr.io/dbca-wa/science-projects-frontend:test` (test environment)
- `ghcr.io/dbca-wa/science-projects-backend:latest`

### Environment Variables

**Frontend** (baked at build time):
- `VITE_API_BASE_URL` - Backend API URL

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
