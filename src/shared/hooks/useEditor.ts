import { observer } from "mobx-react-lite";
import { useEditorStore } from "@/app/providers/store.provider";

interface IEditorHook {
  openEditorsCount: number;
  openEditor: () => void;
  closeEditor: () => void;
  manuallyCheckAndToggleDialog: (action: () => void) => void;
}

/**
 * Hook to access editor functionality using MobX EditorStore
 * Provides the same interface as the previous EditorBlockerContext for easy migration
 */
export const useEditor = (): IEditorHook => {
  const editorStore = useEditorStore();

  return {
    openEditorsCount: editorStore.openEditorsCount,
    openEditor: editorStore.openEditor,
    closeEditor: editorStore.closeEditor,
    manuallyCheckAndToggleDialog: editorStore.manuallyCheckAndToggleDialog,
  };
};

// Export an observer-wrapped version for components that need reactive updates
export const useEditorObserver = observer(useEditor);

// Export the hook with the same name as the context hook for easy migration
export const useEditorContext = useEditor;