import { useNavigate, useParams } from "react-router";
import { Button } from "@/shared/components/ui/button";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { Alert, AlertDescription } from "@/shared/components/ui/alert";
import { ArrowLeft, AlertCircle } from "lucide-react";
import { useUserDetail } from "@/features/users/hooks/useUserDetail";
import { UserForm } from "@/features/users/components/UserForm";
import { getUserDisplayName } from "@/shared/utils/user.utils";

/**
 * UserEditPage
 * Page for editing an existing user (admin only)
 * 
 * Features:
 * - Admin-only access (protected by route guard)
 * - User edit form with pre-populated data
 * - Cancel navigation back to user detail
 * - Loading and error states
 */
export const UserEditPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const userId = Number(id);

  const { data: user, isLoading, error } = useUserDetail(userId);

  const handleCancel = () => {
    navigate(`/users/${id}`);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Skeleton className="h-10 w-32 mb-8" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  // Error state
  if (error) {
    const apiError = error as { status?: number; message?: string };
    const errorMessage = 
      apiError.status === 404 
        ? "User not found" 
        : apiError.status === 403
        ? "You don't have permission to edit this user"
        : "Failed to load user details";

    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Button variant="ghost" onClick={handleCancel} className="mb-8">
          <ArrowLeft className="size-4 mr-2" />
          Back to User
        </Button>
        <Alert variant="destructive">
          <AlertCircle className="size-4" />
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      </div>
    );
  }

  // Not found state
  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Button variant="ghost" onClick={handleCancel} className="mb-8">
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
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Back button */}
      <Button variant="ghost" onClick={handleCancel} className="mb-8">
        <ArrowLeft className="size-4 mr-2" />
        Back to User
      </Button>

      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Edit User</h1>
        <p className="text-muted-foreground">
          Update information for {displayName}
        </p>
      </div>

      {/* User Form */}
      <UserForm mode="edit" userId={userId} onCancel={handleCancel} />
    </div>
  );
};
