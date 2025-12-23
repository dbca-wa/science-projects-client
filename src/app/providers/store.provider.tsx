import { createContext, useContext, type ReactNode } from "react";
import { rootStore, type RootStore } from "@/app/stores/root.store";

// Create context for the store
const StoreContext = createContext<RootStore | null>(null);

interface StoreProviderProps {
  children: ReactNode;
}

/**
 * Provider component that makes the RootStore available to all child components
 * This follows the MobX + React pattern for dependency injection
 */
export const StoreProvider = ({ children }: StoreProviderProps) => {
  return (
    <StoreContext.Provider value={rootStore}>
      {children}
    </StoreContext.Provider>
  );
};

/**
 * Hook to access the root store from any component
 * Throws an error if used outside of StoreProvider
 */
export const useStore = (): RootStore => {
  const store = useContext(StoreContext);
  if (!store) {
    throw new Error("useStore must be used within a StoreProvider");
  }
  return store;
};

// Convenience hooks for accessing individual stores
export const useAuthStore = () => useStore().authStore;
export const useUIStore = () => useStore().uiStore;
export const useUserSearchStore = () => useStore().userSearchStore;
export const useEditorStore = () => useStore().editorStore;
export const useProjectSearchStore = () => useStore().projectSearchStore;
export const useProjectMapSearchStore = () => useStore().projectMapSearchStore;