import { useState } from "react";
import { useNavigate } from "react-router";
import { ArrowDown, ArrowUp } from "lucide-react";
import type { IAdminTask } from "../types/admin-tasks.types";
import { formatDeletionReason, extractTextFromHTML } from "../utils/dashboard.utils";
import { format } from "date-fns";

interface ProjectDeletionTasksDataTableProps {
	tasks: IAdminTask[];
}

export const ProjectDeletionTasksDataTable = ({ tasks }: ProjectDeletionTasksDataTableProps) => {
	const navigate = useNavigate();

	const handleRowClick = (task: IAdminTask, e: React.MouseEvent) => {
		const projectId = task.project?.id;
		if (projectId) {
			const url = `/projects/${projectId}/overview`;
			
			if (e.ctrlKey || e.metaKey) {
				window.open(url, "_blank");
			} else {
				navigate(url);
			}
		}
	};

	const [sorting, setSorting] = useState<{ column: "reason" | "project"; direction: "asc" | "desc" }>({
		column: "reason",
		direction: "asc",
	});

	const sortedTasks = [...tasks].sort((a, b) => {
		if (sorting.column === "reason") {
			const reasonA = formatDeletionReason(a.reason);
			const reasonB = formatDeletionReason(b.reason);
			const comparison = reasonA.localeCompare(reasonB);
			return sorting.direction === "asc" ? comparison : -comparison;
		} else {
			// Sort by project title
			const titleA = extractTextFromHTML(a.project?.title);
			const titleB = extractTextFromHTML(b.project?.title);
			const comparison = titleA.localeCompare(titleB);
			return sorting.direction === "asc" ? comparison : -comparison;
		}
	});

	const toggleSort = (column: "reason" | "project") => {
		setSorting(prev => ({
			column,
			direction: prev.column === column && prev.direction === "asc" ? "desc" : "asc",
		}));
	};

	const ReasonSortIcon = sorting.column === "reason" 
		? (sorting.direction === "asc" ? ArrowDown : ArrowUp)
		: ArrowDown;
	
	const ProjectSortIcon = sorting.column === "project"
		? (sorting.direction === "asc" ? ArrowDown : ArrowUp)
		: ArrowDown;

	if (tasks.length === 0) {
		return (
			<div className="rounded-lg border border-gray-200 dark:border-gray-700 p-8 text-center">
				<div className="text-gray-500 dark:text-gray-400">
					All done! No pending project deletion requests.
				</div>
			</div>
		);
	}

	return (
		<div className="rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
			{/* Header - hidden on mobile */}
			<div className="hidden md:grid grid-cols-[240px_1fr] gap-4 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
				<div className="px-4 py-3">
					<button
						onClick={() => toggleSort("reason")}
						className="flex items-center gap-2 font-semibold text-sm hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
					>
						Reason
						<ReasonSortIcon className="h-4 w-4" />
					</button>
				</div>
				<div className="px-4 py-3">
					<button
						onClick={() => toggleSort("project")}
						className="flex items-center gap-2 font-semibold text-sm hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
					>
						Project
						<ProjectSortIcon className="h-4 w-4" />
					</button>
				</div>
			</div>

			{/* Mobile header - visible only on mobile */}
			<div className="md:hidden bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3">
				<button
					onClick={() => toggleSort("project")}
					className="flex items-center gap-2 font-semibold text-sm hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
				>
					Project
					<ProjectSortIcon className="h-4 w-4" />
				</button>
			</div>

			{/* Rows */}
			<div>
				{sortedTasks.map((task) => {
					const projectTitle = extractTextFromHTML(task.project?.title);
					const formattedDate = format(new Date(task.created_at), "MMM d, yyyy 'at' h:mm a");
					const deletionReason = formatDeletionReason(task.reason);
					
					return (
						<div
							key={task.id}
							onClick={(e) => handleRowClick(task, e)}
							className="grid grid-cols-1 md:grid-cols-[240px_1fr] gap-4 border-b border-gray-200 dark:border-gray-700 last:border-b-0 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
						>
							{/* Reason column - hidden on mobile */}
							<div className="hidden md:block px-4 py-4">
								<div className="text-sm font-bold text-red-600 dark:text-red-400 break-words">
									{deletionReason}
								</div>
							</div>

							{/* Project column */}
							<div className="px-4 py-4 space-y-1">
								{/* Project title - blue and link-like */}
								{task.project && (
									<div className="text-sm font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 break-words">
										{projectTitle} (ID: {task.project.id})
									</div>
								)}
								
								{/* Deletion reason - visible only on mobile */}
								<div className="md:hidden text-sm font-bold text-red-600 dark:text-red-400 break-words">
									{deletionReason}
								</div>
								
								{/* Notes if present */}
								{task.notes && (
									<div className="text-sm text-gray-600 dark:text-gray-400 break-words">
										Note: {task.notes}
									</div>
								)}
								
								{/* Requester info */}
								<div className="text-xs text-gray-500 dark:text-gray-400 break-words">
									Requested by {task.requester.display_first_name} {task.requester.display_last_name}
								</div>
								
								{/* Request date */}
								<div className="text-xs text-gray-500 dark:text-gray-500 break-words">
									{formattedDate}
								</div>
							</div>
						</div>
					);
				})}
			</div>
		</div>
	);
};
