import { InlineSaveEditor } from "@/shared/components/editor/InlineSaveEditor";
import { useAuthStore } from "@/app/stores/store-context";
import type { IAnnualReport } from "@/features/reports/types/report.types";
import type { ContentType } from "@/shared/types/inline-edit.types";

/** Section config for the rich text editors */
const REPORT_SECTIONS: Array<{
	label: string;
	contentType: ContentType;
	field: keyof IAnnualReport;
}> = [
	{ label: "Director's Message", contentType: "annual-report-dm", field: "dm" },
	{
		label: "Director's Message Signature",
		contentType: "annual-report-dm-sign",
		field: "dm_sign",
	},
	{
		label: "Service Delivery Introduction",
		contentType: "annual-report-service-delivery-intro",
		field: "service_delivery_intro",
	},
	{
		label: "Research Introduction",
		contentType: "annual-report-research-intro",
		field: "research_intro",
	},
	{
		label: "Student Introduction",
		contentType: "annual-report-student-intro",
		field: "student_intro",
	},
	{
		label: "Publications",
		contentType: "annual-report-publications",
		field: "publications",
	},
];

/**
 * Details tab — editable rich text sections for the annual report.
 * Uses InlineSaveEditor (same as project documents) with the "simple"
 * toolbar (bold, italic, lists — no headings, links, or tables).
 */
export default function DetailsTab({ report }: { report: IAnnualReport }) {
	const authStore = useAuthStore();
	const canEdit = authStore.isSuperuser || !!authStore.user?.is_key_stakeholder;
	return (
		<div className="space-y-6 py-4">
			{REPORT_SECTIONS.map((section) => (
				<InlineSaveEditor
					key={section.contentType}
					contentType={section.contentType}
					entityId={report.id}
					initialContent={(report[section.field] as string) ?? ""}
					canEdit={canEdit}
					label={section.label}
					toolbar="simple"
				/>
			))}
		</div>
	);
}
