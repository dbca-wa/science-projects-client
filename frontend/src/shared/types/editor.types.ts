/**
 * Rich Text Editor Component Types
 * 
 * Type definitions for the Lexical-based rich text editor component.
 */

export type ToolbarMode = 'full' | 'simple' | 'minimal' | 'none' | 'profile';

export interface RichTextEditorProps {
  // Content
  value?: string;
  onChange?: (html: string) => void;
  
  // Configuration
  placeholder?: string;
  readOnly?: boolean;
  disabled?: boolean;
  autoFocus?: boolean;
  
  // Toolbar
  toolbar?: ToolbarMode;
  
  // Validation
  wordLimit?: number;
  required?: boolean;
  
  // Styling
  className?: string;
  minHeight?: string;
  
  // Accessibility
  'aria-label'?: string;
  'aria-describedby'?: string;
}

export interface RichTextDisplayProps {
  content: string;
  className?: string;
}

export interface ToolbarProps {
  mode: ToolbarMode;
  disabled?: boolean;
}

export interface FormatButtonProps {
  format: 'bold' | 'italic' | 'underline';
  disabled?: boolean;
}

export interface HeadingSelectProps {
  disabled?: boolean;
  disableHeadings?: boolean; // Disable H1/H2/H3 but keep Normal enabled
}

export interface LinkButtonProps {
  disabled?: boolean;
}

export interface WordCountPluginProps {
  wordLimit?: number;
  onWordCountChange?: (count: number) => void;
}

export interface AutoLinkPluginProps {
  // No props needed for now
}

export interface TabIndentationPluginProps {
  // No props needed for now
}












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
