import { useState } from "react";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/shared/components/ui/alert-dialog";
import { Alert, AlertDescription } from "@/shared/components/ui/alert";
import { Loader2, AlertCircle, X, Check } from "lucide-react";
import { UserDisplay } from "@/shared/components/user";
import { toUserDisplayFormat, getCaretakerReasonLabel } from "@/shared/utils/user.utils";
import { formatDate } from "@/shared/utils/common.utils";
import { useCurrentUser } from "@/features/auth";
import { useApproveCaretakerTask } from "../hooks/useApproveCaretakerTask";
import { useRejectCaretakerTask } from "../hooks/useRejectCaretakerTask";
import { useCancelCaretakerRequest } from "../hooks/useCancelCaretakerRequest";
import type { IPendingCaretakerRequestProps } from "../types/caretaker.types";

/**
 * PendingCaretakerRequest component
 * Displays a pending caretaker request in different contexts:
 * 1. Outgoing: Current user requested someone to be THEIR caretaker (show cancel only)
 * 2. Incoming: Someone wants current user to be THEIR caretaker (show approve/reject)
 * 
 * Features:
 * - Detects request type based on current user's role
 * - Shows appropriate badge and buttons based on context
 * - Displays reason, end date, notes
 * - Success/error handling
 * 
 * @param request - AdminTask representing the pending request
 * @param onCancel - Callback when request is cancelled/approved/rejected
 */
export const PendingCaretakerRequest = ({ request, onCancel }: IPendingCaretakerRequestProps) => {
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  
  const approveMutation = useApproveCaretakerTask();
  const rejectMutation = useRejectCaretakerTask();
  const cancelMutation = useCancelCaretakerRequest();
  const { data: currentUser } = useCurrentUser();

  // Determine the request type based on current user's role
  const userNeedingCaretaker = request.primary_user;
  const caretakerId = request.secondary_users?.[0]?.id;
  const requesterId = request.requester?.id;
  
  // Debug logging
  console.log('PendingCaretakerRequest Debug:', {
    currentUserId: currentUser?.id,
    caretakerId,
    requesterId,
    primaryUserId: userNeedingCaretaker?.id,
    request
  });
  
  // Outgoing: I am the requester (I made this request)
  const isOutgoingRequest = currentUser?.id === requesterId;
  
  // Incoming: Someone else made this request and I'm the caretaker being asked
  const isIncomingRequest = currentUser?.id === caretakerId && currentUser?.id !== requesterId;
  
  console.log('Request Type:', { isIncomingRequest, isOutgoingRequest });

  if (!userNeedingCaretaker) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Error: User data not found in request.
        </AlertDescription>
      </Alert>
    );
  }

  const handleApproveClick = () => {
    setShowApproveDialog(true);
  };

  const handleRejectClick = () => {
    setShowRejectDialog(true);
  };

  const handleCancelClick = () => {
    setShowCancelDialog(true);
  };

  const handleConfirmApprove = () => {
    approveMutation.mutate(request.id, {
      onSuccess: () => {
        setShowApproveDialog(false);
        onCancel();
      },
    });
  };

  const handleConfirmReject = () => {
    rejectMutation.mutate(request.id, {
      onSuccess: () => {
        setShowRejectDialog(false);
        onCancel();
      },
    });
  };

  const handleConfirmCancel = () => {
    cancelMutation.mutate(request.id, {
      onSuccess: () => {
        setShowCancelDialog(false);
        onCancel();
      },
    });
  };

  // Determine badge text and color
  const getBadgeContent = () => {
    if (isIncomingRequest) {
      return {
        text: "Pending Your Approval",
        className: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
      };
    }
    if (isOutgoingRequest) {
      return {
        text: "Outgoing Request",
        className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
      };
    }
    return {
      text: "Pending Approval",
      className: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
    };
  };

  const badgeContent = getBadgeContent();

  return (
    <>
      <Card className="border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-900/20">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Caretaker Request</CardTitle>
            <Badge className={badgeContent.className}>
              {badgeContent.text}
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* User Needing Caretaker */}
          <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-2">
              User Needing Caretaker
            </h4>
            <UserDisplay 
              user={toUserDisplayFormat(userNeedingCaretaker)}
              showEmail={true} 
              size="md" 
            />
          </div>

          {/* Proposed Caretaker (You) */}
          {request.secondary_users && request.secondary_users.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-2">
                Proposed Caretaker
              </h4>
              <UserDisplay 
                user={toUserDisplayFormat(request.secondary_users[0])}
                showEmail={true} 
                size="md" 
              />
            </div>
          )}

          {/* Request Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-1">
                Reason
              </h4>
              <p className="text-sm">{getCaretakerReasonLabel(request.reason)}</p>
            </div>

            {request.end_date && (
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-1">
                  Until
                </h4>
                <p className="text-sm">{formatDate(request.end_date)}</p>
              </div>
            )}
          </div>

          {/* Notes (if provided) */}
          {request.notes && (
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-1">
                Notes
              </h4>
              <p className="text-sm bg-white dark:bg-gray-800 p-3 rounded-md">{request.notes}</p>
            </div>
          )}

          {/* Request Details */}
          <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-1">
              Request Details
            </h4>
            <p className="text-sm">
              {formatDate(request.created_at)}
              {request.requester && (
                <>
                  {" by "}
                  <span className="font-medium">
                    {request.requester.display_first_name} {request.requester.display_last_name}
                  </span>
                </>
              )}
            </p>
          </div>

          {/* Error Display */}
          {(approveMutation.isError || rejectMutation.isError || cancelMutation.isError) && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {approveMutation.error?.message || rejectMutation.error?.message || cancelMutation.error?.message || "Failed to process request"}
              </AlertDescription>
            </Alert>
          )}

          {/* Action Buttons - Show based on request type */}
          {isIncomingRequest && (
            <div className="flex flex-col md:flex-row gap-2 pt-2">
              <Button
                onClick={handleApproveClick}
                disabled={approveMutation.isPending || rejectMutation.isPending}
                className="w-full md:flex-1 bg-green-600 hover:bg-green-700 text-white"
              >
                {approveMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Approving...
                  </>
                ) : (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    Approve
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={handleRejectClick}
                disabled={approveMutation.isPending || rejectMutation.isPending}
                className="w-full md:flex-1 border-red-600 text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
              >
                {rejectMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Rejecting...
                  </>
                ) : (
                  <>
                    <X className="mr-2 h-4 w-4" />
                    Reject
                  </>
                )}
              </Button>
            </div>
          )}

          {/* Admin Approve + Cancel Button - Show for non-incoming requests if user is admin */}
          {!isIncomingRequest && currentUser?.is_superuser && isOutgoingRequest && (
            <div className="flex flex-col md:flex-row gap-2 pt-2">
              <Button
                onClick={handleApproveClick}
                disabled={approveMutation.isPending || cancelMutation.isPending}
                className="w-full md:flex-1 bg-green-600 hover:bg-green-700 text-white"
              >
                {approveMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Approving...
                  </>
                ) : (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    Approve as Admin
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={handleCancelClick}
                disabled={approveMutation.isPending || cancelMutation.isPending}
                className="w-full md:flex-1 border-red-600 text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
              >
                {cancelMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Cancelling...
                  </>
                ) : (
                  <>
                    <X className="mr-2 h-4 w-4" />
                    Cancel Request
                  </>
                )}
              </Button>
            </div>
          )}

          {/* Cancel Only - Show for outgoing requests if user is NOT admin */}
          {isOutgoingRequest && !currentUser?.is_superuser && (
            <div className="pt-2">
              <Button
                variant="outline"
                onClick={handleCancelClick}
                disabled={cancelMutation.isPending}
                className="w-full border-red-600 text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
              >
                {cancelMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Cancelling...
                  </>
                ) : (
                  <>
                    <X className="mr-2 h-4 w-4" />
                    Cancel Request
                  </>
                )}
              </Button>
            </div>
          )}

          {/* Show message if current user has no action available */}
          {!isIncomingRequest && !isOutgoingRequest && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                This request is pending approval from the proposed caretaker or an administrator.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Approve Confirmation Dialog */}
      <AlertDialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {currentUser?.is_superuser && !isIncomingRequest 
                ? "Approve Caretaker Request as Admin"
                : "Approve Caretaker Request"
              }
            </AlertDialogTitle>
            <AlertDialogDescription>
              {currentUser?.is_superuser && !isIncomingRequest ? (
                <>
                  Are you sure you want to approve this caretaker request? This will establish the caretaker relationship immediately.
                  <span className="block mt-2 font-medium text-foreground">
                    This will bypass the normal approval process.
                  </span>
                </>
              ) : (
                <>
                  Are you sure you want to approve this caretaker request? You will become the caretaker for {userNeedingCaretaker.display_first_name} {userNeedingCaretaker.display_last_name} and be able to manage their projects.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={approveMutation.isPending}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmApprove}
              disabled={approveMutation.isPending}
              className="bg-green-600 hover:bg-green-700"
            >
              {approveMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Approving...
                </>
              ) : (
                currentUser?.is_superuser && !isIncomingRequest ? "Approve as Admin" : "Approve"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reject Confirmation Dialog */}
      <AlertDialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reject Caretaker Request</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to reject this caretaker request? The requester will be notified.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep Pending</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmReject}
              className="bg-red-600 hover:bg-red-700"
            >
              {rejectMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Rejecting...
                </>
              ) : (
                "Reject"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Cancel Confirmation Dialog */}
      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Caretaker Request</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel this caretaker request? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-4">
            <AlertDialogCancel>Keep Request</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmCancel}
              className="bg-red-600 hover:bg-red-700"
            >
              {cancelMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Cancelling...
                </>
              ) : (
                "Cancel Request"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};