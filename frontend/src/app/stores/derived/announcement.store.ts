import { makeObservable, action, computed } from "mobx";
import { BaseStore, type BaseStoreState } from "../base.store";

type GroupKey = "ba_leads" | "project_leads" | "team_members";

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
	const div = document.createElement("div");
	div.innerHTML = trimmed;
	return (div.textContent ?? "").trim().length === 0;
};

interface AnnouncementStoreState extends BaseStoreState {
	sendBaLeads: boolean;
	sendProjectLeads: boolean;
	sendTeamMembers: boolean;
	excludedUserIds: number[];
	customMessage: string;
	perGroupEnabled: boolean;
	groupCustomEnabled: Record<GroupKey, boolean>;
	customMessages: Record<GroupKey, string>;
	activePreviewGroup: GroupKey;
	subject: string;
}

const DEFAULT_STATE: Omit<
	AnnouncementStoreState,
	"loading" | "error" | "initialised"
> = {
	sendBaLeads: false,
	sendProjectLeads: false,
	sendTeamMembers: false,
	excludedUserIds: [],
	customMessage: "",
	perGroupEnabled: false,
	groupCustomEnabled: {
		ba_leads: true,
		project_leads: true,
		team_members: true,
	},
	customMessages: { ba_leads: "", project_leads: "", team_members: "" },
	activePreviewGroup: "ba_leads",
	subject: "SPMS: Announcement",
};

export class AnnouncementStore extends BaseStore<AnnouncementStoreState> {
	constructor() {
		super({
			...DEFAULT_STATE,
			loading: false,
			error: null,
			initialised: false,
		});

		makeObservable(this, {
			setSendBaLeads: action,
			setSendProjectLeads: action,
			setSendTeamMembers: action,
			excludeUser: action,
			restoreUser: action,
			setCustomMessage: action,
			setPerGroupEnabled: action,
			setGroupCustomEnabled: action,
			setGroupMessage: action,
			setActivePreviewGroup: action,
			setSubject: action,
			reset: action,

			anySendGroup: computed,
			checkedGroupKeys: computed,
			sendGroupCount: computed,
			selectedGroups: computed,
			isCustomMessageValid: computed,
			canSubmit: computed,
		});
	}

	// --- Actions ---

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
			this.state.excludedUserIds.push(userId);
		}
	};

	restoreUser = (userId: number) => {
		this.state.excludedUserIds = this.state.excludedUserIds.filter(
			(id) => id !== userId
		);
	};

	setCustomMessage = (html: string) => {
		this.state.customMessage = html;
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

	setGroupMessage = (group: GroupKey, html: string) => {
		this.state.customMessages = { ...this.state.customMessages, [group]: html };
	};

	setActivePreviewGroup = (group: GroupKey) => {
		this.state.activePreviewGroup = group;
	};

	setSubject = (subject: string) => {
		this.state.subject = subject;
	};

	reset = () => {
		Object.assign(this.state, DEFAULT_STATE);
	};

	// --- Computed ---

	get anySendGroup(): boolean {
		return (
			this.state.sendBaLeads ||
			this.state.sendProjectLeads ||
			this.state.sendTeamMembers
		);
	}

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
		if (this.state.perGroupEnabled) {
			return this.checkedGroupKeys.every((g) => {
				if (!this.state.groupCustomEnabled[g]) return true;
				return !isHtmlEmpty(this.state.customMessages[g]);
			});
		}
		return !isHtmlEmpty(this.state.customMessage);
	}

	get canSubmit(): boolean {
		return this.anySendGroup && this.isCustomMessageValid;
	}
}
