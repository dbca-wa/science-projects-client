import { useState, useEffect } from "react";
import { observer } from "mobx-react-lite";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/shared/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/shared/components/ui/dialog";
import { inlineEditStore } from "@/app/stores/InlineEditStore";
import { ContentDiff } from "./ContentDiff";

interface UnsavedChangesDialogProps {
	isOpen: boolean;
	onProceed: () => void;
	onCancel: () => void;
}

/**
 * UnsavedChangesDialog
 *
 * Displays a confirmation dialog when the user attempts to navigate away
 * from a page with unsaved changes in inline editors.
 *
 * Enhanced with:
 * - Multi-editor navigation
 * - Content diff display
 * - Individual editor scrolling
 * - Save/discard per editor
 *
 * Based on the original SPMS frontend OpenEditorDialog design.
 */
export const UnsavedChangesDialog = observer(
	({ isOpen, onProceed, onCancel }: UnsavedChangesDialogProps) => {
		// State for tracking current editor and saving status
		const [currentIndex, setCurrentIndex] = useState(0);
		const [isSaving, setIsSaving] = useState(false);
		const [scrollAnnouncement, setScrollAnnouncement] = useState("");

		// Get editors with unsaved changes from store
		const editorsWithChanges = inlineEditStore.editorsWithChanges;
		const currentEditor = editorsWithChanges[currentIndex];
		const totalCount = editorsWithChanges.length;

		// Reset index when dialogue opens
		useEffect(() => {
			if (isOpen) {
				setCurrentIndex(0);
			}
		}, [isOpen]);

		// Scroll to current editor when index changes
		useEffect(() => {
			if (currentEditor && isOpen) {
				// Scroll to editor using store method
				inlineEditStore.scrollToEditor(currentEditor.identifier);

				// Update screen reader announcement
				setScrollAnnouncement(
					`Scrolling to editor ${currentIndex + 1} of ${totalCount}`
				);

				// Clear announcement after it's been read
				const timer = setTimeout(() => setScrollAnnouncement(""), 1000);
				return () => clearTimeout(timer);
			}
		}, [currentIndex, currentEditor, isOpen, totalCount]);

		// Handler for saving current editor
		const handleSaveCurrent = async () => {
			if (!currentEditor || isSaving) return;

			setIsSaving(true);
			try {
				await inlineEditStore.saveEditor(
					currentEditor.contentType,
					currentEditor.entityId
				);

				toast.success("Changes saved successfully");

				// Check if there are more editors with changes
				if (inlineEditStore.unsavedCount === 0) {
					// Wait for query invalidation to trigger refetch
					// Increased to 300ms for more reliable refetch completion
					await new Promise((resolve) => setTimeout(resolve, 300));

					// All saved, proceed with navigation
					onProceed();
				} else {
					// Adjust index if needed (if we were at the end)
					if (currentIndex >= inlineEditStore.unsavedCount) {
						setCurrentIndex(Math.max(0, inlineEditStore.unsavedCount - 1));
					}
				}
			} catch (error) {
				const message =
					error instanceof Error ? error.message : "Failed to save changes";
				toast.error(message);
			} finally {
				setIsSaving(false);
			}
		};

		// Handler for discarding current editor
		const handleDiscardCurrent = () => {
			if (!currentEditor) return;

			inlineEditStore.discardEditor(
				currentEditor.contentType,
				currentEditor.entityId
			);

			// Check if there are more editors with changes
			if (inlineEditStore.unsavedCount === 0) {
				// All discarded, proceed with navigation
				onProceed();
			} else {
				// Adjust index if needed (if we were at the end)
				if (currentIndex >= inlineEditStore.unsavedCount) {
					setCurrentIndex(Math.max(0, inlineEditStore.unsavedCount - 1));
				}
			}
		};

		// Handler for saving all editors
		const handleSaveAll = async () => {
			setIsSaving(true);
			try {
				const result = await inlineEditStore.saveAll();

				if (result.errors.length === 0) {
					toast.success(
						`All ${result.successCount} editors saved successfully`
					);

					// Wait for query invalidation to trigger refetch
					// Increased to 300ms for more reliable refetch completion
					await new Promise((resolve) => setTimeout(resolve, 300));

					onProceed();
				} else {
					toast.error(
						`Saved ${result.successCount} editors, but ${result.errors.length} failed. Please review and try again.`
					);
				}
			} catch (error) {
				const message =
					error instanceof Error ? error.message : "Failed to save all changes";
				toast.error(message);
			} finally {
				setIsSaving(false);
			}
		};

		// Handler for discarding all editors
		const handleDiscardAll = () => {
			inlineEditStore.discardAll();
			onProceed();
		};

		// Handler for cancel
		const handleCancel = () => {
			onCancel();
		};

		return (
			<Dialog open={isOpen} onOpenChange={(open) => !open && handleCancel()}>
				<DialogContent
					className="sm:max-w-[800px] max-h-[90vh] flex flex-col gap-0 p-0"
					aria-labelledby="dialog-title"
					aria-describedby="dialog-description"
				>
					{/* Screen reader announcement for scrolling */}
					<div className="sr-only" aria-live="polite" aria-atomic="true">
						{scrollAnnouncement}
					</div>

					{/* Header */}
					<DialogHeader className="px-6 pt-6 pb-4 space-y-3">
						<DialogTitle className="text-xl font-semibold">
							Unsaved Changes
						</DialogTitle>
						<DialogDescription className="text-base">
							You have {totalCount} {totalCount === 1 ? "editor" : "editors"}{" "}
							with unsaved changes. Review and save or discard changes before
							proceeding.
						</DialogDescription>
					</DialogHeader>

					{/* Editor counter and navigation */}
					{totalCount > 1 && (
						<div className="px-6 py-3 bg-blue-50 dark:bg-blue-950/20 border-y border-blue-200 dark:border-blue-800">
							<div
								className="flex items-center justify-between"
								aria-live="polite"
								aria-atomic="true"
							>
								<span className="text-sm font-medium text-blue-900 dark:text-blue-300">
									Viewing editor {currentIndex + 1} of {totalCount}
								</span>

								<div className="flex items-center gap-2">
									<Button
										type="button"
										variant="outline"
										size="sm"
										onClick={() => setCurrentIndex(currentIndex - 1)}
										disabled={currentIndex === 0 || isSaving}
										aria-label="Previous editor"
										className="h-8"
									>
										<ChevronLeft className="h-4 w-4 mr-1" aria-hidden="true" />
										Previous
									</Button>
									<Button
										type="button"
										variant="outline"
										size="sm"
										onClick={() => setCurrentIndex(currentIndex + 1)}
										disabled={currentIndex === totalCount - 1 || isSaving}
										aria-label="Next editor"
										className="h-8"
									>
										Next
										<ChevronRight className="h-4 w-4 ml-1" aria-hidden="true" />
									</Button>
								</div>
							</div>
						</div>
					)}

					{/* Content diff display - scrollable */}
					{currentEditor && (
						<div className="flex-1 overflow-y-auto px-6 py-4">
							<ContentDiff
								originalContent={currentEditor.originalContent}
								currentContent={currentEditor.currentContent}
							/>
						</div>
					)}

					{/* Footer with actions */}
					<div className="px-6 pb-6 pt-4 space-y-3 border-t border-gray-200 dark:border-gray-700">
						{/* Current editor actions - Cancel, Discard (red), Save (green) */}
						<div className="flex items-center justify-between gap-3 p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
							<span className="text-sm font-medium text-muted-foreground">
								Current editor:
							</span>
							<div className="flex gap-2">
								<Button
									type="button"
									variant="outline"
									size="sm"
									onClick={handleCancel}
									disabled={isSaving}
								>
									Cancel
								</Button>
								<Button
									type="button"
									variant="destructive"
									size="sm"
									onClick={handleDiscardCurrent}
									disabled={isSaving}
								>
									Discard
								</Button>
								<Button
									type="button"
									size="sm"
									onClick={handleSaveCurrent}
									disabled={isSaving}
									className="bg-green-600 hover:bg-green-700 dark:bg-green-600 dark:hover:bg-green-700"
								>
									Save
								</Button>
							</div>
						</div>

						{/* All editors actions - only show if multiple editors */}
						{totalCount > 1 && (
							<div className="flex items-center justify-end gap-2">
								<Button
									type="button"
									variant="destructive"
									onClick={handleDiscardAll}
									disabled={isSaving}
									size="sm"
								>
									Discard all
								</Button>
								<Button
									type="button"
									onClick={handleSaveAll}
									disabled={isSaving}
									size="sm"
									className="bg-green-600 hover:bg-green-700 dark:bg-green-600 dark:hover:bg-green-700"
								>
									Save all ({totalCount})
								</Button>
							</div>
						)}
					</div>
				</DialogContent>
			</Dialog>
		);
	}
);

UnsavedChangesDialog.displayName = "UnsavedChangesDialog";
