import { observer } from "mobx-react-lite";
import { useUserDetail } from "@/features/users/hooks/useUserDetail";
import { UserAdminActionButtons } from "./UserAdminActionButtons";
import { Button } from "@/shared/components/ui/button";
import { Alert, AlertDescription } from "@/shared/components/ui/alert";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/components/ui/avatar";
import { AlertCircle, Copy, Mail, UserPlus, X, Check } from "lucide-react";
import { AiFillCloseCircle } from "react-icons/ai";
import { useAuthStore } from "@/app/stores/useStore";
import { toast } from "sonner";
import {
  Sheet,
  SheetContent,
} from "@/shared/components/ui/custom/CustomSheet";
import { getUserDisplayName, getUserInitials, hasValidEmail, getUserEmail, getUserPhone } from "@/shared/utils/user.utils";
import { getSanitizedHtmlOrFallback } from "@/shared/utils/html.utils";

interface UserDetailSheetProps {
  userId: number | null;
  open: boolean;
  onClose: () => void;
}

/**
 * UserDetailSheet component
 * Displays user details in a side sheet matching the original Chakra UI design
 */
export const UserDetailSheet = observer(({ userId, open, onClose }: UserDetailSheetProps) => {
  const authStore = useAuthStore();

  // Fetch user details
  const {
    data: user,
    isLoading,
    error,
  } = useUserDetail(userId || 0);

  const handleCopyEmail = () => {
    if (user?.email) {
      navigator.clipboard.writeText(user.email);
      toast.success("Email copied to clipboard");
    }
  };

  const handleEmailUser = () => {
    if (user?.email) {
      window.open(`mailto:${user.email}`);
    }
  };

  const handleAddToProject = () => {
    // TODO: Implement add to project modal
    toast.info("Add to project functionality will be implemented soon");
  };

  const accountIsStaff = user?.is_staff;
  const accountIsSuper = user?.is_superuser;
  const viewingUserIsSuper = authStore.isSuperuser;

  return (
    <Sheet open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <SheetContent side="right" className="w-full sm:max-w-2xl overflow-y-auto p-0">
        {/* Close button - visible on all screen sizes */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="absolute right-4 top-4 z-10 size-8"
        >
          <X className="size-4" />
        </Button>

        {/* Loading state */}
        {isLoading && (
          <div className="space-y-6 p-6">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-64" />
            <Skeleton className="h-64" />
          </div>
        )}

        {/* Error state */}
        {error && (
          <div className="p-6">
            <Alert variant="destructive">
              <AlertCircle className="size-4" />
              <AlertDescription>Failed to load user details</AlertDescription>
            </Alert>
          </div>
        )}

        {/* User details */}
        {user && (
          <div className="flex flex-col h-full p-6">
            {/* Header Section */}
            <div className="flex gap-4 mb-4">
              <Avatar className="size-24">
                <AvatarImage src={user.image?.file || user.image?.old_file} />
                <AvatarFallback>{getUserInitials(user)}</AvatarFallback>
              </Avatar>

              <div className="flex-1 flex flex-col justify-center overflow-auto">
                <p className="font-bold text-base">{getUserDisplayName(user)}</p>
                <p className="text-sm">{getUserPhone(user)}</p>
                <div className="flex items-center gap-2">
                  <p className="text-sm">{getUserEmail(user)}</p>
                </div>
                {hasValidEmail(user) && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleCopyEmail}
                    className="mt-2 w-fit px-4 bg-blue-500 hover:bg-blue-400 text-white"
                  >
                    <Copy className="size-4 mr-2" />
                    Copy Email
                  </Button>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-4 mb-4 pt-2 pb-4">
              <Button
                onClick={handleEmailUser}
                disabled={!hasValidEmail(user)}
                className="bg-blue-500 hover:bg-blue-400 text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Mail className="size-4 mr-2" />
                Email
              </Button>
              <Button
                onClick={handleAddToProject}
                disabled={user.email === authStore.user?.email}
                className="bg-green-500 hover:bg-green-400 text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <UserPlus className="size-4 mr-2" />
                Add to Project
              </Button>
            </div>

            {/* Organization Info Section */}
            <div className="border border-gray-300 dark:border-gray-500 rounded-xl p-4 mb-2">
              <div className="flex flex-col">
                {accountIsStaff && (
                  <div className="flex h-[60px]">
                    <img
                      src="/dbca.jpg"
                      alt="Agency logo"
                      className="rounded-lg w-[60px] h-[60px] object-cover pointer-events-none select-none"
                    />
                    <div className="flex ml-3 flex-col justify-center">
                      <p className="font-bold text-gray-600 dark:text-gray-300">
                        Department of Biodiversity, Conservation and Attractions
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {user.branch?.name ? `${user.branch.name} Branch` : "Branch not set"}
                      </p>
                      <p className="text-sm text-blue-600 dark:text-gray-400">
                        {user.business_area?.name ? (
                          <>
                            {user.business_area.name}
                          </>
                        ) : (
                          "Business Area not set"
                        )}
                      </p>
                    </div>
                  </div>
                )}
                {!accountIsStaff && (
                  <p className="text-gray-600 dark:text-gray-300">
                    <b>External User</b> - This user does not belong to DBCA
                  </p>
                )}
              </div>
            </div>

            {/* About Section */}
            <div className="border border-gray-300 dark:border-gray-500 rounded-xl p-4 mb-4 mt-2">
              <p className="font-bold text-sm mb-1 text-gray-600 dark:text-gray-300">
                About
              </p>
              <div
                className="mt-1"
                dangerouslySetInnerHTML={{
                  __html: getSanitizedHtmlOrFallback(user.about),
                }}
              />
              <p className="font-bold text-sm mb-1 mt-4 text-gray-600 dark:text-gray-300">
                Expertise
              </p>
              <div
                className="mt-1"
                dangerouslySetInnerHTML={{
                  __html: getSanitizedHtmlOrFallback(user.expertise),
                }}
              />
            </div>

            {/* Involved Projects Section */}
            {/* TODO: Implement UserProjectsDataTable component */}
            {/* <div className="border border-gray-300 dark:border-gray-500 rounded-xl p-4 mb-4 mt-2">
              <p className="font-bold text-sm mb-1 text-gray-600 dark:text-gray-300">
                Involved Projects
              </p>
              <UserProjectsDataTable projectData={userProjectsData} />
            </div> */}

            {/* Caretaker Section */}
            {/* TODO: Implement Caretaker section with caretaker info and actions */}
            {/* <div className="border border-gray-300 dark:border-gray-500 rounded-xl p-4 mb-4 mt-2">
              <p className="font-bold text-sm mb-3 text-gray-600 dark:text-gray-300">
                Caretaker and Merging
              </p>
              ... caretaker content ...
            </div> */}

            {/* Admin Actions - only show for superusers */}
            {viewingUserIsSuper && authStore.user && (
              <UserAdminActionButtons
                user={user}
                currentUserId={authStore.user.pk}
              />
            )}

            {/* Details Section */}
            <div className="border border-gray-300 dark:border-gray-500 rounded-xl p-4 mb-4 mt-2">
              <p className="font-bold text-sm mb-1 text-gray-600 dark:text-gray-300">
                Details
              </p>
              
              <div className="mt-4 rounded-xl p-4 bg-gray-50 dark:bg-gray-600">
                <div className="grid grid-cols-3 gap-3 w-full">
                  {/* Active Status */}
                  <div className="flex flex-col justify-center items-center">
                    <p className="mb-2 font-bold text-gray-500 dark:text-gray-400 text-sm">
                      Active?
                    </p>
                    {user.is_active ? (
                      <Check className="size-6 text-green-500" />
                    ) : (
                      <AiFillCloseCircle className="size-6 text-red-500 dark:text-red-600" />
                    )}
                  </div>

                  {/* Staff Status */}
                  <div className="flex flex-col justify-center items-center">
                    <p className="mb-2 font-bold text-gray-500 dark:text-gray-400 text-sm">
                      Staff?
                    </p>
                    {accountIsStaff ? (
                      <Check className="size-6 text-green-500" />
                    ) : (
                      <AiFillCloseCircle className="size-6 text-red-500 dark:text-red-600" />
                    )}
                  </div>

                  {/* Admin Status */}
                  <div className="flex flex-col justify-center items-center">
                    <p className="mb-2 font-bold text-gray-500 dark:text-gray-400 text-sm">
                      Admin?
                    </p>
                    {accountIsSuper ? (
                      <Check className="size-6 text-green-500" />
                    ) : (
                      <AiFillCloseCircle className="size-6 text-red-500 dark:text-red-600" />
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
});
