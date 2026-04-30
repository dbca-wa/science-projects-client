import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
import { toast } from "sonner";
import { useToggleProfileVisibility } from "../../hooks/useToggleProfileVisibility";

interface HideProjectModalProps {
	isOpen: boolean;
	onClose: () => void;
	projectId: number;
	isCurrentlyHidden: boolean;
}

/**
 * Confirmation modal for toggling a project's visibility on the
 * current user's staff profile in the public science directory.
 */
export function HideProjectModal({
	isOpen,
	onClose,
	projectId,
	isCurrentlyHidden,
}: HideProjectModalProps) {
	const toggleMutation = useToggleProfileVisibility(projectId);

	const action = isCurrentlyHidden ? "Show" : "Hide";
	const oppositeState = isCurrentlyHidden ? "visible on" : "hidden from";

	const handleSubmit = async () => {
		const toastId = toast.loading("Changing project visibility...");
		try {
			await toggleMutation.mutateAsync();
			toast.success(
				`This project is now ${oppositeState} your staff profile.`,
				{ id: toastId }
			);
			onClose();
		} catch {
			// Error toast is handled by the mutation's onError;
			// dismiss the loading toast so it doesn't linger
			toast.dismiss(toastId);
		}
	};

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className="sm:max-w-[500px]">
				<DialogHeader>
					<DialogTitle>{action} Project From Staff Profile</DialogTitle>
					<DialogDescription>
						Are you sure you want to{" "}
						{isCurrentlyHidden
							? "show this project on your staff profile"
							: "hide this project from your staff profile"}
						?
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-3 text-sm">
					<p>
						This project {isCurrentlyHidden ? "will " : "will no longer "}
						appear on your projects tab in the science profiles public
						directory. You can change this setting at any time.
					</p>
					<p>
						If you would still like to proceed, press &ldquo;{action}&rdquo;.
					</p>
				</div>

				<DialogFooter className="gap-2">
					<Button type="button" variant="outline" onClick={onClose}>
						Cancel
					</Button>
					<Button
						onClick={handleSubmit}
						disabled={toggleMutation.isPending}
						variant="destructive"
					>
						{toggleMutation.isPending ? `${action}ing...` : action}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
