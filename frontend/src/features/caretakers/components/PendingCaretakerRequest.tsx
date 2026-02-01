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
import { UserDisplay } from "@/shared/components/UserDisplay";
import { toUserDisplayFormat, getCaretakerReasonLabel } from "@/shared/utils/user.utils";
import { formatDate } from "@/shared/utils/common.utils";
import { useApproveCaretakerTask } from "../hooks/useApproveCaretakerTask";
import { useRejectCaretakerTask } from "../hooks/useRejectCaretakerTask";
import type { IPendingCaretakerRequestProps } from "../types/caretaker.types";

/**
 * PendingCaretakerRequest component
 * Displays a pending caretaker request where someone wants YOU to be THEIR caretaker
 * 
 * Features:
 * - Shows the user who needs a caretaker (primary_user)
 * - Displays reason, end date (if applicable), notes (if provided)
 * - Shows status badge: "Pending Your Approval"
 * - Approve and Reject buttons with confirmation dialogs
 * - Success/error handling
 * 
 * @param request - AdminTask representing the pending request (you are in secondary_users)
 * @param onCancel - Callback when request is cancelled/approved/rejected
 */
export const PendingCaretakerRequest = ({ request, onCancel }: IPendingCaretakerRequestProps) => {
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  
  const approveMutation = useApproveCaretakerTask();
  const rejectMutation = useRejectCaretakerTask();

  // The primary_user is the person who needs a caretaker
  // You (current user) are being asked to be their caretaker
  const userNeedingCaretaker = request.primary_user;

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

  return (
    <>
      <Card className="border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-900/20">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Caretaker Request</CardTitle>
            <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
              Pending Your Approval
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
          {(approveMutation.isError || rejectMutation.isError) && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {approveMutation.error?.message || rejectMutation.error?.message || "Failed to process request"}
              </AlertDescription>
            </Alert>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            <Button
              onClick={handleApproveClick}
              disabled={approveMutation.isPending || rejectMutation.isPending}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white"
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
              className="flex-1 border-red-600 text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
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
        </CardContent>
      </Card>

      {/* Approve Confirmation Dialog */}
      <AlertDialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Approve Caretaker Request</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to approve this caretaker request? You will become the caretaker for {userNeedingCaretaker.display_first_name} {userNeedingCaretaker.display_last_name} and be able to manage their projects.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmApprove}
              className="bg-green-600 hover:bg-green-700"
            >
              {approveMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Approving...
                </>
              ) : (
                "Approve"
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
    </>
  );
};