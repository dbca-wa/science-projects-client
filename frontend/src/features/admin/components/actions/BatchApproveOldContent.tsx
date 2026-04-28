import { CheckSquare, Loader2 } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { useBatchApproveOld } from "../../hooks/useAdminActions";

interface BatchApproveOldContentProps {
	divisionSlug?: string;
}

/**
 * Content for the Batch Approve Old Reports page.
 * Triggers batch approval of older (previous year) reports.
 */
export function BatchApproveOldContent({
	divisionSlug,
}: BatchApproveOldContentProps) {
	const { mutate, isPending } = useBatchApproveOld();

	return (
		<div className="space-y-6">
			<div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6">
				<div className="flex items-start gap-4">
					<CheckSquare className="size-8 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
					<div className="space-y-2">
						<h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
							Batch Approve Old Reports
						</h2>
						<p className="text-sm text-gray-600 dark:text-gray-400">
							This action will approve all outstanding progress and student
							reports from <strong>previous</strong> financial years — i.e.
							years before the currently selected reporting year. Reports from
							the current year are not affected.
						</p>
						<p className="text-sm text-gray-600 dark:text-gray-400">
							No notification emails are sent for batch-approved old reports.
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
						Batch Approve Old Reports
					</Button>
				</div>
			</div>
		</div>
	);
}
