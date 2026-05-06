import { makeObservable, action, computed, reaction } from "mobx";
import { BaseStore, type BaseStoreState } from "../base.store";

type PrepopulateMode = "all" | "partial";
type InclusionMode = "include" | "active-only";
type GroupKey = "ba_leads" | "project_leads" | "team_members";

const STORAGE_KEY = "spms_new_cycle_draft";

interface NewCycleStoreState extends BaseStoreState {
	prepopulateMode: PrepopulateMode;
	inclusionMode: InclusionMode;
	sendBaLeads: boolean;
	sendProjectLeads: boolean;
	sendTeamMembers: boolean;
	excludedUserIds: number[];
	customMessageEnabled: boolean;
	perGroupEnabled: boolean;
	groupCustomEnabled: Record<GroupKey, boolean>;
	activePreviewGroup: GroupKey;
	customMessage: string;
	customMessages: Record<GroupKey, string>;
}

const EMPTY_HTML_PATTERNS = [
	"",
	"<p></p>",
	"<p><br></p>",
	"<p> </p>",
	"<p><br/></p>",
];

const isHtmlEmpty = (html: string): boolean => {
	const trimmed = html.trim();
	if (EMPTY_HTML_PATTERNS.includes(trimmed)) return true;
	// Extract text content by creating a temporary element
	// This is NOT a security sanitiser — actual sanitisation is done server-side via bleach
	const div = document.createElement("div");
	div.innerHTML = trimmed;
	return (div.textContent ?? "").trim().length === 0;
};

const DEFAULT_STATE: Omit<
	NewCycleStoreState,
	"loading" | "error" | "initialised"
> = {
	prepopulateMode: "all",
	inclusionMode: "include",
	sendBaLeads: false,
	sendProjectLeads: false,
	sendTeamMembers: false,
	excludedUserIds: [],
	customMessageEnabled: false,
	perGroupEnabled: false,
	groupCustomEnabled: {
		ba_leads: true,
		project_leads: true,
		team_members: true,
	},
	activePreviewGroup: "ba_leads",
	customMessage: "",
	customMessages: { ba_leads: "", project_leads: "", team_members: "" },
};

export class NewCycleStore extends BaseStore<NewCycleStoreState> {
	private _disposeAutoSave?: () => void;

	constructor() {
		super({
			...DEFAULT_STATE,
			loading: false,
			error: null,
			initialised: false,
		});

		makeObservable(this, {
			setPrepopulateMode: action,
			setInclusionMode: action,
			setSendBaLeads: action,
			setSendProjectLeads: action,
			setSendTeamMembers: action,
			excludeUser: action,
			restoreUser: action,
			excludeUsers: action,
			restoreUsers: action,
			setCustomMessageEnabled: action,
			setPerGroupEnabled: action,
			setGroupCustomEnabled: action,
			setActivePreviewGroup: action,
			setCustomMessage: action,
			setGroupMessage: action,
			restoreFromStorage: action,
			importDraft: action,
			reset: action,

			anySendGroup: computed,
			isEmailOnly: computed,
			hasAnySelection: computed,
			selectedGroups: computed,
			checkedGroupKeys: computed,
			sendGroupCount: computed,
			isCustomMessageValid: computed,
			canSubmit: computed,
			backendUpdate: computed,
			backendPrepopulate: computed,
		});

		// Restore draft from localStorage
		this.restoreFromStorage();

		// Auto-save to localStorage on any state change (debounced via reaction)
		this._disposeAutoSave = reaction(
			() => JSON.stringify(this._serializableState()),
			() => this._saveDraft(),
			{ delay: 300 }
		);
	}

	dispose = async () => {
		this._disposeAutoSave?.();
	};

	// --- Persistence ---

	private _serializableState() {
		return {
			prepopulateMode: this.state.prepopulateMode,
			inclusionMode: this.state.inclusionMode,
			sendBaLeads: this.state.sendBaLeads,
			sendProjectLeads: this.state.sendProjectLeads,
			sendTeamMembers: this.state.sendTeamMembers,
			excludedUserIds: this.state.excludedUserIds,
			customMessageEnabled: this.state.customMessageEnabled,
			perGroupEnabled: this.state.perGroupEnabled,
			groupCustomEnabled: this.state.groupCustomEnabled,
			activePreviewGroup: this.state.activePreviewGroup,
			customMessage: this.state.customMessage,
			customMessages: this.state.customMessages,
		};
	}

	private _saveDraft() {
		try {
			localStorage.setItem(
				STORAGE_KEY,
				JSON.stringify(this._serializableState())
			);
		} catch {
			// Storage full or unavailable — ignore
		}
	}

	restoreFromStorage = () => {
		try {
			const raw = localStorage.getItem(STORAGE_KEY);
			if (!raw) return;
			const parsed: unknown = JSON.parse(raw);
			if (typeof parsed !== "object" || parsed === null) return;
			const data = parsed as Record<string, unknown>;

			if (typeof data.prepopulateMode === "string")
				this.state.prepopulateMode = data.prepopulateMode as PrepopulateMode;
			if (typeof data.inclusionMode === "string")
				this.state.inclusionMode = data.inclusionMode as InclusionMode;
			if (typeof data.sendBaLeads === "boolean")
				this.state.sendBaLeads = data.sendBaLeads;
			if (typeof data.sendProjectLeads === "boolean")
				this.state.sendProjectLeads = data.sendProjectLeads;
			if (typeof data.sendTeamMembers === "boolean")
				this.state.sendTeamMembers = data.sendTeamMembers;
			if (Array.isArray(data.excludedUserIds))
				this.state.excludedUserIds = data.excludedUserIds as number[];
			if (typeof data.customMessageEnabled === "boolean")
				this.state.customMessageEnabled = data.customMessageEnabled;
			if (typeof data.perGroupEnabled === "boolean")
				this.state.perGroupEnabled = data.perGroupEnabled;
			if (
				typeof data.groupCustomEnabled === "object" &&
				data.groupCustomEnabled !== null
			) {
				this.state.groupCustomEnabled = data.groupCustomEnabled as Record<
					GroupKey,
					boolean
				>;
			}
			if (typeof data.activePreviewGroup === "string")
				this.state.activePreviewGroup = data.activePreviewGroup as GroupKey;
			if (typeof data.customMessage === "string")
				this.state.customMessage = data.customMessage;
			if (
				typeof data.customMessages === "object" &&
				data.customMessages !== null
			) {
				this.state.customMessages = data.customMessages as Record<
					GroupKey,
					string
				>;
			}
		} catch {
			// Corrupt data — ignore
		}
	};

	// --- Actions ---

	setPrepopulateMode = (mode: PrepopulateMode) => {
		this.state.prepopulateMode = mode;
	};
	setInclusionMode = (mode: InclusionMode) => {
		this.state.inclusionMode = mode;
	};
	setSendBaLeads = (value: boolean) => {
		this.state.sendBaLeads = value;
	};
	setSendProjectLeads = (value: boolean) => {
		this.state.sendProjectLeads = value;
	};
	setSendTeamMembers = (value: boolean) => {
		this.state.sendTeamMembers = value;
	};

	excludeUser = (userId: number) => {
		if (!this.state.excludedUserIds.includes(userId)) {
			// Use assignment (not push) so React components that memoise on the
			// array reference detect the change.
			this.state.excludedUserIds = [...this.state.excludedUserIds, userId];
		}
	};

	restoreUser = (userId: number) => {
		this.state.excludedUserIds = this.state.excludedUserIds.filter(
			(id) => id !== userId
		);
	};

	excludeUsers = (userIds: number[]) => {
		const toAdd = userIds.filter(
			(id) => !this.state.excludedUserIds.includes(id)
		);
		if (toAdd.length > 0) {
			this.state.excludedUserIds = [...this.state.excludedUserIds, ...toAdd];
		}
	};

	restoreUsers = (userIds: number[]) => {
		const idSet = new Set(userIds);
		this.state.excludedUserIds = this.state.excludedUserIds.filter(
			(id) => !idSet.has(id)
		);
	};

	setCustomMessageEnabled = (enabled: boolean) => {
		this.state.customMessageEnabled = enabled;
	};
	setPerGroupEnabled = (enabled: boolean) => {
		this.state.perGroupEnabled = enabled;
	};

	setGroupCustomEnabled = (group: GroupKey, enabled: boolean) => {
		this.state.groupCustomEnabled = {
			...this.state.groupCustomEnabled,
			[group]: enabled,
		};
	};

	setActivePreviewGroup = (group: GroupKey) => {
		this.state.activePreviewGroup = group;
	};
	setCustomMessage = (html: string) => {
		this.state.customMessage = html;
	};

	setGroupMessage = (group: GroupKey, html: string) => {
		this.state.customMessages = { ...this.state.customMessages, [group]: html };
	};

	/** Clear all state and remove the draft from localStorage */
	reset = () => {
		Object.assign(this.state, DEFAULT_STATE);
		try {
			localStorage.removeItem(STORAGE_KEY);
		} catch {
			/* ignore */
		}
	};

	/** Export the current state as a plain object for saving to the database */
	exportDraft(): Record<string, unknown> {
		return this._serializableState();
	}

	/** Import a draft from the database into the store */
	importDraft = (data: Record<string, unknown>) => {
		if (typeof data.prepopulateMode === "string")
			this.state.prepopulateMode = data.prepopulateMode as PrepopulateMode;
		if (typeof data.inclusionMode === "string")
			this.state.inclusionMode = data.inclusionMode as InclusionMode;
		if (typeof data.sendBaLeads === "boolean")
			this.state.sendBaLeads = data.sendBaLeads;
		if (typeof data.sendProjectLeads === "boolean")
			this.state.sendProjectLeads = data.sendProjectLeads;
		if (typeof data.sendTeamMembers === "boolean")
			this.state.sendTeamMembers = data.sendTeamMembers;
		if (typeof data.customMessageEnabled === "boolean")
			this.state.customMessageEnabled = data.customMessageEnabled;
		if (typeof data.perGroupEnabled === "boolean")
			this.state.perGroupEnabled = data.perGroupEnabled;
		if (
			typeof data.groupCustomEnabled === "object" &&
			data.groupCustomEnabled !== null
		) {
			this.state.groupCustomEnabled = data.groupCustomEnabled as Record<
				GroupKey,
				boolean
			>;
		}
		if (typeof data.customMessage === "string")
			this.state.customMessage = data.customMessage;
		if (
			typeof data.customMessages === "object" &&
			data.customMessages !== null
		) {
			this.state.customMessages = data.customMessages as Record<
				GroupKey,
				string
			>;
		}
	};

	// --- Computed ---

	get backendUpdate(): boolean {
		return this.state.inclusionMode === "include";
	}
	get backendPrepopulate(): boolean {
		return this.state.prepopulateMode === "all";
	}

	get anySendGroup(): boolean {
		return (
			this.state.sendBaLeads ||
			this.state.sendProjectLeads ||
			this.state.sendTeamMembers
		);
	}

	get isEmailOnly(): boolean {
		return false;
	}
	get hasAnySelection(): boolean {
		return true;
	}

	/** The group keys that are currently checked for sending */
	get checkedGroupKeys(): GroupKey[] {
		const keys: GroupKey[] = [];
		if (this.state.sendBaLeads) keys.push("ba_leads");
		if (this.state.sendProjectLeads) keys.push("project_leads");
		if (this.state.sendTeamMembers) keys.push("team_members");
		return keys;
	}

	get sendGroupCount(): number {
		return this.checkedGroupKeys.length;
	}

	get selectedGroups(): string[] {
		return this.checkedGroupKeys;
	}

	get isCustomMessageValid(): boolean {
		if (!this.state.customMessageEnabled) return true;
		if (this.state.perGroupEnabled) {
			return this.checkedGroupKeys.every((g) => {
				if (!this.state.groupCustomEnabled[g]) return true;
				return !isHtmlEmpty(this.state.customMessages[g]);
			});
		}
		return !isHtmlEmpty(this.state.customMessage);
	}

	get canSubmit(): boolean {
		if (this.state.customMessageEnabled && !this.isCustomMessageValid)
			return false;
		return true;
	}
}
