# ADR-006: Vitest Testing Framework

## Context

The SPMS frontend application required a testing framework that could:

- Run tests quickly for fast feedback during development
- Support TypeScript without additional configuration
- Integrate seamlessly with Vite build tool
- Provide good developer experience with watch mode
- Support React component testing
- Generate code coverage reports
- Handle ES modules natively
- Support mocking and stubbing
- Provide clear error messages and debugging

The original application used Jest with React Testing Library, which had several limitations:
- Slow test execution (especially with TypeScript)
- Complex configuration for ES modules
- Separate configuration from Vite
- Slow watch mode
- Requires additional setup for TypeScript

During the refactor to Vite, we needed a testing framework that could leverage Vite's fast build system and provide excellent developer experience.

## Decision

We will use **Vitest** as the testing framework for the SPMS frontend application.

**Key components:**
- Vitest for test runner and assertions
- React Testing Library for component testing
- jsdom for DOM environment
- Vite configuration reuse
- Fast watch mode with HMR
- Coverage reporting with v8

**Testing philosophy:**
- 90% unit tests (utils, hooks, services, stores)
- 10% page tests (user flows + accessibility)
- No component tests (components tested via pages)

## Consequences

### Positive Consequences

- **Fast Execution**: Tests run significantly faster than Jest
- **Vite Integration**: Reuses Vite configuration, no duplicate setup
- **Instant Watch Mode**: HMR-powered watch mode with instant feedback
- **TypeScript Support**: Native TypeScript support without additional configuration
- **Jest Compatible**: Compatible with Jest API, easy migration
- **ES Modules**: Native ES module support, no transformation needed
- **Coverage**: Built-in coverage with v8 (faster than Istanbul)
- **Developer Experience**: Excellent error messages and debugging
- **Active Development**: Actively maintained by Vite team

### Negative Consequences

- **Newer Tool**: Less mature than Jest (though widely adopted)
- **Smaller Ecosystem**: Fewer plugins and extensions than Jest
- **Learning Curve**: Some differences from Jest API
- **Documentation**: Less extensive documentation than Jest
- **Community**: Smaller community than Jest

### Neutral Consequences

- **Jest Compatibility**: Most Jest patterns work, but some differences exist
- **Configuration**: Different configuration format than Jest
- **Mocking**: Different mocking API than Jest

## Alternatives Considered

### Jest

**Description**: Mature, widely-used JavaScript testing framework

**Why not chosen**:
- Slower test execution than Vitest
- Complex configuration for ES modules and TypeScript
- Separate configuration from Vite
- Slower watch mode
- Requires additional setup for Vite integration

**Trade-offs**:
- Jest has larger ecosystem and more plugins
- More extensive documentation
- Larger community
- More mature and battle-tested

### Mocha + Chai

**Description**: Flexible testing framework with assertion library

**Why not chosen**:
- Requires more configuration
- No built-in mocking or coverage
- Less integrated with modern tools
- More boilerplate code
- Slower than Vitest

**Trade-offs**:
- Mocha is more flexible and unopinionated
- Better for custom test setups
- Smaller and more modular

### Jasmine

**Description**: Behaviour-driven testing framework

**Why not chosen**:
- Less popular in React ecosystem
- No built-in coverage
- Less integrated with modern tools
- Slower than Vitest
- Less active development

**Trade-offs**:
- Jasmine has simpler API
- No dependencies required
- Better for simple test cases

### Testing Library + Jest (Keep Existing)

**Description**: Continue using Jest with React Testing Library

**Why not chosen**:
- Slower test execution
- Duplicate configuration (Jest + Vite)
- Slower watch mode
- More complex setup for TypeScript and ES modules

**Trade-offs**:
- Jest is more mature and widely used
- Larger ecosystem
- More documentation and examples

## Implementation Notes

### Vitest Configuration

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/mockData',
        'src/shared/components/ui/**', // shadcn components
      ],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
```

### Test Setup

```typescript
// src/test/setup.ts
import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

// Cleanup after each test
afterEach(() => {
  cleanup();
});

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});
```

### Unit Test Example

```typescript
// src/shared/utils/date.utils.test.ts
import { describe, it, expect } from 'vitest';
import { formatDate, parseDate } from './date.utils';

describe('date.utils', () => {
  describe('formatDate', () => {
    it('should format date correctly', () => {
      const date = new Date('2026-02-14');
      expect(formatDate(date)).toBe('14/02/2026');
    });

    it('should handle invalid date', () => {
      expect(formatDate(null)).toBe('');
    });
  });

  describe('parseDate', () => {
    it('should parse date string', () => {
      const result = parseDate('14/02/2026');
      expect(result).toBeInstanceOf(Date);
      expect(result.getFullYear()).toBe(2026);
    });
  });
});
```

### Page Test Example

```typescript
// src/pages/users/UsersPage.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import { UsersPage } from './UsersPage';
import { TestWrapper } from '@/test/TestWrapper';

expect.extend(toHaveNoViolations);

describe('UsersPage', () => {
  it('should render users list', async () => {
    render(<UsersPage />, { wrapper: TestWrapper });

    await waitFor(() => {
      expect(screen.getByText('Users')).toBeInTheDocument();
    });
  });

  it('should search users', async () => {
    const user = userEvent.setup();
    render(<UsersPage />, { wrapper: TestWrapper });

    const searchInput = screen.getByPlaceholderText('Search users...');
    await user.type(searchInput, 'John');

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });
  });

  it('should have no accessibility violations', async () => {
    const { container } = render(<UsersPage />, { wrapper: TestWrapper });
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
```

### Test Commands

```bash
# Run tests once
bun run test

# Watch mode
bun run test:watch

# Coverage report
bun run test:coverage

# Run specific test file
bun run test src/shared/utils/date.utils.test.ts

# Run tests matching pattern
bun run test --grep "formatDate"
```

### Mocking

```typescript
// Mock API calls
import { vi } from 'vitest';

vi.mock('@/shared/services/api', () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

// Mock MobX store
vi.mock('@/app/stores', () => ({
  useStores: () => ({
    authStore: {
      state: {
        user: { id: 1, username: 'testuser' },
        isAuthenticated: true,
      },
    },
  }),
}));
```

### Coverage Thresholds

```typescript
// vitest.config.ts
export default defineConfig({
  test: {
    coverage: {
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 75,
        statements: 80,
      },
    },
  },
});
```

### Dependencies

```json
{
  "vitest": "^2.1.0",
  "@testing-library/react": "^16.1.0",
  "@testing-library/user-event": "^14.5.0",
  "@testing-library/jest-dom": "^6.6.0",
  "jest-axe": "^9.0.0",
  "jsdom": "^25.0.0",
  "@vitest/coverage-v8": "^2.1.0"
}
```

### Testing Philosophy

**90% Unit Tests**:
- Utils functions
- Custom hooks
- API services
- MobX stores
- Business logic

**10% Page Tests**:
- User flows
- Accessibility checks
- Integration scenarios
- Critical paths

**No Component Tests**:
- Components tested via page tests
- Avoids duplicate testing
- Focuses on user behaviour

## Related Documentation

- [ADR-001: React 19 + TypeScript](./ADR-001-react-typescript.md) - Framework choice
- [ADR-004: Vite Build Tool](./ADR-004-vite-build-tool.md) - Build tooling
- [Testing Guide](../development/testing-guide.md) - Detailed testing patterns
- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library Documentation](https://testing-library.com/react)

---

**Date**: 14-02-2026  
**Author**: [idabblewith](https://github.com/idabblewith)
