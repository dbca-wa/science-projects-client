# Caretakers Feature

Frontend feature for managing caretaker relationships in the Science Projects Management System.

## Overview

The caretaker system allows users to temporarily manage projects and documents on behalf of other users who are on leave, have resigned, or are otherwise unavailable.

## Directory Structure

```
frontend/src/features/caretakers/
├── components/          # React components
├── hooks/               # Custom React hooks
├── services/            # API service functions
├── types/               # TypeScript type definitions
├── utils/               # Utility functions
├── schemas/             # Zod validation schemas
└── index.ts             # Feature exports
```

## Key Components

### CaretakerSection

Main section for managing caretaker relationships on user profile.

**Features:**

- Display active caretakers
- Display outgoing requests
- Display pending requests
- Request to become caretaker
- Remove caretaker relationships

### CaretakerTasksSection

Display caretaker tasks on dashboard.

**Features:**

- Group tasks by caretakee
- Show task counts
- Navigate to task details
- Visual indicators for acting as caretaker

### CaretakerApprovalModal

Modal for approving/rejecting caretaker tasks.

**Features:**

- Approve caretaker request
- Reject caretaker request
- Show caretaker details
- Validation and error handling

## Data Tables

- `AdminCaretakerTasksDataTable` - Admin caretaker tasks
- `CaretakerDocumentsDataTable` - Caretaker document tasks
- `CaretakerDocumentTasksDataTable` - Specific document tasks
- `CaretakerBusinessAreaDocumentsDataTable` - Business area document tasks
- `CaretakerDirectorateDocumentsDataTable` - Directorate document tasks
- `CaretakerProjectTeamDocumentsDataTable` - Project team document tasks

## Forms

### RequestCaretakerForm

Form for requesting to become a caretaker.

**Fields:**

- Caretaker (user search)
- Reason (textarea)
- Start date (optional)
- End date (optional)

**Validation:**

- Prevents circular relationships
- Validates date ranges
- Required fields

## Hooks

### Query Hooks

```typescript
// Get caretaker tasks for a user
const { data, isLoading } = useCaretakerTasks(userId);

// Get pending caretaker requests
const { data, isLoading } = usePendingCaretakerRequests(userId);

// Check if user can be caretaker
const { data } = useCaretakerCheck(caretakerId, userId);
```

### Mutation Hooks

```typescript
// Create caretaker request
const { mutate } = useRequestCaretaker();

// Approve caretaker request
const { mutate } = useApproveCaretakerTask();

// Reject caretaker request
const { mutate } = useRejectCaretakerTask();

// Remove caretaker relationship
const { mutate } = useRemoveCaretaker();

// Stop caretaking for a user
const { mutate } = useStopCaretaking();

// Cancel outgoing caretaker request
const { mutate } = useCancelBecomeCaretakerRequest();

// Respond to caretaker request
const { mutate } = useRespondToCaretakerRequest();
```

### Utility Hooks

```typescript
// Check caretaker permissions
const permissions = useCaretakerPermissions();
const canActForUser = permissions.canActForUser(userId);
const canEditDocument = permissions.canActAsProjectMember(project.members);
const canApproveDocument = permissions.canActAsProjectLead(project);

// Get caretaking chain for a user (for exclusion)
const chainIds = useCaretakingChain(user);
```

## Services

All services use the `/api/v1/caretakers/` endpoints:

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

## Validation

Zod schema for caretaker requests:

```typescript
import { requestCaretakerSchema } from "@/features/caretakers/schemas";

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
import { CaretakerSection } from '@/features/caretakers';

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
import { CaretakerTasksSection, useCaretakerTasks } from '@/features/caretakers';

const Dashboard = () => {
  const { data: user } = useCurrentUser();
  const { data: tasks, isLoading } = useCaretakerTasks(user?.id);

  if (!user?.caretaking_for?.length) return null;

  return <CaretakerTasksSection tasks={tasks} loading={isLoading} />;
};
```

### Request Caretaker

```typescript
import { useRequestCaretaker } from '@/features/caretakers';

const RequestCaretakerButton = ({ user }: { user: IUserData }) => {
  const { mutate, isPending } = useRequestCaretaker();

  const handleRequest = () => {
    mutate({
      user: user.id,
      caretaker: currentUser.id,
      reason: 'On leave for 2 weeks'
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
import { useCaretakerPermissions } from '@/features/caretakers';

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

- `@/features/dashboard/types` - Document and task types
- `@/features/dashboard/utils` - Document utilities
- `@/features/dashboard/constants` - Document constants
- `@/shared/components/user` - BaseUserSearch component

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

**Coverage:**

- Utility functions
- Custom hooks
- Service functions
- Component tests (via page tests)

### Page Tests

Caretaker components are tested via page tests:

- Dashboard page (caretaker tasks section)
- User profile page (caretaker section)
- Admin page (caretaker approval)

## Cache Invalidation

Invalidate caretaker queries when:

1. **Caretaking relationship changes:**

   ```typescript
   queryClient.invalidateQueries({ queryKey: ["caretakers"] });
   ```

2. **Document status changes:**

   ```typescript
   queryClient.invalidateQueries({ queryKey: ["caretakers", "tasks"] });
   ```

3. **Project changes:**
   ```typescript
   queryClient.invalidateQueries({ queryKey: ["caretakers", "tasks"] });
   ```

## Related Documentation

For more information, see the main project documentation.
