import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AdminCaretakerTasksDataTable } from "@/features/caretakers/components/AdminCaretakerTasksDataTable";
import { EndorsementTasksDataTable } from "./EndorsementTasksDataTable";
import { ProjectDeletionTasksDataTable } from "./ProjectDeletionTasksDataTable";
import { filterCaretakerTasks } from "../utils/dashboard.utils";
import type { MyTasksSectionPhase1Props } from "../types/admin-tasks.types";
import { ChevronDown, ChevronRight } from "lucide-react";

/**
 * Collapsible section for task groups
 */
const TaskSection = ({
	title,
	count,
	children,
	defaultOpen = true,
}: {
	title: string;
	count: number;
	children: React.ReactNode;
	defaultOpen?: boolean;
}) => {
	const [isOpen, setIsOpen] = useState(defaultOpen);

	return (
		<div className="mb-6">
			<button
				onClick={() => setIsOpen(!isOpen)}
				className="w-full flex items-center justify-between p-4 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors cursor-pointer"
			>
				<div className="flex items-center gap-3">
					{isOpen ? (
						<ChevronDown className="w-5 h-5 text-gray-600 dark:text-gray-300" />
					) : (
						<ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-300" />
					)}
					<h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
						{title}
					</h3>
					<span className="inline-flex items-center justify-center px-2.5 py-1 text-sm font-bold leading-none text-white bg-blue-600 rounded-full">
						{count}
					</span>
				</div>
			</button>

			<AnimatePresence>
				{isOpen && (
					<motion.div
						initial={{ height: 0, opacity: 0 }}
						animate={{ height: "auto", opacity: 1 }}
						exit={{ height: 0, opacity: 0 }}
						transition={{ duration: 0.3 }}
						className="overflow-hidden"
					>
						<div className="pt-4">{children}</div>
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	);
};

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
				<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
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
	const projectDeletionTasks = adminTasks.filter(task => task.action === "deleteproject");
	
	// Filter endorsement tasks by type
	const aecTasks = endorsementTasks?.aec || [];
	const bmTasks = endorsementTasks?.bm || [];
	const hcTasks = endorsementTasks?.hc || [];
	const totalEndorsementTasks = aecTasks.length + bmTasks.length + hcTasks.length;

	return (
		<div className="flex flex-col w-full h-full">
			{caretakerTasks.length > 0 && (
				<TaskSection
					title="Caretaker Requests"
					count={caretakerTasks.length}
					defaultOpen={true}
				>
					<AdminCaretakerTasksDataTable tasks={caretakerTasks} />
				</TaskSection>
			)}

			{projectDeletionTasks.length > 0 && (
				<TaskSection
					title="Project Deletion"
					count={projectDeletionTasks.length}
					defaultOpen={true}
				>
					<ProjectDeletionTasksDataTable tasks={projectDeletionTasks} />
				</TaskSection>
			)}

			{/* Endorsement Tasks */}
			{endorsementTasksLoading ? (
				<div className="mb-6">
					<div className="w-full flex items-center justify-between p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
						<div className="flex items-center gap-3">
							<ChevronRight className="w-5 h-5 text-gray-400 dark:text-gray-500" />
							<h3 className="text-lg font-semibold text-gray-700 dark:text-gray-400">
								Endorsement Tasks
							</h3>
							<div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500" />
						</div>
					</div>
				</div>
			) : endorsementTasksError ? (
				<div className="mb-6">
					<div className="w-full flex items-center justify-between p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
						<div className="flex items-center gap-3">
							<ChevronRight className="w-5 h-5 text-gray-400 dark:text-gray-500" />
							<h3 className="text-lg font-semibold text-gray-700 dark:text-gray-400">
								Endorsement Tasks
							</h3>
							<span className="inline-flex items-center justify-center px-2.5 py-1 text-sm font-bold leading-none text-gray-500 bg-gray-300 dark:bg-gray-600 rounded-full">
								?
							</span>
						</div>
					</div>
					<div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
						<p className="text-sm text-red-600 dark:text-red-400">
							Failed to load endorsement tasks: {endorsementTasksError.message || "Unknown error"}
						</p>
					</div>
				</div>
			) : totalEndorsementTasks > 0 ? (
				<TaskSection
					title="Endorsement Tasks"
					count={totalEndorsementTasks}
					defaultOpen={true}
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
				</TaskSection>
			) : null}
		</div>
	);
};
