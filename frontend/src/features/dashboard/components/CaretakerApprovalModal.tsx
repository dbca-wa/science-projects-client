import { observer } from "mobx-react-lite";
import { useState, useEffect, useRef } from "react";
import { useApproveCaretakerTask } from "../hooks/useApproveCaretakerTask";
import { useRejectCaretakerTask } from "../hooks/useRejectCaretakerTask";
import { useAdminTasks } from "../hooks/useDashboardTasks";
import { Button } from "@/shared/components/ui/button";
import { Alert, AlertDescription } from "@/shared/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerTitle,
  DrawerDescription,
} from "@/shared/components/ui/drawer";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { Badge } from "@/shared/components/ui/badge";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/shared/components/ui/avatar";
import {
  AlertCircle,
  X,
  Check,
  XCircle,
  Loader2,
  Users,
} from "lucide-react";
import { format } from "date-fns";
import { getImageUrl } from "@/shared/utils/image.utils";
import { formatCaretakerReason } from "../utils/dashboard.utils";
import type { IAdminTask } from "../types/admin-tasks.types";

interface CaretakerApprovalModalProps {
  taskId: number | null;
  open: boolean;
  onClose: () => void;
}

const useMediaQuery = (query: string): boolean => {
  const [matches, setMatches] = useState(() => {
    return window.matchMedia(query).matches;
  });

  useEffect(() => {
    const media = window.matchMedia(query);
    const listener = () => setMatches(media.matches);
    
    media.addEventListener("change", listener);
    return () => media.removeEventListener("change", listener);
  }, [query]);

  return matches;
};

/**
 * CaretakerApprovalModal component
 * Responsive modal/drawer for approving or rejecting caretaker requests
 * - Desktop/Tablet: Centered dialog modal
 * - Mobile: Bottom drawer
 */
export const CaretakerApprovalModal = observer(
  ({ taskId, open, onClose }: CaretakerApprovalModalProps) => {
    const isDesktop = useMediaQuery("(min-width: 768px)");
    
    // Fetch admin tasks
    const { data: adminTasksData, isLoading, error } = useAdminTasks();
    
    // Find the specific caretaker task
    const task = adminTasksData?.find(
      (t: IAdminTask) => t.id === taskId && t.action === "setcaretaker"
    );

    // Keep the last valid task to prevent flashing "not found" during close
    const lastValidTaskRef = useRef<IAdminTask | null>(null);
    useEffect(() => {
      if (task) {
        lastValidTaskRef.current = task;
      }
    }, [task]);

    const displayTask = task || lastValidTaskRef.current;

    // Mutation hooks
    const approveMutation = useApproveCaretakerTask();
    const rejectMutation = useRejectCaretakerTask();

    const handleApprove = () => {
      if (!taskId) return;

      approveMutation.mutate(taskId, {
        onSuccess: () => {
          onClose();
        },
      });
    };

    const handleReject = () => {
      if (!taskId) return;

      rejectMutation.mutate(taskId, {
        onSuccess: () => {
          onClose();
        },
      });
    };

    const primaryUser = displayTask?.primary_user;
    const caretaker = displayTask?.secondary_users?.[0];
    const requester = displayTask?.requester;

    const contentComponent = (
      <>
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
              <AlertDescription>
                Failed to load caretaker request details
              </AlertDescription>
            </Alert>
          </div>
        )}

        {/* Task not found */}
        {!displayTask && !isLoading && !error && open && (
          <div className="p-6">
            <Alert variant="destructive">
              <AlertCircle className="size-4" />
              <AlertDescription>
                Caretaker request not found
              </AlertDescription>
            </Alert>
          </div>
        )}

        {/* Task details */}
        {displayTask && (
          <>
            {/* Header */}
            <div className="p-6 pb-4">
              <h2 className="text-2xl font-bold">Caretaker Request</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Review and approve or reject this caretaker request
              </p>
            </div>

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto px-6">
              {/* User Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {/* Primary User Card */}
                <div className="border border-gray-300 dark:border-gray-500 rounded-xl p-4">
                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
                    For (User)
                  </p>
                  {primaryUser ? (
                    <div className="flex items-center gap-3">
                      <Avatar className="size-12">
                        <AvatarImage src={getImageUrl(primaryUser.image)} />
                        <AvatarFallback>
                          {primaryUser.display_first_name?.[0]}
                          {primaryUser.display_last_name?.[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-green-600 dark:text-green-400 truncate">
                          {primaryUser.display_first_name} {primaryUser.display_last_name}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                          {primaryUser.email}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-4 text-muted-foreground">
                      <Users className="mx-auto h-8 w-8 mb-2 opacity-50" />
                      <p className="text-sm">User information not available</p>
                    </div>
                  )}
                </div>

                {/* Caretaker Card */}
                <div className="border border-gray-300 dark:border-gray-500 rounded-xl p-4">
                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
                    Proposed Caretaker
                  </p>
                  {caretaker ? (
                    <div className="flex items-center gap-3">
                      <Avatar className="size-12">
                        <AvatarImage src={getImageUrl(caretaker.image)} />
                        <AvatarFallback>
                          {caretaker.display_first_name?.[0]}
                          {caretaker.display_last_name?.[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-blue-600 dark:text-blue-400 truncate">
                          {caretaker.display_first_name} {caretaker.display_last_name}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                          {caretaker.email}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-4 text-muted-foreground">
                      <Users className="mx-auto h-8 w-8 mb-2 opacity-50" />
                      <p className="text-sm">Caretaker information not available</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Request Details */}
              <div className="border border-gray-300 dark:border-gray-500 rounded-xl p-4 mb-6">
                <p className="font-bold text-sm mb-3 text-gray-600 dark:text-gray-300">
                  Request Details
                </p>
                <div className="space-y-3">
                  {/* Reason */}
                  {displayTask.reason && (
                    <div>
                      <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                        Reason
                      </p>
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mt-1">
                        {formatCaretakerReason(displayTask.reason)}
                      </p>
                    </div>
                  )}

                  {/* End Date */}
                  {displayTask.end_date && (
                    <div>
                      <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                        Until
                      </p>
                      <p className="text-sm text-gray-900 dark:text-gray-100 mt-1">
                        {format(new Date(displayTask.end_date), "MMMM d, yyyy")}
                      </p>
                    </div>
                  )}

                  {/* Notes */}
                  {displayTask.notes && (
                    <div>
                      <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                        Notes
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {displayTask.notes}
                      </p>
                    </div>
                  )}

                  {/* Requester */}
                  {requester && (
                    <div>
                      <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                        Requested By
                      </p>
                      <p className="text-sm text-gray-900 dark:text-gray-100 mt-1">
                        {requester.display_first_name} {requester.display_last_name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-500">
                        on {format(new Date(displayTask.created_at), "MMM d, yyyy 'at' h:mm a")}
                      </p>
                    </div>
                  )}

                  {/* Status Badge */}
                  <div>
                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                      Status
                    </p>
                    <Badge className="mt-1 bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 capitalize">
                      {displayTask.status}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons - Fixed at bottom */}
            <div className="flex flex-col sm:flex-row gap-3 p-6 pt-4 border-t border-gray-200 dark:border-gray-700">
              <Button
                onClick={handleApprove}
                disabled={approveMutation.isPending || rejectMutation.isPending}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                aria-label="Approve caretaker request"
              >
                {approveMutation.isPending ? (
                  <>
                    <Loader2 className="size-4 mr-2 animate-spin" />
                    Approving...
                  </>
                ) : (
                  <>
                    <Check className="size-4 mr-2" />
                    Approve
                  </>
                )}
              </Button>
              <Button
                onClick={handleReject}
                disabled={approveMutation.isPending || rejectMutation.isPending}
                variant="destructive"
                className="flex-1"
                aria-label="Reject caretaker request"
              >
                {rejectMutation.isPending ? (
                  <>
                    <Loader2 className="size-4 mr-2 animate-spin" />
                    Rejecting...
                  </>
                ) : (
                  <>
                    <XCircle className="size-4 mr-2" />
                    Reject
                  </>
                )}
              </Button>
            </div>
          </>
        )}
      </>
    );

    const mobileContentComponent = (
      <>
        {/* Accessibility - Hidden title and description for screen readers */}
        <DrawerTitle className="sr-only">Caretaker Request</DrawerTitle>
        <DrawerDescription className="sr-only">
          Review and approve or reject this caretaker request
        </DrawerDescription>

        {/* Close button - Mobile only */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="absolute right-4 top-4 z-10 size-8"
          aria-label="Close"
        >
          <X className="size-4" />
        </Button>

        {contentComponent}
      </>
    );

    // Desktop: Dialog (centered modal)
    if (isDesktop) {
      return (
        <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
          <DialogContent className="max-w-3xl max-h-[90vh] p-0 flex flex-col">
            <DialogTitle className="sr-only">Caretaker Request</DialogTitle>
            {contentComponent}
          </DialogContent>
        </Dialog>
      );
    }

    // Mobile: Drawer (from bottom)
    return (
      <Drawer 
        open={open} 
        onOpenChange={(isOpen) => !isOpen && onClose()}
        dismissible={true}
        shouldScaleBackground={false}
      >
        <DrawerContent className="max-h-[90vh] flex flex-col">
          {mobileContentComponent}
        </DrawerContent>
      </Drawer>
    );
  }
);
