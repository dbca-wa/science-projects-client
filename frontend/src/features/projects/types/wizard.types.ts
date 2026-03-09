/**
 * Wizard Types
 *
 * Types for the project creation wizard.
 */

import type { ProjectKind } from "@/shared/types/project.types";

/**
 * Wizard form data structure
 */
export interface IWizardFormData {
	// Base information
	title: string;
	kind: ProjectKind;
	image?: File | string | null;

	// Project details
	description: string;
	keywords: string[];

	// Location
	project_areas: number[];

	// Type-specific fields
	studentDetails?: IStudentDetails;
	externalDetails?: IExternalDetails;
}

/**
 * Student project specific details
 */
export interface IStudentDetails {
	organisation?: string;
	level?: string;
}

/**
 * External project specific details
 */
export interface IExternalDetails {
	collaboration_with?: string;
	budget?: string;
}

/**
 * Wizard step definition
 */
export interface IWizardStep {
	id: string;
	title: string;
	isValid: boolean;
	isComplete: boolean;
}

/**
 * Wizard validation result
 */
export interface IWizardValidation {
	isValid: boolean;
	errors: Record<string, string>;
}
