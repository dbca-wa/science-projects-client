# Memoisation Guide

## Overview

Memoisation is a performance optimisation technique that caches the results of expensive computations or prevents unnecessary re-renders. This guide covers React memoisation patterns and MobX computed properties.

## When to Memoize

**Memoize when**:
- Component renders frequently with same props
- Computation is expensive (>10ms)
- Creating callbacks passed to child components
- Filtering/sorting large datasets

**Don't memoize when**:
- Component rarely re-renders
- Computation is cheap (<1ms)
- Props change frequently
- Premature optimisation

## React.memo

### Basic Usage

Prevent re-renders when props haven't changed:

```typescript
// Without memo - re-renders on every parent render
export function UserCard({ user }: { user: IUserData }) {
  return <div>{user.username}</div>;
}

// With memo - only re-renders when user changes
export const UserCard = React.memo(({ user }: { user: IUserData }) => {
  return <div>{user.username}</div>;
});
```

### Custom Comparison

```typescript
export const UserCard = React.memo(
  ({ user }: { user: IUserData }) => {
    return <div>{user.username}</div>;
  },
  (prevProps, nextProps) => {
    // Return true if props are equal (skip re-render)
    return prevProps.user.id === nextProps.user.id;
  }
);
```

### When to Use React.memo

```typescript
// ✅ GOOD: Expensive component rendered frequently
export const ProjectMap = React.memo(({ projects }: { projects: IProjectData[] }) => {
  // Heavy map rendering logic
  return <Map data={projects} />;
});

// ❌ BAD: Simple component
export const Button = React.memo(({ label }: { label: string }) => {
  return <button>{label}</button>;
});
```

## useMemo

### Basic Usage

Cache expensive computations:

```typescript
export function ProjectList({ projects }: { projects: IProjectData[] }) {
  // ✅ GOOD: Expensive filtering memoized
  const activeProjects = useMemo(
    () => projects.filter(p => p.status === 'active'),
    [projects]
  );

  // ❌ BAD: Cheap operation memoized unnecessarily
  const projectCount = useMemo(
    () => projects.length,
    [projects]
  );

  return <div>{activeProjects.map(p => <ProjectCard key={p.id} project={p} />)}</div>;
}
```

### Complex Computations

```typescript
export function ProjectAnalytics({ projects }: { projects: IProjectData[] }) {
  const analytics = useMemo(() => {
    // Expensive computation
    const byStatus = projects.reduce((acc, project) => {
      acc[project.status] = (acc[project.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const byAgency = projects.reduce((acc, project) => {
      acc[project.agency.id] = (acc[project.agency.id] || 0) + 1;
      return acc;
    }, {} as Record<number, number>);

    return { byStatus, byAgency };
  }, [projects]);

  return <AnalyticsChart data={analytics} />;
}
```

### Dependency Array

```typescript
// ✅ GOOD: All dependencies included
const filtered = useMemo(
  () => projects.filter(p => p.status === status),
  [projects, status]
);

// ❌ BAD: Missing dependency
const filtered = useMemo(
  () => projects.filter(p => p.status === status),
  [projects] // Missing 'status'
);

// ❌ BAD: Empty array (never updates)
const filtered = useMemo(
  () => projects.filter(p => p.status === status),
  [] // Will never update
);
```

## useCallback

### Basic Usage

Memoize callback functions:

```typescript
export function UserList() {
  const [selectedId, setSelectedId] = useState<number | null>(null);

  // ✅ GOOD: Callback memoized
  const handleSelect = useCallback((id: number) => {
    setSelectedId(id);
  }, []); // No dependencies

  return (
    <div>
      {users.map(user => (
        <UserCard
          key={user.id}
          user={user}
          onSelect={handleSelect}
        />
      ))}
    </div>
  );
}
```

### With Dependencies

```typescript
export function ProjectList({ onProjectUpdate }: { onProjectUpdate: (id: number) => void }) {
  const [filter, setFilter] = useState('');

  // ✅ GOOD: Dependencies included
  const handleUpdate = useCallback((id: number) => {
    console.log('Updating with filter:', filter);
    onProjectUpdate(id);
  }, [filter, onProjectUpdate]);

  return <div>{/* ... */}</div>;
}
```

### When to Use useCallback

```typescript
// ✅ GOOD: Callback passed to memoized child
const MemoizedChild = React.memo(Child);

export function Parent() {
  const handleClick = useCallback(() => {
    // Handle click
  }, []);

  return <MemoizedChild onClick={handleClick} />;
}

// ❌ BAD: Callback not passed to memoized child
export function Parent() {
  const handleClick = useCallback(() => {
    // Handle click
  }, []);

  return <div onClick={handleClick}>Click me</div>;
}
```

## MobX Computed Properties

### Basic Usage

```typescript
class ProjectStore extends BaseStore<ProjectState> {
  constructor() {
    super({ projects: [], filter: '' });
    makeObservable(this, {
      filteredProjects: computed,
      projectCount: computed,
    });
  }

  // ✅ GOOD: Computed property (cached)
  get filteredProjects() {
    return this.state.projects.filter(p =>
      p.title.toLowerCase().includes(this.state.filter.toLowerCase())
    );
  }

  get projectCount() {
    return this.filteredProjects.length;
  }
}
```

### Computed vs Regular Getter

```typescript
class UserStore extends BaseStore<UserState> {
  constructor() {
    super({ users: [] });
    makeObservable(this, {
      activeUsers: computed, // Cached
    });
  }

  // ✅ GOOD: Computed (cached, only recalculates when users change)
  get activeUsers() {
    console.log('Computing active users');
    return this.state.users.filter(u => u.isActive);
  }

  // ❌ BAD: Regular getter (recalculates on every access)
  getActiveUsers() {
    console.log('Computing active users');
    return this.state.users.filter(u => u.isActive);
  }
}
```

### Computed with Arguments

```typescript
class ProjectStore extends BaseStore<ProjectState> {
  constructor() {
    super({ projects: [] });
    makeObservable(this, {
      getProjectsByStatus: computed,
    });
  }

  // ❌ BAD: Can't use computed with arguments
  // get getProjectsByStatus(status: string) {
  //   return this.state.projects.filter(p => p.status === status);
  // }

  // ✅ GOOD: Use regular method
  getProjectsByStatus(status: string) {
    return this.state.projects.filter(p => p.status === status);
  }

  // ✅ BETTER: Use computed for common cases
  get activeProjects() {
    return this.state.projects.filter(p => p.status === 'active');
  }

  get completedProjects() {
    return this.state.projects.filter(p => p.status === 'completed');
  }
}
```

## Performance Patterns

### List Rendering

```typescript
// ✅ GOOD: Memoized list items
const ProjectListItem = React.memo(({ project }: { project: IProjectData }) => {
  return <div>{project.title}</div>;
});

export function ProjectList({ projects }: { projects: IProjectData[] }) {
  return (
    <div>
      {projects.map(project => (
        <ProjectListItem key={project.id} project={project} />
      ))}
    </div>
  );
}
```

### Expensive Filters

```typescript
export function UserList({ users }: { users: IUserData[] }) {
  const [searchTerm, setSearchTerm] = useState('');

  // ✅ GOOD: Memoized filtering
  const filteredUsers = useMemo(() => {
    return users.filter(user =>
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [users, searchTerm]);

  return (
    <div>
      <input value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
      {filteredUsers.map(user => <UserCard key={user.id} user={user} />)}
    </div>
  );
}
```

### Context Values

```typescript
// ✅ GOOD: Memoized context value
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<IUserData | null>(null);

  const value = useMemo(
    () => ({ user, setUser }),
    [user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ❌ BAD: New object on every render
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<IUserData | null>(null);

  return (
    <AuthContext.Provider value={{ user, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}
```

## Measuring Performance

### React DevTools Profiler

```typescript
import { Profiler } from 'react';

export function App() {
  const onRender = (
    id: string,
    phase: 'mount' | 'update',
    actualDuration: number
  ) => {
    console.log(`${id} (${phase}) took ${actualDuration}ms`);
  };

  return (
    <Profiler id="App" onRender={onRender}>
      <MyComponent />
    </Profiler>
  );
}
```

### Performance Timing

```typescript
export function ExpensiveComponent() {
  const startTime = performance.now();

  // Expensive computation
  const result = useMemo(() => {
    const computed = expensiveComputation();
    const endTime = performance.now();
    console.log(`Computation took ${endTime - startTime}ms`);
    return computed;
  }, []);

  return <div>{result}</div>;
}
```

## Best Practices

### Do Memoize

✅ **Expensive computations**
```typescript
const sorted = useMemo(() => data.sort(), [data]);
```

✅ **Callbacks to memoized children**
```typescript
const handleClick = useCallback(() => {}, []);
```

✅ **MobX computed properties**
```typescript
get filteredData() { return this.state.data.filter(...); }
```

### Don't Memoize

❌ **Cheap operations**
```typescript
// Don't memoize
const count = data.length;
```

❌ **Frequently changing values**
```typescript
// Don't memoize if searchTerm changes on every keystroke
const filtered = useMemo(() => filter(searchTerm), [searchTerm]);
```

❌ **Premature optimisation**
```typescript
// Don't memoize until you measure a performance issue
```

## Common Pitfalls

### Incorrect Dependencies

```typescript
// ❌ BAD: Missing dependency
const filtered = useMemo(
  () => projects.filter(p => p.status === status),
  [projects] // Missing 'status'
);

// ✅ GOOD: All dependencies included
const filtered = useMemo(
  () => projects.filter(p => p.status === status),
  [projects, status]
);
```

### Over-Memoisation

```typescript
// ❌ BAD: Memoizing everything
const Component = React.memo(() => {
  const value1 = useMemo(() => 1 + 1, []);
  const value2 = useMemo(() => 'hello', []);
  const handleClick = useCallback(() => {}, []);

  return <div onClick={handleClick}>{value1} {value2}</div>;
});

// ✅ GOOD: Only memoize what matters
function Component() {
  const value1 = 1 + 1;
  const value2 = 'hello';
  const handleClick = () => {};

  return <div onClick={handleClick}>{value1} {value2}</div>;
}
```

### Memoizing with Object Dependencies

```typescript
// ❌ BAD: Object dependency (always new reference)
const filtered = useMemo(
  () => filter(data, { status: 'active' }),
  [data, { status: 'active' }] // New object every render
);

// ✅ GOOD: Primitive dependencies
const status = 'active';
const filtered = useMemo(
  () => filter(data, { status }),
  [data, status]
);
```

## Related Documentation

- [Code Splitting](./code-splitting.md) - Code splitting strategies
- [Bundle Optimisation](./bundle-optimisation.md) - Bundle size optimisation
- [Memory Management](./memory-management.md) - Memory management best practices
- [State Management](../architecture/state-management.md) - MobX and TanStack Query patterns

## External Resources

- [React Memo Documentation](https://react.dev/reference/react/memo)
- [useMemo Documentation](https://react.dev/reference/react/useMemo)
- [useCallback Documentation](https://react.dev/reference/react/useCallback)
- [MobX Computed Documentation](https://mobx.js.org/computeds.html)
- [React DevTools Profiler](https://react.dev/learn/react-developer-tools)

---

**Date**: 13-02-2026  
**Author**: [idabblewith](https://github.com/idabblewith)
