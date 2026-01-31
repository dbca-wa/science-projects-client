/**
 * CaretakerDirectorateDocumentsDataTable Component
 * 
 * Displays directorate-level document tasks for caretakers using the generic DataTable.
 * Includes a "For User" column showing which user the task is being done for.
 */

import { useMemo } from "react";
import { useNavigate } from "react-router";
import { DataTable, type ColumnDef } from "@/shared/components/DataTable";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/components/ui/avatar";
import { getImageUrl } from "@/shared/utils/image.utils";
import type { IProjectDocument } from "../types/dashboard.types";
import {
	addTaskLevelMetadata,
	sortTasksByDocumentKind,
	getDocumentUrlPath,
	getDocumentKindTitle,
	extractPlainTextTitle,
	type IDocumentTaskWithLevel,
} from "../utils/document-tasks.utils";

interface CaretakerDirectorateDocumentsDataTableProps {
	tasks: IProjectDocument[];
}

// Red theme for directorate tasks
const directorateTheme = {
	headerBg: "bg-red-50 dark:bg-red-900/20",
	rowHover: "hover:bg-red-50 dark:hover:bg-red-900/10",
	accentColor: "hover:text-red-600 dark:hover:text-red-400",
};

export const CaretakerDirectorateDocumentsDataTable = ({
	tasks,
}: CaretakerDirectorateDocumentsDataTableProps) => {
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
					const sorted = sortTasksByDocumentKind([a, b]);
					return sorted[0] === a ? -1 : 1;
				},
				width: "200px",
			},
			{
				id: "user",
				header: "For User",
				accessor: (row) =>
					row.for_user
						? `${row.for_user.display_first_name} ${row.for_user.display_last_name}`
						: "",
				cell: (row) => {
					const forUser = row.for_user;
					if (!forUser) {
						return (
							<div className="text-sm text-gray-500 dark:text-gray-400">—</div>
						);
					}
					return (
						<div className="flex items-center gap-2">
							<Avatar className="size-6">
								<AvatarImage src={getImageUrl(forUser.image)} />
								<AvatarFallback>
									{forUser.display_first_name[0]}
									{forUser.display_last_name[0]}
								</AvatarFallback>
							</Avatar>
							<div className="text-sm">
								<div className="font-medium text-gray-900 dark:text-gray-100">
									{forUser.display_first_name} {forUser.display_last_name}
								</div>
							</div>
						</div>
					);
				},
				sortable: true,
				sortFn: (a, b) => {
					const nameA = a.for_user
						? `${a.for_user.display_first_name} ${a.for_user.display_last_name}`
						: "";
					const nameB = b.for_user
						? `${b.for_user.display_first_name} ${b.for_user.display_last_name}`
						: "";
					return nameA.localeCompare(nameB);
				},
				width: "180px",
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
	const handleRowClick = (task: IDocumentTaskWithLevel, event: React.MouseEvent) => {
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
			getRowKey={(row) => `${row.id}-${row.for_user?.id || "unknown"}`}
			onRowClick={handleRowClick}
			defaultSort={{ column: "kind", direction: "asc" }}
			pagination={{
				enabled: true,
				pageSize: 50,
				itemLabel: "documents",
			}}
			emptyMessage="No pending directorate tasks."
			ariaLabel="Caretaker directorate document tasks"
			theme={directorateTheme}
		/>
	);
};
