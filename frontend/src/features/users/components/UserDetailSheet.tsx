import { observer } from "mobx-react-lite";
import { useNavigate } from "react-router";
import { useUserDetail } from "@/features/users/hooks/useUserDetail";
import { PersonalInfoSection } from "./PersonalInfoSection";
import { ProfileSection } from "./ProfileSection";
import { MembershipSection } from "./MembershipSection";
import { UserAdminActionButtons } from "./UserAdminActionButtons";
import { Button } from "@/shared/components/ui/button";
import { Alert, AlertDescription } from "@/shared/components/ui/alert";
import { Badge } from "@/shared/components/ui/badge";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { AlertCircle, X } from "lucide-react";
import { useAuthStore } from "@/app/stores/useStore";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/shared/components/ui/custom/CustomSheet";

interface UserDetailSheetProps {
  userId: number | null;
  open: boolean;
  onClose: () => void;
}

/**
 * UserDetailSheet component
 * Displays user details in a side sheet with admin actions
 * Features:
 * - Personal information, profile, and membership sections
 * - Admin action buttons (for superusers)
 * - Edit button with smart navigation (own profile → /users/me)
 * - Loading and error states
 * - Escape key and backdrop click to close
 */
export const UserDetailSheet = observer(({ userId, open, onClose }: UserDetailSheetProps) => {
  const navigate = useNavigate();
  const authStore = useAuthStore();

  // Fetch user details
  const {
    data: user,
    isLoading,
    error,
  } = useUserDetail(userId || 0);

  const handleEdit = () => {
    if (user) {
      // If viewing own profile, navigate to /users/me
      const isSelf = authStore.user?.pk === user.pk;
      if (isSelf) {
        navigate("/users/me");
      } else {
        navigate(`/users/${user.pk}/edit`);
      }
    }
  };

  return (
    <Sheet open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <SheetContent side="right" className="w-full sm:max-w-2xl overflow-y-auto">
        {/* Loading state */}
        {isLoading && (
          <div className="space-y-6">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-64" />
            <Skeleton className="h-64" />
          </div>
        )}

        {/* Error state */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="size-4" />
            <AlertDescription>Failed to load user details</AlertDescription>
          </Alert>
        )}

        {/* User details */}
        {user && (
          <>
            <SheetHeader className="mb-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <SheetTitle className="text-2xl">
                      {user.display_first_name || user.first_name}{" "}
                      {user.display_last_name || user.last_name}
                    </SheetTitle>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={onClose}
                      className="size-8"
                    >
                      <X className="size-4" />
                    </Button>
                  </div>
                  {/* Status badges */}
                  <div className="flex gap-2 mb-2">
                    {user.is_superuser && (
                      <Badge variant="destructive">Admin</Badge>
                    )}
                    {user.is_staff && <Badge variant="default">Staff</Badge>}
                    {!user.is_staff && <Badge variant="secondary">External</Badge>}
                    {!user.is_active && <Badge variant="outline">Inactive</Badge>}
                  </div>
                </div>
              </div>
            </SheetHeader>

            <div className="space-y-6">
              <PersonalInfoSection user={user} />
              <ProfileSection user={user} />
              <MembershipSection user={user} />

              {/* Admin Actions - only show for superusers */}
              {authStore.isSuperuser && authStore.user && (
                <UserAdminActionButtons
                  user={user}
                  currentUserId={authStore.user.pk}
                />
              )}

              {/* Edit button */}
              <Button onClick={handleEdit} className="w-full">
                Edit Profile
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
});
