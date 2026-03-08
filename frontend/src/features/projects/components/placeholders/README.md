# Placeholder Components

## Purpose

These placeholder components are **temporary** visual indicators for features that are currently being implemented. They serve to:

1. **Make missing features visible** to users and developers
2. **Show work in progress** without blocking other development
3. **Provide context** about what the feature will do
4. **Display current state** (read-only preview of backend data)

## Components

### MethodologyImagePlaceholder

- **Purpose**: Placeholder for methodology diagram image upload
- **Features being implemented**:
  - Image upload with drag-and-drop
  - Image compression (max 3MB, 1920px)
  - Preview and delete functionality
  - Progress bar during upload
- **Backend field**: `projectPlan.methodology_image`

### ProjectPlanEndorsementsPlaceholder

- **Purpose**: Placeholder for Animal Ethics Committee endorsement workflow
- **Features being implemented**:
  - AEC endorsement required checkbox
  - AEC endorsement provided status
  - PDF approval document upload/view/delete
  - Permission-based editing
  - Save button with validation
- **Backend fields**: `projectPlan.endorsements.ae_endorsement_*`

## Removal Timeline

These placeholders should be **removed** once the full components are implemented:

1. `MethodologyImage.tsx` replaces `MethodologyImagePlaceholder.tsx`
2. `ProjectPlanEndorsements.tsx` replaces `ProjectPlanEndorsementsPlaceholder.tsx`

## Shared Placeholder

### CommentSectionPlaceholder

- **Location**: `monorepo/frontend/src/shared/components/documents/`
- **Purpose**: Placeholder for document comment system
- **Used by**: Concept Plan, Project Plan, Project Closure tabs
- **Features being implemented**:
  - View existing comments
  - Add/edit/delete comments
  - User avatars and timestamps
  - Markdown support (possibly)

---

**Note**: These are NOT production components. They are development aids to show progress and maintain visibility of missing features.
