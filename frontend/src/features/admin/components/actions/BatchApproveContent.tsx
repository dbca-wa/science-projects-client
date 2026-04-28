import { CheckSquare, Loader2 } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { useBatchApprove } from "../../hooks/useAdminActions";

interface BatchApproveContentProps {
	divisionSlug?: string;
}

/**
 * Content for the Batch Approve Reports page.
 * Triggers batch approval of current year reports.
 */
export function BatchApproveContent({
	divisionSlug,
}: BatchApproveContentProps) {
	const { mutate, isPending } = useBatchApprove();

	return (
		<div className="space-y-6">
			<div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6">
				<div className="flex items-start gap-4">
					<CheckSquare className="size-8 text-green-600 dark:text-green-400 mt-0.5 shrink-0" />
					<div className="space-y-2">
						<h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
							Batch Approve Reports
						</h2>
						<p className="text-sm text-gray-600 dark:text-gray-400">
							This action will approve all outstanding progress and student
							reports at stage 3 (awaiting final/directorate approval) for the
							selected division and current reporting year.
						</p>
						<p className="text-sm text-gray-600 dark:text-gray-400">
							No notification emails are sent for batch-approved reports.
						</p>
					</div>
				</div>
				<div className="mt-6 flex justify-end">
					<Button
						onClick={() => mutate(divisionSlug)}
						disabled={isPending}
						variant="default"
					>
						{isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
						Batch Approve Reports
					</Button>
				</div>
			</div>
		</div>
	);
}
