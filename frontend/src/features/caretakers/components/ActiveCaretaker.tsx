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
import { Loader2, AlertCircle, UserX, AlertTriangle } from "lucide-react";
import { UserDisplay } from "@/shared/components/user";
import { useRemoveCaretaker } from "../hooks/useRemoveCaretaker";
import { formatDate, isDateExpired } from "@/shared/utils/common.utils";
import { getCaretakerReasonLabel } from "@/shared/utils/user.utils";
import type { IActiveCaretakerProps } from "../types";

/**
 * ActiveCaretaker component
 * Displays active caretaker with remove option
 * 
 * Features:
 * - Shows caretaker using UserDisplay component
 * - Displays reason, end date (if applicable)
 * - Shows status: "Active" or "Expired" (if end date passed)
 * - Remove button with confirmation dialog
 * - Warning if removing active caretaker
 * - Success/error handling
 * 
 * @param caretaker - Caretaker object representing the active assignment
 * @param onRemove - Callback when caretaker is removed
 */
export const ActiveCaretaker = ({ caretaker, onRemove }: IActiveCaretakerProps) => {
  const [showRemoveDialog, setShowRemoveDialog] = useState(false);
  const removeMutation = useRemoveCaretaker();

  // Check if caretaker assignment is expired
  const isExpired = isDateExpired(caretaker.end_date);

  const handleRemoveClick = () => {
    setShowRemoveDialog(true);
  };

  const handleConfirmRemove = () => {
    removeMutation.mutate(caretaker.id, {
      onSuccess: () => {
        setShowRemoveDialog(false);
        onRemove();
      },
    });
  };

  const getStatusBadge = () => {
    if (isExpired) {
      return (
        <Badge variant="secondary" className="bg-red-100 text-red-800">
          Expired
        </Badge>
      );
    }
    
    return (
      <Badge variant="secondary" className="bg-green-100 text-green-800">
        Active
      </Badge>
    );
  };

  return (
    <>
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Active Caretaker</CardTitle>
            {getStatusBadge()}
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Caretaker Information */}
          <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-2">
              Caretaker
            </h4>
            <UserDisplay 
              user={caretaker.caretaker} 
              showEmail={true} 
              size="md" 
            />
          </div>

          {/* Caretaker Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-1">
                Reason
              </h4>
              <p className="text-sm">{getCaretakerReasonLabel(caretaker.reason)}</p>
            </div>

            {caretaker.end_date && (
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-1">
                  End Date
                </h4>
                <p className={`text-sm ${isExpired ? 'text-red-600 font-medium' : ''}`}>
                  {formatDate(caretaker.end_date)}
                  {isExpired && " (Expired)"}
                </p>
              </div>
            )}
          </div>

          {/* Notes (if provided) */}
          {caretaker.notes && (
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-1">
                Notes
              </h4>
              <p className="text-sm bg-gray-50 p-3 rounded-md">{caretaker.notes}</p>
            </div>
          )}

          {/* Assignment Date */}
          <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-1">
              Assigned On
            </h4>
            <p className="text-sm">{formatDate(caretaker.created_at)}</p>
          </div>

          {/* Expired Warning */}
          {isExpired && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                This caretaker assignment has expired. Consider removing it or updating the end date.
              </AlertDescription>
            </Alert>
          )}

          {/* Error Display */}
          {removeMutation.isError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {removeMutation.error?.message || "Failed to remove caretaker"}
              </AlertDescription>
            </Alert>
          )}

          {/* Remove Button */}
          <div className="flex justify-end pt-2">
            <Button
              variant="outline"
              onClick={handleRemoveClick}
              disabled={removeMutation.isPending}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              {removeMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Removing...
                </>
              ) : (
                <>
                  <UserX className="mr-2 h-4 w-4" />
                  Remove Caretaker
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Remove Confirmation Dialog */}
      <AlertDialog open={showRemoveDialog} onOpenChange={setShowRemoveDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Caretaker</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove this caretaker? They will no longer be able to manage your projects.
              {!isExpired && (
                <span className="block mt-2 font-medium text-amber-600">
                  Warning: This caretaker assignment is still active.
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep Caretaker</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmRemove}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {removeMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Removing...
                </>
              ) : (
                "Remove Caretaker"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};