import { RefreshCw, Loader2 } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { useOpenNewCycle } from "../../hooks/useAdminActions";

/**
 * Content for the Open New Cycle page.
 * Triggers creation of a new annual reporting cycle.
 */
export function NewCycleContent() {
	const { mutate, isPending } = useOpenNewCycle();

	return (
		<div className="space-y-6">
			<div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6">
				<div className="flex items-start gap-4">
					<RefreshCw className="size-8 text-orange-600 dark:text-orange-400 mt-0.5 shrink-0" />
					<div className="space-y-2">
						<h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
							Open New Cycle
						</h2>
						<p className="text-sm text-gray-600 dark:text-gray-400">
							This action will open a new annual reporting cycle. This should
							only be done once per year when the new financial year begins.
							Ensure the previous cycle has been finalised before proceeding.
						</p>
					</div>
				</div>
				<div className="mt-6 flex justify-end">
					<Button
						onClick={() => mutate()}
						disabled={isPending}
						variant="default"
					>
						{isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
						Open New Cycle
					</Button>
				</div>
			</div>
		</div>
	);
}
