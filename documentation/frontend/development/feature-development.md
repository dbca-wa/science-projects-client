# Feature Development Guide

## Overview

This guide outlines the workflow for developing new features in the Science Projects Management System frontend. It covers planning, implementation, testing, and code review processes.

## Feature Development Workflow

### 1. Planning Phase

Before writing code, understand the feature requirements:

**Questions to answer**:

- What problem does this feature solve?
- Who are the users of this feature?
- What are the acceptance criteria?
- Are there any dependencies on other features?
- Does this feature exist in the original app?

**Create a specification** (optional for complex features):

```markdown
# Feature: User Profile Management

## Requirements

- Users can view their profile
- Users can edit their profile information
- Changes are saved to the backend

## Acceptance Criteria

- [ ] Profile page displays user information
- [ ] Edit form validates input
- [ ] Success message shown on save
- [ ] Error handling for API failures
```

### 2. Feature Structure Setup

Create the feature directory structure:

```bash
# Create feature directory
mkdir -p frontend/src/features/[feature-name]

# Create subdirectories
cd frontend/src/features/[feature-name]
mkdir components hooks services types
```

**Example structure**:

```
frontend/src/features/user-profile/
├── components/
│   ├── ProfileView.tsx
│   ├── ProfileEditForm.tsx
│   └── AvatarUpload.tsx
├── hooks/
│   ├── useUserProfile.ts
│   └── useUpdateProfile.ts
├── services/
│   └── profile.service.ts
├── types/
│   └── profile.types.ts
└── index.ts
```

### 3. Implementation Phase

#### Step 1: Define Types

Start with TypeScript interfaces:

```typescript
// features/user-profile/types/profile.types.ts
export interface IUserProfile {
	id: number;
	username: string;
	email: string;
	firstName: string;
	lastName: string;
	avatar?: string;
	bio?: string;
}

export interface IUpdateProfileData {
	firstName?: string;
	lastName?: string;
	bio?: string;
}
```

#### Step 2: Create API Service

Implement API calls:

```typescript
// features/user-profile/services/profile.service.ts
import { api } from "@/shared/services/api";
import type { IUserProfile, IUpdateProfileData } from "../types/profile.types";

export async function getUserProfile(userId: number): Promise<IUserProfile> {
	const response = await api.get(`/api/v1/users/${userId}`);
	return response.data;
}

export async function updateUserProfile(
	userId: number,
	data: IUpdateProfileData,
): Promise<IUserProfile> {
	const response = await api.put(`/api/v1/users/${userId}`, data);
	return response.data;
}
```

#### Step 3: Create TanStack Query Hooks

Implement data fetching hooks:

```typescript
// features/user-profile/hooks/useUserProfile.ts
import { useQuery } from "@tanstack/react-query";
import { getUserProfile } from "../services/profile.service";

export function useUserProfile(userId: number) {
	return useQuery({
		queryKey: ["users", "detail", userId],
		queryFn: () => getUserProfile(userId),
		staleTime: 5 * 60_000, // 5 minutes
	});
}
```

```typescript
// features/user-profile/hooks/useUpdateProfile.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateUserProfile } from "../services/profile.service";
import { toast } from "sonner";

export function useUpdateProfile(userId: number) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (data: IUpdateProfileData) =>
			updateUserProfile(userId, data),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: ["users", "detail", userId],
			});
			toast.success("Profile updated successfully");
		},
		onError: (error: Error) => {
			toast.error(error.message || "Failed to update profile");
		},
	});
}
```

#### Step 4: Create Components

Build UI components:

```typescript
// features/user-profile/components/ProfileView.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/shared/components/ui/avatar';
import type { IUserProfile } from '../types/profile.types';

interface ProfileViewProps {
  profile: IUserProfile;
  onEdit?: () => void;
}

export function ProfileView({ profile, onEdit }: ProfileViewProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4">
          <Avatar className="h-20 w-20">
            <AvatarImage src={profile.avatar} alt={profile.username} />
            <AvatarFallback>
              {profile.firstName[0]}{profile.lastName[0]}
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="text-lg font-semibold">
              {profile.firstName} {profile.lastName}
            </h3>
            <p className="text-sm text-muted-foreground">@{profile.username}</p>
          </div>
        </div>
        {profile.bio && (
          <p className="mt-4 text-sm">{profile.bio}</p>
        )}
        {onEdit && (
          <Button onClick={onEdit} className="mt-4">
            Edit Profile
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
```

```typescript
// features/user-profile/components/ProfileEditForm.tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Textarea } from '@/shared/components/ui/textarea';
import { useUpdateProfile } from '../hooks/useUpdateProfile';
import type { IUserProfile } from '../types/profile.types';

const profileSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  bio: z.string().optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

interface ProfileEditFormProps {
  profile: IUserProfile;
  onSuccess?: () => void;
}

export function ProfileEditForm({ profile, onSuccess }: ProfileEditFormProps) {
  const updateProfile = useUpdateProfile(profile.id);

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: profile.firstName,
      lastName: profile.lastName,
      bio: profile.bio || '',
    },
  });

  const onSubmit = async (data: ProfileFormData) => {
    await updateProfile.mutateAsync(data);
    onSuccess?.();
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label htmlFor="firstName">First Name</label>
        <Input
          id="firstName"
          {...form.register('firstName')}
          error={form.formState.errors.firstName?.message}
        />
      </div>

      <div>
        <label htmlFor="lastName">Last Name</label>
        <Input
          id="lastName"
          {...form.register('lastName')}
          error={form.formState.errors.lastName?.message}
        />
      </div>

      <div>
        <label htmlFor="bio">Bio</label>
        <Textarea
          id="bio"
          {...form.register('bio')}
          rows={4}
        />
      </div>

      <Button type="submit" disabled={updateProfile.isPending}>
        {updateProfile.isPending ? 'Saving...' : 'Save Changes'}
      </Button>
    </form>
  );
}
```

#### Step 5: Create Page

Compose components into a page:

```typescript
// pages/users/UserProfilePage.tsx
import { useState } from 'react';
import { useParams } from 'react-router';
import { useUserProfile } from '@/features/user-profile/hooks/useUserProfile';
import { ProfileView } from '@/features/user-profile/components/ProfileView';
import { ProfileEditForm } from '@/features/user-profile/components/ProfileEditForm';
import { Dialog, DialogContent } from '@/shared/components/ui/dialog';

export function UserProfilePage() {
  const { userId } = useParams<{ userId: string }>();
  const [isEditing, setIsEditing] = useState(false);

  const { data: profile, isLoading, error } = useUserProfile(Number(userId));

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (!profile) return <div>Profile not found</div>;

  return (
    <div className="container mx-auto py-8">
      <ProfileView profile={profile} onEdit={() => setIsEditing(true)} />

      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent>
          <ProfileEditForm
            profile={profile}
            onSuccess={() => setIsEditing(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
```

#### Step 6: Add Route

Register the page in the router:

```typescript
// app/router.tsx
import { createBrowserRouter } from 'react-router';
import { UserProfilePage } from '@/pages/users/UserProfilePage';

export const router = createBrowserRouter([
  // ... other routes
  {
    path: '/users/:userId',
    element: <UserProfilePage />,
  },
]);
```

### 4. Testing Phase

#### Write Unit Tests

Test services, hooks, and utilities:

```typescript
// features/user-profile/services/profile.service.test.ts
import { describe, it, expect, vi } from "vitest";
import { getUserProfile, updateUserProfile } from "./profile.service";
import { api } from "@/shared/services/api";

vi.mock("@/shared/services/api");

describe("profile.service", () => {
	it("should fetch user profile", async () => {
		const mockProfile = { id: 1, username: "test" };
		vi.mocked(api.get).mockResolvedValue({ data: mockProfile });

		const result = await getUserProfile(1);

		expect(api.get).toHaveBeenCalledWith("/api/v1/users/1");
		expect(result).toEqual(mockProfile);
	});
});
```

#### Write Page Tests

Test user flows and accessibility:

```typescript
// pages/users/UserProfilePage.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import { UserProfilePage } from './UserProfilePage';
import { TestWrapper } from '@/test/TestWrapper';

expect.extend(toHaveNoViolations);

describe('UserProfilePage', () => {
  it('should display user profile', async () => {
    render(
      <TestWrapper>
        <UserProfilePage />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });
  });

  it('should open edit dialog on edit button click', async () => {
    const user = userEvent.setup();

    render(
      <TestWrapper>
        <UserProfilePage />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Edit Profile')).toBeInTheDocument();
    });

    await user.click(screen.getByText('Edit Profile'));

    expect(screen.getByLabelText('First Name')).toBeInTheDocument();
  });

  it('should have no accessibility violations', async () => {
    const { container } = render(
      <TestWrapper>
        <UserProfilePage />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
```

#### Run Tests

```bash
# Run all tests
bun run test

# Run tests for specific feature
bun run test src/features/user-profile

# Run with coverage
bun run test:coverage
```

### 5. Code Review Phase

#### Self-Review Checklist

Before submitting for review:

- [ ] Code follows style guide
- [ ] All tests pass
- [ ] Coverage meets thresholds
- [ ] No TypeScript errors
- [ ] No ESLint warnings
- [ ] Accessibility tested
- [ ] Responsive design tested
- [ ] Error states handled
- [ ] Loading states handled
- [ ] Success messages shown
- [ ] Documentation updated

#### Create Pull Request

```bash
# Create feature branch
git checkout -b feature/user-profile-management

# Commit changes
git add .
git commit -m "feat: Add user profile management feature"

# Push to remote
git push origin feature/user-profile-management
```

**Pull Request Template**:

```markdown
## Description

Add user profile management feature allowing users to view and edit their profiles.

## Changes

- Add ProfileView component
- Add ProfileEditForm component
- Add useUserProfile and useUpdateProfile hooks
- Add profile service functions
- Add UserProfilePage
- Add unit and page tests

## Testing

- [ ] Unit tests pass
- [ ] Page tests pass
- [ ] Accessibility tests pass
- [ ] Manual testing completed

## Screenshots

[Add screenshots of the feature]

## Related Issues

Closes #123
```

#### Code Review Guidelines

**For reviewers**:

- Check code quality and style
- Verify tests are comprehensive
- Test the feature manually
- Check accessibility
- Verify responsive design
- Review error handling
- Check for security issues

**For authors**:

- Respond to feedback promptly
- Make requested changes
- Re-request review after changes
- Thank reviewers for their time

### 6. Deployment Phase

#### Pre-Deployment Checklist

- [ ] All tests pass in CI/CD
- [ ] Code review approved
- [ ] No merge conflicts
- [ ] Documentation updated
- [ ] Changelog updated

#### Merge to Main

```bash
# Merge via GitHub UI or command line
git checkout main
git pull origin main
git merge feature/user-profile-management
git push origin main
```

#### Monitor Deployment

- Check CI/CD pipeline
- Verify deployment to staging
- Test in staging environment
- Monitor for errors
- Verify in production after deployment

## Feature Organisation

### Platform vs Domain Features

**Platform Features** (can be imported by other features):

- `auth/` - Authentication and authorisation
- `users/` - User management

**Domain Features** (isolated):

- `projects/` - Project management
- `caretakers/` - Caretaker system
- `user-profile/` - User profile management

### Cross-Feature Imports

#### ✅ Acceptable Imports

```typescript
// Platform features
import { useAuth } from "@/features/auth";
import { useCurrentUser } from "@/features/users";

// Shared types
import type { IUserData } from "@/shared/types/user.types";

// Query hooks
import { useProjects } from "@/features/projects/hooks";
```

#### ❌ Not Acceptable Imports

```typescript
// Domain feature components
import { ProjectCard } from "@/features/projects/components";

// Business logic from other features
import { calculateProjectScore } from "@/features/projects/utils";
```

### When to Move Code to Shared

If code is used by 2+ features, move it to `shared/`:

```typescript
// ❌ BAD: Component in feature but used by 3+ features
import { BaseUserSearch } from "@/features/users/components";

// ✅ GOOD: Component moved to shared
import { BaseUserSearch } from "@/shared/components/user";
```

## Common Patterns

### Loading States

```typescript
export function MyComponent() {
  const { data, isLoading, error } = useQuery(...);

  if (isLoading) {
    return <Skeleton />;
  }

  if (error) {
    return <ErrorMessage error={error} />;
  }

  return <div>{/* Render data */}</div>;
}
```

### Error Handling

```typescript
const mutation = useMutation({
	mutationFn: updateData,
	onSuccess: () => {
		toast.success("Updated successfully");
	},
	onError: (error: Error) => {
		toast.error(error.message || "Update failed");
	},
});
```

### Form Validation

```typescript
const schema = z.object({
	email: z.string().email("Invalid email"),
	password: z.string().min(8, "Password must be at least 8 characters"),
});

const form = useForm({
	resolver: zodResolver(schema),
});
```

### Responsive Design

```typescript
// Prefer Tailwind classes
<div className="px-4 md:px-8 lg:px-12">

// Use programmatic only when necessary
const { width } = useWindowSize();
const isMobile = width < BREAKPOINTS.sm;
```

## Best Practices

### State Management

- **MobX**: Client state only (UI, auth, preferences)
- **TanStack Query**: ALL API calls and server data
- **MobX stores NEVER make API calls**

### Component Composition

- Keep components small and focused
- Compose complex UIs from simple components
- Use composition over inheritance

### Performance

- Use React.memo for expensive components
- Use useMemo for expensive calculations
- Use useCallback for event handlers passed to children
- Set appropriate staleTime for queries

### Accessibility

- Use semantic HTML
- Add ARIA labels where needed
- Test with keyboard navigation
- Test with screen readers
- Run axe accessibility tests

## Troubleshooting

### Common Issues

**Issue**: TypeScript errors after adding new types
**Solution**: Restart TypeScript server in VS Code

**Issue**: Tests failing with "Cannot find module"
**Solution**: Check import paths and ensure files exist

**Issue**: Query not refetching after mutation
**Solution**: Invalidate query in mutation's onSuccess

**Issue**: Component not re-rendering with MobX
**Solution**: Wrap component with observer()

**Issue**: Styles not applying
**Solution**: Check Tailwind class names and ensure they're not purged

## Related Documentation

- [Getting Started](./getting-started.md) - Setup and installation
- [Code Style Guide](./code-style.md) - Code style standards
- [Testing Guide](./testing-guide.md) - Testing practices
- [Architecture Overview](../architecture/overview.md) - System architecture
- [Component Organisation](../architecture/component-organisation.md) - Feature organisation

## External Resources

- [React Documentation](https://react.dev/)
- [TanStack Query Documentation](https://tanstack.com/query/latest)
- [MobX Documentation](https://mobx.js.org/)
- [React Hook Form Documentation](https://react-hook-form.com/)
- [Zod Documentation](https://zod.dev/)

---

**Date**: 13-02-2026  
**Author**: [idabblewith](https://github.com/idabblewith)
