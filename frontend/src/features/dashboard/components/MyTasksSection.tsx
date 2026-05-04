import { AdminCaretakerTasksDataTable } from "@/features/caretakers/components/AdminCaretakerTasksDataTable";
import { Alert, AlertDescription } from "@/shared/components/ui/alert";
import { AlertCircle, Loader2 } from "lucide-react";
import { CollapsibleCard } from "@/shared/components/CollapsibleCard";
import { EndorsementTasksDataTable } from "./EndorsementTasksDataTable";
import { ProjectDeletionTasksDataTable } from "./ProjectDeletionTasksDataTable";
import { AdminTasksDataTable } from "./AdminTasksDataTable";
import { filterCaretakerTasks } from "../utils/dashboard.utils";
import type { MyTasksSectionPhase1Props } from "../types/admin-tasks.types";

export const MyTasksSection = ({
	adminTasks,
	adminTasksLoading,
	adminTasksError,
	refetchAdminTasks,
	endorsementTasks,
	endorsementTasksLoading,
	endorsementTasksError,
}: MyTasksSectionPhase1Props) => {
	if (adminTasksLoading) {
		return (
			<div className="flex items-center justify-center py-20">
				<Loader2 className="size-12 animate-spin text-blue-500" />
			</div>
		);
	}

	if (adminTasksError) {
		return (
			<div className="text-center py-8">
				<p className="text-red-600 dark:text-red-400 mb-4">
					Failed to load tasks: {adminTasksError.message || "Unknown error"}
				</p>
				{refetchAdminTasks && (
					<button
						onClick={() => refetchAdminTasks()}
						className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
					>
						Retry
					</button>
				)}
			</div>
		);
	}

	const totalTasks = adminTasks.length;

	if (totalTasks === 0) {
		return (
			<div className="w-full h-full">
				<p className="text-gray-600 dark:text-gray-400 text-center py-8">
					Your tasks will be shown here...
				</p>
			</div>
		);
	}

	const caretakerTasks = filterCaretakerTasks(adminTasks);
	const projectDeletionTasks = adminTasks.filter(
		(task) => task.action === "deleteproject"
	);
	const mergeUserTasks = adminTasks.filter(
		(task) => task.action === "mergeuser"
	);

	// Filter endorsement tasks by type
	const aecTasks = endorsementTasks?.aec || [];
	const bmTasks = endorsementTasks?.bm || [];
	const hcTasks = endorsementTasks?.hc || [];
	const totalEndorsementTasks =
		aecTasks.length + bmTasks.length + hcTasks.length;

	return (
		<div className="flex flex-col w-full h-full space-y-4">
			{caretakerTasks.length > 0 && (
				<CollapsibleCard
					title="Caretaker Requests"
					count={caretakerTasks.length}
				>
					<AdminCaretakerTasksDataTable tasks={caretakerTasks} />
				</CollapsibleCard>
			)}

			{projectDeletionTasks.length > 0 && (
				<CollapsibleCard
					title="Project Deletion"
					count={projectDeletionTasks.length}
				>
					<ProjectDeletionTasksDataTable tasks={projectDeletionTasks} />
				</CollapsibleCard>
			)}

			{mergeUserTasks.length > 0 && (
				<CollapsibleCard
					title="Merge User Requests"
					count={mergeUserTasks.length}
				>
					<AdminTasksDataTable tasks={mergeUserTasks} />
				</CollapsibleCard>
			)}

			{/* Endorsement Tasks */}
			{endorsementTasksLoading ? (
				<CollapsibleCard title="Endorsement Tasks" count={0}>
					<div className="flex items-center justify-center py-8">
						<Loader2 className="size-6 animate-spin text-muted-foreground" />
					</div>
				</CollapsibleCard>
			) : endorsementTasksError ? (
				<CollapsibleCard title="Endorsement Tasks" count={0} defaultOpen={true}>
					<Alert variant="destructive">
						<AlertCircle className="size-4" />
						<AlertDescription>
							Failed to load endorsement tasks.
							{endorsementTasksError.message &&
								!endorsementTasksError.message.includes("<!DOCTYPE") && (
									<> {endorsementTasksError.message}</>
								)}
							{endorsementTasksError.message?.includes("<!DOCTYPE") && (
								<>
									{" "}
									Server error occurred. Please check the backend logs for
									details.
								</>
							)}
						</AlertDescription>
					</Alert>
				</CollapsibleCard>
			) : totalEndorsementTasks > 0 ? (
				<CollapsibleCard
					title="Endorsement Tasks"
					count={totalEndorsementTasks}
				>
					<div className="space-y-6">
						{aecTasks.length > 0 && (
							<EndorsementTasksDataTable tasks={aecTasks} kind="aec" />
						)}
						{bmTasks.length > 0 && (
							<EndorsementTasksDataTable tasks={bmTasks} kind="bm" />
						)}
						{hcTasks.length > 0 && (
							<EndorsementTasksDataTable tasks={hcTasks} kind="hc" />
						)}
					</div>
				</CollapsibleCard>
			) : null}
		</div>
	);
};
