# Science Projects Frontend

[![Tests](https://github.com/dbca-wa/science-projects/actions/workflows/ci.yml/badge.svg)](https://github.com/dbca-wa/science-projects/actions/workflows/ci.yml)
[![Frontend Coverage](https://raw.githubusercontent.com/dbca-wa/science-projects/badges/frontend-coverage.svg)](https://github.com/dbca-wa/science-projects/actions)

> **Note**: This is the frontend component of the Science Projects monorepo. See the [root README](../README.md) for the complete system overview.

Modern React frontend for the Science Projects Management System, built with TypeScript, Vite, TanStack Query, and MobX.

## Tech Stack

- **React 19** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **TanStack Query** - Server state management
- **MobX** - Client state management
- **React Router** - Routing
- **Tailwind CSS v4** - Styling
- **shadcn/ui** - Component library
- **Vitest** - Testing framework
- **Bun** - Package manager

## Getting Started

### Prerequisites

- [Bun](https://bun.sh/) v1.0+
- Node.js v18+ (for compatibility)

### Installation

```bash
# From the frontend directory
cd frontend

# Install dependencies
bun install

# Copy environment variables
cp .env.example .env

# Start development server
bun run dev
```

The app will be available at `http://127.0.0.1:3000`

### Using Docker Compose

From the repository root:

```bash
docker-compose -f docker-compose.dev.yml up frontend
```

## Development

### Available Scripts

```bash
# Development
bun run dev              # Start dev server

# Building
bun run build            # Build for production
bun run preview          # Preview production build

# Testing
bun test                 # Run tests once
bun test:watch           # Run tests in watch mode
bun test:ui              # Run tests with UI
bun test:coverage        # Run tests with coverage
bun test:coverage:open   # Run tests with coverage and open report

# Linting
bun run lint             # Run ESLint
```

### Project Structure

```
frontend/
├── src/
│   ├── app/              # App-level config (stores, router)
│   ├── features/         # Feature modules
│   │   ├── auth/
│   │   ├── users/
│   │   └── dashboard/
│   ├── pages/            # Route pages
│   ├── shared/           # Shared code
│   │   ├── components/   # Reusable components
│   │   ├── hooks/        # Reusable hooks
│   │   ├── services/     # API services
│   │   ├── types/        # Shared types
│   │   └── utils/        # Utility functions
│   └── test/             # Test setup and factories
├── coverage/             # Test coverage reports (gitignored)
└── dist/                 # Production build (gitignored)
```

## Testing

This project uses Vitest for testing with a focus on:

- **Unit tests** for utilities and pure functions
- **Integration tests** for components and hooks
- **Property-based tests** for complex logic

### Running Tests

```bash
# Run all tests
bun test

# Run tests in watch mode (TDD)
bun test:watch

# Run tests with coverage
bun test:coverage

# Open coverage report in browser
bun test:coverage:open
```

### Coverage Thresholds

Current thresholds:

- Lines: 50%
- Functions: 50%
- Branches: 50%
- Statements: 50%

### Writing Tests

Tests are co-located with source files:

```
src/shared/utils/
├── user.utils.ts
└── user.utils.test.ts
```

Example test:

```typescript
import { describe, it, expect } from "vitest";
import { getUserDisplayName } from "./user.utils";

describe("getUserDisplayName", () => {
	it("should return full name when display names are valid", () => {
		const user = { display_first_name: "John", display_last_name: "Doe" };
		expect(getUserDisplayName(user)).toBe("John Doe");
	});
});
```

## Architecture

### State Management

- **TanStack Query**: Server state (API calls, caching)
- **MobX**: Client state (UI, auth status, preferences)

### Routing

React Router with data mode for type-safe routing and data loading.

### Styling

Tailwind CSS v4 with shadcn/ui components. No CSS-in-JS or styled-components.

### API Client

Axios-based client with:

- Automatic CSRF token handling
- Request/response interceptors
- Error handling
- Type-safe endpoints

## Environment Variables

```bash
# API Configuration
VITE_API_BASE_URL=http://localhost:8000/api/v1/

# Feature Flags (optional)
VITE_ENABLE_DEVTOOLS=true
```

## Building for Production

```bash
# Build
bun run build

# Preview build locally
bun run preview
```

The build output will be in the `dist/` directory.

## CI/CD

GitHub Actions automatically:

- Runs tests on pull requests
- Generates coverage reports
- Enforces 50% coverage threshold
- Builds Docker images on tagged releases

See the [root CI/CD workflow](../.github/workflows/ci.yml) for details.

## Backend Integration

The frontend communicates with the Django REST API backend. See the [backend README](../backend/README.md) for API documentation.

## Related Documentation

- [Root README](../README.md) - Complete system overview
- [Backend README](../backend/README.md) - API documentation
- [Docker Compose](../docker-compose.dev.yml) - Local development setup
