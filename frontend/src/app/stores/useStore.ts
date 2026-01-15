import { useContext } from "react";
import { StoreContext } from "./store-context";

/**
 * Hook to access stores in components
 */
export const useStore = () => {
	const context = useContext(StoreContext);
	if (!context) {
		throw new Error("useStore must be used within StoreProvider");
	}
	return context;
};

// Specific store hooks for better developer experience / prevent performance issues
export const useUIStore = () => useStore().uiStore;
export const useAuthStore = () => useStore().authStore;
export const useEditorStore = () => useStore().editorStore;
// export const useProjectMapSearchStore = () => useStore().projectMapSearcStore;
// export const useProjectSearchStore = () => useStore().projectSearchStore;
// export const useUserSearchStore = () => useStore().userSearchStore;
