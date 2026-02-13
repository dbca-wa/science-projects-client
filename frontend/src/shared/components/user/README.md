# Shared User Components

User-related components used by multiple features.

## Components

### BaseUserSearch

Base user search component with autocomplete functionality.

**Used by**: users, projects, caretakers features

**Props**:

- `onUserSelect: (user: IUserData) => void` - Callback when user selected
- `excludeUserIds?: number[]` - User IDs to exclude from search
- `placeholder?: string` - Input placeholder text
- `disabled?: boolean` - Disable the search input

**Example**:

```typescript
import { BaseUserSearch } from '@/shared/components/user';

<BaseUserSearch
  onUserSelect={(user) => console.log(user)}
  excludeUserIds={[1, 2, 3]}
  placeholder="Search for a user..."
/>
```

### UserSearchDropdown

Dropdown variant of user search.

**Used by**: projects, dashboard features

**Props**:

- `value?: number` - Selected user ID
- `onValueChange: (userId: number) => void` - Callback when selection changes
- `excludeUserIds?: number[]` - User IDs to exclude
- `placeholder?: string` - Placeholder text
- `disabled?: boolean` - Disable the dropdown

**Example**:

```typescript
import { UserSearchDropdown } from '@/shared/components/user';

<UserSearchDropdown
  value={selectedUserId}
  onValueChange={setSelectedUserId}
  placeholder="Select a user..."
/>
```

### UserDisplay

Display user information with avatar and details.

**Used by**: users, projects, caretakers, dashboard features

**Props**:

- `user: IUserData` - User data to display
- `showEmail?: boolean` - Show email address
- `size?: 'sm' | 'md' | 'lg'` - Display size

**Example**:

```typescript
import { UserDisplay } from '@/shared/components/user';

<UserDisplay user={user} showEmail={true} size="md" />
```

## Usage Guidelines

- Only add components used by 2+ features
- Keep components generic and reusable
- Document props and usage examples
- Maintain backward compatibility
- Test thoroughly before moving components here

## Adding New Components

Before adding a component to this directory, ask:

1. Is it used by 2+ features?
2. Is it user-related?
3. Is it generic enough to be reusable?

If yes to all three, it belongs here.
