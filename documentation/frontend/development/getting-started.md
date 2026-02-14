# Getting Started

## Prerequisites

Before you begin, ensure you have the following installed:

### Required

- **Bun 1.1+** - Package manager and test runner
  - Install: https://bun.sh/docs/installation
  - Verify: `bun --version`

- **Node.js 20+** - JavaScript runtime (required by some dependencies)
  - Install: https://nodejs.org/
  - Verify: `node --version`

- **Git** - Version control
  - Install: https://git-scm.com/downloads
  - Verify: `git --version`

### Recommended

- **VS Code** - Code editor with excellent TypeScript support
- **VS Code Extensions**:
  - ESLint
  - Prettier
  - Tailwind CSS IntelliSense
  - TypeScript and JavaScript Language Features

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/dbca-wa/science-projects.git
cd science-projects/frontend
```

### 2. Install Dependencies

```bash
bun install
```

This will install all required dependencies including:
- React 19
- TypeScript
- Vite
- Tailwind CSS
- MobX
- TanStack Query
- shadcn/ui components

### 3. Configure Environment Variables

Create a `.env` file in the `frontend/` directory:

```bash
cp .env.example .env
```

Update the environment variables:

```env
# API Configuration
VITE_API_URL=http://localhost:8000

# Environment
VITE_ENV=development
```

### 4. Start Development Server

```bash
bun run dev
```

The application will be available at http://localhost:5173

## Development Workflow

### Running the Application

```bash
# Start development server
bun run dev

# Start with specific port
bun run dev --port 3000

# Start with host exposed (for network access)
bun run dev --host
```

### Running Tests

```bash
# Run all tests once
bun run test

# Run tests in watch mode
bun run test:watch

# Run tests with coverage
bun run test:coverage

# Run specific test file
bun run test src/shared/utils/date.utils.test.ts
```

### Type Checking

```bash
# Check types
bun run type-check

# Check types in watch mode
bun run type-check --watch
```

### Linting and Formatting

```bash
# Run ESLint
bun run lint

# Fix ESLint errors
bun run lint:fix

# Format code with Prettier
bun run format

# Check formatting
bun run format:check
```

### Building for Production

```bash
# Build for production
bun run build

# Preview production build
bun run preview
```

## Project Structure

```
frontend/
├── public/                  # Static assets
├── src/
│   ├── app/
│   │   └── stores/          # MobX stores
│   ├── features/            # Feature-specific code
│   │   ├── auth/            # Authentication
│   │   ├── users/           # User management
│   │   ├── projects/        # Project management
│   │   └── ...
│   ├── pages/               # Route pages
│   ├── shared/              # Shared code
│   │   ├── components/      # Shared components
│   │   ├── hooks/           # Shared hooks
│   │   ├── services/        # API services
│   │   ├── types/           # TypeScript types
│   │   └── utils/           # Utility functions
│   ├── test/                # Test setup
│   ├── App.tsx              # Root component
│   └── main.tsx             # Entry point
├── .env                     # Environment variables
├── .env.example             # Environment template
├── package.json             # Dependencies and scripts
├── tsconfig.json            # TypeScript configuration
├── vite.config.ts           # Vite configuration
└── vitest.config.ts         # Vitest configuration
```

## First Feature Walkthrough

Let's create a simple feature to understand the architecture.

### 1. Create Feature Directory

```bash
mkdir -p src/features/example/{components,hooks,services,types}
```

### 2. Define Types

```typescript
// src/features/example/types/example.types.ts
export interface IExample {
  id: number;
  name: string;
  description: string;
}
```

### 3. Create API Service

```typescript
// src/features/example/services/example.service.ts
import { api } from '@/shared/services/api';
import type { IExample } from '../types/example.types';

export async function getExamples(): Promise<IExample[]> {
  const response = await api.get<IExample[]>('/api/v1/examples');
  return response.data;
}
```

### 4. Create Query Hook

```typescript
// src/features/example/hooks/useExamples.ts
import { useQuery } from '@tanstack/react-query';
import { getExamples } from '../services/example.service';

export function useExamples() {
  return useQuery({
    queryKey: ["examples"],
    queryFn: getExamples,
    staleTime: 5 * 60_000, // 5 minutes
  });
}
```

### 5. Create Component

```typescript
// src/features/example/components/ExampleList.tsx
import { useExamples } from '../hooks/useExamples';

export function ExampleList() {
  const { data: examples, isLoading, error } = useExamples();

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <h2>Examples</h2>
      <ul>
        {examples?.map(example => (
          <li key={example.id}>
            <h3>{example.name}</h3>
            <p>{example.description}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
```

### 6. Create Page

```typescript
// src/pages/example/ExamplePage.tsx
import { ExampleList } from '@/features/example/components/ExampleList';

export function ExamplePage() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Examples</h1>
      <ExampleList />
    </div>
  );
}
```

### 7. Add Route

```typescript
// src/App.tsx
import { ExamplePage } from '@/pages/example/ExamplePage';

// Add to routes
{
  path: '/examples',
  element: <ExamplePage />,
}
```

## Common Tasks

### Adding a shadcn/ui Component

```bash
bunx shadcn@latest add button
bunx shadcn@latest add dialog
bunx shadcn@latest add dropdown-menu
```

### Creating a New Feature

1. Create feature directory: `src/features/[feature-name]/`
2. Add subdirectories: `components/`, `hooks/`, `services/`, `types/`
3. Define types in `types/[feature].types.ts`
4. Create API service in `services/[feature].service.ts`
5. Create query hooks in `hooks/use[Feature].ts`
6. Create components in `components/`
7. Create page in `pages/[feature]/`
8. Add route in `App.tsx`

### Adding a Shared Component

1. Create component in `src/shared/components/`
2. Export from `src/shared/components/index.ts`
3. Use in multiple features

### Writing Tests

```typescript
// src/shared/utils/example.test.ts
import { describe, it, expect } from 'vitest';
import { exampleFunction } from './example';

describe('exampleFunction', () => {
  it('should return expected result', () => {
    expect(exampleFunction('input')).toBe('expected');
  });
});
```

## Troubleshooting

### Port Already in Use

```bash
# Kill process on port 5173
lsof -ti:5173 | xargs kill -9

# Or use different port
bun run dev --port 3000
```

### Module Not Found

```bash
# Clear bun cache
rm -rf node_modules
bun install
```

### Type Errors

```bash
# Restart TypeScript server in VS Code
# Command Palette (Cmd+Shift+P) → "TypeScript: Restart TS Server"

# Or check types manually
bun run type-check
```

### Test Failures

```bash
# Clear test cache
rm -rf node_modules/.vitest

# Run tests with verbose output
bun run test --reporter=verbose
```

## Next Steps

- Read [Code Style Guide](./code-style.md) for coding standards
- Read [Testing Guide](./testing-guide.md) for testing philosophy
- Read [Feature Development Guide](./feature-development.md) for development workflow
- Explore [Architecture Documentation](../architecture/README.md) for architectural patterns

## Related Documentation

- [Code Style](./code-style.md) - TypeScript standards and ESLint configuration
- [Testing Guide](./testing-guide.md) - Testing philosophy and implementation
- [Feature Development](./feature-development.md) - Feature development workflow
- [Architecture Overview](../architecture/overview.md) - System architecture

## External Resources

- [Bun Documentation](https://bun.sh/docs)
- [Vite Documentation](https://vitejs.dev/)
- [React Documentation](https://react.dev/)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
