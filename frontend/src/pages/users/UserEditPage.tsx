import { useNavigate, useParams } from "react-router";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { Alert, AlertDescription } from "@/shared/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { Breadcrumb } from "@/shared/components/Breadcrumb";
import { useUserDetail } from "@/features/users/hooks/useUserDetail";
import { UserEditForm } from "@/features/users/components/UserEditForm";
import { getUserDisplayName } from "@/shared/utils/user.utils";

/**
 * UserEditPage
 * Page for editing an existing user (admin only)
 * 
 * Features:
 * - Admin-only access (protected by route guard)
 * - User edit form with pre-populated data
 * - Breadcrumb navigation
 * - Loading and error states
 */
const UserEditPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const userId = Number(id);

  const { data: user, isLoading, error } = useUserDetail(userId);

  const handleCancel = () => {
    navigate(`/users/${id}`);
  };

  const displayName = user ? getUserDisplayName(user) : "";
  
  const breadcrumbItems = [
    { title: "Users", link: "/users" },
    { title: displayName || "User", link: `/users/${id}` },
    { title: "Edit" },
  ];

  // Loading state
  if (isLoading) {
    return (
      <div className="w-full max-w-4xl">
        <Skeleton className="h-10 w-full mb-6" />
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
      <div className="w-full max-w-4xl">
        <Breadcrumb items={breadcrumbItems} />
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
      <div className="w-full max-w-4xl">
        <Breadcrumb items={breadcrumbItems} />
        <div className="text-center py-12">
          <p className="text-muted-foreground">User not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl">
      {/* Breadcrumb */}
      <Breadcrumb items={breadcrumbItems} />

      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Edit User</h1>
        <p className="text-muted-foreground">
          Update information for {displayName}
        </p>
      </div>

      {/* User Edit Form */}
      <UserEditForm userId={userId} onCancel={handleCancel} />
    </div>
  );
};

export default UserEditPage;
