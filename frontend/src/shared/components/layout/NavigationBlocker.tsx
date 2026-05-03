import { useBlocker } from "react-router";
import { observer } from "mobx-react-lite";
import { inlineEditStore } from "@/app/stores/InlineEditStore";
import { useEffect } from "react";
import { toast } from "sonner";

/**
 * NavigationBlocker
 *
 * Blocks navigation when inline editors have unsaved changes.
 * Instead of showing a modal dialog, it scrolls to the first unsaved editor
 * and shows a toast notification. The user must save or discard each editor
 * before navigation is allowed.
 *
 * Flow:
 * 1. User tries to navigate with unsaved changes
 * 2. Navigation is blocked
 * 3. Page scrolls to the first unsaved editor
 * 4. Toast shows: "You have unsaved changes in [editor name]"
 * 5. User saves/discards that editor
 * 6. If more unsaved editors remain, repeat on next navigation attempt
 * 7. Once all editors are saved, navigation proceeds
 */
export const NavigationBlocker = observer(() => {
	// Block ALL navigation when there are unsaved changes
	const blocker = useBlocker(({ currentLocation, nextLocation }) => {
		const hasChanges = inlineEditStore.hasUnsavedChanges;
		const pathChanged = currentLocation.pathname !== nextLocation.pathname;

		return hasChanges && pathChanged;
	});

	// When navigation is blocked, scroll to the first unsaved editor and show a toast
	useEffect(() => {
		if (blocker.state === "blocked") {
			const editors = inlineEditStore.editorsWithChanges;
			const firstEditor = editors[0];

			if (firstEditor) {
				// Format a readable label from the contentType
				const label = firstEditor.contentType
					.replace(/-/g, " ")
					.replace(/\b\w/g, (c) => c.toUpperCase());

				// Scroll to and highlight the editor (works for both inline and form-based)
				inlineEditStore.scrollToEditor(firstEditor.identifier);

				toast.warning(`Unsaved changes in "${label}"`, {
					description: "Save or discard your changes before navigating away.",
					duration: 4000,
				});
			}

			// Reset the blocker so the user can try again after saving
			blocker.reset?.();
		}
	}, [blocker.state, blocker]);

	// Block browser-level navigation (tab close, refresh)
	// Shows the browser's native "Leave site?" dialog
	useEffect(() => {
		const handleBeforeUnload = (e: BeforeUnloadEvent) => {
			if (inlineEditStore.hasUnsavedChanges) {
				e.preventDefault();
				e.returnValue = "";
			}
		};

		window.addEventListener("beforeunload", handleBeforeUnload);
		return () => window.removeEventListener("beforeunload", handleBeforeUnload);
	}, []);

	// No UI to render — toast is shown imperatively
	return null;
});

NavigationBlocker.displayName = "NavigationBlocker";
