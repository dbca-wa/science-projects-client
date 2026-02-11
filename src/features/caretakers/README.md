# Caretakers Feature

Frontend feature for managing caretaker relationships in the Science Projects Management System.

## Overview

The caretaker system allows users to temporarily manage projects and documents on behalf of other users who are on leave, have resigned, or are otherwise unavailable. This feature provides the UI and logic for caretaker management.

## Directory Structure

```
frontend/src/features/caretakers/
├── components/          # React components
├── hooks/               # Custom React hooks
├── services/            # API service functions
├── types/               # TypeScript type definitions
├── utils/               # Utility functions
├── schemas/             # Zod validation schemas
├── index.ts             # Feature exports
└── README.md            # This file
```

## Components

### Core Components

#### CaretakerSection

Main section for managing caretaker relationships on user profile.

**Props**:

- `user`: Current user data

**Features**:

- Display active caretakers
- Display outgoing requests
- Display pending requests
- Request to become caretaker
- Remove caretaker relationships

#### CaretakerTasksSection

Display caretaker tasks on dashboard.

**Props**:

- `tasks`: Caretaker tasks data
- `loading`: Loading state

**Features**:

- Group tasks by caretakee
- Show task counts
- Navigate to task details
- Visual indicators for acting as caretaker

#### CaretakerApprovalModal

Modal for approving/rejecting caretaker tasks.

**Props**:

- `task`: Admin task data
- `open`: Modal open state
- `onOpenChange`: Open state change handler

**Features**:

- Approve caretaker request
- Reject caretaker request
- Show caretaker details
- Validation and error handling

### Data Table Components

#### AdminCaretakerTasksDataTable

Data table for admin caretaker tasks.

#### CaretakerDocumentsDataTable

Data table for caretaker document tasks.

#### CaretakerDocumentTasksDataTable

Data table for specific document tasks.

#### CaretakerBusinessAreaDocumentsDataTable

Data table for business area document tasks.

#### CaretakerDirectorateDocumentsDataTable

Data table for directorate document tasks.

#### CaretakerProjectTeamDocumentsDataTable

Data table for project team document tasks.

### Form Components

#### RequestCaretakerForm

Form for requesting to become a caretaker.

**Props**:

- `user`: User to caretake for
- `onSuccess`: Success callback

**Fields**:

- Caretaker (user search)
- Reason (textarea)
- Start date (optional)
- End date (optional)

**Validation**:

- Prevents circular relationships
- Validates date ranges
- Required fields

#### CaretakerUserSearch

User search component with caretaking chain exclusion.

**Props**:

- `onSelect`: User selection callback
- `excludeUserIds`: User IDs to exclude

### Display Components

#### ActiveCaretaker

Display active caretaker relationship.

**Props**:

- `caretaker`: Caretaker data
- `onRemove`: Remove callback

#### PendingCaretakerRequest

Display pending caretaker request.

**Props**:

- `request`: Request data
- `onApprove`: Approve callback
- `onReject`: Reject callback

#### OutgoingCaretakerRequest

Display outgoing caretaker request.

**Props**:

- `request`: Request data
- `onCancel`: Cancel callback

#### CaretakeeCell

Display caretakee information in data tables.

**Props**:

- `user`: User data

#### CaretakerTaskCard

Display caretaker task card.

**Props**:

- `task`: Task data
- `caretakee`: Caretakee data

## Hooks

### Query Hooks

#### useCaretakerTasks

Get caretaker tasks for a user.

```typescript
const { data, isLoading, error } = useCaretakerTasks(userId);
```

**Returns**:

- `all`: All tasks
- `by_caretakee`: Tasks grouped by caretakee

#### usePendingCaretakerRequests

Get pending caretaker requests for a user.

```typescript
const { data, isLoading } = usePendingCaretakerRequests(userId);
```

#### useCaretakerCheck

Check if user can be caretaker.

```typescript
const { data } = useCaretakerCheck(caretakerId, userId);
```

**Returns**:

- `can_be_caretaker`: Boolean
- `reason`: Reason if not eligible

### Mutation Hooks

#### useRequestCaretaker

Create caretaker request.

```typescript
const { mutate, isPending } = useRequestCaretaker();

mutate({
	user: 123,
	caretaker: 456,
	reason: "On leave",
});
```

#### useApproveCaretakerTask

Approve caretaker request.

```typescript
const { mutate } = useApproveCaretakerTask();

mutate(taskId);
```

#### useRejectCaretakerTask

Reject caretaker request.

```typescript
const { mutate } = useRejectCaretakerTask();

mutate(taskId);
```

#### useRemoveCaretaker

Remove caretaker relationship.

```typescript
const { mutate } = useRemoveCaretaker();

mutate(caretakerId);
```

#### useStopCaretaking

Stop caretaking for a user.

```typescript
const { mutate } = useStopCaretaking();

mutate(caretakerId);
```

#### useCancelBecomeCaretakerRequest

Cancel outgoing caretaker request.

```typescript
const { mutate } = useCancelBecomeCaretakerRequest();

mutate(taskId);
```

#### useRespondToCaretakerRequest

Respond to caretaker request (approve/reject).

```typescript
const { mutate } = useRespondToCaretakerRequest();

mutate({
	taskId: 123,
	action: "approve", // or "reject"
});
```

### Utility Hooks

#### useCaretakerPermissions

Check caretaker permissions.

```typescript
const permissions = useCaretakerPermissions();

// Check if can act for specific user
const canActForUser = permissions.canActForUser(userId);

// Check if can act as project member
const canEditDocument = permissions.canActAsProjectMember(project.members);

// Check if can act as project lead
const canApproveDocument = permissions.canActAsProjectLead(project);
```

#### useCaretakingChain

Get caretaking chain for a user (for exclusion).

```typescript
const chainIds = useCaretakingChain(user);

// Use in user search to prevent circular relationships
<UserSearch excludeUserIds={chainIds} />
```

## Services

### API Endpoints

All services use the new `/api/v1/caretakers/` endpoints:

```typescript
import {
	getCaretakerTasks,
	getPendingCaretakerRequests,
	getCaretakerCheck,
	requestCaretaker,
	removeCaretaker,
	cancelCaretakerRequest,
} from "@/features/caretakers/services";
```

### Query Keys

Centralized query key factory:

```typescript
export const caretakerKeys = {
	all: ["caretakers"] as const,
	lists: () => [...caretakerKeys.all, "list"] as const,
	list: (filters: string) => [...caretakerKeys.lists(), { filters }] as const,
	details: () => [...caretakerKeys.all, "detail"] as const,
	detail: (id: number) => [...caretakerKeys.details(), id] as const,
	tasks: (userId: number) => [...caretakerKeys.all, "tasks", userId] as const,
	requests: (userId: number) =>
		[...caretakerKeys.all, "requests", userId] as const,
	check: (caretakerId: number, userId: number) =>
		[...caretakerKeys.all, "check", caretakerId, userId] as const,
	permissions: (userId: number) =>
		[...caretakerKeys.all, "permissions", userId] as const,
};
```

## Types

### Core Types

```typescript
interface ICaretaker {
	id: number;
	user: IUserData;
	caretaker: IUserData;
	start_date: string;
	end_date: string | null;
	reason: string;
	created_at: string;
}

interface ICaretakee {
	id: number;
	display_first_name: string;
	display_last_name: string;
	email: string;
	avatar: string | null;
	caretaking_for?: ICaretakee[];
}

interface ICaretakerTask {
	id: number;
	document: IProjectDocument;
	project: IProject;
	caretakee: IUserData;
	approval_type: "project_lead" | "business_area_lead" | "directorate_lead";
	created_at: string;
}

interface ICaretakerTasksResponse {
	all: ICaretakerTask[];
	by_caretakee: Record<
		string,
		{
			user: IUserData;
			tasks: {
				project_lead: ICaretakerTask[];
				business_area_lead: ICaretakerTask[];
				directorate_lead: ICaretakerTask[];
			};
		}
	>;
}
```

### Request Types

```typescript
interface IRequestCaretakerData {
	user: number;
	caretaker: number;
	reason: string;
	start_date?: string;
	end_date?: string;
}

interface ICaretakerCheckResponse {
	can_be_caretaker: boolean;
	reason: string | null;
}
```

## Utilities

### isValidCaretaking

Check if caretaking relationship is valid and not expired.

```typescript
import { isValidCaretaking } from "@/features/caretakers/utils";

const isValid = isValidCaretaking(caretakee);
```

### hasNestedCaretakee

Check if user has nested caretakee.

```typescript
import { hasNestedCaretakee } from "@/features/caretakers/utils";

const hasNested = hasNestedCaretakee(caretakee, targetUserId);
```

### buildCaretakingChain

Build caretaking chain for a user.

```typescript
import { buildCaretakingChain } from "@/features/caretakers/utils";

const chainIds = buildCaretakingChain(user);
```

## Schemas

### Zod Validation

```typescript
import { requestCaretakerSchema } from "@/features/caretakers/schemas";

const schema = requestCaretakerSchema;

// Validates:
// - user (required number)
// - caretaker (required number)
// - reason (required string, min 10 chars)
// - start_date (optional date string)
// - end_date (optional date string, must be after start_date)
```

## Usage Examples

### Display Caretaker Section

```typescript
import { CaretakerSection } from "@/features/caretakers";

const UserProfile = () => {
  const { data: user } = useCurrentUser();

  return (
    <div>
      <h1>Profile</h1>
      <CaretakerSection user={user} />
    </div>
  );
};
```

### Display Caretaker Tasks

```typescript
import { CaretakerTasksSection, useCaretakerTasks } from "@/features/caretakers";

const Dashboard = () => {
  const { data: user } = useCurrentUser();
  const { data: tasks, isLoading } = useCaretakerTasks(user?.id);

  if (!user?.caretaking_for?.length) return null;

  return <CaretakerTasksSection tasks={tasks} loading={isLoading} />;
};
```

### Request Caretaker

```typescript
import { useRequestCaretaker } from "@/features/caretakers";

const RequestCaretakerButton = ({ user }: { user: IUserData }) => {
  const { mutate, isPending } = useRequestCaretaker();

  const handleRequest = () => {
    mutate({
      user: user.id,
      caretaker: currentUser.id,
      reason: "On leave for 2 weeks"
    });
  };

  return (
    <Button onClick={handleRequest} disabled={isPending}>
      Request to be Caretaker
    </Button>
  );
};
```

### Check Permissions

```typescript
import { useCaretakerPermissions } from "@/features/caretakers";

const DocumentActions = ({ document, project }: Props) => {
  const permissions = useCaretakerPermissions();

  const canEdit = permissions.canActAsProjectMember(project.members);
  const canApprove = permissions.canActAsProjectLead(project);

  return (
    <>
      {canEdit && <EditButton />}
      {canApprove && <ApproveButton />}
    </>
  );
};
```

## Dependencies

### Internal Dependencies

The caretaker feature depends on:

- `@/features/dashboard/types` - For document and task types
- `@/features/dashboard/utils` - For document utilities
- `@/features/dashboard/constants` - For document constants
- `@/shared/components/user` - For BaseUserSearch

This is intentional to avoid code duplication while maintaining feature organization.

### External Dependencies

- `@tanstack/react-query` - Data fetching and caching
- `react-hook-form` - Form management
- `zod` - Schema validation
- `lucide-react` - Icons
- `date-fns` - Date formatting

## Testing

### Unit Tests

```bash
bun run test caretakers
```

**Coverage**:

- ✅ Utility functions
- ✅ Custom hooks
- ✅ Service functions
- ⏳ Component tests (via page tests)

### Page Tests

Caretaker components are tested via page tests:

- Dashboard page (caretaker tasks section)
- User profile page (caretaker section)
- Admin page (caretaker approval)

## Cache Invalidation

Invalidate caretaker queries when:

1. **Caretaking relationship changes**:

   ```typescript
   queryClient.invalidateQueries({ queryKey: ["caretakers"] });
   ```

2. **Document status changes**:

   ```typescript
   queryClient.invalidateQueries({ queryKey: ["caretakers", "tasks"] });
   ```

3. **Project changes**:
   ```typescript
   queryClient.invalidateQueries({ queryKey: ["caretakers", "tasks"] });
   ```

## Related Documentation

- [Backend README](../../../../backend/caretakers/README.md)
- [API Documentation](../../../../.kiro/specs/caretaker-refactor/API_DOCUMENTATION.md)
- [Migration Guide](../../../../.kiro/specs/caretaker-refactor/MIGRATION_GUIDE.md)
- [Caretaker Permissions](../../../../.kiro/steering/caretaker-permissions.md)

## Migration Notes

This feature was extracted from:

- `frontend/src/features/dashboard/` (components, hooks, services)
- `frontend/src/features/users/` (types, hooks, components)
- `frontend/src/shared/` (hooks, utilities)

See [Migration Guide](../../../../.kiro/specs/caretaker-refactor/MIGRATION_GUIDE.md) for details.

---

**Created**: February 1, 2026  
**Author**: Kiro AI  
**Version**: 1.0
