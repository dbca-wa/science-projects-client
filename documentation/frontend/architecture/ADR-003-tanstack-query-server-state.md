# ADR-003: TanStack Query for Server State Management

## Context

The SPMS frontend application requires robust server state management for:

- Fetching data from the Django REST API
- Caching API responses to reduce network requests
- Invalidating stale data after mutations
- Handling loading and error states
- Optimistic updates for better UX
- Background refetching for data freshness
- Pagination and infinite scrolling
- Request deduplication

Server state is fundamentally different from client state:
- Server state is asynchronous and requires fetching
- Server state can become stale and needs refetching
- Server state is shared across components
- Server state requires cache invalidation strategies

The original application used a mix of useEffect hooks and custom fetch logic, which led to:
- Duplicate API calls
- Inconsistent caching strategies
- Complex loading state management
- Difficult error handling
- No automatic refetching

## Decision

We will use **TanStack Query (React Query)** for all server state management and API interactions in the SPMS frontend application.

**Key components:**
- `useQuery` for data fetching (GET requests)
- `useMutation` for data mutations (POST, PUT, PATCH, DELETE)
- Query keys for cache management
- Stale time configuration based on data change frequency
- Query invalidation after mutations
- Optimistic updates for instant feedback
- Error handling with toast notifications

**Critical separation:**
- TanStack Query handles ALL API calls and server state
- MobX handles ONLY client state (UI, auth, preferences)
- MobX stores NEVER make API calls

## Consequences

### Positive Consequences

- **Automatic Caching**: Reduces unnecessary network requests
- **Background Refetching**: Keeps data fresh automatically
- **Loading States**: Built-in loading, error, and success states
- **Request Deduplication**: Multiple components can use same query without duplicate requests
- **Optimistic Updates**: Instant UI feedback before server confirmation
- **Cache Invalidation**: Simple API for invalidating stale data
- **DevTools**: Excellent debugging tools for query inspection
- **TypeScript Support**: Strong typing for queries and mutations
- **Retry Logic**: Automatic retry on failed requests
- **Pagination Support**: Built-in pagination and infinite scroll helpers

### Negative Consequences

- **Learning Curve**: Developers need to understand query keys, stale time, and cache invalidation
- **Query Key Management**: Requires careful planning of query key structure
- **Complexity**: More complex than simple fetch calls for simple use cases
- **Bundle Size**: Adds ~13KB (gzipped) to the bundle
- **Debugging**: Cache behaviour can be confusing initially

### Neutral Consequences

- **Opinionated Caching**: Requires understanding TanStack Query's caching strategy
- **Query Key Conventions**: Need to establish consistent query key patterns
- **Stale Time Configuration**: Requires deciding appropriate stale times for different data

## Alternatives Considered

### SWR (Stale-While-Revalidate)

**Description**: React hooks library for data fetching by Vercel

**Why not chosen**:
- Less feature-rich than TanStack Query
- Weaker TypeScript support
- Smaller community and ecosystem
- Less flexible cache invalidation
- No built-in optimistic updates

**Trade-offs**:
- SWR has smaller bundle size (~5KB)
- Simpler API for basic use cases
- Better for simple data fetching

### Apollo Client

**Description**: GraphQL client with caching and state management

**Why not chosen**:
- Backend uses REST API, not GraphQL
- Overkill for REST API
- Larger bundle size (~33KB)
- More complex setup
- Requires GraphQL schema

**Trade-offs**:
- Apollo Client has better GraphQL support
- More powerful for complex GraphQL queries
- Built-in state management

### RTK Query (Redux Toolkit Query)

**Description**: Data fetching and caching tool built into Redux Toolkit

**Why not chosen**:
- Requires Redux Toolkit (we use MobX for client state)
- More boilerplate code
- Less flexible than TanStack Query
- Tighter coupling with Redux ecosystem

**Trade-offs**:
- RTK Query integrates with Redux DevTools
- Better for applications already using Redux
- More opinionated patterns

### Custom Fetch Hooks

**Description**: Build custom hooks with useEffect and useState

**Why not chosen**:
- Requires implementing caching manually
- No automatic refetching
- Complex error handling
- Duplicate code across components
- No request deduplication
- Difficult to maintain

**Trade-offs**:
- No additional dependencies
- Full control over implementation
- Simpler for very basic use cases

## Implementation Notes

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

```typescript
// features/users/hooks/useUsers.ts
export function useUsers() {
  return useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const response = await api.get<IUserData[]>("/api/v1/users");
      return response.data;
    },
    staleTime: 5 * 60_000,
  });
}

// Usage in component
const { data: users, isLoading, error } = useUsers();
```

### Mutation Pattern

```typescript
// features/users/hooks/useUpdateUser.ts
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

```typescript
export function useUpdateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateProjectApi,
    onMutate: async (variables) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["projects", variables.id] });

      // Snapshot previous value
      const previousProject = queryClient.getQueryData(["projects", variables.id]);

      // Optimistically update cache
      queryClient.setQueryData(["projects", variables.id], (old: IProject) => ({
        ...old,
        ...variables.data,
      }));

      return { previousProject };
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousProject) {
        queryClient.setQueryData(["projects", variables.id], context.previousProject);
      }
      toast.error("Failed to update project");
    },
    onSettled: (data, error, variables) => {
      // Refetch after mutation
      queryClient.invalidateQueries({ queryKey: ["projects", variables.id] });
    },
  });
}
```

### Error Handling

```typescript
// Global error handler
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      onError: (error: Error) => {
        console.error("Query error:", error);
      },
    },
    mutations: {
      onError: (error: Error) => {
        toast.error(error.message || "An error occurred");
      },
    },
  },
});
```

### Dependencies

```json
{
  "@tanstack/react-query": "^5.62.0",
  "@tanstack/react-query-devtools": "^5.62.0"
}
```

## Related Documentation

- [ADR-001: React 19 + TypeScript](./ADR-001-react-typescript.md) - Framework choice
- [ADR-002: MobX for Client State](./ADR-002-mobx-client-state.md) - Client state management
- [State Management Guide](./state-management.md) - Detailed patterns and examples
- [TanStack Query Documentation](https://tanstack.com/query/latest)
- [TanStack Query Best Practices](https://tanstack.com/query/latest/docs/react/guides/important-defaults)

---

**Date**: 14-02-2026  
**Author**: [idabblewith](https://github.com/idabblewith)
