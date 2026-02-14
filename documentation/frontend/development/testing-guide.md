# Testing Guide

## Overview

This guide defines the testing strategy and practices for the Science Projects Management System frontend. Our testing approach focuses on two types of tests: unit tests (90%) and page tests (10%), with a strong emphasis on accessibility.

## Testing Philosophy

### Two Types Only

1. **Unit Tests (90%)**: Test utilities, hooks, services, and stores in isolation
2. **Page Tests (10%)**: Test complete user flows with accessibility checks

**NEVER write component tests** - Components are tested via page tests.

### Decision Tree

```
Is it a function/hook/service/store?
├─ YES → Unit Test
└─ NO → Is it a page?
    ├─ YES → Page Test (includes accessibility)
    └─ NO → Is it a component?
        └─ YES → NO TEST (tested via page)
```

### Why This Approach?

**Benefits**:
- Avoids duplicate testing (components tested via pages)
- Focuses on user behaviour, not implementation details
- Ensures accessibility is always tested
- Faster test suite (fewer tests, better coverage)
- Easier to maintain (no brittle component tests)

**Trade-offs**:
- Requires well-structured pages
- Page tests are slower than component tests
- Need good test organisation

## Test Commands

```bash
# Run all tests once
bun run test

# Watch mode (re-run on changes)
bun run test:watch

# With coverage report
bun run test:coverage

# Run specific test file
bun run test src/features/users/hooks/useCurrentUser.test.ts

# Run tests matching pattern
bun run test --grep "authentication"
```

## Unit Testing

### What to Unit Test

- **Utilities**: Pure functions, formatters, validators
- **Hooks**: Custom React hooks
- **Services**: API service functions
- **Stores**: MobX store logic

### Utility Testing

```typescript
// src/shared/utils/date.utils.test.ts
import { describe, it, expect } from 'vitest';
import { formatDate, parseDate, isValidDate } from './date.utils';

describe('date.utils', () => {
  describe('formatDate', () => {
    it('should format date to DD/MM/YYYY', () => {
      const date = new Date('2026-02-13');
      expect(formatDate(date)).toBe('13/02/2026');
    });

    it('should handle invalid dates', () => {
      expect(formatDate(null)).toBe('');
      expect(formatDate(undefined)).toBe('');
    });
  });

  describe('isValidDate', () => {
    it('should return true for valid dates', () => {
      expect(isValidDate('2026-02-13')).toBe(true);
      expect(isValidDate('13/02/2026')).toBe(true);
    });

    it('should return false for invalid dates', () => {
      expect(isValidDate('invalid')).toBe(false);
      expect(isValidDate('32/13/2026')).toBe(false);
    });
  });
});
```

### Hook Testing

```typescript
// src/features/users/hooks/useCurrentUser.test.ts
import { describe, it, expect, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useCurrentUser } from './useCurrentUser';
import * as userService from '../services/user.service';

// Mock the service
vi.mock('../services/user.service');

describe('useCurrentUser', () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );

  it('should fetch current user', async () => {
    const mockUser = { id: 1, username: 'testuser' };
    vi.mocked(userService.getCurrentUser).mockResolvedValue(mockUser);

    const { result } = renderHook(() => useCurrentUser(), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(mockUser);
  });

  it('should handle errors', async () => {
    vi.mocked(userService.getCurrentUser).mockRejectedValue(
      new Error('Failed to fetch')
    );

    const { result } = renderHook(() => useCurrentUser(), { wrapper });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeInstanceOf(Error);
  });
});
```

### Service Testing

```typescript
// src/features/users/services/user.service.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getCurrentUser, updateUser } from './user.service';
import { api } from '@/shared/services/api';

vi.mock('@/shared/services/api');

describe('user.service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getCurrentUser', () => {
    it('should fetch current user from API', async () => {
      const mockUser = { id: 1, username: 'testuser' };
      vi.mocked(api.get).mockResolvedValue({ data: mockUser });

      const result = await getCurrentUser();

      expect(api.get).toHaveBeenCalledWith('/api/v1/users/me');
      expect(result).toEqual(mockUser);
    });

    it('should throw error on API failure', async () => {
      vi.mocked(api.get).mockRejectedValue(new Error('Network error'));

      await expect(getCurrentUser()).rejects.toThrow('Network error');
    });
  });

  describe('updateUser', () => {
    it('should update user via API', async () => {
      const userId = 1;
      const updates = { username: 'newname' };
      const mockResponse = { id: 1, username: 'newname' };

      vi.mocked(api.put).mockResolvedValue({ data: mockResponse });

      const result = await updateUser(userId, updates);

      expect(api.put).toHaveBeenCalledWith(`/api/v1/users/${userId}`, updates);
      expect(result).toEqual(mockResponse);
    });
  });
});
```

### Store Testing

```typescript
// src/app/stores/AuthStore.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { AuthStore } from './AuthStore';

describe('AuthStore', () => {
  let store: AuthStore;

  beforeEach(() => {
    store = new AuthStore();
  });

  describe('login', () => {
    it('should set authenticated state', () => {
      const user = { id: 1, username: 'testuser' };

      store.login(user);

      expect(store.isAuthenticated).toBe(true);
      expect(store.currentUser).toEqual(user);
    });
  });

  describe('logout', () => {
    it('should clear authenticated state', () => {
      const user = { id: 1, username: 'testuser' };
      store.login(user);

      store.logout();

      expect(store.isAuthenticated).toBe(false);
      expect(store.currentUser).toBeNull();
    });
  });

  describe('computed properties', () => {
    it('should compute isAdmin correctly', () => {
      expect(store.isAdmin).toBe(false);

      store.login({ id: 1, username: 'admin', role: 'admin' });
      expect(store.isAdmin).toBe(true);
    });
  });
});
```

## Page Testing

### What to Page Test

- **User flows**: Complete interactions from start to finish
- **Accessibility**: WCAG compliance for all pages
- **Navigation**: Routing and page transitions
- **Form submissions**: End-to-end form workflows
- **Error states**: How pages handle errors

### Page Test Structure

```typescript
// src/pages/users/UserListPage.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import { UserListPage } from './UserListPage';
import { TestWrapper } from '@/test/TestWrapper';

expect.extend(toHaveNoViolations);

describe('UserListPage', () => {
  it('should render user list', async () => {
    render(
      <TestWrapper>
        <UserListPage />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Users')).toBeInTheDocument();
    });

    expect(screen.getByRole('table')).toBeInTheDocument();
  });

  it('should filter users by search term', async () => {
    const user = userEvent.setup();

    render(
      <TestWrapper>
        <UserListPage />
      </TestWrapper>
    );

    const searchInput = screen.getByPlaceholderText('Search users...');
    await user.type(searchInput, 'john');

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.queryByText('Jane Smith')).not.toBeInTheDocument();
    });
  });

  it('should navigate to user detail on row click', async () => {
    const user = userEvent.setup();

    render(
      <TestWrapper>
        <UserListPage />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    await user.click(screen.getByText('John Doe'));

    expect(window.location.pathname).toBe('/users/1');
  });

  it('should have no accessibility violations', async () => {
    const { container } = render(
      <TestWrapper>
        <UserListPage />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Users')).toBeInTheDocument();
    });

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
```

### Accessibility Testing

**Every page test MUST include accessibility checks**:

```typescript
import { axe, toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

it('should have no accessibility violations', async () => {
  const { container } = render(<MyPage />);

  // Wait for page to load
  await waitFor(() => {
    expect(screen.getByRole('main')).toBeInTheDocument();
  });

  // Run accessibility checks
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
```

### Form Testing

```typescript
// src/pages/users/UserEditPage.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { UserEditPage } from './UserEditPage';
import { TestWrapper } from '@/test/TestWrapper';

describe('UserEditPage', () => {
  it('should submit form with valid data', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();

    render(
      <TestWrapper>
        <UserEditPage onSubmit={onSubmit} />
      </TestWrapper>
    );

    // Fill form
    await user.type(screen.getByLabelText('Username'), 'newuser');
    await user.type(screen.getByLabelText('Email'), 'new@example.com');

    // Submit
    await user.click(screen.getByRole('button', { name: 'Save' }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        username: 'newuser',
        email: 'new@example.com',
      });
    });
  });

  it('should show validation errors', async () => {
    const user = userEvent.setup();

    render(
      <TestWrapper>
        <UserEditPage />
      </TestWrapper>
    );

    // Submit without filling form
    await user.click(screen.getByRole('button', { name: 'Save' }));

    await waitFor(() => {
      expect(screen.getByText('Username is required')).toBeInTheDocument();
      expect(screen.getByText('Email is required')).toBeInTheDocument();
    });
  });

  it('should handle API errors', async () => {
    const user = userEvent.setup();

    render(
      <TestWrapper>
        <UserEditPage />
      </TestWrapper>
    );

    // Fill and submit form
    await user.type(screen.getByLabelText('Username'), 'existing');
    await user.click(screen.getByRole('button', { name: 'Save' }));

    await waitFor(() => {
      expect(screen.getByText('Username already exists')).toBeInTheDocument();
    });
  });
});
```

## Test Utilities

### TestWrapper

Create a reusable test wrapper for common providers:

```typescript
// src/test/TestWrapper.tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router';
import { AuthStoreProvider } from '@/app/stores/AuthStore';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      staleTime: 0,
    },
  },
});

export function TestWrapper({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthStoreProvider>
          {children}
        </AuthStoreProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
```

### Mock Data Factories

Create factories for consistent test data:

```typescript
// src/test/factories/user.factory.ts
import type { IUserData } from '@/shared/types/user.types';

export function createMockUser(overrides?: Partial<IUserData>): IUserData {
  return {
    id: 1,
    username: 'testuser',
    email: 'test@example.com',
    firstName: 'Test',
    lastName: 'User',
    isActive: true,
    ...overrides,
  };
}

export function createMockUsers(count: number): IUserData[] {
  return Array.from({ length: count }, (_, i) =>
    createMockUser({ id: i + 1, username: `user${i + 1}` })
  );
}
```

### Custom Matchers

Create custom matchers for common assertions:

```typescript
// src/test/matchers.ts
import { expect } from 'vitest';

expect.extend({
  toBeValidEmail(received: string) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const pass = emailRegex.test(received);

    return {
      pass,
      message: () =>
        pass
          ? `Expected ${received} not to be a valid email`
          : `Expected ${received} to be a valid email`,
    };
  },
});
```

## Coverage Thresholds

The project enforces minimum coverage thresholds:

```json
{
  "coverage": {
    "branches": 80,
    "functions": 80,
    "lines": 80,
    "statements": 80
  }
}
```

### Checking Coverage

```bash
# Generate coverage report
bun run test:coverage

# View HTML report
open coverage/index.html
```

### Coverage Best Practices

- **Focus on critical paths**: Ensure core functionality is well-tested
- **Don't chase 100%**: Some code (error handlers, edge cases) may not need tests
- **Test behaviour, not implementation**: Coverage is a metric, not a goal
- **Exclude generated code**: Don't include coverage for generated files

## Mocking

### Mocking Services

```typescript
import { vi } from 'vitest';
import * as userService from '../services/user.service';

vi.mock('../services/user.service');

// Mock implementation
vi.mocked(userService.getCurrentUser).mockResolvedValue({
  id: 1,
  username: 'testuser',
});
```

### Mocking API Calls

```typescript
import { vi } from 'vitest';
import { api } from '@/shared/services/api';

vi.mock('@/shared/services/api');

// Mock successful response
vi.mocked(api.get).mockResolvedValue({
  data: { id: 1, username: 'testuser' },
});

// Mock error response
vi.mocked(api.get).mockRejectedValue(new Error('Network error'));
```

### Mocking Stores

```typescript
import { vi } from 'vitest';
import { useAuthStore } from '@/app/stores/AuthStore';

vi.mock('@/app/stores/AuthStore');

// Mock store state
vi.mocked(useAuthStore).mockReturnValue({
  isAuthenticated: true,
  currentUser: { id: 1, username: 'testuser' },
  login: vi.fn(),
  logout: vi.fn(),
});
```

## Best Practices

### Test Organisation

```typescript
describe('Feature', () => {
  describe('Subfeature', () => {
    it('should do something specific', () => {
      // Test implementation
    });
  });
});
```

### Test Naming

Use descriptive test names that explain the behaviour:

```typescript
// ✅ GOOD: Descriptive names
it('should display error message when login fails')
it('should disable submit button while form is submitting')
it('should filter users by search term')

// ❌ BAD: Vague names
it('should work')
it('should handle errors')
it('should test the component')
```

### Arrange-Act-Assert Pattern

Structure tests with clear sections:

```typescript
it('should update user on form submit', async () => {
  // Arrange: Set up test data and mocks
  const user = userEvent.setup();
  const mockUser = createMockUser();
  vi.mocked(updateUser).mockResolvedValue(mockUser);

  // Act: Perform the action
  render(<UserEditPage />);
  await user.type(screen.getByLabelText('Username'), 'newname');
  await user.click(screen.getByRole('button', { name: 'Save' }));

  // Assert: Verify the outcome
  await waitFor(() => {
    expect(updateUser).toHaveBeenCalledWith(1, { username: 'newname' });
  });
});
```

### Avoid Test Interdependence

Each test should be independent:

```typescript
// ❌ BAD: Tests depend on each other
let user: IUserData;

it('should create user', () => {
  user = createUser({ username: 'test' });
  expect(user).toBeDefined();
});

it('should update user', () => {
  updateUser(user.id, { username: 'updated' });
  expect(user.username).toBe('updated');
});

// ✅ GOOD: Independent tests
it('should create user', () => {
  const user = createUser({ username: 'test' });
  expect(user).toBeDefined();
});

it('should update user', () => {
  const user = createUser({ username: 'test' });
  updateUser(user.id, { username: 'updated' });
  expect(user.username).toBe('updated');
});
```

### Use beforeEach for Setup

```typescript
describe('UserService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch users', async () => {
    // Test implementation
  });
});
```

## Common Pitfalls

### Don't Test Implementation Details

```typescript
// ❌ BAD: Testing implementation
it('should call useState with initial value', () => {
  const { result } = renderHook(() => useState(0));
  expect(result.current[0]).toBe(0);
});

// ✅ GOOD: Testing behaviour
it('should display initial count', () => {
  render(<Counter />);
  expect(screen.getByText('Count: 0')).toBeInTheDocument();
});
```

### Don't Over-Mock

```typescript
// ❌ BAD: Mocking everything
vi.mock('react');
vi.mock('@tanstack/react-query');
vi.mock('./UserProfile');

// ✅ GOOD: Mock only external dependencies
vi.mock('../services/user.service');
```

### Don't Forget to Wait

```typescript
// ❌ BAD: Not waiting for async operations
it('should display user', () => {
  render(<UserProfile />);
  expect(screen.getByText('John Doe')).toBeInTheDocument(); // Fails!
});

// ✅ GOOD: Wait for async operations
it('should display user', async () => {
  render(<UserProfile />);
  await waitFor(() => {
    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });
});
```

## Related Documentation

- [Code Style Guide](./code-style.md) - Code style standards
- [Feature Development](./feature-development.md) - Feature development workflow
- [ADR-006: Vitest Testing Framework](../architecture/ADR-006-vitest-testing.md) - Testing framework decision
- [Getting Started](./getting-started.md) - Setup and installation

## External Resources

- [Vitest Documentation](https://vitest.dev/)
- [Testing Library Documentation](https://testing-library.com/)
- [jest-axe Documentation](https://github.com/nickcolley/jest-axe)
- [WCAG Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

---

**Date**: 13-02-2026  
**Author**: [idabblewith](https://github.com/idabblewith)
