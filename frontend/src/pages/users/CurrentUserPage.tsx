import { observer } from "mobx-react-lite";
import { useNavigate } from "react-router";
import { useCurrentUser } from "@/features/auth/hooks/useAuth";
import { PersonalInfoSection } from "@/features/users/components/PersonalInfoSection";
import { ProfileSection } from "@/features/users/components/ProfileSection";
import { MembershipSection } from "@/features/users/components/MembershipSection";
import { Button } from "@/shared/components/ui/button";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { Alert, AlertDescription } from "@/shared/components/ui/alert";
import { ArrowLeft, AlertCircle, Edit } from "lucide-react";
import { Badge } from "@/shared/components/ui/badge";

/**
 * CurrentUserPage
 * Displays the current user's profile at /users/me
 * Shows personal information, profile, and membership sections with edit capabilities
 */
export const CurrentUserPage = observer(() => {
  const navigate = useNavigate();
  const { data: user, isLoading, error } = useCurrentUser();

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
    const apiError = error as { status?: number; message?: string };
    const errorMessage =
      apiError.status === 401
        ? "You must be logged in to view this page"
        : "Failed to load your profile";

    return (
      <div className="container mx-auto px-4 py-8">
        <Button variant="ghost" onClick={handleBack} className="mb-8">
          <ArrowLeft className="size-4 mr-2" />
          Back to Users
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
      <div className="container mx-auto px-4 py-8">
        <Button variant="ghost" onClick={handleBack} className="mb-8">
          <ArrowLeft className="size-4 mr-2" />
          Back to Users
        </Button>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Profile not found</p>
        </div>
      </div>
    );
  }

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
            <h1 className="text-3xl font-bold">My Profile</h1>
            {/* Status badges */}
            <div className="flex gap-2">
              {user.is_superuser && (
                <Badge variant="destructive">Admin</Badge>
              )}
              {user.is_staff && <Badge variant="default">Staff</Badge>}
              {!user.is_staff && <Badge variant="secondary">External</Badge>}
              {!user.is_active && <Badge variant="outline">Inactive</Badge>}
            </div>
          </div>
          <p className="text-muted-foreground">
            View and edit your profile information
          </p>
        </div>

        {/* Edit button */}
        <Button onClick={() => navigate(`/users/${user.pk}/edit`)}>
          <Edit className="size-4 mr-2" />
          Edit Profile
        </Button>
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
        </div>
      </div>

      {/* TODO: Add additional sections as needed */}
      {/* - Public profile visibility toggle */}
      {/* - Custom title section */}
      {/* - Public email section */}
      {/* - Caretaker mode (if applicable) */}
    </div>
  );
});
