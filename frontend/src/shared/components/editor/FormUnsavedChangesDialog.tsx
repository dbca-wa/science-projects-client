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

interface FormUnsavedChangesDialogProps {
	isOpen: boolean;
	onStay: () => void;
	onLeave: () => void;
}

/**
 * FormUnsavedChangesDialog
 *
 * Simple confirmation dialog for form-based editors (FormRichTextEditor).
 * Unlike UnsavedChangesDialog (for inline editors), this doesn't show diffs
 * or individual save/discard buttons. It simply asks if the user wants to
 * leave without saving their form changes.
 *
 * Use with React Hook Form's useBlocker and formState.isDirty.
 *
 * @example
 * ```tsx
 * const blocker = useBlocker(({ currentLocation, nextLocation }) => {
 *   return form.formState.isDirty &&
 *          currentLocation.pathname !== nextLocation.pathname;
 * });
 *
 * <FormUnsavedChangesDialog
 *   isOpen={blocker.state === "blocked"}
 *   onStay={() => blocker.reset?.()}
 *   onLeave={() => {
 *     form.reset();
 *     blocker.proceed?.();
 *   }}
 * />
 * ```
 */
export const FormUnsavedChangesDialog = ({
	isOpen,
	onStay,
	onLeave,
}: FormUnsavedChangesDialogProps) => {
	return (
		<AlertDialog open={isOpen} onOpenChange={() => {}}>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>Unsaved Changes</AlertDialogTitle>
					<AlertDialogDescription>
						You have unsaved changes in this form. If you leave now, your
						changes will be lost. Are you sure you want to leave without saving?
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel onClick={onStay}>Stay on Page</AlertDialogCancel>
					<AlertDialogAction
						onClick={onLeave}
						className="bg-red-600 hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-700"
					>
						Leave Without Saving
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
};

FormUnsavedChangesDialog.displayName = "FormUnsavedChangesDialog";
