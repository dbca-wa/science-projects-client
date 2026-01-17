import { useParams, useNavigate } from "react-router";
import { observer } from "mobx-react-lite";
import { useUserDetail } from "@/features/users/hooks/useUserDetail";
import { PersonalInfoSection } from "@/features/users/components/PersonalInfoSection";
import { ProfileSection } from "@/features/users/components/ProfileSection";
import { MembershipSection } from "@/features/users/components/MembershipSection";
import { UserAdminActionButtons } from "@/features/users/components/UserAdminActionButtons";
import { Button } from "@/shared/components/ui/button";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { Alert, AlertDescription } from "@/shared/components/ui/alert";
import { ArrowLeft, AlertCircle, Edit } from "lucide-react";
import { Badge } from "@/shared/components/ui/badge";
import { useAuthStore } from "@/app/stores/useStore";
import { getUserDisplayName } from "@/shared/utils/user.utils";

/**
 * UserDetailPage
 * Displays detailed information about a single user
 * Features:
 * - Personal information
 * - Profile (avatar, about, expertise)
 * - Membership (branch, business area, affiliation)
 * - Back button navigation
 * - Admin-only edit button
 * - Loading and error states
 * - Responsive layout
 */
export const UserDetailPage = observer(() => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const authStore = useAuthStore();
  const userId = Number(id);

  const { data: user, isLoading, error } = useUserDetail(userId);

  const handleBack = () => {
    navigate("/users");
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="h-10 w-32 mb-8" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-96" />
          <Skeleton className="h-96" />
          <Skeleton className="h-64" />
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    // Type guard for API errors with status
    const apiError = error as { status?: number; message?: string };
    const errorMessage = 
      apiError.status === 404 
        ? "User not found" 
        : apiError.status === 403
        ? "You don't have permission to view this user"
        : "Failed to load user details";

    return (
      <div className="container mx-auto px-4 py-8">
        <Button variant="ghost" onClick={handleBack} className="mb-8">
          <ArrowLeft className="size-4 mr-2" />
          Back to Users
        </Button>
        <Alert variant="destructive">
          <AlertCircle className="size-4" />
          <AlertDescription>
            {errorMessage}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Not found state
  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Button variant="ghost" onClick={handleBack} className="mb-8">
          <ArrowLeft className="size-4 mr-2" />
          Back to Users
        </Button>
        <div className="text-center py-12">
          <p className="text-muted-foreground">User not found</p>
        </div>
      </div>
    );
  }

  const displayName = getUserDisplayName(user);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Back button */}
      <Button variant="ghost" onClick={handleBack} className="mb-8">
        <ArrowLeft className="size-4 mr-2" />
        Back to Users
      </Button>

      {/* Page header */}
      <div className="mb-8 flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold">{displayName}</h1>
            {/* Status badges */}
            <div className="flex gap-2">
              {user.is_superuser && (
                <Badge variant="destructive">Admin</Badge>
              )}
              {user.is_staff && (
                <Badge variant="default">Staff</Badge>
              )}
              {!user.is_staff && (
                <Badge variant="secondary">External</Badge>
              )}
              {!user.is_active && (
                <Badge variant="outline">Inactive</Badge>
              )}
            </div>
          </div>
          <p className="text-muted-foreground">
            View detailed information about this user
          </p>
        </div>

        {/* Edit button - admin only */}
        {authStore.isSuperuser && (
          <Button onClick={() => navigate(`/users/${userId}/edit`)}>
            <Edit className="size-4 mr-2" />
            Edit User
          </Button>
        )}
      </div>

      {/* Content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left column */}
        <div className="space-y-6">
          <PersonalInfoSection user={user} />
          <MembershipSection user={user} />
        </div>

        {/* Right column */}
        <div className="space-y-6">
          <ProfileSection user={user} />
          
          {/* Admin Actions - only show for superusers */}
          {authStore.isSuperuser && authStore.user && (
            <UserAdminActionButtons
              user={user}
              currentUserId={authStore.user.pk}
            />
          )}
        </div>
      </div>
    </div>
  );
});
