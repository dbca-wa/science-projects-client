import { createContext, useContext } from "react";
import { AuthStore } from "./derived/auth.store";
import { UIStore } from "./derived/ui.store";
import { EditorStore } from "./derived/editor.store";
import { UserSearchStore } from "./derived/user-search.store";
import { ProjectSearchStore } from "./derived/project-search.store";
import { ProjectWizardStore } from "./derived/project-wizard.store";
import { CreateProjectWizardStore } from "./derived/create-project-wizard.store";
import { EditProjectStore } from "./derived/edit-project.store";
import { ProjectMapStore } from "./derived/project-map.store";
import { MyProjectsStore } from "./derived/my-projects.store";
import { UnapprovedDocsFilterStore } from "./derived/unapproved-docs-filter.store";
import { ReportDetailsStore } from "./derived/report-details.store";

/**
 * Root store that combines all MobX stores
 */
class RootStore {
	authStore: AuthStore;
	editorStore: EditorStore;
	uiStore: UIStore;
	userSearchStore: UserSearchStore;
	projectSearchStore: ProjectSearchStore;
	projectWizardStore: ProjectWizardStore;
	createProjectWizardStore: CreateProjectWizardStore;
	editProjectStore: EditProjectStore;
	projectMapStore: ProjectMapStore;
	myProjectsStore: MyProjectsStore;
	unapprovedDocsFilterStore: UnapprovedDocsFilterStore;
	reportDetailsStore: ReportDetailsStore;

	constructor() {
		this.authStore = new AuthStore();
		this.editorStore = new EditorStore();
		this.uiStore = new UIStore();
		this.userSearchStore = new UserSearchStore();
		this.projectSearchStore = new ProjectSearchStore();
		this.projectWizardStore = new ProjectWizardStore();
		this.createProjectWizardStore = new CreateProjectWizardStore();
		this.editProjectStore = new EditProjectStore();
		this.projectMapStore = new ProjectMapStore();
		this.myProjectsStore = new MyProjectsStore();
		this.unapprovedDocsFilterStore = new UnapprovedDocsFilterStore();
		this.reportDetailsStore = new ReportDetailsStore();
	}
}

// Create singleton instance
export const rootStore = new RootStore();

// Create React Context
export const StoreContext = createContext<RootStore>(rootStore);

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
export const useUserSearchStore = () => useStore().userSearchStore;
export const useProjectSearchStore = () => useStore().projectSearchStore;
export const useProjectWizardStore = () => useStore().projectWizardStore;
export const useEditProjectStore = () => useStore().editProjectStore;
export const useProjectMapStore = () => useStore().projectMapStore;
export const useMyProjectsStore = () => useStore().myProjectsStore;
export const useUnapprovedDocsFilterStore = () =>
	useStore().unapprovedDocsFilterStore;
export const useReportDetailsStore = () => useStore().reportDetailsStore;
