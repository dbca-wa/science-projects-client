import { createContext } from "react";
import { AuthStore } from "./derived/auth.store";
import { UIStore } from "./derived/ui.store";
import { EditorStore } from "./derived/editor.store";
import { UserSearchStore } from "./derived/userSearch.store";

/**
 * Root store that combines all MobX stores
 */
class RootStore {
	authStore: AuthStore;
	editorStore: EditorStore;
	// projectMapSearcStore: ProjectMapSearchStore;
	// projectSearchStore: ProjectSearchStore;
	uiStore: UIStore;
	userSearchStore: UserSearchStore;

	constructor() {
		this.authStore = new AuthStore();
		this.editorStore = new EditorStore();
		// this.projectMapSearcStore = new ProjoectMapSearchStore();
		// this.projectSearchStore = new ProjectSearchStore();
		this.uiStore = new UIStore();
		this.userSearchStore = new UserSearchStore();
	}
}

// Create singleton instance
export const rootStore = new RootStore();

// Create React Context
export const StoreContext = createContext<RootStore>(rootStore);
