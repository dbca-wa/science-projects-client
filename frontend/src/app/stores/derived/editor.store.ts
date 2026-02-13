import { makeObservable, action } from "mobx";
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

		makeObservable(this, {
			openEditor: action,
			closeEditor: action,
			setDialogOpen: action,
			setPendingAction: action,
			manuallyCheckAndToggleDialog: action,
			handleProceed: action,
			handleReset: action,
			shouldBlockNavigation: action,
			reset: action,
		});
	}

	/**
	 * Initialises the editor store.
	 */
	public async initialise(): Promise<void> {
		await this.executeAsync(
			async () => {
				this.state.initialised = true;
				logger.info("Editor store initialised");
			},
			"initialise_editor",
			{ silent: true }
		);
	}

	/**
	 * Increments the count of open editors.
	 */
	openEditor = () => {
		this.state.openEditorsCount = Math.max(this.state.openEditorsCount + 1, 0);

		logger.info("Editor opened", {
			count: this.state.openEditorsCount,
		});
	};

	/**
	 * Decrements the count of open editors and auto-closes dialog if count reaches zero.
	 */
	closeEditor = () => {
		this.state.openEditorsCount = Math.max(this.state.openEditorsCount - 1, 0);

		if (this.state.openEditorsCount === 0 && this.state.isDialogOpen) {
			this.state.isDialogOpen = false;
		}

		logger.info("Editor closed", {
			count: this.state.openEditorsCount,
		});
	};

	/**
	 * Sets the dialog open state.
	 */
	setDialogOpen = (open: boolean) => {
		this.state.isDialogOpen = open;
		logger.info("Editor dialog state changed", { open });
	};

	/**
	 * Sets a pending action to execute after dialog is confirmed.
	 */
	setPendingAction = (action: (() => void) | null) => {
		this.state.pendingAction = action;
	};

	/**
	 * Checks if editors are open and shows dialog if needed, otherwise executes action immediately.
	 */
	manuallyCheckAndToggleDialog = (action: () => void) => {
		if (this.state.openEditorsCount > 0) {
			this.setPendingAction(() => action);
			this.setDialogOpen(true);
		} else {
			action();
		}
	};

	/**
	 * Proceeds with closing all editors and executes pending action.
	 */
	handleProceed = (blockerProceed?: () => void) => {
		this.setDialogOpen(false);
		this.state.openEditorsCount = 0;

		if (blockerProceed) {
			blockerProceed();
		}

		if (this.state.pendingAction) {
			this.state.pendingAction();
			this.setPendingAction(null);
		}

		logger.info("Editor dialog proceeded");
	};

	/**
	 * Resets dialog state without executing pending action.
	 */
	handleReset = (blockerReset?: () => void) => {
		this.setDialogOpen(false);
		this.setPendingAction(null);

		if (blockerReset) {
			blockerReset();
		}

		logger.info("Editor dialog reset");
	};

	/**
	 * Determines if navigation should be blocked based on open editors.
	 */
	shouldBlockNavigation = (currentPath: string, nextPath: string): boolean => {
		const shouldBlock =
			this.state.openEditorsCount > 0 && currentPath !== nextPath;

		if (shouldBlock) {
			this.setDialogOpen(true);
		}

		return shouldBlock;
	};

	/**
	 * @returns The number of currently open editors
	 */
	get openEditorsCount() {
		return this.state.openEditorsCount;
	}

	/**
	 * @returns True if the unsaved changes dialog is open
	 */
	get isDialogOpen() {
		return this.state.isDialogOpen;
	}

	/**
	 * @returns The pending action to execute after dialog confirmation
	 */
	get pendingAction() {
		return this.state.pendingAction;
	}

	/**
	 * Performs cleanup when store is disposed.
	 */
	async dispose() {
		logger.info("Editor store disposed");
	}

	/**
	 * Resets store to initial state.
	 */
	reset() {
		this.state.openEditorsCount = 0;
		this.state.isDialogOpen = false;
		this.state.pendingAction = null;
		this.state.loading = false;
		this.state.error = null;
		this.state.initialised = false;

		logger.info("Editor store reset complete");
	}
}
