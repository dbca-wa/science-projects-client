import {
	useLatestProgressReports,
	useLatestStudentReports,
} from "@/features/reports/hooks/useReports";
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
 * Approved tab — approved/active student and progress reports.
 */

interface ApprovedTabProps {
	reportId: number;
}

const ApprovedTab = observer(function ApprovedTab({
	reportId,
}: ApprovedTabProps) {
	const authStore = useAuthStore();
	const canEdit = authStore.isSuperuser || !!authStore.user?.is_key_stakeholder;
	const {
		data: progressReports,
		isLoading: progressLoading,
		error: progressError,
	} = useLatestProgressReports(reportId);
	const {
		data: studentReports,
		isLoading: studentLoading,
		error: studentError,
	} = useLatestStudentReports(reportId);

	const isLoading = progressLoading || studentLoading;
	const error = progressError || studentError;

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
					Failed to load approved reports: {error.message}
				</AlertDescription>
			</Alert>
		);
	}

	const studentItems = studentReports ?? [];
	const progressItems = progressReports ?? [];

	if (studentItems.length === 0 && progressItems.length === 0) {
		return (
			<div className="text-center py-12">
				<p className="text-muted-foreground">
					There are no approved reports for this year.
				</p>
			</div>
		);
	}

	return (
		<div className="py-4 space-y-4">
			<Accordion type="multiple" defaultValue={["progress-reports"]}>
				<div className="space-y-6">
					{studentItems.length > 0 && (
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
										{studentItems.length}
									</span>
								</span>
							</AccordionTrigger>
							<AccordionContent className="pt-4 px-1">
								<div className="space-y-6">
									{studentItems.map((sr, idx) => (
										<ReportProjectCard
											key={sr.id}
											report={sr}
											reportType="student"
											index={idx}
											canEdit={canEdit}
											showApproveButton={false}
										/>
									))}
								</div>
							</AccordionContent>
						</AccordionItem>
					)}

					{progressItems.length > 0 && (
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
										{progressItems.length}
									</span>
								</span>
							</AccordionTrigger>
							<AccordionContent className="pt-4 px-1">
								<div className="space-y-6">
									{progressItems.map((pr, idx) => (
										<ReportProjectCard
											key={pr.id}
											report={pr}
											reportType="progress"
											index={idx}
											canEdit={canEdit}
											showApproveButton={false}
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

export default ApprovedTab;
