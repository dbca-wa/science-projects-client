import { useBlocker } from "react-router";
import { observer } from "mobx-react-lite";
import { inlineEditStore } from "@/app/stores/InlineEditStore";
import { UnsavedChangesDialog } from "../editor/UnsavedChangesDialog";
import { useState, useEffect } from "react";

/**
 * NavigationBlocker
 *
 * Blocks navigation when inline editors have unsaved changes.
 * Integrates InlineEditStore with React Router's navigation blocker.
 *
 * Note: Browser-level navigation (refresh, close tab, back button) cannot show
 * custom dialogs due to browser security restrictions. The browser's default
 * "Leave site?" dialog will be shown instead.
 *
 */
export const NavigationBlocker = observer(() => {
	const [isDialogOpen, setIsDialogOpen] = useState(false);

	// Block navigation when there are unsaved changes
	const blocker = useBlocker(({ currentLocation, nextLocation }) => {
		const hasChanges = inlineEditStore.hasUnsavedChanges;
		const pathChanged = currentLocation.pathname !== nextLocation.pathname;

		return hasChanges && pathChanged;
	});

	// Handle blocker state changes
	useEffect(() => {
		if (blocker.state === "blocked") {
			setIsDialogOpen(true);
		}
	}, [blocker.state]);

	// Block browser-level navigation (tab close, refresh, back button)
	// Note: We can only show the browser's default dialog, not our custom one
	useEffect(() => {
		const handleBeforeUnload = (e: BeforeUnloadEvent) => {
			// Access the computed value directly each time (not captured in closure)
			const hasChanges = inlineEditStore.hasUnsavedChanges;

			if (hasChanges) {
				// Standard way to trigger browser confirmation dialog
				e.preventDefault();
				// Chrome requires returnValue to be set
				e.returnValue = "";
			}
		};

		window.addEventListener("beforeunload", handleBeforeUnload);

		return () => {
			window.removeEventListener("beforeunload", handleBeforeUnload);
		};
	}, []); // Empty deps - handler accesses store directly

	const handleProceed = () => {
		setIsDialogOpen(false);
		// Clear all active edits before proceeding
		inlineEditStore.clearAll();
		// Allow navigation to proceed
		if (blocker.state === "blocked") {
			blocker.proceed?.();
		}
	};

	const handleCancel = () => {
		setIsDialogOpen(false);
		// Reset the blocker to stay on current page
		if (blocker.state === "blocked") {
			blocker.reset?.();
		}
	};

	return (
		<UnsavedChangesDialog
			isOpen={isDialogOpen}
			onProceed={handleProceed}
			onCancel={handleCancel}
		/>
	);
});

NavigationBlocker.displayName = "NavigationBlocker";
