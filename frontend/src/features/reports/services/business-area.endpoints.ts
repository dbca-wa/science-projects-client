/**
 * Business area API endpoints
 *
 * Paths are relative to the base URL which already includes /api/v1/.
 */
export const BA_ENDPOINTS = {
	MINE: "agencies/business_areas/mine",
	DETAIL: (id: number) => `agencies/business_areas/${id}`,
	PROBLEMATIC_PROJECTS: "agencies/business_areas/problematic_projects",
	UNAPPROVED_DOCS: "agencies/business_areas/unapproved_docs",
} as const;
