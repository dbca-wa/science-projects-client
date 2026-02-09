/**
 * CaretakerDocumentTasksDataTable Component
 * 
 * Displays caretaker document tasks with caretakee information using the generic DataTable.
 * Shows document tasks for users you're caretaking for with visual distinction.
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
import type { IProjectDocument } from "@/features/dashboard/types/dashboard.types";
import {
	sortTasksByLevel,
	sortTasksByDocumentKind,
	getDocumentUrlPath,
	getDocumentKindTitle,
	extractPlainTextTitle,
	type IDocumentTaskWithLevel,
} from "@/features/dashboard/utils/document-tasks.utils";
import { TASK_LEVEL_CONFIG } from "@/features/dashboard/constants/document-tasks.constants";
import { CaretakeeCell } from "./CaretakeeCell";

interface CaretakerDocumentTasksDataTableProps {
	teamTasks: IProjectDocument[];
	leadTasks: IProjectDocument[];
	baTasks: IProjectDocument[];
	directorateTasks: IProjectDocument[];
}

type FilterOption = "all" | "team" | "lead" | "ba" | "directorate";

// Blue theme for caretaker tasks
const caretakerTheme = {
	headerBg: "bg-blue-50 dark:bg-blue-900/20",
	rowHover: "hover:bg-blue-50 dark:hover:bg-blue-900/10",
	accentColor: "hover:text-blue-600 dark:hover:text-blue-400",
};

export const CaretakerDocumentTasksDataTable = ({
	teamTasks,
	leadTasks,
	baTasks,
	directorateTasks,
}: CaretakerDocumentTasksDataTableProps) => {
	const navigate = useNavigate();
	const [filter, setFilter] = useState<FilterOption>("all");

	// Combine all tasks with level information
	const combinedTasks = useMemo(() => {
		const teamWithLevel = (teamTasks || []).map((task) => ({
			...task,
			taskLevel: "team" as const,
			projectCode: `${task.project.kind.toUpperCase()}-${task.project.year}-${task.project.number}`,
			taskDescription: "Review as team member",
		}));

		const leadWithLevel = (leadTasks || []).map((task) => ({
			...task,
			taskLevel: "lead" as const,
			projectCode: `${task.project.kind.toUpperCase()}-${task.project.year}-${task.project.number}`,
			taskDescription: "Approve as project lead",
		}));

		const baWithLevel = (baTasks || []).map((task) => ({
			...task,
			taskLevel: "ba" as const,
			projectCode: `${task.project.kind.toUpperCase()}-${task.project.year}-${task.project.number}`,
			taskDescription: "Approve as business area lead",
		}));

		const directorateWithLevel = (directorateTasks || []).map((task) => ({
			...task,
			taskLevel: "directorate" as const,
			projectCode: `${task.project.kind.toUpperCase()}-${task.project.year}-${task.project.number}`,
			taskDescription: "Approve as directorate",
		}));

		return [...teamWithLevel, ...leadWithLevel, ...baWithLevel, ...directorateWithLevel];
	}, [teamTasks, leadTasks, baTasks, directorateTasks]);

	// Filter tasks
	const filteredTasks = useMemo(() => {
		if (filter === "all") return combinedTasks;
		return combinedTasks.filter((t) => t.taskLevel === filter);
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
				id: "caretakee",
				header: "For User",
				accessor: (row) =>
					row.for_user
						? `${row.for_user.display_first_name} ${row.for_user.display_last_name}`
						: "",
				cell: (row) => {
					if (row.for_user) {
						return <CaretakeeCell user={row.for_user} />;
					}
					return null;
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
					No pending caretaker tasks.
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
							<RadioGroupItem value="all" id="caretaker-tasks-filter-all" />
							<Label htmlFor="caretaker-tasks-filter-all" className="cursor-pointer font-normal">
								Show All
							</Label>
						</div>
						<div className="flex items-center space-x-2">
							<RadioGroupItem value="team" id="caretaker-tasks-filter-team" />
							<Label htmlFor="caretaker-tasks-filter-team" className="cursor-pointer font-normal">
								Team Tasks
							</Label>
						</div>
						<div className="flex items-center space-x-2">
							<RadioGroupItem value="lead" id="caretaker-tasks-filter-lead" />
							<Label htmlFor="caretaker-tasks-filter-lead" className="cursor-pointer font-normal">
								Lead Tasks
							</Label>
						</div>
						<div className="flex items-center space-x-2">
							<RadioGroupItem value="ba" id="caretaker-tasks-filter-ba" />
							<Label htmlFor="caretaker-tasks-filter-ba" className="cursor-pointer font-normal">
								BA Tasks
							</Label>
						</div>
						<div className="flex items-center space-x-2">
							<RadioGroupItem value="directorate" id="caretaker-tasks-filter-directorate" />
							<Label htmlFor="caretaker-tasks-filter-directorate" className="cursor-pointer font-normal">
								Directorate Tasks
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
							<SelectItem value="team">Team Tasks</SelectItem>
							<SelectItem value="lead">Lead Tasks</SelectItem>
							<SelectItem value="ba">BA Tasks</SelectItem>
							<SelectItem value="directorate">Directorate Tasks</SelectItem>
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
					itemLabel: "tasks",
				}}
				emptyMessage="No tasks match the current filter."
				ariaLabel="Caretaker document tasks"
				theme={caretakerTheme}
				className="[&_[role=row]]:bg-blue-50/30 dark:[&_[role=row]]:bg-blue-900/5"
			/>
		</div>
	);
};
