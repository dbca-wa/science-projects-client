/**
 * Knowledge Base Types
 *
 * Interfaces for guide sections (categories) and content fields (articles).
 */

/** A single article within a knowledge base category */
export interface IContentField {
	id: string;
	title: string | null;
	field_key: string;
	description: string | null;
	section: string;
	order: number;
}

/** Role required to view a guide section */
export type GuideSectionRole =
	| "all"
	| "admin"
	| "business_area_lead"
	| "key_stakeholder";

/** A knowledge base category with its articles */
export interface IGuideSection {
	id: string;
	title: string;
	description: string;
	icon: string;
	required_role: GuideSectionRole;
	order: number;
	show_divider_after: boolean;
	category: string | null;
	is_active: boolean;
	content_fields: IContentField[];
}

/** Payload for creating/updating a guide section */
export interface IGuideSectionPayload {
	id: string;
	title: string;
	description?: string;
	icon?: string;
	required_role?: GuideSectionRole;
	order?: number;
	show_divider_after?: boolean;
	category?: string | null;
	is_active?: boolean;
	content_fields?: IContentFieldPayload[];
}

/** Payload for creating/updating a content field */
export interface IContentFieldPayload {
	id?: string;
	title?: string;
	field_key: string;
	description?: string;
	section?: string;
	order?: number;
}
