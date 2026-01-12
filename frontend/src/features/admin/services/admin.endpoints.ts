export const ADMIN_ENDPOINTS = {
	OPTIONS: {
		MERGE_USERS: "adminoptions/mergeusers",
		MAINTAINER: "adminoptions/maintainer",
		DETAIL: (pk: string | number) => `adminoptions/${pk}`,
		UPDATE: (pk: string | number) => `adminoptions/${pk}`,
		UPDATE_GUIDE_CONTENT: (pk: number) =>
			`adminoptions/${pk}/update_guide_content/`,
	},
	GUIDE: {
		SECTIONS: "adminoptions/guide-sections/",
		SECTION_DETAIL: (id: string) => `adminoptions/guide-sections/${id}/`,
		REORDER_SECTIONS: "adminoptions/guide-sections/reorder/",
		REORDER_FIELDS: (sectionId: string) =>
			`adminoptions/guide-sections/${sectionId}/reorder_fields/`,
		CONTENT_FIELDS: "adminoptions/content-fields/",
		CONTENT_FIELD_DETAIL: (id: string) =>
			`adminoptions/content-fields/${id}/`,
	},
	TASKS: {
		LIST: "adminoptions/tasks",
		DETAIL: (taskPk: number) => `adminoptions/tasks/${taskPk}`,
		ACTION: (taskPk: number, action: string) =>
			`adminoptions/tasks/${taskPk}/${action}`,
		CANCEL: (taskPk: number) => `adminoptions/tasks/${taskPk}/cancel`,
	},
	CARETAKER: {
		CHECK_STATUS: "adminoptions/caretakers/checkcaretaker",
		ADMIN_SET: "adminoptions/caretakers/adminsetcaretaker",
		REQUESTS: "adminoptions/caretakers/requests",
		DETAIL: (id: number) => `adminoptions/caretakers/${id}`,
	},
} as const;
