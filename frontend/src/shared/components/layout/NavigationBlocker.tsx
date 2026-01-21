import { useBlocker } from "react-router";
import { observer } from "mobx-react-lite";
import { useEditorStore } from "@/app/stores/store-context";
import { OpenEditorDialog } from "../rich-text/components/OpenEditorDialog";

/**
 * Blocks navigation when editors are open with unsaved changes
 * Integrates EditorStore with React Router's navigation blocker
 */
export const NavigationBlocker = observer(() => {
	const editorStore = useEditorStore();

	const blocker = useBlocker(({ currentLocation, nextLocation }) => {
		return editorStore.shouldBlockNavigation(
			currentLocation.pathname,
			nextLocation.pathname
		);
	});

	const handleProceed = () => {
		editorStore.handleProceed(blocker.proceed);
	};

	const handleReset = () => {
		editorStore.handleReset(blocker.reset);
	};

	return (
		<OpenEditorDialog
			isOpen={editorStore.isDialogOpen}
			proceed={handleProceed}
			reset={handleReset}
		/>
	);
});

NavigationBlocker.displayName = "NavigationBlocker";
