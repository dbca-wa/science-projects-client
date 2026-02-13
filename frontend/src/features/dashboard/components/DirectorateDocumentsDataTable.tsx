/**
 * DirectorateDocumentsDataTable Component
 *
 * Displays directorate-level document tasks using the generic DataTable.
 */

import { useMemo } from "react";
import { useNavigate } from "react-router";
import { DataTable, type ColumnDef } from "@/shared/components/DataTable";
import type { IProjectDocument } from "../types/dashboard.types";
import {
	addTaskLevelMetadata,
	sortTasksByDocumentKind,
	getDocumentUrlPath,
	getDocumentKindTitle,
	extractPlainTextTitle,
	type IDocumentTaskWithLevel,
} from "../utils/document-tasks.utils";

interface DirectorateDocumentsDataTableProps {
	tasks: IProjectDocument[];
}

// Red theme for directorate tasks
const directorateTheme = {
	headerBg: "bg-red-50 dark:bg-red-900/20",
	rowHover: "hover:bg-red-50 dark:hover:bg-red-900/10",
	accentColor: "hover:text-red-600 dark:hover:text-red-400",
};

export const DirectorateDocumentsDataTable = ({
	tasks,
}: DirectorateDocumentsDataTableProps) => {
	const navigate = useNavigate();

	// Add level metadata to tasks
	const tasksWithLevel = useMemo(
		() => addTaskLevelMetadata(tasks, "directorate"),
		[tasks]
	);

	// Column definitions
	const columns: ColumnDef<IDocumentTaskWithLevel>[] = useMemo(
		() => [
			{
				id: "kind",
				header: "Document Type",
				accessor: (row) => row.kind,
				cell: (row) => (
					<div className="font-medium text-gray-900 dark:text-gray-100">
						{getDocumentKindTitle(row.kind)}
					</div>
				),
				sortable: true,
				sortFn: (a, b) => {
					// Use the existing sort utility
					const sorted = sortTasksByDocumentKind([a, b]);
					return sorted[0] === a ? -1 : 1;
				},
				width: "200px",
			},
			{
				id: "title",
				header: "Project Title",
				accessor: (row) => extractPlainTextTitle(row.project.title),
				cell: (row) => {
					const plainTitle = extractPlainTextTitle(row.project.title);
					return (
						<div className="space-y-1">
							<div className="font-semibold text-red-600 dark:text-red-400 break-words">
								{plainTitle}
							</div>
							<div className="text-sm text-gray-600 dark:text-gray-400">
								{row.projectCode}
							</div>
							<div className="text-xs text-gray-500 dark:text-gray-500">
								{row.taskDescription}
							</div>
						</div>
					);
				},
				sortable: true,
				sortFn: (a, b) => {
					const titleA = extractPlainTextTitle(a.project.title);
					const titleB = extractPlainTextTitle(b.project.title);
					return titleA.localeCompare(titleB);
				},
			},
		],
		[]
	);

	// Handle row click - navigate to document
	const handleRowClick = (
		task: IDocumentTaskWithLevel,
		event: React.MouseEvent
	) => {
		const urlPath = getDocumentUrlPath(task.kind);
		const url = `/projects/${task.project.id}/${urlPath}`;

		if (event.ctrlKey || event.metaKey) {
			window.open(url, "_blank");
		} else {
			navigate(url);
		}
	};

	return (
		<DataTable
			data={tasksWithLevel}
			columns={columns}
			getRowKey={(row) => row.id}
			onRowClick={handleRowClick}
			defaultSort={{ column: "kind", direction: "asc" }}
			pagination={{
				enabled: true,
				pageSize: 50,
				itemLabel: "documents",
			}}
			emptyMessage="No pending directorate tasks."
			ariaLabel="Directorate document tasks"
			theme={directorateTheme}
		/>
	);
};
