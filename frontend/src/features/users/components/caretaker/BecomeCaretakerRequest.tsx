import { useState } from "react";
import { Badge } from "@/shared/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Alert, AlertDescription } from "@/shared/components/ui/alert";
import { Button } from "@/shared/components/ui/button";
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
import { Info, Check, X, Loader2 } from "lucide-react";
import { UserDisplay } from "@/shared/components/UserDisplay";
import { useRespondToCaretakerRequest } from "../../hooks/useRespondToCaretakerRequest";
import { formatDate } from "@/shared/utils/common.utils";
import { getCaretakerReasonLabel } from "@/shared/utils/user.utils";
import { toast } from "sonner";
import type { BecomeCaretakerRequestProps } from "../../types/caretaker.types";

/**
 * BecomeCaretakerRequest component
 * 
 * ⚠️ IMPORTANT: This component is currently NOT USED in the application.
 * 
 * INTENDED USE CASE (not yet implemented):
 * This component is designed for a scenario where someone requests YOU to become THEIR caretaker.
 * In this case:
 * - You would be in secondary_users array
 * - The person needing a caretaker would be primary_user
 * - You would see: "You have been requested to be [User]'s caretaker"
 * - You can approve or reject the request
 * 
 * CURRENT IMPLEMENTATION:
 * The current caretaker system works differently:
 * - Users request someone to be THEIR caretaker (not the other way around)
 * - Use PendingCaretakerRequest for incoming requests (someone wants to be YOUR caretaker)
 * - Use OutgoingCaretakerRequest for outgoing requests (YOU want to be someone's caretaker)
 * 
 * This component may be useful if the system is extended to allow users to request
 * specific people to become their caretaker (invitation-based system).
 * 
 * @param request - AdminTask representing the become caretaker request
 * @param onResponse - Callback after successful approve/reject
 */
export const BecomeCaretakerRequest = ({ request, onResponse }: BecomeCaretakerRequestProps) => {
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);

  const respondMutation = useRespondToCaretakerRequest();

  // The primary_user is the person who needs a caretaker
  // The current user (viewing this) is in secondary_users as the requested caretaker
  const userNeedingCaretaker = request.primary_user;

  const getUserName = () => {
    const firstName = userNeedingCaretaker.display_first_name;
    const lastName = userNeedingCaretaker.display_last_name;
    
    if (firstName && lastName) {
      return `${firstName} ${lastName}`;
    }
    
    return userNeedingCaretaker.email || "Unknown User";
  };

  const handleApprove = () => {
    respondMutation.mutate(
      { taskId: request.id, action: "approve" },
      {
        onSuccess: () => {
          toast.success("Caretaker request approved successfully");
          setShowApproveDialog(false);
          onResponse?.();
        },
        onError: (error: Error) => {
          toast.error(error.message || "Failed to approve request");
        },
      }
    );
  };

  const handleReject = () => {
    respondMutation.mutate(
      { taskId: request.id, action: "reject" },
      {
        onSuccess: () => {
          toast.success("Caretaker request rejected");
          setShowRejectDialog(false);
          onResponse?.();
        },
        onError: (error: Error) => {
          toast.error(error.message || "Failed to reject request");
        },
      }
    );
  };

  return (
    <>
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Caretaker Request</CardTitle>
            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
              Awaiting Your Response
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Request Message */}
          <div className="bg-blue-50 p-4 rounded-md">
            <p className="text-sm font-medium text-blue-900">
              You have been requested to be {getUserName()}'s caretaker
            </p>
          </div>

          {/* User Needing Caretaker Information */}
          <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-2">
              User Needing Caretaker
            </h4>
            <UserDisplay 
              user={{
                id: userNeedingCaretaker.id,
                display_first_name: userNeedingCaretaker.display_first_name,
                display_last_name: userNeedingCaretaker.display_last_name,
                email: userNeedingCaretaker.email,
                image: userNeedingCaretaker.image?.file || undefined,
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

          {/* Info Alert */}
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              You can approve or reject this request directly. Approving will make you the caretaker for this user.
            </AlertDescription>
          </Alert>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <Button
              onClick={() => setShowApproveDialog(true)}
              disabled={respondMutation.isPending}
              className="flex-1 bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800"
            >
              <Check className="mr-2 h-4 w-4" />
              Approve
            </Button>
            <Button
              onClick={() => setShowRejectDialog(true)}
              disabled={respondMutation.isPending}
              variant="destructive"
              className="flex-1"
            >
              <X className="mr-2 h-4 w-4" />
              Reject
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
              Are you sure you want to become {getUserName()}'s caretaker?
              <span className="block mt-2 font-medium text-foreground">
                You will be able to manage their projects during their absence.
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={respondMutation.isPending}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleApprove}
              disabled={respondMutation.isPending}
              className="bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800"
            >
              {respondMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Approving...
                </>
              ) : (
                "Approve Request"
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
              Are you sure you want to reject this caretaker request from {getUserName()}?
              <span className="block mt-2 text-sm">
                They will be notified that you declined to be their caretaker.
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={respondMutation.isPending}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleReject}
              disabled={respondMutation.isPending}
              className="bg-red-600 hover:bg-red-700"
            >
              {respondMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Rejecting...
                </>
              ) : (
                "Reject Request"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};