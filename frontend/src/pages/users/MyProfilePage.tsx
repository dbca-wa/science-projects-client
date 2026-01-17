import { observer } from "mobx-react-lite";
import { useState } from "react";
import { useCurrentUser } from "@/features/auth/hooks/useAuth";
import { Breadcrumb } from "@/shared/components/Breadcrumb";
import { PersonalInformationCard } from "@/features/users/components/PersonalInformationCard";
import { ProfileSection } from "@/features/users/components/ProfileSection";
import { MembershipSection } from "@/features/users/components/MembershipSection";
import { PublicAppearanceSection } from "@/features/users/components/PublicAppearanceSection";
import { InAppSearchSection } from "@/features/users/components/InAppSearchSection";
import { StatusSection } from "@/features/users/components/StatusSection";
import { 
  EditPersonalInformationModal,
  EditProfileModal,
  EditMembershipModal,
  ToggleStaffProfileVisibilityModal
} from "@/features/users/components/modals";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { Alert, AlertDescription } from "@/shared/components/ui/alert";
import { AlertCircle } from "lucide-react";

/**
 * MyProfilePage
 * Displays the current user's profile at /users/me
 * Shows personal information, profile, and membership sections with modal-based editing
 * Includes tabbed navigation for SPMS Profile, Staff Profile, and Caretaker Mode
 */
export const MyProfilePage = observer(() => {
  const { data: user, isLoading, error } = useCurrentUser();
  
  // Modal state
  const [isPersonalInfoModalOpen, setIsPersonalInfoModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isMembershipModalOpen, setIsMembershipModalOpen] = useState(false);
  const [isToggleVisibilityModalOpen, setIsToggleVisibilityModalOpen] = useState(false);

  // Track active tab for dynamic title/subtitle
  const [activeTab, setActiveTab] = useState("profile");

  const breadcrumbItems = [
    { title: "Users", link: "/users" },
    { title: "My Profile" },
  ];

  // Dynamic title and subtitle based on active tab
  const getPageContent = () => {
    switch (activeTab) {
      case "staff-profile":
        return {
          title: "Public Staff Profile",
          subtitle: "Manage how you appear on the public staff directory",
        };
      case "caretaker":
        return {
          title: "Caretaker Mode",
          subtitle: "Manage caretaker relationships and permissions",
        };
      default:
        return {
          title: "SPMS Profile",
          subtitle: "View and edit your profile information",
        };
    }
  };

  const pageContent = getPageContent();

  // Loading state
  if (isLoading) {
    return (
      <div className="w-full">
        <Skeleton className="h-10 w-full mb-6" />
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
      <div className="w-full">
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
      <div className="w-full">
        <Breadcrumb items={breadcrumbItems} />
        <div className="text-center py-12">
          <p className="text-muted-foreground">Profile not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Breadcrumb */}
      <Breadcrumb items={breadcrumbItems} />

      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">{pageContent.title}</h1>
        <p className="text-muted-foreground">
          {pageContent.subtitle}
        </p>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} className="w-full" onValueChange={setActiveTab}>
        <TabsList className="mb-6 w-full flex">
          <TabsTrigger value="profile" className="flex-1">SPMS Profile</TabsTrigger>
          {user.is_staff && (
            <TabsTrigger value="staff-profile" className="flex-1">Public Profile</TabsTrigger>
          )}
          <TabsTrigger value="caretaker" className="flex-1">Caretaker Mode</TabsTrigger>
        </TabsList>

        {/* My Profile Tab */}
        <TabsContent value="profile" className="space-y-4">
          {/* In-App Search Appearance */}
          <InAppSearchSection user={user} />

          {/* Personal Information Card */}
          <PersonalInformationCard 
            user={user} 
            onClick={() => setIsPersonalInfoModalOpen(true)}
          />

          {/* Profile Card (About & Expertise) */}
          <ProfileSection 
            user={user} 
            onClick={() => setIsProfileModalOpen(true)}
          />

          {/* Membership Card */}
          <MembershipSection 
            user={user} 
            onClick={() => setIsMembershipModalOpen(true)}
          />

          {/* Status Card */}
          <StatusSection user={user} />
        </TabsContent>

        {/* Staff Profile Tab (Staff only) */}
        {user.is_staff && (
          <TabsContent value="staff-profile" className="space-y-6">
            <div className="max-w-4xl mx-auto space-y-6">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold mb-2">Public Staff Profile</h2>
                <p className="text-muted-foreground">
                  Manage how you appear on the public staff directory
                </p>
              </div>
              
              <PublicAppearanceSection 
                user={user} 
                onClick={() => setIsToggleVisibilityModalOpen(true)}
              />
              
              <div className="text-sm text-muted-foreground text-center pt-4 border-t">
                <p>
                  Your staff profile is {user.staff_profile_hidden ? "hidden" : "visible"} to the public.
                  {user.staff_profile_hidden 
                    ? " Click above to make it visible on the staff directory."
                    : " Click above to hide it from the staff directory."}
                </p>
              </div>
            </div>
          </TabsContent>
        )}

        {/* Caretaker Mode Tab */}
        <TabsContent value="caretaker" className="space-y-6">
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              Caretaker mode functionality will be implemented in a future update.
            </p>
          </div>
        </TabsContent>
      </Tabs>

      {/* Modals */}
      <EditPersonalInformationModal
        user={user}
        isOpen={isPersonalInfoModalOpen}
        onClose={() => setIsPersonalInfoModalOpen(false)}
        onSuccess={() => {
          // Refetch user data after successful update
          // TanStack Query will automatically refetch due to invalidation in the mutation
        }}
      />
      <EditProfileModal
        user={user}
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        onSuccess={() => {
          // Refetch user data after successful update
        }}
      />
      <EditMembershipModal
        user={user}
        isOpen={isMembershipModalOpen}
        onClose={() => setIsMembershipModalOpen(false)}
        onSuccess={() => {
          // Refetch user data after successful update
        }}
      />
      <ToggleStaffProfileVisibilityModal
        user={user}
        isOpen={isToggleVisibilityModalOpen}
        onClose={() => setIsToggleVisibilityModalOpen(false)}
        onSuccess={() => {
          // Refetch user data after successful update
        }}
      />
    </div>
  );
});
