import { createContext } from "react";
import { AuthStore } from "./auth.store";
import { UIStore } from "./ui.store";
import GameStore from "./game.store";

/**
 * Root store that combines all MobX stores
 */
class RootStore {
	authStore: AuthStore;
	uiStore: UIStore;
	gameStore: GameStore;

	constructor() {
		this.authStore = new AuthStore();
		this.uiStore = new UIStore();
		this.gameStore = new GameStore();
	}
}

// Create singleton instance
export const rootStore = new RootStore();

// Create React Context
export const StoreContext = createContext<RootStore>(rootStore);
