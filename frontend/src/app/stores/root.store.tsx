import { type ReactNode } from "react";
import { StoreContext, rootStore } from "./store-context";

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
