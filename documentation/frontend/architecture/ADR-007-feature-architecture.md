# ADR-007: Feature-Based Architecture

## Context

The SPMS frontend application required a scalable code organisation strategy that could:

- Support growing codebase with multiple features
- Enable clear boundaries between features
- Facilitate parallel development by multiple developers
- Make code easy to find and understand
- Support code reuse without tight coupling
- Enable feature-specific testing and deployment
- Reduce merge conflicts
- Support gradual refactoring

The original application used a type-based organisation (components/, hooks/, utils/, services/), which had several limitations:

- Difficult to find related code (scattered across directories)
- Unclear feature boundaries
- Tight coupling between features
- Difficult to understand feature scope
- Hard to remove or refactor features
- Merge conflicts in shared directories

During the refactor, we needed an organisation strategy that would scale with the application and support the migration from Chakra UI to Tailwind/shadcn.

## Decision

We will use **feature-based architecture** for organising code in the SPMS frontend application.

**Key principles:**

- Group code by feature, not by type
- Each feature contains its own components, hooks, services, and types
- Shared code lives in `shared/` directory
- Platform features (auth, users) can be imported by other features
- Domain features (projects, caretakers) are isolated
- Dashboard aggregates data from multiple features

**Directory structure:**

```
frontend/src/
├── app/stores/              # MobX stores
├── features/[feature]/      # Feature-specific code
│   ├── components/          # Feature components
│   ├── hooks/               # Feature hooks
│   ├── services/            # Feature API services
│   └── types/               # Feature types
├── pages/                   # Route pages
└── shared/                  # Cross-feature code
    ├── components/ui/       # shadcn components
    ├── hooks/queries/       # Shared TanStack Query hooks
    ├── services/            # Shared API services
    └── types/               # Shared types
```

## Consequences

### Positive Consequences

- **Clear Boundaries**: Each feature has clear scope and boundaries
- **Easy Navigation**: Related code is co-located
- **Scalability**: Easy to add new features without affecting existing ones
- **Parallel Development**: Multiple developers can work on different features
- **Feature Removal**: Easy to remove features by deleting directory
- **Testing**: Feature-specific tests are co-located
- **Code Reuse**: Shared code is explicit and intentional
- **Reduced Coupling**: Features are loosely coupled
- **Better Understanding**: Feature scope is immediately clear

### Negative Consequences

- **Learning Curve**: Developers need to understand feature boundaries
- **Duplication Risk**: Risk of duplicating code instead of sharing
- **Import Complexity**: Need to manage cross-feature imports carefully
- **Refactoring**: Moving code between features requires careful consideration
- **Shared Code Decision**: Need to decide when to move code to shared/

### Neutral Consequences

- **Directory Depth**: More nested directories than type-based organisation
- **Feature Definition**: Need to define what constitutes a feature
- **Shared vs Feature**: Need clear rules for shared vs feature code

## Alternatives Considered

### Type-Based Organisation

**Description**: Organise code by type (components/, hooks/, utils/, services/)

**Why not chosen**:

- Difficult to find related code
- Unclear feature boundaries
- Tight coupling between features
- Hard to understand feature scope
- Difficult to remove or refactor features
- Merge conflicts in shared directories

**Trade-offs**:

- Type-based is simpler for small applications
- More familiar to developers
- Flatter directory structure

### Domain-Driven Design (DDD)

**Description**: Organise code by business domain with strict boundaries

**Why not chosen**:

- Too complex for application size
- Requires more upfront planning
- Steeper learning curve
- Overkill for current requirements
- More suitable for microservices

**Trade-offs**:

- DDD provides stronger boundaries
- Better for large enterprise applications
- More formal architecture

### Layered Architecture

**Description**: Organise code by technical layer (presentation, business, data)

**Why not chosen**:

- Doesn't align with React component model
- Difficult to co-locate related code
- More suitable for backend applications
- Unclear feature boundaries

**Trade-offs**:

- Layered architecture has clear technical separation
- Better for traditional MVC applications
- More formal structure

### Monolithic Structure

**Description**: Keep all code in flat structure without organisation

**Why not chosen**:

- Doesn't scale beyond small applications
- Difficult to navigate
- No clear boundaries
- High coupling
- Merge conflicts

**Trade-offs**:

- Monolithic is simplest for tiny applications
- No organisation overhead
- Fastest initial development

## Implementation Notes

### Feature Classification

**Platform Features** (can be imported by other features):

- `auth/` - Authentication and authorisation
- `users/` - User management and search

**Domain Features** (isolated, business logic):

- `projects/` - Project management
- `caretakers/` - Caretaker system
- `documents/` - Document management
- `communications/` - Comments and messages

**Special Cases**:

- `dashboard/` - Aggregation layer (can import from any feature)
- `pages/` - Composition layer (can import from any feature)

### Feature Structure

```
features/projects/
├── components/
│   ├── ProjectCard.tsx
│   ├── ProjectForm.tsx
│   └── ProjectList.tsx
├── hooks/
│   ├── useProjects.ts
│   ├── useProject.ts
│   └── useUpdateProject.ts
├── services/
│   └── projects.service.ts
├── types/
│   └── project.types.ts
└── index.ts  # Public API
```

### Cross-Feature Import Rules

**✅ Acceptable:**

- Platform features (auth, users)
- Shared types (contracts)
- Query hooks (data fetching)
- Dashboard aggregation

**⚠️ Move to Shared:**

- Components used by 2+ features
- Hooks used by 2+ features
- Utilities used by 2+ features

**❌ Not Acceptable:**

- Domain feature components
- Business logic from other features
- Circular dependencies

### Decision Tree

```
Need to import from another feature?
│
├─ Is it auth or users (platform)? ────────────────→ ✅ OK
│
├─ Is it a type/interface (contract)? ─────────────→ ✅ OK
│
├─ Is it a query hook (data fetching)? ────────────→ ✅ OK
│
├─ Am I in dashboard (aggregation)? ───────────────→ ✅ OK
│
├─ Is it used by 2+ features? ─────────────────────→ ⚠️ Move to shared
│
└─ Otherwise ──────────────────────────────────────→ ❌ Refactor
```

### Shared Components

Location: `shared/components/`

**When to create shared components:**

1. Used by 2+ features
2. Generic and reusable
3. No feature-specific logic

**Examples:**

- `BaseUserSearch` - Used by projects, caretakers, users
- `UserDisplay` - Used by multiple features
- `DataTable` - Generic table component

### Public API Pattern

```typescript
// features/projects/index.ts
// Export only public API
export { useProjects, useProject, useUpdateProject } from "./hooks";
export type { IProject, IProjectFilters } from "./types";

// Don't export internal components
// Internal components are implementation details
```

### Migration Strategy

1. **Identify features**: List all features in application
2. **Create feature directories**: Set up directory structure
3. **Move code incrementally**: Move one feature at a time
4. **Update imports**: Fix import paths after moving
5. **Identify shared code**: Move code used by 2+ features to shared/
6. **Test thoroughly**: Ensure no broken imports

### Code Location Decision

```
New code to add?
│
├─ Is it a React component?
│   ├─ Used by 2+ features? ──────────→ shared/components/
│   ├─ UI component (button, input)? ─→ shared/components/ui/
│   └─ Feature-specific? ─────────────→ features/[feature]/components/
│
├─ Is it a custom hook?
│   ├─ Used by 2+ features? ──────────→ shared/hooks/
│   ├─ TanStack Query hook? ──────────→ features/[feature]/hooks/
│   └─ Feature-specific? ─────────────→ features/[feature]/hooks/
│
├─ Is it a utility function?
│   ├─ Used by 2+ features? ──────────→ shared/utils/
│   └─ Feature-specific? ─────────────→ features/[feature]/utils/
│
├─ Is it a type/interface?
│   ├─ Used by 2+ features? ──────────→ shared/types/
│   └─ Feature-specific? ─────────────→ features/[feature]/types/
│
└─ Is it a MobX store?
    └─ Always ────────────────────────→ app/stores/
```

## Related Documentation

- [ADR-001: React 19 + TypeScript](./ADR-001-react-typescript.md) - Framework choice
- [Component Organisation Guide](./component-organisation.md) - Detailed organisation patterns

---

**Date**: 14-02-2026  
**Author**: [idabblewith](https://github.com/idabblewith)
