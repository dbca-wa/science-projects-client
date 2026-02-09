import type { IProjectDocument } from "./dashboard.types";

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

/**
 * Client-side grouped tasks for a specific caretakee
 */
export interface ICaretakeeTasksGroup {
  user: {
    id: number;
    display_first_name: string;
    display_last_name: string;
    email: string;
    image: string | null;
  };
  tasks: IProjectDocument[];
}
