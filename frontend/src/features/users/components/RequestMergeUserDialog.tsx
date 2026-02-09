import { useState } from "react";
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

interface RequestMergeUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void | Promise<void>;
}

/**
 * Request merge user dialog
 * Creates admin task for merging duplicate accounts with detailed explanation of the merge process
 */
export const RequestMergeUserDialog = ({
  open,
  onOpenChange,
  onConfirm,
}: RequestMergeUserDialogProps) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleConfirm = async () => {
    setIsLoading(true);
    try {
      await onConfirm();
      onOpenChange(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-2xl">
        <AlertDialogHeader>
          <AlertDialogTitle>Request Merge?</AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-4">
              <p className="text-blue-500 dark:text-blue-400">
                This form is for merging duplicate users. Please ensure that the
                user you merge has the correct information.
              </p>
              <ul className="list-disc ml-6 space-y-1">
                <li>
                  The primary user (you) will receive any projects belonging to
                  the secondary user (account you merge with)
                </li>
                <li>
                  The primary user (you) will receive any comments belonging to
                  the secondary user (account you merge with)
                </li>
                <li>
                  The primary user (you) will receive any documents and roles
                  belonging to the secondary user (account you merge with) on
                  projects, where applicable (if primary user is already on the
                  project and has a higher role, they will maintain the higher
                  role)
                </li>
                <li className="underline text-destructive">
                  The secondary user (account you merge with) will be deleted
                  from the system. This is permanent.
                </li>
              </ul>
              <p className="text-center font-bold text-destructive underline pt-2">
                Once approved by admins, this is permanent.
              </p>
              <p className="text-center font-semibold text-blue-500 dark:text-blue-400 pt-2">
                If you wish to proceed, click "Request Merge". Clicking the
                button will send a request to the admins, so the process may
                take time.
              </p>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={isLoading}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isLoading ? "Requesting..." : "Request Merge"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
