import { useLatestInactiveReports } from "@/features/reports/hooks/useReports";
import { useAuthStore } from "@/app/stores/store-context";
import { observer } from "mobx-react-lite";
import { Loader2, AlertCircle, BookOpen, FlaskConical } from "lucide-react";
import { Alert, AlertDescription } from "@/shared/components/ui/alert";
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/shared/components/ui/accordion";
import ReportProjectCard from "./ReportProjectCard";

/**
 * Pending tab — unapproved student and progress reports in accordion sections.
 */

interface PendingTabProps {
	reportId: number;
}

const PendingTab = observer(function PendingTab({ reportId }: PendingTabProps) {
	const authStore = useAuthStore();
	const canEdit = authStore.isSuperuser || !!authStore.user?.is_key_stakeholder;
	const {
		data: inactiveData,
		isLoading,
		error,
	} = useLatestInactiveReports(reportId);

	if (isLoading) {
		return (
			<div className="flex justify-center py-12">
				<Loader2 className="size-8 animate-spin text-blue-600" />
			</div>
		);
	}

	if (error) {
		return (
			<Alert variant="destructive">
				<AlertCircle className="size-4" />
				<AlertDescription>
					Failed to load pending reports: {error.message}
				</AlertDescription>
			</Alert>
		);
	}

	const studentReports = inactiveData?.student_reports ?? [];
	const progressReports = inactiveData?.progress_reports ?? [];

	if (studentReports.length === 0 && progressReports.length === 0) {
		return (
			<div className="text-center py-12">
				<p className="text-muted-foreground">
					There are no unapproved reports for this year.
				</p>
			</div>
		);
	}

	return (
		<div className="py-4 space-y-4">
			<Accordion type="multiple" defaultValue={["student-reports"]}>
				<div className="space-y-6">
					{studentReports.length > 0 && (
						<AccordionItem value="student-reports" className="border-none">
							<AccordionTrigger
								className={[
									"rounded-full bg-gradient-to-r from-blue-600 to-blue-700",
									"text-white px-6 py-3 shadow-md cursor-pointer",
									"hover:from-blue-500 hover:to-blue-600 hover:no-underline",
									"transition-all duration-200",
									"[&[data-state=open]>svg]:rotate-180",
									"[&>svg]:text-white",
									"justify-center",
								].join(" ")}
							>
								<span className="flex items-center gap-3">
									<BookOpen className="size-5" />
									<span className="font-bold text-lg">Student Reports</span>
									<span className="bg-white/20 text-white text-sm font-semibold px-2.5 py-0.5 rounded-full">
										{studentReports.length}
									</span>
								</span>
							</AccordionTrigger>
							<AccordionContent className="pt-4 px-1">
								<div className="space-y-6">
									{studentReports.map((sr, idx) => (
										<ReportProjectCard
											key={sr.id}
											report={sr}
											reportType="student"
											index={idx}
											canEdit={canEdit}
											showApproveButton={true}
										/>
									))}
								</div>
							</AccordionContent>
						</AccordionItem>
					)}

					{progressReports.length > 0 && (
						<AccordionItem value="progress-reports" className="border-none">
							<AccordionTrigger
								className={[
									"rounded-full bg-gradient-to-r from-green-600 to-green-700",
									"text-white px-6 py-3 shadow-md cursor-pointer",
									"hover:from-green-500 hover:to-green-600 hover:no-underline",
									"transition-all duration-200",
									"[&[data-state=open]>svg]:rotate-180",
									"[&>svg]:text-white",
									"justify-center",
								].join(" ")}
							>
								<span className="flex items-center gap-3">
									<FlaskConical className="size-5" />
									<span className="font-bold text-lg">Progress Reports</span>
									<span className="bg-white/20 text-white text-sm font-semibold px-2.5 py-0.5 rounded-full">
										{progressReports.length}
									</span>
								</span>
							</AccordionTrigger>
							<AccordionContent className="pt-4 px-1">
								<div className="space-y-6">
									{progressReports.map((pr, idx) => (
										<ReportProjectCard
											key={pr.id}
											report={pr}
											reportType="progress"
											index={idx}
											canEdit={canEdit}
											showApproveButton={true}
										/>
									))}
								</div>
							</AccordionContent>
						</AccordionItem>
					)}
				</div>
			</Accordion>
		</div>
	);
});

export default PendingTab;
