import type {
	AnnualReportSection,
	ConceptPlanSection,
	ProgressReportSection,
	ProjectClosureSection,
	ProjectPlanSection,
	ProjectSection,
	PubliProfileSection,
	StudentReportSection,
} from "./document.types";

export type EditorType =
	| "PublicProfile"
	| "ProjectDetail"
	| "ProjectDocument"
	| "AnnualReport"
	| "Comment"
	| "Guide";
export type EditorSections =
	| "Public Profile"
	| "Annual Report"
	| "Description"
	| "Concept Plan"
	| "Project Plan"
	| "Progress Report"
	| "Student Report"
	| "Project Closure"
	| "Comment";
export type EditorSubsections =
	| "Comment"
	| PubliProfileSection
	| ProjectSection
	| ConceptPlanSection
	| ProjectPlanSection
	| ProgressReportSection
	| StudentReportSection
	| ProjectClosureSection
	| AnnualReportSection;

export interface RGB {
	b: number;
	g: number;
	r: number;
}
export interface HSV {
	h: number;
	s: number;
	v: number;
}
export interface Color {
	hex: string;
	hsv: HSV;
	rgb: RGB;
}
