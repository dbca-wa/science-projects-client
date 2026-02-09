import type { IProjectDocument, IEndorsement } from "@/features/dashboard/types/dashboard.types";

/**
 * Create a mock document task for testing
 * Provides sensible defaults with ability to override any field
 * 
 * @example
 * // Create document task with defaults
 * const task = createMockDocumentTask();
 * 
 * // Override specific fields
 * const conceptTask = createMockDocumentTask({ 
 *   kind: "concept",
 *   project: { id: 5, title: "My Project" }
 * });
 */
export const createMockDocumentTask = (
	overrides?: Partial<IProjectDocument>
): IProjectDocument => ({
	id: 1,
	kind: "concept",
	status: "pending",
	project: {
		id: 1,
		title: "Test Project",
		kind: "science",
		year: 2024,
		number: 1,
	},
	project_lead_approval_granted: false,
	business_area_lead_approval_granted: false,
	directorate_approval_granted: false,
	...overrides,
});

/**
 * Create a mock endorsement task for testing
 * Provides sensible defaults with ability to override any field
 * 
 * @example
 * // Create endorsement task with defaults
 * const endorsement = createMockEndorsementTask();
 * 
 * // Override specific fields
 * const aecEndorsement = createMockEndorsementTask({ 
 *   ae_endorsement_required: true,
 *   ae_endorsement_provided: false
 * });
 */
export const createMockEndorsementTask = (
	overrides?: Partial<IEndorsement>
): IEndorsement => ({
	id: 1,
	project_plan: {
		document: {
			project: {
				id: 1,
				title: "Test Project",
				kind: "projectplan",
			},
		},
	},
	ae_endorsement_required: false,
	ae_endorsement_provided: false,
	bm_endorsement_required: false,
	bm_endorsement_provided: false,
	hc_endorsement_required: false,
	hc_endorsement_provided: false,
	...overrides,
});

/**
 * Create a mock concept plan task
 * Convenience factory for concept plan specific tests
 * 
 * @example
 * const conceptTask = createMockConceptPlanTask();
 * expect(conceptTask.kind).toBe("concept");
 */
export const createMockConceptPlanTask = (): IProjectDocument =>
	createMockDocumentTask({
		kind: "concept",
	});

/**
 * Create a mock project plan task
 * Convenience factory for project plan specific tests
 * 
 * @example
 * const projectPlanTask = createMockProjectPlanTask();
 * expect(projectPlanTask.kind).toBe("projectplan");
 */
export const createMockProjectPlanTask = (): IProjectDocument =>
	createMockDocumentTask({
		kind: "projectplan",
	});

/**
 * Create a mock progress report task
 * Convenience factory for progress report specific tests
 * 
 * @example
 * const progressReportTask = createMockProgressReportTask();
 * expect(progressReportTask.kind).toBe("progressreport");
 */
export const createMockProgressReportTask = (): IProjectDocument =>
	createMockDocumentTask({
		kind: "progressreport",
	});
