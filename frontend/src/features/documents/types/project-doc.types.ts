export interface IApproveProgressReport {
	kind: "studentreport" | "progressreport";
	isActive: number;
	reportPk: number;
	documentPk: number;
}

export interface IProjectLeadsEmail {
	shouldDownloadList: boolean;
}
