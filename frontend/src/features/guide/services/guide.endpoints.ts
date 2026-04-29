/**
 * Knowledge Base API Endpoints
 *
 * Paths are relative to the base URL which already includes /api/v1/.
 */
export const GUIDE_ENDPOINTS = {
	// Guide sections (categories)
	SECTIONS: "adminoptions/guide-sections",
	SECTION_DETAIL: (id: string) => `adminoptions/guide-sections/${id}`,
	SECTIONS_REORDER: "adminoptions/guide-sections/reorder",
	SECTION_REORDER_FIELDS: (id: string) =>
		`adminoptions/guide-sections/${id}/reorder_fields`,

	// Content fields (articles)
	CONTENT_FIELDS: "adminoptions/content-fields",
	CONTENT_FIELD_DETAIL: (id: string) => `adminoptions/content-fields/${id}`,
} as const;
