import { AlertCircle, CheckCircle, FileText } from "lucide-react";
import {
	Alert,
	AlertDescription,
	AlertTitle,
} from "@/shared/components/ui/alert";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/shared/components/ui/card";

interface ProjectPlanEndorsementsPlaceholderProps {
	projectPlanId: number;
	endorsements?: {
		ae_endorsement_required?: boolean;
		ae_endorsement_provided?: boolean;
		aec_pdf?: { file: string } | null;
	} | null;
}

export function ProjectPlanEndorsementsPlaceholder({
	projectPlanId,
	endorsements,
}: ProjectPlanEndorsementsPlaceholderProps) {
	const aecRequired = endorsements?.ae_endorsement_required || false;
	const aecProvided = endorsements?.ae_endorsement_provided || false;
	const hasPdf = !!endorsements?.aec_pdf?.file;

	return (
		<div className="space-y-4">
			<Alert
				variant="default"
				className="border-blue-500 bg-blue-50 dark:bg-blue-950/20"
			>
				<AlertCircle className="h-4 w-4 text-blue-600" />
				<AlertTitle className="text-blue-900 dark:text-blue-100">
					Animal Ethics Committee Endorsements - Coming Soon
				</AlertTitle>
				<AlertDescription className="text-blue-800 dark:text-blue-200">
					This feature manages AEC endorsement requirements, approval status,
					and PDF document uploads. The full endorsement workflow with
					permissions and PDF management is currently being implemented.
				</AlertDescription>
			</Alert>

			{/* Visual placeholder showing current state */}
			<Card className="border-2 border-dashed border-gray-300 dark:border-gray-600">
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<FileText className="h-5 w-5" />
						Endorsements (Read-Only Preview)
					</CardTitle>
					<CardDescription>
						Project Plan ID: {projectPlanId} - Full editing capabilities coming
						soon
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					{/* AEC Endorsement Required */}
					<div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
						<span className="text-sm font-medium">
							AEC Endorsement Required?
						</span>
						<div className="flex items-center gap-2">
							{aecRequired ? (
								<CheckCircle className="h-4 w-4 text-green-600" />
							) : (
								<span className="text-xs text-gray-500">Not required</span>
							)}
						</div>
					</div>

					{/* AEC Endorsement Provided */}
					{aecRequired && (
						<div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
							<span className="text-sm font-medium">
								AEC Endorsement Status
							</span>
							<div className="flex items-center gap-2">
								{aecProvided ? (
									<span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
										Granted
									</span>
								) : (
									<span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
										Required
									</span>
								)}
							</div>
						</div>
					)}

					{/* PDF Document */}
					{hasPdf && (
						<div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
							<span className="text-sm font-medium">Approval PDF</span>
							<div className="flex items-center gap-2">
								<FileText className="h-4 w-4 text-red-600" />
								<span className="text-xs text-blue-600 dark:text-blue-400">
									PDF attached (view/delete coming soon)
								</span>
							</div>
						</div>
					)}

					{/* Upload Area Placeholder */}
					{aecRequired && !hasPdf && (
						<div className="p-6 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/50 text-center">
							<p className="text-sm text-gray-600 dark:text-gray-400">
								PDF upload area (coming soon)
							</p>
						</div>
					)}

					{/* Action Buttons Placeholder */}
					<div className="flex justify-end pt-2">
						<div className="px-4 py-2 text-sm rounded-md bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400">
							Save (coming soon)
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
