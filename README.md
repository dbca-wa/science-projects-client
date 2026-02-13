# Science Projects Management System

A comprehensive project management system for scientific research projects, developed by the Department of Biodiversity, Conservation and Attractions (DBCA), Western Australia.

## Test Coverage

[![Frontend Coverage](https://raw.githubusercontent.com/dbca-wa/science-projects/badges/frontend-coverage.svg)](https://github.com/dbca-wa/science-projects/actions)
[![Backend Coverage](https://raw.githubusercontent.com/dbca-wa/science-projects/badges/backend-coverage.svg)](https://github.com/dbca-wa/science-projects/actions)

- **Frontend**: Minimum 50% coverage (Vitest)
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
- **Bun** as package manager

### Backend
- **Django** REST framework
- **Python 3.13**
- **PostgreSQL** database
- **Poetry** for dependency management
- **pytest** for testing with 4-way sharding

## Getting Started

### Prerequisites

- **Frontend**: [Bun](https://bun.sh/) v1.0+
- **Backend**: Python 3.13+, [Poetry](https://python-poetry.org/)
- **Database**: PostgreSQL 17

### Local Development (Docker Compose)

The easiest way to run the full stack locally:

```bash
# Start all services (frontend, backend, database)
docker-compose -f docker-compose.dev.yml up

# Frontend will be available at: http://localhost:3000
# Backend will be available at: http://localhost:8000
# Database will be available at: localhost:54320
```

### Local Development (Manual)

**Frontend**:
```bash
cd frontend
bun install
cp .env.example .env
bun run dev
```

**Backend**:
```bash
cd backend
poetry install
cp .env.example .env
poetry run python manage.py migrate
poetry run python manage.py createsuperuser
poetry run python manage.py runserver
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
