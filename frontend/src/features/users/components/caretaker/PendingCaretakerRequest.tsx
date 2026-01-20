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
import { Loader2, AlertCircle, X } from "lucide-react";
import { UserDisplay } from "@/shared/components/UserDisplay";
import { toUserDisplayFormat, getCaretakerReasonLabel } from "@/shared/utils/user.utils";
import { formatDate } from "@/shared/utils/common.utils";
import { useCancelCaretakerRequest } from "../../hooks/useCancelCaretakerRequest";
import type { PendingCaretakerRequestProps } from "../../types/caretaker.types";

/**
 * PendingCaretakerRequest component
 * Displays a pending caretaker request with cancel option
 * 
 * Features:
 * - Shows requested caretaker using UserDisplay component
 * - Displays reason, end date (if applicable), notes (if provided)
 * - Shows status badge: "Pending Admin Approval"
 * - Cancel button with confirmation dialog
 * - Success/error handling
 * 
 * @param request - AdminTask representing the pending request
 * @param onCancel - Callback when request is cancelled
 */
export const PendingCaretakerRequest = ({ request, onCancel }: PendingCaretakerRequestProps) => {
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const cancelMutation = useCancelCaretakerRequest();

  // Get the caretaker from secondary_users array
  // The AdminTaskSerializer serializes secondary_users as an array of user objects
  const caretakerUser = request.secondary_users && request.secondary_users.length > 0
    ? request.secondary_users[0]
    : null;

  if (!caretakerUser) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Error: Caretaker user data not found in request.
        </AlertDescription>
      </Alert>
    );
  }

  const handleCancelClick = () => {
    setShowCancelDialog(true);
  };

  const handleConfirmCancel = () => {
    cancelMutation.mutate(request.id, {
      onSuccess: () => {
        setShowCancelDialog(false);
        onCancel();
      },
    });
  };

  return (
    <>
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Pending Caretaker Request</CardTitle>
            <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
              Pending Approval
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Requested Caretaker */}
          <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-2">
              Requested Caretaker
            </h4>
            <UserDisplay 
              user={toUserDisplayFormat(caretakerUser)}
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
                  End Date
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
              <p className="text-sm bg-gray-50 p-3 rounded-md">{request.notes}</p>
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
          {cancelMutation.isError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {cancelMutation.error?.message || "Failed to cancel caretaker request"}
              </AlertDescription>
            </Alert>
          )}

          {/* Cancel Button */}
          <div className="flex justify-end pt-2">
            <Button
              variant="outline"
              onClick={handleCancelClick}
              disabled={cancelMutation.isPending}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
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
        </CardContent>
      </Card>

      {/* Cancel Confirmation Dialog */}
      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Caretaker Request</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel this caretaker request? This action cannot be undone.
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
    </>
  );
};