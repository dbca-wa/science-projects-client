# ADR-002: MobX for Client State Management

## Context

The SPMS frontend application requires client-side state management for:

- UI state (sidebar open/closed, modal visibility, form state)
- Authentication state (current user, permissions, session status)
- User preferences (theme, saved searches, filter settings)
- Local caching (recently viewed items, draft data)
- Application-wide settings (breakpoints, feature flags)

This state is distinct from server state (API data), which is managed separately. The client state management solution needed to:

- Provide reactive updates when state changes
- Support computed values derived from state
- Enable persistence to localStorage
- Integrate well with React components
- Minimise boilerplate code
- Support TypeScript with strong typing
- Handle complex state updates efficiently

The original application used a mix of React Context and local component state, which became difficult to manage as the application grew.

## Decision

We will use **MobX** for all client-side state management in the SPMS frontend application.

**Key components:**
- MobX stores for client state (UI, auth, preferences)
- BaseStore pattern for consistent store structure
- `makeObservable` for stores with inheritance
- `makeAutoObservable` for standalone stores
- Computed values for derived state
- Actions for state mutations
- LocalStorage persistence for user preferences

**Critical separation:**
- MobX handles ONLY client state
- TanStack Query handles ALL server state and API calls
- MobX stores NEVER make API calls

## Consequences

### Positive Consequences

- **Reactive Programming**: Automatic re-renders when observed state changes
- **Minimal Boilerplate**: Less code compared to Redux or Context API
- **Computed Values**: Efficient derived state with automatic dependency tracking
- **TypeScript Support**: Excellent TypeScript integration with decorators
- **Performance**: Fine-grained reactivity updates only affected components
- **Developer Experience**: Simple API, easy to understand and debug
- **Persistence**: Easy integration with localStorage for user preferences
- **Flexibility**: No strict patterns, adaptable to different use cases

### Negative Consequences

- **Learning Curve**: Developers need to understand MobX concepts (observables, actions, computed)
- **Magic Behaviour**: Automatic reactivity can be confusing for newcomers
- **Less Opinionated**: Requires establishing patterns and conventions
- **Smaller Ecosystem**: Fewer MobX-specific libraries compared to Redux
- **Debugging**: Reactivity can make debugging more complex

### Neutral Consequences

- **State Management Split**: Requires clear separation between client and server state
- **Store Organisation**: Need to decide on store structure and organisation
- **Bundle Size**: MobX adds ~16KB (gzipped) to the bundle

## Alternatives Considered

### Redux Toolkit

**Description**: Opinionated Redux library with simplified API and built-in best practices

**Why not chosen**:
- More boilerplate code (actions, reducers, selectors)
- Steeper learning curve
- Overkill for client state management
- Better suited for complex state machines
- Immutable updates more verbose than MobX

**Trade-offs**:
- Redux has larger ecosystem and more middleware
- Better DevTools for time-travel debugging
- More predictable state updates
- Stronger community and documentation

### Zustand

**Description**: Lightweight state management with hooks-based API

**Why not chosen**:
- Less mature than MobX
- Fewer features (no computed values, no decorators)
- Less powerful reactivity system
- Smaller community and ecosystem
- Team unfamiliarity with Zustand patterns

**Trade-offs**:
- Zustand has smaller bundle size (~3KB)
- Simpler API with less magic
- Better for simple state management

### Jotai

**Description**: Atomic state management with bottom-up approach

**Why not chosen**:
- Different mental model (atoms vs stores)
- Less suitable for complex state relationships
- Smaller community and ecosystem
- Team unfamiliarity with atomic state management
- Less mature TypeScript support

**Trade-offs**:
- Jotai has smaller bundle size (~5KB)
- Better for isolated state atoms
- More flexible composition

### React Context + useReducer

**Description**: Built-in React state management with Context API

**Why not chosen**:
- Performance issues with large state trees
- No computed values
- More boilerplate for complex state
- Difficult to persist to localStorage
- No automatic dependency tracking

**Trade-offs**:
- No additional dependencies
- Simpler for small applications
- More familiar to React developers

## Implementation Notes

### BaseStore Pattern

All MobX stores extend a BaseStore class for consistency:

```typescript
abstract class BaseStore<T> {
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
class AuthStore extends BaseStore<AuthState> {
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

  setUser = (user: IUserData) => {
    this.state.user = user;
    this.state.isAuthenticated = true;
  };

  logout = () => {
    this.state.user = null;
    this.state.isAuthenticated = false;
  };

  get isAuthenticated() {
    return this.state.isAuthenticated && this.state.user !== null;
  }
}
```

### Standalone Store

Use `makeAutoObservable` for stores without inheritance:

```typescript
class UIStore {
  sidebarOpen = false;
  modalOpen = false;

  constructor() {
    makeAutoObservable(this);
  }

  toggleSidebar = () => {
    this.sidebarOpen = !this.sidebarOpen;
  };

  openModal = () => {
    this.modalOpen = true;
  };

  closeModal = () => {
    this.modalOpen = false;
  };
}
```

### LocalStorage Persistence

```typescript
class PreferencesStore extends BaseStore<PreferencesState> {
  constructor() {
    super({
      theme: 'light',
      saveSearch: true,
    });

    makeObservable(this, {
      setTheme: action,
      toggleSaveSearch: action,
    });

    this.loadFromStorage();
  }

  private loadFromStorage() {
    const stored = localStorage.getItem('preferences');
    if (stored) {
      const parsed: unknown = JSON.parse(stored);
      if (isValidPreferences(parsed)) {
        this.state = { ...this.state, ...parsed };
      }
    }
  }

  private saveToStorage() {
    localStorage.setItem('preferences', JSON.stringify(this.state));
  }

  setTheme = (theme: 'light' | 'dark') => {
    this.state.theme = theme;
    this.saveToStorage();
  };
}
```

### React Integration

```typescript
// Use observer HOC for class components
import { observer } from 'mobx-react-lite';

export const UserProfile = observer(() => {
  const { authStore } = useStores();

  return (
    <div>
      {authStore.isAuthenticated && (
        <p>Welcome, {authStore.state.user?.username}</p>
      )}
    </div>
  );
});
```

### Critical Rules

- **Never use `runInAction`** inside action methods (already in action context)
- **Always use type guards** for localStorage data validation
- **Never make API calls** from MobX stores (use TanStack Query)
- **Use computed** for derived state, not methods
- **Direct mutation** is allowed inside actions (MobX handles reactivity)

### Dependencies

```json
{
  "mobx": "^6.13.0",
  "mobx-react-lite": "^4.0.0"
}
```

## Related Documentation

- [ADR-001: React 19 + TypeScript](./ADR-001-react-typescript.md) - Framework choice
- [ADR-003: TanStack Query for Server State](./ADR-003-tanstack-query-server-state.md) - Server state management
- [State Management Guide](./state-management.md) - Detailed patterns and examples
- [MobX Documentation](https://mobx.js.org/)
- [MobX React Documentation](https://mobx.js.org/react-integration.html)

---

**Date**: 14-02-2026  
**Author**: [idabblewith](https://github.com/idabblewith)
