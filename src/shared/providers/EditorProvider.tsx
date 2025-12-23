import { observer } from "mobx-react-lite";
import { useEffect, type ReactNode } from "react";
import { useBlocker } from "react-router-dom";
import { useEditorStore } from "@/app/providers/store.provider";
import { OpenEditorDialog } from "@/shared/components/RichTextEditor/OpenEditorDialog";

interface IEditorProviderProps {
  children: ReactNode;
}

/**
 * EditorProvider component that uses MobX EditorStore for state management
 * and integrates with react-router-dom for navigation blocking
 */
export const EditorProvider = observer(({ children }: IEditorProviderProps) => {
  const editorStore = useEditorStore();

  // Block navigation when editors are open
  const blocker = useBlocker(({ currentLocation, nextLocation }) => {
    return editorStore.shouldBlockNavigation(
      currentLocation.pathname,
      nextLocation.pathname
    );
  });

  // Handle proceed action with router blocker integration
  const handleProceed = () => {
    editorStore.handleProceed(blocker?.proceed);
  };

  // Handle reset action with router blocker integration
  const handleReset = () => {
    editorStore.handleReset(blocker?.reset);
  };

  // Auto-close dialog when no editors are open (cleanup effect)
  useEffect(() => {
    if (editorStore.openEditorsCount === 0 && editorStore.isDialogOpen) {
      editorStore.setDialogOpen(false);
    }
  }, [editorStore.openEditorsCount, editorStore.isDialogOpen]);

  return (
    <>
      <OpenEditorDialog
        isOpen={editorStore.isDialogOpen}
        proceed={handleProceed}
        reset={handleReset}
      />
      {children}
    </>
  );
});