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
import { getImageUrl } from "@/shared/utils/image.utils";
import { getCaretakerReasonLabel } from "@/shared/utils/user.utils";
import { formatDate } from "@/shared/utils/common.utils";
import { useCancelBecomeCaretakerRequest } from "../hooks/useCancelBecomeCaretakerRequest";
import { useApproveCaretakerTask } from "../hooks/useApproveCaretakerTask";
import { useCurrentUser } from "@/features/auth/hooks/useAuth";
import type { IAdminTask } from "../types/caretaker.types";

interface OutgoingCaretakerRequestProps {
  request: IAdminTask;
  onCancel: () => void;
}

/**
 * OutgoingCaretakerRequest component
 * Displays when YOU requested someone to be YOUR caretaker
 * 
 * Features:
 * - Shows the user you want as your caretaker (secondary_users[0])
 * - Displays message: "You requested [User] to be your caretaker"
 * - Shows reason, end date (if applicable), notes (if provided)
 * - Cancel button to withdraw your request
 * - Confirmation dialog for cancellation
 * 
 * @param request - AdminTask representing your outgoing request (you are primary_user)
 * @param onCancel - Callback when request is cancelled
 */
export const OutgoingCaretakerRequest = ({ request, onCancel }: OutgoingCaretakerRequestProps) => {
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const cancelMutation = useCancelBecomeCaretakerRequest();
  const approveMutation = useApproveCaretakerTask();
  const { data: currentUser } = useCurrentUser();

  // Check if current user is admin
  const isAdmin = currentUser?.is_superuser || false;

  // The secondary_users[0] is the person you want as your caretaker
  const targetUser = request.secondary_users && request.secondary_users.length > 0
    ? request.secondary_users[0]
    : null;

  if (!targetUser) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Error: Target user data not found in request.
        </AlertDescription>
      </Alert>
    );
  }

  const getUserName = () => {
    const firstName = targetUser.display_first_name;
    const lastName = targetUser.display_last_name;
    
    if (firstName && lastName) {
      return `${firstName} ${lastName}`;
    }
    
    return targetUser.email || "Unknown User";
  };

  const handleCancelClick = () => {
    setShowCancelDialog(true);
  };

  const handleApproveClick = () => {
    setShowApproveDialog(true);
  };

  const handleConfirmCancel = () => {
    cancelMutation.mutate(
      { taskId: request.id, userId: targetUser.id },
      {
        onSuccess: () => {
          setShowCancelDialog(false);
          onCancel();
        },
      }
    );
  };

  const handleConfirmApprove = () => {
    approveMutation.mutate(request.id, {
      onSuccess: () => {
        setShowApproveDialog(false);
        onCancel();
      },
    });
  };

  return (
    <>
      <Card className="border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Outgoing Caretaker Request</CardTitle>
            <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
              Awaiting Approval
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Request Message */}
          <div className="bg-white dark:bg-gray-800 p-4 rounded-md border border-blue-200 dark:border-blue-800">
            <p className="text-sm font-medium">
              You requested {getUserName()} to be your caretaker
            </p>
          </div>

          {/* Target User */}
          <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-2">
              User
            </h4>
            <UserDisplay 
              user={{
                id: targetUser.id,
                display_first_name: targetUser.display_first_name,
                display_last_name: targetUser.display_last_name,
                email: targetUser.email,
                image: getImageUrl(targetUser.image),
              }}
              showEmail={true} 
              size="md" 
            />
          </div>

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

          {/* Request Date */}
          <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-1">
              Requested On
            </h4>
            <p className="text-sm">{formatDate(request.created_at)}</p>
          </div>

          {/* Error Display */}
          {(cancelMutation.isError || approveMutation.isError) && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {cancelMutation.error?.message || approveMutation.error?.message || "Failed to process request"}
              </AlertDescription>
            </Alert>
          )}

          {/* Action Buttons */}
          {isAdmin ? (
            <div className="flex flex-col md:flex-row gap-2 pt-2">
              <Button
                onClick={handleApproveClick}
                disabled={cancelMutation.isPending || approveMutation.isPending}
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
                disabled={cancelMutation.isPending || approveMutation.isPending}
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
          ) : (
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
        </CardContent>
      </Card>

      {/* Cancel Confirmation Dialog */}
      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Caretaker Request</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel your request for {getUserName()} to be your caretaker?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
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

      {/* Approve Confirmation Dialog (Admin Only) */}
      {isAdmin && (
        <AlertDialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Approve Caretaker Request as Admin</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to approve this request? {getUserName()} will become your caretaker immediately.
                <span className="block mt-2 font-medium text-foreground">
                  This will bypass the normal approval process.
                </span>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="mt-4">
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
                  "Approve as Admin"
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </>
  );
};
