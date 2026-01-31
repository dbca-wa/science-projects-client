import { useState, useMemo } from "react";
import { useNavigate } from "react-router";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import type { IProjectDocument } from "../types/dashboard.types";
import {
	addTaskLevelMetadata,
	sortTasksByDocumentKind,
	getDocumentUrlPath,
	getDocumentKindTitle,
	extractPlainTextTitle,
	type IDocumentTaskWithLevel,
} from "../utils/document-tasks.utils";

interface BusinessAreaLeadDocumentsDataTableProps {
	tasks: IProjectDocument[];
}

type SortColumn = "kind" | "title";
type SortDirection = "asc" | "desc";

export const BusinessAreaLeadDocumentsDataTable = ({
	tasks,
}: BusinessAreaLeadDocumentsDataTableProps) => {
	const navigate = useNavigate();
	const [sorting, setSorting] = useState<{
		column: SortColumn;
		direction: SortDirection;
	}>({
		column: "kind",
		direction: "asc",
	});

	const tasksWithLevel = useMemo(
		() => addTaskLevelMetadata(tasks, "ba"),
		[tasks]
	);

	const sortedTasks = useMemo(() => {
		let sorted = [...tasksWithLevel];

		if (sorting.column === "kind") {
			sorted = sortTasksByDocumentKind(sorted);
		} else if (sorting.column === "title") {
			sorted.sort((a, b) => {
				const titleA = extractPlainTextTitle(a.project.title);
				const titleB = extractPlainTextTitle(b.project.title);
				return titleA.localeCompare(titleB);
			});
		}

		if (sorting.direction === "desc") {
			sorted.reverse();
		}

		return sorted;
	}, [tasksWithLevel, sorting]);

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

	const toggleSort = (column: SortColumn) => {
		setSorting((prev) => ({
			column,
			direction:
				prev.column === column && prev.direction === "asc" ? "desc" : "asc",
		}));
	};

	const getSortIcon = (column: SortColumn) => {
		if (sorting.column !== column) {
			return <ArrowUpDown className="ml-2 h-4 w-4" />;
		}
		return sorting.direction === "asc" ? (
			<ArrowDown className="ml-2 h-4 w-4" />
		) : (
			<ArrowUp className="ml-2 h-4 w-4" />
		);
	};

	if (tasks.length === 0) {
		return (
			<div className="rounded-lg border border-gray-200 dark:border-gray-700 p-8 text-center">
				<div className="text-gray-500 dark:text-gray-400">
					No pending business area lead tasks.
				</div>
			</div>
		);
	}

	return (
		<div className="rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
			{/* Desktop Header */}
			<div className="hidden md:grid md:grid-cols-[200px_1fr] gap-4 bg-orange-50 dark:bg-orange-900/20 border-b border-gray-200 dark:border-gray-700">
				<div className="px-4 py-3">
					<button
						onClick={() => toggleSort("kind")}
						className="flex items-center gap-2 font-semibold text-sm hover:text-orange-600 dark:hover:text-orange-400 transition-colors"
					>
						Document Type
						{getSortIcon("kind")}
					</button>
				</div>
				<div className="px-4 py-3">
					<button
						onClick={() => toggleSort("title")}
						className="flex items-center gap-2 font-semibold text-sm hover:text-orange-600 dark:hover:text-orange-400 transition-colors"
					>
						Project Title
						{getSortIcon("title")}
					</button>
				</div>
			</div>

			{/* Rows */}
			<div>
				{sortedTasks.map((task) => {
					const plainTitle = extractPlainTextTitle(task.project.title);

					return (
						<div
							key={task.id}
							onClick={(e) => handleRowClick(task, e)}
							className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-4 border-b border-gray-200 dark:border-gray-700 last:border-b-0 cursor-pointer hover:bg-orange-50 dark:hover:bg-orange-900/10 transition-colors"
						>
							{/* Document Type Column */}
							<div className="px-4 py-4">
								<div className="md:hidden text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
									Document Type
								</div>
								<div className="font-medium text-gray-900 dark:text-gray-100">
									{getDocumentKindTitle(task.kind)}
								</div>
							</div>

							{/* Project Title Column */}
							<div className="px-4 py-4 space-y-1">
								<div className="md:hidden text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
									Project
								</div>
								<div className="font-semibold text-orange-600 dark:text-orange-400 break-words">
									{plainTitle}
								</div>
								<div className="text-sm text-gray-600 dark:text-gray-400">
									{task.projectCode}
								</div>
								<div className="text-xs text-gray-500 dark:text-gray-500">
									{task.taskDescription}
								</div>
							</div>
						</div>
					);
				})}
			</div>
		</div>
	);
};
