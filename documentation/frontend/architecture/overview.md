# Frontend Architecture Overview

## System Architecture

The Science Projects Management System (SPMS) frontend is a modern React application built with TypeScript, following a feature-based architecture pattern. The application provides a responsive, accessible interface for managing scientific projects, caretakers, users, and related workflows.

## Technology Stack

### Core Framework

- **React 19** - UI library with modern features (automatic batching, transitions, suspense)
- **TypeScript 5.6+** - Type-safe JavaScript with strict mode enabled
- **Vite 6** - Fast build tool and development server

### State Management

- **MobX 6** - Reactive client state management (UI, auth, preferences)
- **TanStack Query 5** - Server state management (API calls, caching, invalidation)

### Styling

- **Tailwind CSS v4** - Utility-first CSS framework
- **shadcn/ui** - Accessible component library built on Radix UI primitives
- **Radix UI** - Unstyled, accessible component primitives

### Routing

- **React Router** - Client-side routing with Data Mode

### Testing

- **Vitest 2** - Fast, Vite-native testing framework
- **React Testing Library** - Component testing utilities
- **jest-axe** - Accessibility testing

### Development Tools

- **Bun** - Fast package manager and test runner
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **TypeScript** - Type checking

## Architectural Patterns

### State Management Separation

The application strictly separates client state from server state:

**Client State (MobX)**:

- UI state (sidebar open/closed, modal visibility)
- Authentication state (current user, permissions)
- User preferences (theme, saved searches)
- Local caching (recently viewed items)

**Server State (TanStack Query)**:

- API data fetching
- Response caching
- Cache invalidation
- Optimistic updates
- Loading and error states

**Critical Rule**: MobX stores NEVER make API calls. All API interactions go through TanStack Query.

### Feature-Based Architecture

Code is organised by feature, not by type:

```
frontend/src/
├── app/stores/              # MobX stores (client state)
├── features/
│   ├── auth/                # Platform: Authentication
│   ├── users/               # Platform: User management
│   ├── projects/            # Domain: Project management
│   ├── caretakers/          # Domain: Caretaker system
│   ├── documents/           # Domain: Document management
│   ├── communications/      # Domain: Comments and messages
│   └── dashboard/           # Aggregation: Multi-feature views
├── pages/                   # Route pages (composition layer)
└── shared/                  # Cross-feature code
    ├── components/ui/       # shadcn components
    ├── components/user/     # Shared user components
    ├── hooks/               # Shared hooks
    ├── services/            # Shared API services
    ├── types/               # Shared TypeScript types
    └── utils/               # Shared utilities
```

**Feature Classification**:

- **Platform Features** (auth, users): Can be imported by other features
- **Domain Features** (projects, caretakers): Isolated business logic
- **Dashboard**: Aggregation layer that can import from any feature

### Component Organisation

**Shared Components**:

- Used by 2+ features
- Located in `shared/components/`
- Examples: BaseUserSearch, UserDisplay, DataTable

**Feature Components**:

- Used by single feature
- Located in `features/[feature]/components/`
- Examples: ProjectCard, CaretakerForm

**UI Components**:

- shadcn/ui components
- Located in `shared/components/ui/`
- DO NOT MODIFY (owned by shadcn)

### Cross-Feature Import Rules

**✅ Acceptable**:

- Platform features (auth, users)
- Shared types (contracts between features)
- Query hooks (data fetching)
- Dashboard aggregation

**⚠️ Move to Shared**:

- Components used by 2+ features
- Hooks used by 2+ features
- Utilities used by 2+ features

**❌ Not Acceptable**:

- Domain feature components
- Business logic from other features
- Circular dependencies

## Key Architectural Decisions

The following Architectural Decision Records (ADRs) document major technology and pattern choices:

1. [ADR-001: React 19 + TypeScript](./ADR-001-react-typescript.md) - Framework and language choice
2. [ADR-002: MobX for Client State](./ADR-002-mobx-client-state.md) - Client state management
3. [ADR-003: TanStack Query for Server State](./ADR-003-tanstack-query-server-state.md) - Server state management
4. [ADR-004: Vite Build Tool](./ADR-004-vite-build-tool.md) - Build tooling selection
5. [ADR-005: Tailwind CSS + shadcn/ui](./ADR-005-tailwind-shadcn.md) - Styling approach
6. [ADR-006: Vitest Testing Framework](./ADR-006-vitest-testing.md) - Testing framework choice
7. [ADR-007: Feature-Based Architecture](./ADR-007-feature-architecture.md) - Code organisation pattern
8. [ADR-008: Web Workers and CSP](./ADR-008-web-workers-csp.md) - Web Workers strategy and security

## Security

### Content Security Policy (CSP)

The application uses strict Content Security Policy headers to prevent XSS attacks:

**Production CSP**:

- `default-src 'self'` - Only load resources from same origin
- `script-src 'self'` - Only execute scripts from same origin
- `style-src 'self' 'unsafe-inline'` - Allow inline styles (required for Tailwind)
- `img-src 'self' data: https:` - Allow images from same origin, data URIs, and HTTPS
- `font-src 'self' data:` - Allow fonts from same origin and data URIs
- `connect-src 'self'` - Only connect to same origin APIs

**Web Workers**: Currently disabled for security and simplicity. See [ADR-008](./ADR-008-web-workers-csp.md) for details.

### Authentication

- **CSRF Protection**: Django CSRF tokens for all mutations
- **Session Management**: HttpOnly cookies for session storage
- **Token Validation**: CSRF token checked on every API call

### XSS Prevention

- **DOMPurify**: Sanitises user-generated HTML content
- **React**: Automatic XSS protection through JSX escaping
- **CSP**: Prevents inline script execution

## Performance Optimisations

### Code Splitting

- **Route-based splitting**: Each route is a separate chunk
- **Vendor splitting**: React, MobX, TanStack Query in separate chunks
- **Manual chunks**: UI libraries and utilities in dedicated chunks

### Caching Strategy

**TanStack Query Stale Times**:

- Static data (branches, categories): 10 minutes
- Semi-static data (users, agencies): 5 minutes
- Dynamic data (projects, documents): 1 minute
- Real-time data (notifications): 0 seconds (always fresh)

### Memoisation

- **React.memo**: Prevent unnecessary component re-renders
- **useMemo**: Cache expensive calculations
- **useCallback**: Stable function references
- **MobX computed**: Cached derived state

### Bundle Optimisation

- **Tree shaking**: Remove unused code
- **Minification**: Compress JavaScript and CSS
- **Source maps**: Separate source maps for debugging
- **Lazy loading**: Load routes and heavy components on demand

## Testing Strategy

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

**No Component Tests**: Components are tested via page tests to avoid duplicate testing.

### Test Coverage

**Minimum Thresholds**:

- Lines: 80%
- Functions: 80%
- Branches: 75%
- Statements: 80%

**Excluded from Coverage**:

- shadcn/ui components (third-party)
- Test files
- Type definitions
- Mock data

## Development Workflow

### Local Development

```bash
# Install dependencies
bun install

# Start development server
bun run dev

# Run tests
bun run test

# Run tests in watch mode
bun run test:watch

# Type checking
bun run type-check

# Linting
bun run lint

# Format code
bun run format
```

### Build and Deployment

```bash
# Build for production
bun run build

# Preview production build
bun run preview

# Run tests with coverage
bun run test:coverage
```

### Pre-commit Checks

Automated checks run before each commit:

- ESLint (code quality)
- Prettier (code formatting)
- TypeScript (type checking)
- Tests (unit and page tests)

## Migration Context

The current frontend is a refactor from the original Chakra UI application to Tailwind CSS and shadcn/ui. The refactor maintains feature parity whilst improving:

- **Performance**: No runtime CSS-in-JS overhead
- **Bundle Size**: Smaller production bundles
- **Flexibility**: Full control over component styling
- **Architecture**: Feature-based organisation
- **State Management**: Clear separation of client and server state

## Related Documentation

- [State Management Guide](./state-management.md) - Detailed MobX and TanStack Query patterns
- [Component Organisation Guide](./component-organisation.md) - Feature structure and import rules
- [Development Guide](../development/README.md) - Development workflow and standards
- [Performance Guide](../performance/README.md) - Performance optimisation strategies
- [Deployment Guide](../../general/deployment/README.md) - Build and deployment configuration

## External Resources

- [React Documentation](https://react.dev/)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [MobX Documentation](https://mobx.js.org/)
- [TanStack Query Documentation](https://tanstack.com/query/latest)
- [Vite Documentation](https://vitejs.dev/)
- [Tailwind CSS Documentation](https://tailwindcss.com/)
- [shadcn/ui Documentation](https://ui.shadcn.com/)
- [Vitest Documentation](https://vitest.dev/)
