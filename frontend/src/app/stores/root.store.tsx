import { createContext, useContext, type ReactNode } from "react";
import { AuthStore } from "./auth.store";
import { UIStore } from "./ui.store";

/**
 * Root store that combines all MobX stores
 */
class RootStore {
	authStore: AuthStore;
	uiStore: UIStore;

	constructor() {
		this.authStore = new AuthStore();
		this.uiStore = new UIStore();
	}
}

// Create singleton instance
const rootStore = new RootStore();

// Create React Context
const StoreContext = createContext<RootStore>(rootStore);

/**
 * Provider component to wrap app with stores
 */
export const StoreProvider = ({ children }: { children: ReactNode }) => {
	return (
		<StoreContext.Provider value={rootStore}>
			{children}
		</StoreContext.Provider>
	);
};

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
