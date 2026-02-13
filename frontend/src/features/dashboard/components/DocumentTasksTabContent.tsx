import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronRight } from "lucide-react";
import type { DocumentTasksResponse } from "../types/dashboard.types";
import { ProjectTeamDocumentsDataTable } from "./ProjectTeamDocumentsDataTable";
import { BusinessAreaLeadDocumentsDataTable } from "./BusinessAreaLeadDocumentsDataTable";
import { DirectorateDocumentsDataTable } from "./DirectorateDocumentsDataTable";

interface DocumentTasksTabContentProps {
	documentTasks?: DocumentTasksResponse;
	documentTasksLoading: boolean;
	documentTasksError?: Error | null;
	isBusinessAreaLead: boolean;
	isSuperuser: boolean;
}

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

export const DocumentTasksTabContent = ({
	documentTasks,
	documentTasksLoading,
	documentTasksError,
	isBusinessAreaLead,
	isSuperuser,
}: DocumentTasksTabContentProps) => {
	if (documentTasksLoading) {
		return (
			<div className="flex items-center justify-center py-20">
				<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
			</div>
		);
	}

	if (documentTasksError) {
		return (
			<div className="text-center py-8">
				<p className="text-red-600 dark:text-red-400 mb-4">
					Failed to load tasks: {documentTasksError.message || "Unknown error"}
				</p>
			</div>
		);
	}

	const teamTasks = documentTasks?.team || [];
	const leadTasks = documentTasks?.lead || [];
	const baTasks = documentTasks?.ba || [];
	const directorateTasks = documentTasks?.directorate || [];

	const projectTeamCount = teamTasks.length + leadTasks.length;
	const totalTasks =
		projectTeamCount + baTasks.length + directorateTasks.length;

	if (totalTasks === 0) {
		return (
			<div className="w-full h-full">
				<p className="text-gray-600 dark:text-gray-400 text-center py-8">
					No pending document tasks.
				</p>
			</div>
		);
	}

	return (
		<div className="flex flex-col w-full h-full space-y-6">
			{/* Project Team Documents */}
			{projectTeamCount > 0 && (
				<TaskSection
					title="Project Team Documents"
					count={projectTeamCount}
					defaultOpen={true}
				>
					<ProjectTeamDocumentsDataTable
						teamTasks={teamTasks}
						leadTasks={leadTasks}
					/>
				</TaskSection>
			)}

			{/* Business Area Lead Documents - Only show if user is BA lead AND has tasks */}
			{isBusinessAreaLead && baTasks.length > 0 && (
				<TaskSection
					title="Business Area Lead Documents"
					count={baTasks.length}
					defaultOpen={true}
				>
					<BusinessAreaLeadDocumentsDataTable tasks={baTasks} />
				</TaskSection>
			)}

			{/* Directorate Documents - Only show if user is superuser AND has tasks */}
			{isSuperuser && directorateTasks.length > 0 && (
				<TaskSection
					title="Directorate Documents"
					count={directorateTasks.length}
					defaultOpen={true}
				>
					<DirectorateDocumentsDataTable tasks={directorateTasks} />
				</TaskSection>
			)}
		</div>
	);
};
