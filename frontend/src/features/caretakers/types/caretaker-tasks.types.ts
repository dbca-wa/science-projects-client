import type { IProjectDocument } from "@/shared/types/document.types";

/**
 * Response from caretaker tasks API
 * Backend returns flat arrays with for_user field
 * Frontend groups by for_user on client side
 */
export interface ICaretakerTasksResponse {
	all: IProjectDocument[];
	team: IProjectDocument[];
	lead: IProjectDocument[];
	ba: IProjectDocument[];
	directorate: IProjectDocument[];
}
