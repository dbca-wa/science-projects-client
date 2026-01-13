// ============================================================================
// GUIDE SECTIONS (Feature-specific)
// ============================================================================

export const GuideSections = {
	ADMIN: "guide_admin",
	ABOUT: "guide_about",
	LOGIN: "guide_login",
	USER_PROFILE: "guide_profile",
	USER_CREATION: "guide_user_creation",
	USER_VIEW: "guide_user_view",
	PROJECT_CREATION: "guide_project_creation",
	PROJECT_VIEW: "guide_project_view",
	TEAM: "guide_project_team",
	DOCUMENTS: "guide_documents",
	REPORT: "guide_report",
} as const;

export type GuideSectionValue =
	(typeof GuideSections)[keyof typeof GuideSections];

export interface GuideSection {
	id: string;
	title: string;
	order: number;
	show_divider_after: boolean;
	category?: string;
	is_active: boolean;
	content_fields: ContentField[];
}

export interface ContentField {
	id?: string;
	title?: string;
	field_key: string;
	description?: string;
	order: number;
}

export interface ContentType {
	fieldKey: string;
	content: string;
	adminOptionsPk: number;
}

// ============================================================================
// GUIDE HTML SAVE (Feature-specific mutation variables)
// ============================================================================

export interface IHTMLGuideSave {
	htmlData: string;
	isUpdate: boolean;
	adminOptionsPk: null | number;
	section: string | GuideSectionValue;
	softRefetch?: () => void;
	setIsEditorOpen?: React.Dispatch<React.SetStateAction<boolean>>;
	canSave: boolean;
}

export interface IHTMLGuideSaveExtended extends IHTMLGuideSave {
	onSave?: (content: string) => Promise<boolean>;
}

// ============================================================================
// CARETAKER OPERATIONS (Feature-specific mutation variables)
// ============================================================================

export interface IExtendCaretakerProps {
	id: number;
	currentEndDate: Date;
	newEndDate: Date;
}
