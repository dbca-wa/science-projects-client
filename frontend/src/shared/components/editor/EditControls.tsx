import { useEffect } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/shared/components/ui/button";

export interface EditControlsProps {
	onSave: () => void;
	onCancel: () => void;
	isSaving?: boolean;
	hasChanges?: boolean;
	saveLabel?: string;
	cancelLabel?: string;
}

/**
 * EditControls component
 *
 * Provides Save and Cancel buttons for inline editing with:
 * - Loading spinner during save
 * - Disabled Save when no changes
 * - Keyboard shortcuts (Ctrl+S, Escape)
 * - Proper ARIA labels
 */
export function EditControls({
	onSave,
	onCancel,
	isSaving = false,
	hasChanges = true,
	saveLabel = "Save",
	cancelLabel = "Cancel",
}: EditControlsProps) {
	// Handle keyboard shortcuts
	useEffect(() => {
		const handleKeyDown = (event: KeyboardEvent) => {
			// Ctrl+S or Cmd+S to save
			if ((event.ctrlKey || event.metaKey) && event.key === "s") {
				event.preventDefault();
				if (hasChanges && !isSaving) {
					onSave();
				}
			}

			// Escape to cancel
			if (event.key === "Escape") {
				event.preventDefault();
				if (!isSaving) {
					onCancel();
				}
			}
		};

		document.addEventListener("keydown", handleKeyDown);
		return () => document.removeEventListener("keydown", handleKeyDown);
	}, [onSave, onCancel, hasChanges, isSaving]);

	return (
		<div className="flex items-center gap-2">
			<Button
				type="button"
				onClick={onCancel}
				disabled={isSaving}
				variant="outline"
				size="sm"
				aria-label={cancelLabel}
			>
				{cancelLabel}
			</Button>

			<Button
				type="button"
				onClick={onSave}
				disabled={!hasChanges || isSaving}
				size="sm"
				aria-label={isSaving ? "Saving changes" : saveLabel}
			>
				{isSaving && (
					<Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
				)}
				{saveLabel}
			</Button>
		</div>
	);
}
