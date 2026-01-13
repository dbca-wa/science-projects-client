export interface IReportMediaUploadProps {
	pk: number;
	file: File;
	section:
		| "cover"
		| "rear_cover"
		| "sdchart"
		| "service_delivery"
		| "research"
		| "partnerships"
		| "collaborations"
		| "student_projects"
		| "publications"
		| "dbca_banner_cropped"
		| "dbca_banner";
}

export interface IReportMediaDeleteProps {
	pk: number;
	section:
		| "cover"
		| "rear_cover"
		| "sdchart"
		| "service_delivery"
		| "research"
		| "partnerships"
		| "collaborations"
		| "student_projects"
		| "publications"
		| "dbca_banner_cropped"
		| "dbca_banner";
}

export interface INewCycle {
	alsoUpdate: boolean;
	shouldSendEmails: boolean;
	shouldPrepopulate: boolean;
}

export interface PRPopulationVar {
	writeable_document_kind: string;
	section: string;
	project_pk: number;
}
