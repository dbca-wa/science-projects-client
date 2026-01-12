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
