/**
 * ProjectDeletionTasksDataTable Component
 * 
 * Displays project deletion request tasks using the generic DataTable.
 */

import { useMemo } from "react";
import { useNavigate } from "react-router";
import { DataTable, type ColumnDef } from "@/shared/components/DataTable";
import type { IAdminTask } from "../types/admin-tasks.types";
import { formatDeletionReason, extractTextFromHTML } from "../utils/dashboard.utils";
import { format } from "date-fns";

interface ProjectDeletionTasksDataTableProps {
	tasks: IAdminTask[];
}

export const ProjectDeletionTasksDataTable = ({ tasks }: ProjectDeletionTasksDataTableProps) => {
	const navigate = useNavigate();

	// Column definitions
	const columns: ColumnDef<IAdminTask>[] = useMemo(
		() => [
			{
				id: "reason",
				header: "Reason",
				accessor: (row) => formatDeletionReason(row.reason),
				cell: (row) => (
					<div className="text-sm font-bold text-red-600 dark:text-red-400 break-words">
						{formatDeletionReason(row.reason)}
					</div>
				),
				sortable: true,
				sortFn: (a, b) => {
					const reasonA = formatDeletionReason(a.reason);
					const reasonB = formatDeletionReason(b.reason);
					return reasonA.localeCompare(reasonB);
				},
				width: "240px",
				hideOnMobile: true,
			},
			{
				id: "project",
				header: "Project",
				accessor: (row) => extractTextFromHTML(row.project?.title),
				cell: (row) => {
					const projectTitle = extractTextFromHTML(row.project?.title);
					const formattedDate = format(new Date(row.created_at), "MMM d, yyyy 'at' h:mm a");
					const deletionReason = formatDeletionReason(row.reason);

					return (
						<div className="space-y-1">
							{/* Project title */}
							{row.project && (
								<div className="text-sm font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 break-words">
									{projectTitle} (ID: {row.project.id})
								</div>
							)}

							{/* Deletion reason - visible only on mobile */}
							<div className="md:hidden text-sm font-bold text-red-600 dark:text-red-400 break-words">
								{deletionReason}
							</div>

							{/* Notes if present */}
							{row.notes && (
								<div className="text-sm text-gray-600 dark:text-gray-400 break-words">
									Note: {row.notes}
								</div>
							)}

							{/* Requester info */}
							<div className="text-xs text-gray-500 dark:text-gray-400 break-words">
								Requested by {row.requester.display_first_name} {row.requester.display_last_name}
							</div>

							{/* Request date */}
							<div className="text-xs text-gray-500 dark:text-gray-500 break-words">
								{formattedDate}
							</div>
						</div>
					);
				},
				sortable: true,
				sortFn: (a, b) => {
					const titleA = extractTextFromHTML(a.project?.title);
					const titleB = extractTextFromHTML(b.project?.title);
					return titleA.localeCompare(titleB);
				},
			},
		],
		[]
	);

	// Handle row click - navigate to project
	const handleRowClick = (task: IAdminTask, event: React.MouseEvent) => {
		const projectId = task.project?.id;
		if (projectId) {
			const url = `/projects/${projectId}/overview`;

			if (event.ctrlKey || event.metaKey) {
				window.open(url, "_blank");
			} else {
				navigate(url);
			}
		}
	};

	return (
		<DataTable
			data={tasks}
			columns={columns}
			getRowKey={(row) => row.id}
			onRowClick={handleRowClick}
			defaultSort={{ column: "reason", direction: "asc" }}
			emptyMessage="All done! No pending project deletion requests."
			ariaLabel="Project deletion tasks"
		/>
	);
};
