import type {
	ContentType,
	ContentTypeConfig,
} from "@/shared/types/inline-edit.types";
import {
	updateProjectDescription,
	updateExternalProjectField,
	updateConceptPlanField,
	updateProjectPlanField,
	updateProjectPlanEndorsementField,
	updateProgressReportField,
	updateStudentReportField,
	updateProjectClosureField,
} from "@/features/projects/services/project.service";
import { updateAnnualReportField } from "@/features/reports/services/report.service";

/**
 * Central registry mapping content types to their configurations
 */
export const CONTENT_TYPE_CONFIGS: Record<ContentType, ContentTypeConfig> = {
	// ===== PROJECT FIELDS =====
	"project-description": {
		fieldName: "description",
		queryKey: (id: number) => ["projects", "detail", id],
		invalidateKeys: (id: number) => [["projects", "detail", id], ["projects"]],
		updateFn: async (id: number, content: string) => {
			await updateProjectDescription(id, content);
		},
		defaultPlaceholder: "Describe the project...",
		defaultEmptyMessage: "No description provided",
	},

	// ===== EXTERNAL PROJECT FIELDS =====
	"external-project-description": {
		fieldName: "description",
		queryKey: (id: number) => ["external-project-details", "detail", id],
		invalidateKeys: (id: number) => [
			["external-project-details", "detail", id],
			["external-project-details"],
			["projects"],
		],
		updateFn: async (id: number, content: string) => {
			await updateExternalProjectField(id, "description", content);
		},
		defaultPlaceholder: "Describe the external project...",
		defaultEmptyMessage: "No description provided",
	},

	"external-project-aims": {
		fieldName: "aims",
		queryKey: (id: number) => ["external-project-details", "detail", id],
		invalidateKeys: (id: number) => [
			["external-project-details", "detail", id],
			["external-project-details"],
			["projects"],
		],
		updateFn: async (id: number, content: string) => {
			await updateExternalProjectField(id, "aims", content);
		},
		defaultPlaceholder: "Describe the external project aims...",
		defaultEmptyMessage: "No aims provided",
	},

	"external-project-budget": {
		fieldName: "budget",
		queryKey: (id: number) => ["external-project-details", "detail", id],
		invalidateKeys: (id: number) => [
			["external-project-details", "detail", id],
			["external-project-details"],
			["projects"],
		],
		updateFn: async (id: number, content: string) => {
			await updateExternalProjectField(id, "budget", content);
		},
		defaultPlaceholder: "Describe the budget...",
		defaultEmptyMessage: "No budget provided",
	},

	"external-project-collaboration-with": {
		fieldName: "collaboration_with",
		queryKey: (id: number) => ["external-project-details", "detail", id],
		invalidateKeys: (id: number) => [
			["external-project-details", "detail", id],
			["external-project-details"],
			["projects"],
		],
		updateFn: async (id: number, content: string) => {
			await updateExternalProjectField(id, "collaboration_with", content);
		},
		defaultPlaceholder: "Describe collaborations...",
		defaultEmptyMessage: "No collaborations provided",
	},

	// ===== CONCEPT PLAN FIELDS =====
	"concept-plan-background": {
		fieldName: "background",
		queryKey: (id: number) => ["concept-plans", "detail", id],
		invalidateKeys: (id: number) => [
			["concept-plans", "detail", id],
			["concept-plans"],
		],
		updateFn: async (id: number, content: string) => {
			await updateConceptPlanField(id, "background", content);
		},
		defaultPlaceholder: "Provide background in up to 500 words...",
		defaultEmptyMessage: "No background provided",
	},

	"concept-plan-aims": {
		fieldName: "aims",
		queryKey: (id: number) => ["concept-plans", "detail", id],
		invalidateKeys: (id: number) => [
			["concept-plans", "detail", id],
			["concept-plans"],
		],
		updateFn: async (id: number, content: string) => {
			await updateConceptPlanField(id, "aims", content);
		},
		defaultPlaceholder: "List the aims in up to 500 words...",
		defaultEmptyMessage: "No aims provided",
	},

	"concept-plan-outcome": {
		fieldName: "outcome",
		queryKey: (id: number) => ["concept-plans", "detail", id],
		invalidateKeys: (id: number) => [
			["concept-plans", "detail", id],
			["concept-plans"],
		],
		updateFn: async (id: number, content: string) => {
			await updateConceptPlanField(id, "outcome", content);
		},
		defaultPlaceholder: "Summarise expected outcome in up to 500 words...",
		defaultEmptyMessage: "No outcome provided",
	},

	"concept-plan-collaborations": {
		fieldName: "collaborations",
		queryKey: (id: number) => ["concept-plans", "detail", id],
		invalidateKeys: (id: number) => [
			["concept-plans", "detail", id],
			["concept-plans"],
		],
		updateFn: async (id: number, content: string) => {
			await updateConceptPlanField(id, "collaborations", content);
		},
		defaultPlaceholder: "List expected collaborations in up to 500 words...",
		defaultEmptyMessage: "No collaborations provided",
	},

	"concept-plan-strategic-context": {
		fieldName: "strategic_context",
		queryKey: (id: number) => ["concept-plans", "detail", id],
		invalidateKeys: (id: number) => [
			["concept-plans", "detail", id],
			["concept-plans"],
		],
		updateFn: async (id: number, content: string) => {
			await updateConceptPlanField(id, "strategic_context", content);
		},
		defaultPlaceholder:
			"Describe strategic context and management implications in up to 500 words...",
		defaultEmptyMessage: "No strategic context provided",
	},

	"concept-plan-staff-time-allocation": {
		fieldName: "staff_time_allocation",
		queryKey: (id: number) => ["concept-plans", "detail", id],
		invalidateKeys: (id: number) => [
			["concept-plans", "detail", id],
			["concept-plans"],
		],
		updateFn: async (id: number, content: string) => {
			await updateConceptPlanField(id, "staff_time_allocation", content);
		},
		defaultPlaceholder: "Summarise staff time allocation by role...",
		defaultEmptyMessage: "No staff time allocation provided",
	},

	"concept-plan-budget": {
		fieldName: "budget",
		queryKey: (id: number) => ["concept-plans", "detail", id],
		invalidateKeys: (id: number) => [
			["concept-plans", "detail", id],
			["concept-plans"],
		],
		updateFn: async (id: number, content: string) => {
			await updateConceptPlanField(id, "budget", content);
		},
		defaultPlaceholder: "Indicate the operating budget...",
		defaultEmptyMessage: "No budget provided",
	},

	// ===== PROJECT PLAN FIELDS =====
	"project-plan-background": {
		fieldName: "background",
		queryKey: (id: number) => ["project-plans", "detail", id],
		invalidateKeys: (id: number) => [
			["project-plans", "detail", id],
			["project-plans"],
		],
		updateFn: async (id: number, content: string) => {
			await updateProjectPlanField(id, "background", content);
		},
		defaultPlaceholder:
			"Describe project background including a literature review...",
		defaultEmptyMessage: "No background provided",
	},

	"project-plan-aims": {
		fieldName: "aims",
		queryKey: (id: number) => ["project-plans", "detail", id],
		invalidateKeys: (id: number) => [
			["project-plans", "detail", id],
			["project-plans"],
		],
		updateFn: async (id: number, content: string) => {
			await updateProjectPlanField(id, "aims", content);
		},
		defaultPlaceholder: "List project aims...",
		defaultEmptyMessage: "No aims provided",
	},

	"project-plan-outcome": {
		fieldName: "outcome",
		queryKey: (id: number) => ["project-plans", "detail", id],
		invalidateKeys: (id: number) => [
			["project-plans", "detail", id],
			["project-plans"],
		],
		updateFn: async (id: number, content: string) => {
			await updateProjectPlanField(id, "outcome", content);
		},
		defaultPlaceholder: "Describe expected project outcome...",
		defaultEmptyMessage: "No outcome provided",
	},

	"project-plan-knowledge-transfer": {
		fieldName: "knowledge_transfer",
		queryKey: (id: number) => ["project-plans", "detail", id],
		invalidateKeys: (id: number) => [
			["project-plans", "detail", id],
			["project-plans"],
		],
		updateFn: async (id: number, content: string) => {
			await updateProjectPlanField(id, "knowledge_transfer", content);
		},
		defaultPlaceholder:
			"Describe anticipated users of the knowledge and technology transfer strategy...",
		defaultEmptyMessage: "No knowledge transfer information provided",
	},

	"project-plan-project-tasks": {
		fieldName: "project_tasks",
		queryKey: (id: number) => ["project-plans", "detail", id],
		invalidateKeys: (id: number) => [
			["project-plans", "detail", id],
			["project-plans"],
		],
		updateFn: async (id: number, content: string) => {
			await updateProjectPlanField(id, "project_tasks", content);
		},
		defaultPlaceholder:
			"List major tasks, milestones and outputs with delivery time frames...",
		defaultEmptyMessage: "No project tasks provided",
	},

	"project-plan-listed-references": {
		fieldName: "listed_references",
		queryKey: (id: number) => ["project-plans", "detail", id],
		invalidateKeys: (id: number) => [
			["project-plans", "detail", id],
			["project-plans"],
		],
		updateFn: async (id: number, content: string) => {
			await updateProjectPlanField(id, "listed_references", content);
		},
		defaultPlaceholder:
			"Paste in the bibliography of your literature research...",
		defaultEmptyMessage: "No references provided",
	},

	"project-plan-methodology": {
		fieldName: "methodology",
		queryKey: (id: number) => ["project-plans", "detail", id],
		invalidateKeys: (id: number) => [
			["project-plans", "detail", id],
			["project-plans"],
		],
		updateFn: async (id: number, content: string) => {
			await updateProjectPlanField(id, "methodology", content);
		},
		defaultPlaceholder: "Describe the study design and statistical analysis...",
		defaultEmptyMessage: "No methodology provided",
	},

	"project-plan-operating-budget": {
		fieldName: "operating_budget",
		queryKey: (id: number) => ["project-plans", "detail", id],
		invalidateKeys: (id: number) => [
			["project-plans", "detail", id],
			["project-plans"],
		],
		updateFn: async (id: number, content: string) => {
			await updateProjectPlanField(id, "operating_budget", content);
		},
		defaultPlaceholder: "Estimated budget: consolidated DBCA funds...",
		defaultEmptyMessage: "No operating budget provided",
	},

	"project-plan-operating-budget-external": {
		fieldName: "operating_budget_external",
		queryKey: (id: number) => ["project-plans", "detail", id],
		invalidateKeys: (id: number) => [
			["project-plans", "detail", id],
			["project-plans"],
		],
		updateFn: async (id: number, content: string) => {
			await updateProjectPlanField(id, "operating_budget_external", content);
		},
		defaultPlaceholder: "Estimated budget: external funds...",
		defaultEmptyMessage: "No external budget provided",
	},

	"project-plan-related-projects": {
		fieldName: "related_projects",
		queryKey: (id: number) => ["project-plans", "detail", id],
		invalidateKeys: (id: number) => [
			["project-plans", "detail", id],
			["project-plans"],
		],
		updateFn: async (id: number, content: string) => {
			await updateProjectPlanField(id, "related_projects", content);
		},
		defaultPlaceholder:
			"Name related SPPs and the extent you have consulted with their project leaders...",
		defaultEmptyMessage: "No related projects provided",
	},

	"project-plan-data-management": {
		fieldName: "data_management",
		queryKey: (id: number) => ["project-plans", "detail", id],
		invalidateKeys: (id: number) => [
			["project-plans", "detail", id],
			["project-plans"],
		],
		updateFn: async (id: number, content: string) => {
			// Note: This updates the endorsements object, not the project plan directly
			await updateProjectPlanEndorsementField(id, "data_management", content);
		},
		defaultPlaceholder: "Describe data management strategy...",
		defaultEmptyMessage: "No data management information provided",
	},

	"project-plan-specimens": {
		fieldName: "no_specimens",
		queryKey: (id: number) => ["project-plans", "detail", id],
		invalidateKeys: (id: number) => [
			["project-plans", "detail", id],
			["project-plans"],
		],
		updateFn: async (id: number, content: string) => {
			// Note: This updates the endorsements object, not the project plan directly
			await updateProjectPlanEndorsementField(id, "no_specimens", content);
		},
		defaultPlaceholder: "Indicate number of voucher specimens...",
		defaultEmptyMessage: "No specimen information provided",
	},

	// ===== PROGRESS REPORT FIELDS =====
	"progress-report-context": {
		fieldName: "context",
		queryKey: (id: number) => ["progress-reports", "detail", id],
		invalidateKeys: (id: number) => [
			["progress-reports", "detail", id],
			["progress-reports"],
		],
		updateFn: async (id: number, content: string) => {
			await updateProgressReportField(id, "context", content);
		},
		defaultPlaceholder:
			"A shortened introduction/background (100-150 words)...",
		defaultEmptyMessage: "No context provided",
	},

	"progress-report-aims": {
		fieldName: "aims",
		queryKey: (id: number) => ["progress-reports", "detail", id],
		invalidateKeys: (id: number) => [
			["progress-reports", "detail", id],
			["progress-reports"],
		],
		updateFn: async (id: number, content: string) => {
			await updateProgressReportField(id, "aims", content);
		},
		defaultPlaceholder: "A bullet point list of aims (100-150 words)...",
		defaultEmptyMessage: "No aims provided",
	},

	"progress-report-progress": {
		fieldName: "progress",
		queryKey: (id: number) => ["progress-reports", "detail", id],
		invalidateKeys: (id: number) => [
			["progress-reports", "detail", id],
			["progress-reports"],
		],
		updateFn: async (id: number, content: string) => {
			await updateProgressReportField(id, "progress", content);
		},
		defaultPlaceholder: "Current progress and achievements (100-150 words)...",
		defaultEmptyMessage: "No progress provided",
	},

	"progress-report-implications": {
		fieldName: "implications",
		queryKey: (id: number) => ["progress-reports", "detail", id],
		invalidateKeys: (id: number) => [
			["progress-reports", "detail", id],
			["progress-reports"],
		],
		updateFn: async (id: number, content: string) => {
			await updateProgressReportField(id, "implications", content);
		},
		defaultPlaceholder: "Management implications (100-150 words)...",
		defaultEmptyMessage: "No implications provided",
	},

	"progress-report-future": {
		fieldName: "future",
		queryKey: (id: number) => ["progress-reports", "detail", id],
		invalidateKeys: (id: number) => [
			["progress-reports", "detail", id],
			["progress-reports"],
		],
		updateFn: async (id: number, content: string) => {
			await updateProgressReportField(id, "future", content);
		},
		defaultPlaceholder: "Future directions (100-150 words)...",
		defaultEmptyMessage: "No future directions provided",
	},

	// ===== STUDENT REPORT FIELDS =====
	"student-report-progress-report": {
		fieldName: "progress_report",
		queryKey: (id: number) => ["student-reports", "detail", id],
		invalidateKeys: (id: number) => [
			["student-reports", "detail", id],
			["student-reports"],
		],
		updateFn: async (id: number, content: string) => {
			await updateStudentReportField(id, "progress_report", content);
		},
		defaultPlaceholder: "Report progress made this year (max. 150 words)...",
		defaultEmptyMessage: "No progress report provided",
	},

	// ===== PROJECT CLOSURE FIELDS =====
	"project-closure-intended-outcome": {
		fieldName: "intended_outcome",
		queryKey: (id: number) => ["project-closures", "detail", id],
		invalidateKeys: (id: number) => [
			["project-closures", "detail", id],
			["project-closures"],
			["projects", "detail"], // Invalidate all project details to update parent
		],
		updateFn: async (id: number, content: string) => {
			await updateProjectClosureField(id, "intended_outcome", content);
		},
		defaultPlaceholder: "Describe the intended outcome...",
		defaultEmptyMessage: "No intended outcome provided",
	},

	"project-closure-reason": {
		fieldName: "reason",
		queryKey: (id: number) => ["project-closures", "detail", id],
		invalidateKeys: (id: number) => [
			["project-closures", "detail", id],
			["project-closures"],
		],
		updateFn: async (id: number, content: string) => {
			await updateProjectClosureField(id, "reason", content);
		},
		defaultPlaceholder: "Reason for closure...",
		defaultEmptyMessage: "No reason provided",
	},

	"project-closure-scientific-outputs": {
		fieldName: "scientific_outputs",
		queryKey: (id: number) => ["project-closures", "detail", id],
		invalidateKeys: (id: number) => [
			["project-closures", "detail", id],
			["project-closures"],
		],
		updateFn: async (id: number, content: string) => {
			await updateProjectClosureField(id, "scientific_outputs", content);
		},
		defaultPlaceholder: "List key publications and documents...",
		defaultEmptyMessage: "No scientific outputs provided",
	},

	"project-closure-knowledge-transfer": {
		fieldName: "knowledge_transfer",
		queryKey: (id: number) => ["project-closures", "detail", id],
		invalidateKeys: (id: number) => [
			["project-closures", "detail", id],
			["project-closures"],
		],
		updateFn: async (id: number, content: string) => {
			await updateProjectClosureField(id, "knowledge_transfer", content);
		},
		defaultPlaceholder: "List knowledge transfer achievements...",
		defaultEmptyMessage: "No knowledge transfer information provided",
	},

	"project-closure-data-location": {
		fieldName: "data_location",
		queryKey: (id: number) => ["project-closures", "detail", id],
		invalidateKeys: (id: number) => [
			["project-closures", "detail", id],
			["project-closures"],
		],
		updateFn: async (id: number, content: string) => {
			await updateProjectClosureField(id, "data_location", content);
		},
		defaultPlaceholder: "Paste links to all datasets...",
		defaultEmptyMessage: "No data location provided",
	},

	"project-closure-hardcopy-location": {
		fieldName: "hardcopy_location",
		queryKey: (id: number) => ["project-closures", "detail", id],
		invalidateKeys: (id: number) => [
			["project-closures", "detail", id],
			["project-closures"],
		],
		updateFn: async (id: number, content: string) => {
			await updateProjectClosureField(id, "hardcopy_location", content);
		},
		defaultPlaceholder: "Location of hardcopy of all project data...",
		defaultEmptyMessage: "No hardcopy location provided",
	},

	"project-closure-backup-location": {
		fieldName: "backup_location",
		queryKey: (id: number) => ["project-closures", "detail", id],
		invalidateKeys: (id: number) => [
			["project-closures", "detail", id],
			["project-closures"],
		],
		updateFn: async (id: number, content: string) => {
			await updateProjectClosureField(id, "backup_location", content);
		},
		defaultPlaceholder: "Location of electronic project data...",
		defaultEmptyMessage: "No backup location provided",
	},

	// ===== ANNUAL REPORT FIELDS =====
	"annual-report-dm": {
		fieldName: "dm",
		queryKey: (_id: number) => ["reports", "latest"],
		invalidateKeys: (_id: number) => [
			["reports", "latest"],
			["reports", "latest-year"],
			["report-info"],
		],
		updateFn: async (id: number, content: string) => {
			await updateAnnualReportField(id, "dm", content);
		},
		defaultPlaceholder: "Enter the Director's Message...",
		defaultEmptyMessage: "No Director's Message provided",
	},

	"annual-report-dm-sign": {
		fieldName: "dm_sign",
		queryKey: (_id: number) => ["reports", "latest"],
		invalidateKeys: (_id: number) => [
			["reports", "latest"],
			["reports", "latest-year"],
			["report-info"],
		],
		updateFn: async (id: number, content: string) => {
			await updateAnnualReportField(id, "dm_sign", content);
		},
		defaultPlaceholder: "Enter the Director's Message signature...",
		defaultEmptyMessage: "No signature provided",
	},

	"annual-report-service-delivery-intro": {
		fieldName: "service_delivery_intro",
		queryKey: (_id: number) => ["reports", "latest"],
		invalidateKeys: (_id: number) => [
			["reports", "latest"],
			["reports", "latest-year"],
			["report-info"],
		],
		updateFn: async (id: number, content: string) => {
			await updateAnnualReportField(id, "service_delivery_intro", content);
		},
		defaultPlaceholder: "Enter the Service Delivery introduction...",
		defaultEmptyMessage: "No Service Delivery introduction provided",
	},

	"annual-report-research-intro": {
		fieldName: "research_intro",
		queryKey: (_id: number) => ["reports", "latest"],
		invalidateKeys: (_id: number) => [
			["reports", "latest"],
			["reports", "latest-year"],
			["report-info"],
		],
		updateFn: async (id: number, content: string) => {
			await updateAnnualReportField(id, "research_intro", content);
		},
		defaultPlaceholder: "Enter the Research introduction...",
		defaultEmptyMessage: "No Research introduction provided",
	},

	"annual-report-student-intro": {
		fieldName: "student_intro",
		queryKey: (_id: number) => ["reports", "latest"],
		invalidateKeys: (_id: number) => [
			["reports", "latest"],
			["reports", "latest-year"],
			["report-info"],
		],
		updateFn: async (id: number, content: string) => {
			await updateAnnualReportField(id, "student_intro", content);
		},
		defaultPlaceholder: "Enter the Student introduction...",
		defaultEmptyMessage: "No Student introduction provided",
	},

	"annual-report-publications": {
		fieldName: "publications",
		queryKey: (_id: number) => ["reports", "latest"],
		invalidateKeys: (_id: number) => [
			["reports", "latest"],
			["reports", "latest-year"],
			["report-info"],
		],
		updateFn: async (id: number, content: string) => {
			await updateAnnualReportField(id, "publications", content);
		},
		defaultPlaceholder: "Enter the Publications content...",
		defaultEmptyMessage: "No Publications content provided",
	},
};
