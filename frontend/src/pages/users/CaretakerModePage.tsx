import { Loader2, AlertCircle, Info } from "lucide-react";
import { Alert, AlertDescription } from "@/shared/components/ui/alert";
import { Separator } from "@/shared/components/ui/separator";
import { useCurrentUser } from "@/features/auth";
import { 
  useCaretakerCheck,
  RequestCaretakerForm,
  PendingCaretakerRequest,
  OutgoingCaretakerRequest,
  ActiveCaretaker,
  CaretakeesTable
} from "@/features/users";

/**
 * CaretakerModePage component
 * Main page for caretaker management
 * 
 * Features:
 * - Uses useCaretakerCheck hook to fetch data
 * - Shows loading spinner while fetching
 * - Displays description of caretaker functionality
 * - Renders "My Caretaker" section with appropriate component based on state
 * - Renders "My Caretakees" section if user is caretaking for others
 * - Handles error states gracefully
 * 
 * Route: /users/me/caretaker
 */
const CaretakerModePage = () => {
  // Fetch current user data
  const { 
    data: user, 
    isLoading: isLoadingUser, 
    error: userError,
    refetch: refetchUser
  } = useCurrentUser();

  // Fetch caretaker check data
  const { 
    data: caretakerData, 
    isLoading: isLoadingCaretaker, 
    error: caretakerError,
    refetch: refetchCaretaker
  } = useCaretakerCheck();

  const currentUserId = user?.id;

  // Handle loading state
  if (isLoadingUser || isLoadingCaretaker) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">Loading caretaker information...</p>
          </div>
        </div>
      </div>
    );
  }

  // Handle error state
  if (userError || caretakerError) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to load caretaker information. Please try again later.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Handle missing user ID
  if (!currentUserId) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Unable to determine current user. Please log in again.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

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

  // Determine which component to show in "My Caretaker" section
  const renderMyCaretakerSection = () => {
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
      const isMyRequest = caretakerData.caretaker_request_object.requester.id === currentUserId;
      
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

    // Show incoming request if someone wants YOU to be THEIR caretaker
    // (you are in secondary_users)
    if (caretakerData?.become_caretaker_request_object) {
      return (
        <PendingCaretakerRequest 
          request={caretakerData.become_caretaker_request_object}
          onCancel={handleCaretakerCancel}
        />
      );
    }

    // Show request form if no caretaker or requests
    return (
      <RequestCaretakerForm 
        userId={currentUserId}
        onSuccess={handleCaretakerSuccess}
      />
    );
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Caretaker Mode</h1>
        
        {/* Description */}
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            Caretakers can manage your projects when you're unavailable (on leave, resignation, or other absence). 
            All caretaker requests require admin approval for security and accountability.
          </AlertDescription>
        </Alert>
      </div>

      <div className="space-y-8">
        {/* My Caretaker Section */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">My Caretaker</h2>
          {renderMyCaretakerSection()}
        </section>

        <Separator />

        {/* My Caretakees Section */}
        {user?.caretaking_for && user.caretaking_for.length > 0 && (
          <section>
            <h2 className="text-2xl font-semibold mb-4">My Caretakees</h2>
            <CaretakeesTable caretakees={user.caretaking_for} />
          </section>
        )}
      </div>
    </div>
  );
};

export default CaretakerModePage;