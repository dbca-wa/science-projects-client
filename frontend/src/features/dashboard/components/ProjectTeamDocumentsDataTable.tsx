/**
 * ProjectTeamDocumentsDataTable Component
 * 
 * Displays project team document tasks using the generic DataTable.
 * Includes filtering by task level (team/lead).
 */

import { useState, useMemo } from "react";
import { useNavigate } from "react-router";
import { DataTable, type ColumnDef } from "@/shared/components/DataTable";
import { Label } from "@/shared/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/shared/components/ui/radio-group";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/shared/components/ui/select";
import type { IProjectDocument } from "../types/dashboard.types";
import {
	combineProjectLevelTasks,
	sortTasksByLevel,
	sortTasksByDocumentKind,
	getDocumentUrlPath,
	getDocumentKindTitle,
	extractPlainTextTitle,
	type IDocumentTaskWithLevel,
} from "../utils/document-tasks.utils";
import { TASK_LEVEL_CONFIG } from "../constants/document-tasks.constants";

interface ProjectTeamDocumentsDataTableProps {
	teamTasks: IProjectDocument[];
	leadTasks: IProjectDocument[];
}

type FilterOption = "all" | "team" | "lead";

// Blue theme for project team tasks
const projectTeamTheme = {
	headerBg: "bg-blue-50 dark:bg-blue-900/20",
	rowHover: "hover:bg-blue-50 dark:hover:bg-blue-900/10",
	accentColor: "hover:text-blue-600 dark:hover:text-blue-400",
};

export const ProjectTeamDocumentsDataTable = ({
	teamTasks,
	leadTasks,
}: ProjectTeamDocumentsDataTableProps) => {
	const navigate = useNavigate();
	const [filter, setFilter] = useState<FilterOption>("all");

	// Combine and filter tasks
	const combinedTasks = useMemo(
		() => combineProjectLevelTasks(teamTasks, leadTasks),
		[teamTasks, leadTasks]
	);

	const filteredTasks = useMemo(() => {
		if (filter === "team") {
			return combinedTasks.filter((t) => t.taskLevel === "team");
		}
		if (filter === "lead") {
			return combinedTasks.filter((t) => t.taskLevel === "lead");
		}
		return combinedTasks;
	}, [combinedTasks, filter]);

	// Column definitions
	const columns: ColumnDef<IDocumentTaskWithLevel>[] = useMemo(
		() => [
			{
				id: "level",
				header: "Level",
				accessor: (row) => row.taskLevel,
				cell: (row) => {
					const levelConfig = TASK_LEVEL_CONFIG[row.taskLevel];
					return (
						<span
							className={`font-semibold text-${levelConfig.color}-600 dark:text-${levelConfig.color}-400`}
						>
							{levelConfig.title}
						</span>
					);
				},
				sortable: true,
				sortFn: (a, b) => {
					const sorted = sortTasksByLevel([a, b]);
					return sorted[0] === a ? -1 : 1;
				},
				width: "150px",
			},
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
				id: "title",
				header: "Project Title",
				accessor: (row) => extractPlainTextTitle(row.project.title),
				cell: (row) => {
					const plainTitle = extractPlainTextTitle(row.project.title);
					return (
						<div className="space-y-1">
							<div className="font-semibold text-blue-600 dark:text-blue-400 break-words">
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

	// Empty state for combined tasks
	if (combinedTasks.length === 0) {
		return (
			<div className="rounded-lg border border-gray-200 dark:border-gray-700 p-8 text-center">
				<div className="text-gray-500 dark:text-gray-400">
					No pending project team tasks.
				</div>
			</div>
		);
	}

	return (
		<div className="space-y-4">
			{/* Filter Controls */}
			<div className="flex items-center justify-between">
				{/* Desktop: Radio buttons */}
				<div className="hidden md:block">
					<RadioGroup
						value={filter}
						onValueChange={(value) => setFilter(value as FilterOption)}
						className="flex gap-4"
					>
						<div className="flex items-center space-x-2">
							<RadioGroupItem value="all" id="project-filter-all" />
							<Label htmlFor="project-filter-all" className="cursor-pointer font-normal">
								Show All
							</Label>
						</div>
						<div className="flex items-center space-x-2">
							<RadioGroupItem value="team" id="project-filter-team" />
							<Label htmlFor="project-filter-team" className="cursor-pointer font-normal">
								Team Tasks Only
							</Label>
						</div>
						<div className="flex items-center space-x-2">
							<RadioGroupItem value="lead" id="project-filter-lead" />
							<Label htmlFor="project-filter-lead" className="cursor-pointer font-normal">
								Lead Tasks Only
							</Label>
						</div>
					</RadioGroup>
				</div>

				{/* Mobile: Dropdown */}
				<div className="md:hidden w-full">
					<Select value={filter} onValueChange={(value) => setFilter(value as FilterOption)}>
						<SelectTrigger className="w-full">
							<SelectValue placeholder="Filter tasks" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="all">Show All</SelectItem>
							<SelectItem value="team">Team Tasks Only</SelectItem>
							<SelectItem value="lead">Lead Tasks Only</SelectItem>
						</SelectContent>
					</Select>
				</div>
			</div>

			{/* DataTable */}
			<DataTable
				data={filteredTasks}
				columns={columns}
				getRowKey={(row) => row.id}
				onRowClick={handleRowClick}
				defaultSort={{ column: "level", direction: "asc" }}
				pagination={{
					enabled: true,
					pageSize: 50,
					itemLabel: "documents",
				}}
				emptyMessage="No tasks match the current filter."
				ariaLabel="Project team document tasks"
				theme={projectTeamTheme}
			/>
		</div>
	);
};
