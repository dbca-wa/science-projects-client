import { makeObservable, action, computed, runInAction } from "mobx";
import { logger } from "@/shared/services/logger.service";
import { BaseStore, type BaseStoreState } from "../base.store";

interface EditorStoreState extends BaseStoreState {
	openEditorsCount: number;
	isDialogOpen: boolean;
	pendingAction: (() => void) | null;
}

export class EditorStore extends BaseStore<EditorStoreState> {
	constructor() {
		super({
			openEditorsCount: 0,
			isDialogOpen: false,
			pendingAction: null,
			loading: false,
			error: null,
			initialised: false,
		});
		
		// Use makeObservable instead of makeAutoObservable for classes with inheritance
		makeObservable(this, {
			// Actions
			openEditor: action,
			closeEditor: action,
			setDialogOpen: action,
			setPendingAction: action,
			manuallyCheckAndToggleDialog: action,
			handleProceed: action,
			handleReset: action,
			shouldBlockNavigation: action,
			reset: action,
			
			// Computed
			openEditorsCount: computed,
			isDialogOpen: computed,
			pendingAction: computed,
		});
	}

	public async initialise(): Promise<void> {
		await this.executeAsync(
			async () => {
				runInAction(() => {
					this.state.initialised = true;
				});

				logger.info("Editor store initialised");
			},
			"initialise_editor",
			{ silent: true }
		);
	}

	// Editor management actions
	openEditor = () => {
		runInAction(() => {
			this.state.openEditorsCount = Math.max(
				this.state.openEditorsCount + 1,
				0
			);
		});

		logger.info("Editor opened", {
			count: this.state.openEditorsCount,
		});
	};

	closeEditor = () => {
		runInAction(() => {
			this.state.openEditorsCount = Math.max(
				this.state.openEditorsCount - 1,
				0
			);

			// Auto-close dialog if no editors are open
			if (this.state.openEditorsCount === 0 && this.state.isDialogOpen) {
				this.state.isDialogOpen = false;
			}
		});

		logger.info("Editor closed", {
			count: this.state.openEditorsCount,
		});
	};

	// Dialog management actions
	setDialogOpen = (open: boolean) => {
		runInAction(() => {
			this.state.isDialogOpen = open;
		});

		logger.info("Editor dialog state changed", { open });
	};

	setPendingAction = (action: (() => void) | null) => {
		runInAction(() => {
			this.state.pendingAction = action;
		});
	};

	// Main method for checking and showing dialog
	manuallyCheckAndToggleDialog = (action: () => void) => {
		if (this.state.openEditorsCount > 0) {
			this.setPendingAction(() => action);
			this.setDialogOpen(true);
		} else {
			action(); // Execute immediately if no editors are open
		}
	};

	// Dialog action handlers
	handleProceed = (blockerProceed?: () => void) => {
		this.setDialogOpen(false);

		runInAction(() => {
			this.state.openEditorsCount = 0;
		});

		// Call router blocker proceed if provided
		if (blockerProceed) {
			blockerProceed();
		}

		// Execute pending action if it exists
		if (this.state.pendingAction) {
			this.state.pendingAction();
			this.setPendingAction(null);
		}

		logger.info("Editor dialog proceeded");
	};

	handleReset = (blockerReset?: () => void) => {
		this.setDialogOpen(false);
		this.setPendingAction(null);

		// Call router blocker reset if provided
		if (blockerReset) {
			blockerReset();
		}

		logger.info("Editor dialog reset");
	};

	// Navigation blocker helper
	shouldBlockNavigation = (
		currentPath: string,
		nextPath: string
	): boolean => {
		const shouldBlock =
			this.state.openEditorsCount > 0 && currentPath !== nextPath;

		if (shouldBlock) {
			this.setDialogOpen(true);
		}

		return shouldBlock;
	};

	// Getters
	get openEditorsCount() {
		return this.state.openEditorsCount;
	}

	get isDialogOpen() {
		return this.state.isDialogOpen;
	}

	get pendingAction() {
		return this.state.pendingAction;
	}

	async dispose() {
		logger.info("Editor store disposed");
	}

	reset() {
		runInAction(() => {
			this.state.openEditorsCount = 0;
			this.state.isDialogOpen = false;
			this.state.pendingAction = null;
			this.state.loading = false;
			this.state.error = null;
			this.state.initialised = false;
		});

		logger.info("Editor store reset complete");
	}
}
