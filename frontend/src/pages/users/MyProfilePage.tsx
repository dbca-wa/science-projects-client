import { observer } from "mobx-react-lite";
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router";
import { useCurrentUser } from "@/features/auth";
import { 
  useCaretakerCheck,
  PersonalInformationCard,
  ProfileSection,
  MembershipSection,
  PublicAppearanceSection,
  InAppSearchSection,
  StatusSection,
  RequestCaretakerForm,
  PendingCaretakerRequest,
  OutgoingCaretakerRequest,
  ActiveCaretaker,
  CaretakeesTable,
  EditPersonalInformationModal,
  EditOrgMembershipModal,
  ToggleStaffProfileVisibilityModal
} from "@/features/users";
import { useWindowSize } from "@/shared/hooks/useWindowSize";
import { AutoBreadcrumb } from "@/shared/components/navigation/AutoBreadcrumb";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import { Alert, AlertDescription } from "@/shared/components/ui/alert";
import { Separator } from "@/shared/components/ui/separator";
import { AlertCircle, Info, Loader2 } from "lucide-react";
import { PageTransition } from "@/shared/components/PageTransition";
import { Skeleton } from "@/shared/components/ui/skeleton";

/**
 * MyProfilePage
 * Displays the current user's profile at /users/me
 * Shows personal information, profile, and membership sections with modal-based editing
 * Includes tabbed navigation for SPMS Profile, Staff Profile, and Caretaker Mode
 * Supports direct URL navigation to tabs via /users/me/caretaker
 */
const MyProfilePage = observer(() => {
  const navigate = useNavigate();
  const location = useLocation();
  const { width } = useWindowSize();
  const { data: user, isLoading, error, refetch: refetchUser } = useCurrentUser();
  
  // Fetch caretaker data for caretaker tab
  const { 
    data: caretakerData, 
    isLoading: isLoadingCaretaker, 
    error: caretakerError,
    refetch: refetchCaretaker
  } = useCaretakerCheck();
  
  // Modal state
  const [isPersonalInfoModalOpen, setIsPersonalInfoModalOpen] = useState(false);
  const [isMembershipModalOpen, setIsMembershipModalOpen] = useState(false);
  const [isToggleVisibilityModalOpen, setIsToggleVisibilityModalOpen] = useState(false);

  // Determine if we should show short labels (mobile)
  const showShortLabels = width < 480;

  // Determine active tab from URL
  const getTabFromPath = (pathname: string): string => {
    if (pathname.includes("/caretaker")) return "caretaker";
    if (pathname.includes("/staff-profile")) return "staff-profile";
    return "profile";
  };

  const [activeTab, setActiveTab] = useState(getTabFromPath(location.pathname));

  // Update active tab when URL changes
  useEffect(() => {
    setActiveTab(getTabFromPath(location.pathname));
  }, [location.pathname]);

  // Generate breadcrumbs based on active tab
  const getBreadcrumbItems = () => {
    switch (activeTab) {
      case "staff-profile":
        return [
          { title: "My Profile", link: "/users/me" },
          { title: "Public Profile" },
        ];
      case "caretaker":
        return [
          { title: "My Profile", link: "/users/me" },
          { title: "Caretaker Mode" },
        ];
      default:
        return [{ title: "My Profile" }];
    }
  };

  // Handle tab change - update URL without replacing history
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    switch (value) {
      case "caretaker":
        navigate("/users/me/caretaker");
        break;
      case "staff-profile":
        navigate("/users/me/staff-profile");
        break;
      default:
        navigate("/users/me");
        break;
    }
  };

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

  // Caretaker handlers
  const handleCaretakerSuccess = () => {
    refetchUser();
    refetchCaretaker();
  };

  const handleCaretakerCancel = () => {
    refetchUser();
    refetchCaretaker();
  };

  const handleCaretakerRemove = () => {
    refetchUser();
    refetchCaretaker();
  };

  // Render caretaker section content
  const renderMyCaretakerSection = () => {
    if (!user?.id) return null;

    // Show active caretaker if exists
    if (caretakerData?.caretaker_object) {
      return (
        <ActiveCaretaker 
          caretaker={caretakerData.caretaker_object}
          onRemove={handleCaretakerRemove}
        />
      );
    }

    // Show outgoing request if YOU requested someone to be YOUR caretaker
    // (you are primary_user AND you are the requester)
    if (caretakerData?.caretaker_request_object) {
      const isMyRequest = caretakerData.caretaker_request_object.requester.id === user.id;
      
      if (isMyRequest) {
        return (
          <OutgoingCaretakerRequest 
            request={caretakerData.caretaker_request_object}
            onCancel={handleCaretakerCancel}
          />
        );
      } else {
        // Someone else made this request on your behalf (admin action)
        // This is unusual but possible - treat as incoming
        return (
          <PendingCaretakerRequest 
            request={caretakerData.caretaker_request_object}
            onCancel={handleCaretakerCancel}
          />
        );
      }
    }

    // Show request form if no caretaker or requests
    return (
      <RequestCaretakerForm 
        userId={user.id}
        onSuccess={handleCaretakerSuccess}
      />
    );
  };

  // Render incoming caretaker requests section (someone wants YOU to be THEIR caretaker)
  const renderIncomingCaretakerSection = () => {
    if (!caretakerData?.become_caretaker_request_object) return null;

    return (
      <PendingCaretakerRequest 
        request={caretakerData.become_caretaker_request_object}
        onCancel={() => {
          refetchUser();
          refetchCaretaker();
        }}
      />
    );
  };

  // Error state
  if (error) {
    const apiError = error as { status?: number; message?: string };
    const errorMessage =
      apiError.status === 401
        ? "You must be logged in to view this page"
        : "Failed to load your profile";

    return (
      <div className="w-full">
        <AutoBreadcrumb overrideItems={getBreadcrumbItems()} />
        <Alert variant="destructive">
          <AlertCircle className="size-4" />
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      </div>
    );
  }

  // Not found state
  if (!isLoading && !user) {
    return (
      <div className="w-full">
        <AutoBreadcrumb overrideItems={getBreadcrumbItems()} />
        <div className="text-center py-12">
          <p className="text-muted-foreground">Profile not found</p>
        </div>
      </div>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <Loader2 className="size-12 mx-auto animate-spin text-blue-600" />
          <div className="text-lg font-medium text-muted-foreground">Loading profile...</div>
        </div>
      </div>
    );
  }

  return (
    <PageTransition>
      <div className="w-full">
        {/* Breadcrumb */}
        <AutoBreadcrumb overrideItems={getBreadcrumbItems()} />

        {/* Page header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">{pageContent.title}</h1>
          <p className="text-muted-foreground">
            {pageContent.subtitle}
          </p>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} className="w-full" onValueChange={handleTabChange}>
          <TabsList className="mb-6 w-full flex">
            <TabsTrigger value="profile" className="flex-1">
              {showShortLabels ? "SPMS" : "SPMS Profile"}
            </TabsTrigger>
            {user?.is_staff && (
              <TabsTrigger value="staff-profile" className="flex-1">
                {showShortLabels ? "Public" : "Public Profile"}
              </TabsTrigger>
            )}
            <TabsTrigger value="caretaker" className="flex-1">
              {showShortLabels ? "Caretaker" : "Caretaker Mode"}
            </TabsTrigger>
          </TabsList>

          {/* My Profile Tab */}
          <TabsContent value="profile" className="space-y-4">
            {/* Profile Card (About & Expertise) */}
            <ProfileSection 
              user={user!} 
              onClick={() => navigate("/users/me/profile")}
            />

            {/* Personal Information Card */}
            <PersonalInformationCard 
              user={user!} 
              onClick={() => setIsPersonalInfoModalOpen(true)}
            />

            {/* Membership Card */}
            <MembershipSection 
              user={user!} 
              onClick={() => setIsMembershipModalOpen(true)}
            />

            {/* In-App Search Appearance */}
            <InAppSearchSection user={user!} />

            {/* Status Card */}
            <StatusSection user={user!} />
          </TabsContent>

          {/* Staff Profile Tab (Staff only) */}
          {user?.is_staff && (
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
            <div className="max-w-4xl mx-auto">
              {/* Description */}
              <Alert className="mb-6">
                <Info className="h-4 w-4" />
                <AlertDescription>
                  Caretakers can manage your projects when you're unavailable (on leave, resignation, or other absence). 
                  All caretaker requests require admin approval for security and accountability.
                </AlertDescription>
              </Alert>

              {isLoadingCaretaker ? (
                <div className="space-y-6">
                  <Skeleton className="h-64" />
                  <Skeleton className="h-64" />
                </div>
              ) : caretakerError ? (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Failed to load caretaker information. Please try again later.
                  </AlertDescription>
                </Alert>
              ) : (
                <div className="space-y-8">
                  {/* My Caretaker Section */}
                  <section>
                    <h2 className="text-2xl font-semibold mb-4">My Caretaker</h2>
                    <p className="text-sm text-muted-foreground mb-4">
                      Request someone to manage your projects during your absence.
                    </p>
                    {renderMyCaretakerSection()}
                  </section>

                  {/* Caretaker Requests Section */}
                  {caretakerData?.become_caretaker_request_object && (
                    <>
                      <Separator />
                      <section>
                        <h2 className="text-2xl font-semibold mb-4">Caretaker Request</h2>
                        <p className="text-sm text-muted-foreground mb-4">
                          A user needs you to be their caretaker.
                        </p>
                        {renderIncomingCaretakerSection()}
                      </section>
                    </>
                  )}

                  {/* My Caretakees Section */}
                  {user?.caretaking_for && user.caretaking_for.length > 0 && (
                    <>
                      <Separator />
                      <section>
                        <h2 className="text-2xl font-semibold mb-4">My Caretakees</h2>
                        <p className="text-sm text-muted-foreground mb-4">
                          Users you are currently caretaking for.
                        </p>
                        <CaretakeesTable caretakees={user.caretaking_for} />
                      </section>
                    </>
                  )}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>

        {/* Modals */}
        {user && (
          <>
            <EditPersonalInformationModal
              user={user}
              isOpen={isPersonalInfoModalOpen}
              onClose={() => setIsPersonalInfoModalOpen(false)}
              onSuccess={() => {
                // Refetch user data after successful update
                // TanStack Query will automatically refetch due to invalidation in the mutation
              }}
            />
            <EditOrgMembershipModal
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
          </>
        )}
      </div>
    </PageTransition>
  );
});

export default MyProfilePage;
