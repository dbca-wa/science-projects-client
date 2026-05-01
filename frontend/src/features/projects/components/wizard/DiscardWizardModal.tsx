import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
import { AlertTriangle } from "lucide-react";

interface DiscardWizardModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onConfirm: () => void;
}

/**
 * DiscardWizardModal - Confirmation modal shown when the user clicks Discard
 *
 * Warns the user that all unsaved changes will be lost and the form will be reset.
 */
export function DiscardWizardModal({
	open,
	onOpenChange,
	onConfirm,
}: DiscardWizardModalProps) {
	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<div className="flex items-center gap-3">
						<div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10">
							<AlertTriangle className="h-5 w-5 text-destructive" />
						</div>
						<DialogTitle>Discard project?</DialogTitle>
					</div>
					<DialogDescription className="pt-2">
						All unsaved changes will be lost and the form will be reset. This
						action cannot be undone.
					</DialogDescription>
				</DialogHeader>
				<DialogFooter className="gap-2 sm:gap-0">
					<Button variant="outline" onClick={() => onOpenChange(false)}>
						Cancel
					</Button>
					<Button variant="destructive" onClick={onConfirm}>
						Discard
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
