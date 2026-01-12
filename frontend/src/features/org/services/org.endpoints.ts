export const ORG_ENDPOINTS = {
	DIVISIONS: {
		LIST: "agencies/divisions",
		CREATE: "agencies/divisions",
		DETAIL: (pk: number) => `agencies/divisions/${pk}`,
		UPDATE: (pk: number) => `agencies/divisions/${pk}`,
		DELETE: (pk: number) => `agencies/divisions/${pk}`,
	},

	LOCATIONS: {
		LIST: "locations",
		CREATE: "locations/",
		DETAIL: (pk: number) => `locations/${pk}`,
		UPDATE: (pk: number) => `locations/${pk}`,
		DELETE: (pk: number) => `locations/${pk}`,
	},

	ADDRESSES: {
		LIST: "contacts/addresses",
		CREATE: "contacts/addresses",
		DETAIL: (pk: number) => `contacts/addresses/${pk}`,
		UPDATE: (pk: number) => `contacts/addresses/${pk}`,
		DELETE: (pk: number) => `contacts/addresses/${pk}`,
	},

	SERVICES: {
		LIST: "agencies/services",
		CREATE: "agencies/services",
		DETAIL: (pk: number) => `agencies/services/${pk}`,
		UPDATE: (pk: number) => `agencies/services/${pk}`,
		DELETE: (pk: number) => `agencies/services/${pk}`,
	},

	BUSINESS_AREAS: {
		LIST: "agencies/business_areas",
		CREATE: "agencies/business_areas",
		MINE: "agencies/business_areas/mine",
		DETAIL: (pk: string | number) => `agencies/business_areas/${pk}`,
		UPDATE: (pk: number) => `agencies/business_areas/${pk}`,
		DELETE: (pk: number) => `agencies/business_areas/${pk}`,
		// admin

		UNAPPROVED_DOCS: "agencies/business_areas/unapproved_docs",
		PROBLEMATIC_PROJECTS: "agencies/business_areas/problematic_projects",
		SET_ACTIVE: (pk: number) => `agencies/business_areas/setactive/${pk}`,
	},

	AFFILIATIONS: {
		LIST: "agencies/affiliations",
		CREATE: "agencies/affiliations",
		DETAIL: (pk: string | number) => `agencies/affiliations/${pk}`,
		UPDATE: (pk: number) => `agencies/affiliations/${pk}`,
		DELETE: (pk: number) => `agencies/affiliations/${pk}`,
		// admin
		MERGE: "agencies/affiliations/merge",
		CLEAN_ORPHANED: "agencies/affiliations/clean_orphaned",
	},

	BRANCHES: {
		LIST: "agencies/branches",
		CREATE: "agencies/branches",
		DETAIL: (pk: string | number) => `agencies/branches/${pk}`,
		UPDATE: (pk: number) => `agencies/branches/${pk}`,
		DELETE: (pk: number) => `agencies/branches/${pk}`,
	},
};
