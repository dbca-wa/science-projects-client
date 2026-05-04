import type { ICaretakerTasksResponse } from "../types/caretaker-tasks.types";
import { CollapsibleCard } from "@/shared/components/CollapsibleCard";
import { CaretakerProjectTeamDocumentsDataTable } from "./CaretakerProjectTeamDocumentsDataTable";
import { CaretakerBusinessAreaDocumentsDataTable } from "./CaretakerBusinessAreaDocumentsDataTable";
import { CaretakerDirectorateDocumentsDataTable } from "./CaretakerDirectorateDocumentsDataTable";

interface CaretakerDocumentsTabContentProps {
	caretakerTasks?: ICaretakerTasksResponse;
	caretakerTasksLoading: boolean;
	caretakerTasksError?: Error | null;
}

export const CaretakerDocumentsTabContent = ({
	caretakerTasks,
	caretakerTasksLoading,
	caretakerTasksError,
}: CaretakerDocumentsTabContentProps) => {
	if (caretakerTasksLoading) {
		return (
			<div className="flex items-center justify-center py-20">
				<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
			</div>
		);
	}

	if (caretakerTasksError) {
		return (
			<div className="text-center py-8">
				<p className="text-red-600 dark:text-red-400 mb-4">
					Failed to load caretaker tasks:{" "}
					{caretakerTasksError.message || "Unknown error"}
				</p>
			</div>
		);
	}

	const teamTasks = caretakerTasks?.team || [];
	const leadTasks = caretakerTasks?.lead || [];
	const baTasks = caretakerTasks?.ba || [];
	const directorateTasks = caretakerTasks?.directorate || [];

	const projectTeamCount = teamTasks.length + leadTasks.length;
	const totalTasks =
		projectTeamCount + baTasks.length + directorateTasks.length;

	if (totalTasks === 0) {
		return (
			<div className="w-full h-full">
				<p className="text-gray-600 dark:text-gray-400 text-center py-8">
					No pending caretaker document tasks.
				</p>
			</div>
		);
	}

	return (
		<div className="flex flex-col w-full h-full space-y-4">
			{/* Project Team Documents */}
			{projectTeamCount > 0 && (
				<CollapsibleCard
					title="Project Team Documents"
					count={projectTeamCount}
				>
					<CaretakerProjectTeamDocumentsDataTable
						teamTasks={teamTasks}
						leadTasks={leadTasks}
					/>
				</CollapsibleCard>
			)}

			{/* Business Area Lead Documents */}
			{baTasks.length > 0 && (
				<CollapsibleCard
					title="Business Area Lead Documents"
					count={baTasks.length}
				>
					<CaretakerBusinessAreaDocumentsDataTable tasks={baTasks} />
				</CollapsibleCard>
			)}

			{/* Directorate Documents */}
			{directorateTasks.length > 0 && (
				<CollapsibleCard
					title="Directorate Documents"
					count={directorateTasks.length}
				>
					<CaretakerDirectorateDocumentsDataTable tasks={directorateTasks} />
				</CollapsibleCard>
			)}
		</div>
	);
};
