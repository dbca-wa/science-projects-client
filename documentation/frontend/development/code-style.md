# Code Style Guide

## Overview

This guide defines the code style standards for the Science Projects Management System frontend. Consistent code style improves readability, maintainability, and collaboration across the team.

## TypeScript Standards

### Strict Type Safety

**NEVER use `any` type** - This defeats TypeScript's purpose and hides bugs.

```typescript
// ❌ BAD: Using any
const parsed: any = JSON.parse(data);
parsed.whatever.property; // No type safety!

function handleData(data: any) {
  return data.value;
}

// ✅ GOOD: Use unknown and type guard
const parsed: unknown = JSON.parse(data);
if (isValidData(parsed)) {
  parsed.property; // Type-safe!
}

function handleData(data: UserData) {
  return data.value;
}
```

**NEVER use `@ts-ignore`** - Fix the underlying issue instead.

```typescript
// ❌ BAD: Suppressing errors
// @ts-ignore
const value = obj.nonExistentProperty;

// ✅ GOOD: Fix the type
interface MyObject {
  nonExistentProperty?: string;
}
const value = obj.nonExistentProperty;
```

### Type Guard Pattern

When dealing with unknown data (JSON parsing, API responses), use type guards:

```typescript
// Define the expected shape
interface StoredSearchState {
  saveSearch: boolean;
  searchTerm: string;
  filters: Record<string, unknown>;
}

// Create type guard
function isStoredSearchState(value: unknown): value is StoredSearchState {
  return (
    typeof value === 'object' &&
    value !== null &&
    'saveSearch' in value &&
    typeof (value as StoredSearchState).saveSearch === 'boolean' &&
    'searchTerm' in value &&
    typeof (value as StoredSearchState).searchTerm === 'string'
  );
}

// Use it safely
function loadFromStorage(key: string): StoredSearchState | null {
  try {
    const stored = localStorage.getItem(key);
    if (!stored) return null;

    const parsed: unknown = JSON.parse(stored);
    if (isStoredSearchState(parsed)) {
      return parsed;
    }
    return null;
  } catch {
    return null;
  }
}
```

### Error Handling

Always use proper Error types:

```typescript
// ✅ GOOD: Typed error handling
try {
  await someOperation();
} catch (error) {
  if (error instanceof Error) {
    console.error(error.message);
  } else {
    console.error('Unknown error occurred');
  }
}

// ✅ GOOD: Mutation error handling
const mutation = useMutation({
  mutationFn: updateUser,
  onError: (error: Error) => {
    toast.error(error.message || 'Update failed');
  },
});
```

### When You Think You Need `any`

If you think you need `any`, you probably need one of these instead:

1. **`unknown`** - For truly unknown data that needs validation
2. **Generic type** - `<T>` for reusable functions
3. **Union type** - `string | number` for multiple possibilities
4. **Type guard** - Runtime validation with type narrowing
5. **Proper interface** - Define the actual shape

```typescript
// Instead of any, use:

// 1. unknown + type guard
function process(data: unknown) {
  if (typeof data === 'string') {
    return data.toUpperCase();
  }
}

// 2. Generic
function identity<T>(value: T): T {
  return value;
}

// 3. Union type
function format(value: string | number): string {
  return String(value);
}

// 4. Proper interface
interface ApiResponse {
  data: UserData;
  status: number;
}
```

## Naming Conventions

### Files and Directories

```
// Components (PascalCase)
UserProfile.tsx
ProjectCard.tsx
BaseUserSearch.tsx

// Hooks (camelCase with 'use' prefix)
useCurrentUser.ts
useProjects.ts
useAuth.ts

// Services (camelCase with service suffix)
user.service.ts
project.service.ts
auth.service.ts

// Types (camelCase with types suffix)
user.types.ts
project.types.ts
api.types.ts

// Utils (camelCase with utils suffix)
date.utils.ts
image.utils.ts
validation.utils.ts

// Stores (PascalCase with Store suffix)
AuthStore.ts
UserStore.ts
ProjectStore.ts

// Constants (SCREAMING_SNAKE_CASE)
API_ENDPOINTS.ts
BREAKPOINTS.ts
```

### Variables and Functions

```typescript
// Variables (camelCase)
const userName = 'John';
const projectList = [];
const isAuthenticated = true;

// Functions (camelCase)
function getUserById(id: number) {}
function calculateTotal(items: Item[]) {}
function validateEmail(email: string) {}

// Boolean variables (is/has/should prefix)
const isLoading = false;
const hasPermission = true;
const shouldRender = false;

// Constants (SCREAMING_SNAKE_CASE)
const MAX_RETRIES = 3;
const API_BASE_URL = 'https://api.example.com';
const DEFAULT_PAGE_SIZE = 20;
```

### React Components

```typescript
// Component names (PascalCase)
export function UserProfile() {}
export function ProjectCard() {}
export function BaseUserSearch() {}

// Props interfaces (PascalCase with Props suffix)
interface UserProfileProps {
  userId: number;
  onUpdate?: () => void;
}

// Event handlers (handle prefix)
const handleClick = () => {};
const handleSubmit = (data: FormData) => {};
const handleUserSelect = (user: IUserData) => {};
```

### Types and Interfaces

```typescript
// Interfaces (PascalCase with I prefix)
interface IUserData {
  id: number;
  username: string;
}

interface IProjectData {
  id: number;
  title: string;
}

// Types (PascalCase)
type UserRole = 'admin' | 'user' | 'guest';
type ProjectStatus = 'active' | 'completed' | 'archived';

// Enums (PascalCase)
enum UserRole {
  Admin = 'admin',
  User = 'user',
  Guest = 'guest',
}
```

## Import Organisation

### Import Order

Organise imports in the following order:

1. React and React-related imports
2. Third-party libraries
3. Internal absolute imports (using `@/`)
4. Relative imports
5. Type imports (at the end)

```typescript
// 1. React imports
import { useState, useEffect } from 'react';

// 2. Third-party libraries
import { observer } from 'mobx-react-lite';
import { useQuery } from '@tanstack/react-query';

// 3. Internal absolute imports
import { useAuth } from '@/features/auth';
import { Button } from '@/shared/components/ui/button';
import { BaseUserSearch } from '@/shared/components/user';

// 4. Relative imports
import { ProjectCard } from './ProjectCard';
import { useProjectStore } from '../stores/ProjectStore';

// 5. Type imports
import type { IUserData } from '@/shared/types/user.types';
import type { IProjectData } from '@/shared/types/project.types';
```

### Import Paths

Use absolute imports with `@/` prefix for better maintainability:

```typescript
// ✅ GOOD: Absolute imports
import { useAuth } from '@/features/auth';
import { Button } from '@/shared/components/ui/button';
import { IUserData } from '@/shared/types/user.types';

// ❌ BAD: Relative imports for shared code
import { useAuth } from '../../../features/auth';
import { Button } from '../../../shared/components/ui/button';
```

Use relative imports only for files within the same feature:

```typescript
// ✅ GOOD: Relative imports within feature
import { ProjectCard } from './ProjectCard';
import { useProjectStore } from '../stores/ProjectStore';
```

## ESLint Configuration

The project uses ESLint with TypeScript support. Key rules:

```json
{
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended"
  ],
  "rules": {
    "@typescript-eslint/no-explicit-any": "error",
    "@typescript-eslint/no-unused-vars": "error",
    "@typescript-eslint/explicit-function-return-type": "off",
    "react/react-in-jsx-scope": "off",
    "react/prop-types": "off"
  }
}
```

### Running ESLint

```bash
# Check for linting errors
bun run lint

# Fix auto-fixable errors
bun run lint:fix
```

## Prettier Configuration

The project uses Prettier for code formatting:

```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": false,
  "printWidth": 80,
  "tabWidth": 2,
  "useTabs": false
}
```

### Running Prettier

```bash
# Check formatting
bun run format:check

# Fix formatting
bun run format
```

## Component Structure

### Functional Component Pattern

```typescript
import { useState } from 'react';
import type { IUserData } from '@/shared/types/user.types';

interface UserProfileProps {
  user: IUserData;
  onUpdate?: (user: IUserData) => void;
}

export function UserProfile({ user, onUpdate }: UserProfileProps) {
  const [isEditing, setIsEditing] = useState(false);

  const handleSave = () => {
    // Save logic
    onUpdate?.(user);
    setIsEditing(false);
  };

  return (
    <div className="user-profile">
      {/* Component JSX */}
    </div>
  );
}
```

### MobX Observer Component

```typescript
import { observer } from 'mobx-react-lite';
import { useAuthStore } from '@/app/stores/AuthStore';

export const UserMenu = observer(() => {
  const authStore = useAuthStore();

  return (
    <div>
      {authStore.isAuthenticated && (
        <span>{authStore.currentUser?.username}</span>
      )}
    </div>
  );
});
```

### Component with TanStack Query

```typescript
import { useQuery } from '@tanstack/react-query';
import { getProjects } from '@/features/projects/services/project.service';

export function ProjectList() {
  const { data: projects, isLoading, error } = useQuery({
    queryKey: ['projects'],
    queryFn: getProjects,
    staleTime: 5 * 60_000, // 5 minutes
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      {projects?.map(project => (
        <div key={project.id}>{project.title}</div>
      ))}
    </div>
  );
}
```

## Comments and Documentation

### JSDoc Comments

Use JSDoc for functions and complex logic:

```typescript
/**
 * Fetches user data by ID
 * @param userId - The unique identifier of the user
 * @returns Promise resolving to user data
 * @throws {NotFoundError} If user doesn't exist
 */
async function getUserById(userId: number): Promise<IUserData> {
  // Implementation
}
```

### Inline Comments

Use inline comments sparingly, only for complex logic:

```typescript
// ✅ GOOD: Explaining complex logic
// Calculate stale time based on data change frequency
// Static data: 10 minutes, dynamic data: 1 minute
const staleTime = isStaticData ? 10 * 60_000 : 60_000;

// ❌ BAD: Stating the obvious
// Set loading to true
setLoading(true);
```

### TODO Comments

Use TODO comments with context:

```typescript
// TODO: Implement pagination when API supports it
// TODO: Add error boundary for this component
// TODO: Optimise this query with proper indexing
```

## Best Practices

### Destructuring

Prefer destructuring for cleaner code:

```typescript
// ✅ GOOD: Destructuring
const { username, email } = user;
const { data, isLoading, error } = useQuery(...);

// ❌ BAD: Accessing properties repeatedly
const username = user.username;
const email = user.email;
```

### Optional Chaining

Use optional chaining for safer property access:

```typescript
// ✅ GOOD: Optional chaining
const avatarUrl = user?.profile?.avatar?.url;
const firstProject = projects?.[0]?.title;

// ❌ BAD: Manual null checks
const avatarUrl = user && user.profile && user.profile.avatar
  ? user.profile.avatar.url
  : undefined;
```

### Nullish Coalescing

Use nullish coalescing for default values:

```typescript
// ✅ GOOD: Nullish coalescing
const pageSize = settings.pageSize ?? 20;
const theme = user.preferences?.theme ?? 'light';

// ❌ BAD: OR operator (treats 0 and '' as falsy)
const pageSize = settings.pageSize || 20;
```

### Array Methods

Prefer functional array methods:

```typescript
// ✅ GOOD: Functional methods
const activeProjects = projects.filter(p => p.status === 'active');
const projectIds = projects.map(p => p.id);
const hasActiveProject = projects.some(p => p.status === 'active');

// ❌ BAD: Imperative loops
const activeProjects = [];
for (let i = 0; i < projects.length; i++) {
  if (projects[i].status === 'active') {
    activeProjects.push(projects[i]);
  }
}
```

### Async/Await

Prefer async/await over promise chains:

```typescript
// ✅ GOOD: Async/await
async function loadUserData(userId: number) {
  try {
    const user = await getUser(userId);
    const projects = await getUserProjects(userId);
    return { user, projects };
  } catch (error) {
    console.error('Failed to load user data:', error);
    throw error;
  }
}

// ❌ BAD: Promise chains
function loadUserData(userId: number) {
  return getUser(userId)
    .then(user => {
      return getUserProjects(userId)
        .then(projects => ({ user, projects }));
    })
    .catch(error => {
      console.error('Failed to load user data:', error);
      throw error;
    });
}
```

## Common Pitfalls

### Avoid Mutation

Don't mutate objects or arrays directly:

```typescript
// ❌ BAD: Direct mutation
const user = { name: 'John' };
user.name = 'Jane'; // Mutation

const items = [1, 2, 3];
items.push(4); // Mutation

// ✅ GOOD: Immutable updates
const user = { name: 'John' };
const updatedUser = { ...user, name: 'Jane' };

const items = [1, 2, 3];
const newItems = [...items, 4];
```

### Avoid Nested Ternaries

Keep ternaries simple and readable:

```typescript
// ❌ BAD: Nested ternaries
const status = isLoading
  ? 'Loading...'
  : error
    ? 'Error'
    : data
      ? 'Success'
      : 'No data';

// ✅ GOOD: Early returns or if/else
function getStatus() {
  if (isLoading) return 'Loading...';
  if (error) return 'Error';
  if (data) return 'Success';
  return 'No data';
}
```

### Avoid Large Components

Break down large components into smaller, focused ones:

```typescript
// ❌ BAD: Large component with multiple responsibilities
function UserDashboard() {
  // 500 lines of code handling:
  // - User profile
  // - Project list
  // - Activity feed
  // - Settings
}

// ✅ GOOD: Composed from smaller components
function UserDashboard() {
  return (
    <div>
      <UserProfile />
      <ProjectList />
      <ActivityFeed />
      <UserSettings />
    </div>
  );
}
```

## Related Documentation

- [Testing Guide](./testing-guide.md) - Testing standards and practices
- [Feature Development](./feature-development.md) - Feature development workflow
- [Getting Started](./getting-started.md) - Setup and installation
- [Architecture Overview](../architecture/overview.md) - System architecture
- [State Management](../architecture/state-management.md) - MobX and TanStack Query patterns

## External Resources

- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [React TypeScript Cheatsheet](https://react-typescript-cheatsheet.netlify.app/)
- [ESLint Rules](https://eslint.org/docs/latest/rules/)
- [Prettier Options](https://prettier.io/docs/en/options.html)
- [Airbnb JavaScript Style Guide](https://github.com/airbnb/javascript)

---

**Date**: 13-02-2026  
**Author**: [idabblewith](https://github.com/idabblewith)
