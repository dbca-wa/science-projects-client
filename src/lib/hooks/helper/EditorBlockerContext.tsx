import { OpenEditorDialog } from "@/components/RichTextEditor/OpenEditorDialog";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { useBlocker } from "react-router-dom";

interface IEditorContext {
  openEditorsCount: number;
  openEditor: () => void;
  closeEditor: () => void;
  manuallyCheckAndToggleDialog: (action: () => void) => void;
}

const EditorContext = createContext<IEditorContext>({
  openEditorsCount: 0,
  openEditor: () => {
    throw new Error("openEditor function must be overridden");
  },
  closeEditor: () => {
    throw new Error("closeEditor function must be overridden");
  },
  manuallyCheckAndToggleDialog: () => {
    throw new Error("manuallyCheckAndToggleDialog function must be overridden");
  },
});

interface IEditorProviderProps {
  children: React.ReactNode;
}

export const EditorProvider = ({ children }: IEditorProviderProps) => {
  const [openEditorsCount, setOpenEditorsCount] = useState(0);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<() => void | null>(null);

  const openEditor = useCallback(() => {
    setOpenEditorsCount((count) => count + 1);
  }, []);

  const closeEditor = useCallback(() => {
    setOpenEditorsCount((count) => Math.max(count - 1, 0));
  }, []);

  const manuallyCheckAndToggleDialog = useCallback(
    (action: () => void) => {
      if (openEditorsCount > 0) {
        setPendingAction(() => action); // Capture the action
        setIsDialogOpen(true);
      } else {
        action(); // Execute immediately if no editors are open
      }
    },
    [openEditorsCount],
  );

  // Block navigation when editors are open
  const blocker = useBlocker(({ currentLocation, nextLocation }) => {
    const shouldBlock =
      openEditorsCount > 0 &&
      currentLocation.pathname !== nextLocation.pathname;
    setIsDialogOpen(shouldBlock);
    return shouldBlock;
  });

  const handleProceed = () => {
    setIsDialogOpen(false);
    setOpenEditorsCount(0);
    blocker?.proceed?.();
    if (pendingAction) {
      pendingAction(); // Execute the pending action if it exists
      setPendingAction(null); // Clear the pending action
    }
  };

  const handleReset = () => {
    setIsDialogOpen(false);
    setPendingAction(null);
    if (blocker?.reset) {
      blocker?.reset();
    }
  };

  useEffect(() => {
    // console.log(openEditorsCount);
    if (openEditorsCount === 0 && isDialogOpen === true) {
      setIsDialogOpen(false);
    }
  }, [openEditorsCount, isDialogOpen]);

  return (
    <EditorContext.Provider
      value={{
        openEditorsCount,
        openEditor,
        closeEditor,
        manuallyCheckAndToggleDialog,
      }}
    >
      {/* {isDialogOpen && ( */}
      <OpenEditorDialog
        isOpen={isDialogOpen}
        proceed={handleProceed}
        reset={handleReset}
      />
      {/* )} */}
      {children}
    </EditorContext.Provider>
  );
};

export const useEditorContext = () => useContext(EditorContext);
