# State Management Guide

## Overview

The SPMS frontend uses a dual state management approach that strictly separates client state from server state:

- **MobX**: Client state (UI, auth, preferences)
- **TanStack Query**: Server state (API data, caching, invalidation)

This separation provides clear boundaries, better performance, and easier debugging.

## Critical Rule

**MobX stores NEVER make API calls.** All API interactions must go through TanStack Query.

## MobX for Client State

MobX manages reactive client-side state that doesn't come from the server.

### When to Use MobX

Use MobX for:
- UI state (sidebar open/closed, modal visibility, form state)
- Authentication state (current user, permissions, session status)
- User preferences (theme, saved searches, filter settings)
- Local caching (recently viewed items, draft data)
- Application-wide settings (feature flags, breakpoints)

### BaseStore Pattern

All MobX stores extend a BaseStore class for consistency:

```typescript
// app/stores/BaseStore.ts
export abstract class BaseStore<T> {
  state: T;

  constructor(initialState: T) {
    this.state = initialState;
  }

  reset() {
    this.state = { ...this.state };
  }
}
```

### Store with Inheritance

Use `makeObservable` for stores that extend BaseStore:

```typescript
// app/stores/AuthStore.ts
import { makeObservable, action, computed } from 'mobx';
import { BaseStore } from './BaseStore';

interface AuthState {
  user: IUserData | null;
  isAuthenticated: boolean;
}

export class AuthStore extends BaseStore<AuthState> {
  constructor() {
    super({
      user: null,
      isAuthenticated: false,
    });

    makeObservable(this, {
      setUser: action,
      logout: action,
      isAuthenticated: computed,
    });
  }

  // ✅ Direct mutation (already in action context)
  setUser = (user: IUserData) => {
    this.state.user = user;
    this.state.isAuthenticated = true;
  };

  logout = () => {
    this.state.user = null;
    this.state.isAuthenticated = false;
  };

  // ✅ Computed for derived state
  get isAuthenticated() {
    return this.state.isAuthenticated && this.state.user !== null;
  }
}
```

### Standalone Store

Use `makeAutoObservable` for stores without inheritance:

```typescript
// app/stores/UIStore.ts
import { makeAutoObservable } from 'mobx';

export class UIStore {
  sidebarOpen = false;
  modalOpen = false;
  currentModal: string | null = null;

  constructor() {
    makeAutoObservable(this);
  }

  toggleSidebar = () => {
    this.sidebarOpen = !this.sidebarOpen;
  };

  openModal = (modalId: string) => {
    this.modalOpen = true;
    this.currentModal = modalId;
  };

  closeModal = () => {
    this.modalOpen = false;
    this.currentModal = null;
  };
}
```

### LocalStorage Persistence

Persist user preferences to localStorage:

```typescript
// app/stores/PreferencesStore.ts
import { makeObservable, action } from 'mobx';
import { BaseStore } from './BaseStore';

interface PreferencesState {
  theme: 'light' | 'dark';
  saveSearch: boolean;
  sidebarCollapsed: boolean;
}

function isValidPreferences(value: unknown): value is PreferencesState {
  return (
    typeof value === 'object' &&
    value !== null &&
    'theme' in value &&
    'saveSearch' in value &&
    'sidebarCollapsed' in value
  );
}

export class PreferencesStore extends BaseStore<PreferencesState> {
  private readonly STORAGE_KEY = 'spms-preferences';

  constructor() {
    super({
      theme: 'light',
      saveSearch: true,
      sidebarCollapsed: false,
    });

    makeObservable(this, {
      setTheme: action,
      toggleSaveSearch: action,
      toggleSidebar: action,
    });

    this.loadFromStorage();
  }

  private loadFromStorage() {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (!stored) return;

      const parsed: unknown = JSON.parse(stored);
      if (isValidPreferences(parsed)) {
        this.state = { ...this.state, ...parsed };
      }
    } catch (error) {
      console.error('Failed to load preferences:', error);
    }
  }

  private saveToStorage() {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.state));
    } catch (error) {
      console.error('Failed to save preferences:', error);
    }
  }

  setTheme = (theme: 'light' | 'dark') => {
    this.state.theme = theme;
    this.saveToStorage();
  };

  toggleSaveSearch = () => {
    this.state.saveSearch = !this.state.saveSearch;
    this.saveToStorage();
  };

  toggleSidebar = () => {
    this.state.sidebarCollapsed = !this.state.sidebarCollapsed;
    this.saveToStorage();
  };
}
```

### React Integration

Use the `observer` HOC to make components reactive:

```typescript
// components/UserProfile.tsx
import { observer } from 'mobx-react-lite';
import { useStores } from '@/app/stores';

export const UserProfile = observer(() => {
  const { authStore } = useStores();

  if (!authStore.isAuthenticated) {
    return <div>Please log in</div>;
  }

  return (
    <div>
      <h1>Welcome, {authStore.state.user?.username}</h1>
      <p>Email: {authStore.state.user?.email}</p>
    </div>
  );
});
```

### MobX Best Practices

**✅ DO**:
- Use `makeObservable` for stores with inheritance
- Use `makeAutoObservable` for standalone stores
- Use computed for derived state
- Use actions for state mutations
- Use type guards for localStorage data
- Direct mutation inside actions (MobX handles reactivity)

**❌ DON'T**:
- Use `runInAction` inside action methods (already in action context)
- Make API calls from MobX stores (use TanStack Query)
- Use `any` type (use proper types or `unknown`)
- Forget `observer` HOC on components using MobX state

## TanStack Query for Server State

TanStack Query manages all server state, API calls, caching, and invalidation.

### When to Use TanStack Query

Use TanStack Query for:
- Fetching data from API (GET requests)
- Mutating data (POST, PUT, PATCH, DELETE)
- Caching API responses
- Invalidating stale data
- Optimistic updates
- Background refetching
- Loading and error states

### Query Key Structure

Use hierarchical query keys for efficient cache invalidation:

```typescript
// All users
["users"]

// Specific user
["users", "detail", userId]

// User search
["users", "search", searchParams]

// User projects
["users", userId, "projects"]

// All projects
["projects"]

// Specific project
["projects", "detail", projectId]

// Project documents
["projects", projectId, "documents"]
```

### Stale Time Configuration

Set stale time based on data change frequency:

```typescript
// Static data (rarely changes) - 10 minutes
useQuery({
  queryKey: ["branches"],
  queryFn: getBranches,
  staleTime: 10 * 60_000,
});

// Semi-static data (changes occasionally) - 5 minutes
useQuery({
  queryKey: ["users"],
  queryFn: getUsers,
  staleTime: 5 * 60_000,
});

// Dynamic data (changes frequently) - 1 minute
useQuery({
  queryKey: ["projects"],
  queryFn: getProjects,
  staleTime: 1 * 60_000,
});

// Real-time data (always fresh) - 0 seconds
useQuery({
  queryKey: ["notifications"],
  queryFn: getNotifications,
  staleTime: 0,
});
```

### Query Hook Pattern

Create custom hooks for each query:

```typescript
// features/users/hooks/useUsers.ts
import { useQuery } from '@tanstack/react-query';
import { api } from '@/shared/services/api';
import type { IUserData } from '@/shared/types/user.types';

export function useUsers() {
  return useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const response = await api.get<IUserData[]>("/api/v1/users/list");
      return response.data;
    },
    staleTime: 5 * 60_000, // 5 minutes
  });
}

// Usage in component
const { data: users, isLoading, error } = useUsers();
```

### Mutation Pattern

Create custom hooks for mutations:

```typescript
// features/users/hooks/useUpdateUser.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/shared/services/api';
import { toast } from 'sonner';
import type { IUserData } from '@/shared/types/user.types';

export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<IUserData> }) => {
      const response = await api.put<IUserData>(`/api/v1/users/${id}`, data);
      return response.data;
    },
    onSuccess: (data) => {
      // Invalidate user list
      queryClient.invalidateQueries({ queryKey: ["users"] });

      // Update specific user cache
      queryClient.setQueryData(["users", "detail", data.id], data);

      toast.success("User updated successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update user");
    },
  });
}

// Usage in component
const updateUser = useUpdateUser();

const handleSubmit = (data: Partial<IUserData>) => {
  updateUser.mutate({ id: userId, data });
};
```

### Optimistic Updates

Provide instant feedback before server confirmation:

```typescript
// features/projects/hooks/useUpdateProject.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { IProject } from '@/shared/types/project.types';

export function useUpdateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateProjectApi,
    onMutate: async (variables) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({
        queryKey: ["projects", "detail", variables.id]
      });

      // Snapshot previous value
      const previousProject = queryClient.getQueryData([
        "projects",
        "detail",
        variables.id
      ]);

      // Optimistically update cache
      queryClient.setQueryData(
        ["projects", "detail", variables.id],
        (old: IProject) => ({
          ...old,
          ...variables.data,
        })
      );

      return { previousProject };
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousProject) {
        queryClient.setQueryData(
          ["projects", "detail", variables.id],
          context.previousProject
        );
      }
      toast.error("Failed to update project");
    },
    onSettled: (data, error, variables) => {
      // Refetch after mutation
      queryClient.invalidateQueries({
        queryKey: ["projects", "detail", variables.id]
      });
    },
  });
}
```

### Cache Invalidation Strategies

**Invalidate all queries with key**:
```typescript
queryClient.invalidateQueries({ queryKey: ["users"] });
```

**Invalidate specific query**:
```typescript
queryClient.invalidateQueries({ queryKey: ["users", "detail", userId] });
```

**Invalidate multiple related queries**:
```typescript
// Invalidate all user-related queries
queryClient.invalidateQueries({ queryKey: ["users"] });

// Invalidate user's projects
queryClient.invalidateQueries({ queryKey: ["users", userId, "projects"] });
```

**Update cache directly**:
```typescript
queryClient.setQueryData(["users", "detail", userId], updatedUser);
```

### TanStack Query Best Practices

**✅ DO**:
- Use hierarchical query keys
- Set appropriate stale times
- Invalidate queries after mutations
- Use optimistic updates for better UX
- Handle errors with toast notifications
- Use TypeScript for query/mutation types

**❌ DON'T**:
- Use same query key for different data
- Forget to invalidate after mutations
- Use `any` type for API responses
- Make API calls outside TanStack Query
- Forget error handling

## State Management Decision Tree

```
Need to manage state?
│
├─ Is it from the API?
│   └─ YES → Use TanStack Query
│
├─ Is it UI state?
│   └─ YES → Use MobX
│
├─ Is it user preferences?
│   └─ YES → Use MobX with localStorage
│
├─ Is it authentication state?
│   └─ YES → Use MobX
│
└─ Is it derived from other state?
    ├─ Client state → Use MobX computed
    └─ Server state → Use TanStack Query with select
```

## Common Patterns

### Authentication Flow

```typescript
// 1. Login mutation (TanStack Query)
const login = useMutation({
  mutationFn: loginApi,
  onSuccess: (user) => {
    // 2. Update auth store (MobX)
    authStore.setUser(user);

    // 3. Invalidate user queries
    queryClient.invalidateQueries({ queryKey: ["users", "me"] });
  },
});

// 4. Check auth in component
const { authStore } = useStores();
if (!authStore.isAuthenticated) {
  return <Navigate to="/login" />;
}
```

### Search with Filters

```typescript
// 1. Filter state (MobX)
class SearchStore extends BaseStore<SearchState> {
  constructor() {
    super({
      searchTerm: '',
      filters: {},
    });
    makeObservable(this, {
      setSearchTerm: action,
      setFilter: action,
    });
  }

  setSearchTerm = (term: string) => {
    this.state.searchTerm = term;
  };

  setFilter = (key: string, value: unknown) => {
    this.state.filters[key] = value;
  };
}

// 2. Search query (TanStack Query)
const { searchStore } = useStores();
const { data: results } = useQuery({
  queryKey: ["users", "search", searchStore.state],
  queryFn: () => searchUsers(searchStore.state),
  staleTime: 1 * 60_000,
});
```

### Form with Optimistic Update

```typescript
// 1. Form state (React Hook Form)
const { register, handleSubmit } = useForm<FormData>();

// 2. Mutation with optimistic update (TanStack Query)
const updateProject = useUpdateProject();

// 3. Submit handler
const onSubmit = (data: FormData) => {
  updateProject.mutate({ id: projectId, data });
};

// 4. UI shows optimistic state immediately
// 5. Rollback on error, refetch on success
```

## Related Documentation

- [ADR-002: MobX for Client State](./ADR-002-mobx-client-state.md) - MobX decision record
- [ADR-003: TanStack Query for Server State](./ADR-003-tanstack-query-server-state.md) - TanStack Query decision record
- [MobX Documentation](https://mobx.js.org/)
- [TanStack Query Documentation](https://tanstack.com/query/latest)
