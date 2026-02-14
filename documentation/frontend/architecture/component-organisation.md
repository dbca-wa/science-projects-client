# Component Organisation Guide

## Overview

The SPMS frontend uses a feature-based architecture where code is organised by feature rather than by type. This approach provides clear boundaries, better scalability, and easier navigation.

## Directory Structure

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
    ├── components/
    │   ├── ui/              # shadcn components (DO NOT MODIFY)
    │   └── user/            # Shared user components
    ├── hooks/               # Shared hooks
    ├── services/            # Shared API services
    ├── types/               # Shared TypeScript types
    └── utils/               # Shared utilities
```

## Feature Classification

### Platform Features

Platform features provide foundational services and can be imported by other features.

**auth/** - Authentication & Authorisation

- Login, logout, session management
- CSRF token handling
- Permission checks
- Can be imported by: All features

**users/** - User Management

- User data, search, operations
- User profiles and preferences
- Can be imported by: All features

**Example**:

```typescript
// ✅ Any feature can import from auth or users
import { useAuth } from "@/features/auth";
import { useCurrentUser } from "@/features/users";
```

### Domain Features

Domain features contain business logic and should be isolated from each other.

**projects/** - Project Management

- Project CRUD operations
- Project workflows
- Should NOT be imported by: Other domain features
- Exception: Dashboard can import

**caretakers/** - Caretaker Management

- Caretaker relationships
- Approval workflows
- Should NOT be imported by: Other domain features
- Exception: Dashboard can import

**documents/** - Document Management

- Document upload and storage
- Document workflows
- Should NOT be imported by: Other domain features
- Exception: Dashboard can import

**communications/** - Comments and Messages

- Comments on projects
- Direct messages
- Chat rooms
- Should NOT be imported by: Other domain features
- Exception: Dashboard can import

### Special Cases

**dashboard/** - Aggregation Layer

- Aggregates data from multiple features
- Can import from: Any feature
- Purpose: Display combined information from multiple domains

**pages/** - Composition Layer

- Composes features into routes
- Can import from: Any feature
- Purpose: Route-level composition and layout

## Feature Structure

Each feature follows a consistent structure:

```
features/projects/
├── components/
│   ├── ProjectCard.tsx
│   ├── ProjectForm.tsx
│   ├── ProjectList.tsx
│   └── ProjectFilters.tsx
├── hooks/
│   ├── useProjects.ts
│   ├── useProject.ts
│   ├── useCreateProject.ts
│   ├── useUpdateProject.ts
│   └── useDeleteProject.ts
├── services/
│   └── projects.service.ts
├── types/
│   └── project.types.ts
└── index.ts  # Public API (optional)
```

### Feature Components

Components specific to a single feature:

```typescript
// features/projects/components/ProjectCard.tsx
import type { IProject } from '../types/project.types';

interface ProjectCardProps {
  project: IProject;
  onEdit?: (project: IProject) => void;
}

export function ProjectCard({ project, onEdit }: ProjectCardProps) {
  return (
    <div className="border rounded-lg p-4">
      <h3>{project.title}</h3>
      <p>{project.description}</p>
      {onEdit && (
        <button onClick={() => onEdit(project)}>Edit</button>
      )}
    </div>
  );
}
```

### Feature Hooks

TanStack Query hooks for API calls:

```typescript
// features/projects/hooks/useProjects.ts
import { useQuery } from "@tanstack/react-query";
import { getProjects } from "../services/projects.service";

export function useProjects() {
	return useQuery({
		queryKey: ["projects"],
		queryFn: getProjects,
		staleTime: 1 * 60_000, // 1 minute
	});
}
```

### Feature Services

API service functions:

```typescript
// features/projects/services/projects.service.ts
import { api } from "@/shared/services/api";
import type { IProject } from "../types/project.types";

export async function getProjects(): Promise<IProject[]> {
	const response = await api.get<IProject[]>("/api/v1/projects/list");
	return response.data;
}

export async function getProject(id: number): Promise<IProject> {
	const response = await api.get<IProject>(`/api/v1/projects/${id}`);
	return response.data;
}
```

### Feature Types

TypeScript type definitions:

```typescript
// features/projects/types/project.types.ts
export interface IProject {
	id: number;
	title: string;
	description: string;
	status: ProjectStatus;
	createdAt: string;
	updatedAt: string;
}

export type ProjectStatus = "active" | "completed" | "archived";
```

## Shared Components

Components used by 2+ features belong in `shared/components/`.

### Shared User Components

Location: `shared/components/user/`

**BaseUserSearch** - User search with autocomplete

```typescript
import { BaseUserSearch } from '@/shared/components/user';

<BaseUserSearch
  onUserSelect={(user) => handleSelect(user)}
  excludeUserIds={[1, 2, 3]}
  placeholder="Search for a user..."
/>
```

**UserSearchDropdown** - Dropdown variant

```typescript
import { UserSearchDropdown } from '@/shared/components/user';

<UserSearchDropdown
  value={selectedUserId}
  onValueChange={setSelectedUserId}
  placeholder="Select a user..."
/>
```

**UserDisplay** - User information display

```typescript
import { UserDisplay } from '@/shared/components/user';

<UserDisplay
  user={user}
  showEmail={true}
  size="md"
/>
```

### shadcn/ui Components

Location: `shared/components/ui/`

**DO NOT MODIFY** these components. They are owned by shadcn/ui.

```typescript
import { Button } from "@/shared/components/ui/button";
import { Dialog } from "@/shared/components/ui/dialog";
import { Input } from "@/shared/components/ui/input";
```

If you need to customise a shadcn component, create a wrapper:

```typescript
// shared/components/LoadingButton.tsx
import { Button } from '@/shared/components/ui/button';
import { Loader2 } from 'lucide-react';

interface LoadingButtonProps extends React.ComponentProps<typeof Button> {
  loading?: boolean;
}

export function LoadingButton({ loading, children, ...props }: LoadingButtonProps) {
  return (
    <Button disabled={loading} {...props}>
      {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {children}
    </Button>
  );
}
```

## Cross-Feature Imports

### Import Rules

#### ✅ ACCEPTABLE

**1. Platform Features**

```typescript
// Any feature can import from auth or users
import { useAuth } from "@/features/auth";
import { useCurrentUser } from "@/features/users";
import { IUserData } from "@/shared/types/user.types";
```

**2. Shared Types** (Contracts)

```typescript
// Types define contracts between features
import type { IProject } from "@/shared/types/project.types";
import type { IDocument } from "@/shared/types/document.types";
```

**3. Query Hooks** (Data Fetching)

```typescript
// TanStack Query hooks for API calls
import { useProjects } from "@/features/projects/hooks";
import { useUsers } from "@/features/users/hooks";
```

**4. Dashboard Aggregation**

```typescript
// Dashboard can import from any feature
import { useProjects } from "@/features/projects";
import { useCaretakerTasks } from "@/features/caretakers";
```

#### ⚠️ MOVE TO SHARED

If code is used by 2+ features, move it to shared:

```typescript
// ❌ BAD: Component in feature but used by 3+ features
import { BaseUserSearch } from "@/features/users/components";

// ✅ GOOD: Component moved to shared
import { BaseUserSearch } from "@/shared/components/user";
```

**When to move**:

- Components used by 2+ features
- Hooks used by 2+ features
- Utilities used by 2+ features
- Types used by 2+ features

#### ❌ NOT ACCEPTABLE

**1. Domain-to-Domain Imports**

```typescript
// ❌ BAD: Projects importing from caretakers
import { useCaretakers } from "@/features/caretakers";
```

**2. Internal Components**

```typescript
// ❌ BAD: Importing internal components
import { ProjectCard } from "@/features/projects/components";
```

**3. Business Logic**

```typescript
// ❌ BAD: Importing business logic
import { calculateProjectScore } from "@/features/projects/utils";
```

**4. Circular Dependencies**

```typescript
// ❌ BAD: Feature A imports Feature B, Feature B imports Feature A
```

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

## Code Location Decision

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
├─ Is it an API service?
│   ├─ Used by 2+ features? ──────────→ shared/services/
│   └─ Feature-specific? ─────────────→ features/[feature]/services/
│
└─ Is it a MobX store?
    └─ Always ────────────────────────→ app/stores/
```

## Examples

### Good Architecture

```typescript
// ✅ Platform import
import { useCurrentUser } from "@/features/users";

// ✅ Shared component
import { BaseUserSearch } from "@/shared/components/user";

// ✅ Shared type
import type { IUserData } from "@/shared/types/user.types";

// ✅ Dashboard aggregation
// In dashboard feature
import { useProjects } from "@/features/projects";
import { useCaretakerTasks } from "@/features/caretakers";
```

### Bad Architecture

```typescript
// ❌ Domain-to-domain import
import { ProjectCard } from "@/features/projects/components";

// ❌ Business logic import
import { calculateScore } from "@/features/projects/utils";

// ❌ Component should be in shared (if used by 3+ features)
import { UserSearch } from "@/features/users/components";
```

### Refactoring Example

**Before** (violation):

```typescript
// In features/caretakers/components/SomeComponent.tsx
import { BaseUserSearch } from "@/features/users/components";
```

**After** (fixed):

```typescript
// 1. Move BaseUserSearch to shared/components/user/
// 2. Update import
import { BaseUserSearch } from "@/shared/components/user";
```

## When to Create Shared Components

Ask these questions:

1. Is it used by 2+ features? → YES = shared
2. Is it generic and reusable? → YES = shared
3. Does it have feature-specific logic? → NO = shared

**Examples**:

✅ **Should be shared**:

- User search (used by projects, caretakers, users)
- Date picker (used by multiple features)
- Data table (used by multiple features)
- Loading button (used by multiple features)

❌ **Should NOT be shared**:

- Project-specific forms
- Caretaker-specific workflows
- Feature-specific business logic

## Public API Pattern

Optionally export a public API from features:

```typescript
// features/projects/index.ts
// Export only public API
export { useProjects, useProject, useUpdateProject } from "./hooks";
export type { IProject, IProjectFilters } from "./types";

// Don't export internal components
// Internal components are implementation details
```

This allows:

```typescript
// ✅ Import from feature public API
import { useProjects, type IProject } from "@/features/projects";

// Instead of:
import { useProjects } from "@/features/projects/hooks";
import type { IProject } from "@/features/projects/types";
```

## Related Documentation

- [ADR-007: Feature-Based Architecture](./ADR-007-feature-architecture.md) - Architecture decision record
- [Overview](./overview.md) - System architecture overview
