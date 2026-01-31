import { useState, useMemo } from "react";
import { useNavigate } from "react-router";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
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
import { Label } from "@/shared/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/shared/components/ui/radio-group";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/shared/components/ui/select";

interface ProjectTeamDocumentsDataTableProps {
	teamTasks: IProjectDocument[];
	leadTasks: IProjectDocument[];
}

type FilterOption = "all" | "team" | "lead";
type SortColumn = "level" | "kind" | "title";
type SortDirection = "asc" | "desc";

export const ProjectTeamDocumentsDataTable = ({
	teamTasks,
	leadTasks,
}: ProjectTeamDocumentsDataTableProps) => {
	const navigate = useNavigate();
	const [filter, setFilter] = useState<FilterOption>("all");
	const [sorting, setSorting] = useState<{
		column: SortColumn;
		direction: SortDirection;
	}>({
		column: "level",
		direction: "asc",
	});

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

	const sortedTasks = useMemo(() => {
		let sorted = [...filteredTasks];

		if (sorting.column === "level") {
			sorted = sortTasksByLevel(sorted);
		} else if (sorting.column === "kind") {
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
	}, [filteredTasks, sorting]);

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
							<RadioGroupItem value="all" id="filter-all" />
							<Label htmlFor="filter-all" className="cursor-pointer font-normal">
								Show All
							</Label>
						</div>
						<div className="flex items-center space-x-2">
							<RadioGroupItem value="team" id="filter-team" />
							<Label
								htmlFor="filter-team"
								className="cursor-pointer font-normal"
							>
								Team Tasks Only
							</Label>
						</div>
						<div className="flex items-center space-x-2">
							<RadioGroupItem value="lead" id="filter-lead" />
							<Label
								htmlFor="filter-lead"
								className="cursor-pointer font-normal"
							>
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

			{/* Table */}
			<div className="rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
				{/* Desktop Header */}
				<div className="hidden md:grid md:grid-cols-[150px_200px_1fr] gap-4 bg-blue-50 dark:bg-blue-900/20 border-b border-gray-200 dark:border-gray-700">
					<div className="px-4 py-3">
						<button
							onClick={() => toggleSort("level")}
							className="flex items-center gap-2 font-semibold text-sm hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
						>
							Level
							{getSortIcon("level")}
						</button>
					</div>
					<div className="px-4 py-3">
						<button
							onClick={() => toggleSort("kind")}
							className="flex items-center gap-2 font-semibold text-sm hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
						>
							Document Type
							{getSortIcon("kind")}
						</button>
					</div>
					<div className="px-4 py-3">
						<button
							onClick={() => toggleSort("title")}
							className="flex items-center gap-2 font-semibold text-sm hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
						>
							Project Title
							{getSortIcon("title")}
						</button>
					</div>
				</div>

				{/* Rows */}
				<div>
					{sortedTasks.map((task) => {
						const levelConfig = TASK_LEVEL_CONFIG[task.taskLevel];
						const plainTitle = extractPlainTextTitle(task.project.title);

						return (
							<div
								key={task.id}
								onClick={(e) => handleRowClick(task, e)}
								className="grid grid-cols-1 md:grid-cols-[150px_200px_1fr] gap-4 border-b border-gray-200 dark:border-gray-700 last:border-b-0 cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-colors"
							>
								{/* Level Column */}
								<div className="px-4 py-4">
									<div className="md:hidden text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
										Level
									</div>
									<span
										className={`font-semibold text-${levelConfig.color}-600 dark:text-${levelConfig.color}-400`}
									>
										{levelConfig.title}
									</span>
								</div>

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
									<div className="font-semibold text-blue-600 dark:text-blue-400 break-words">
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
		</div>
	);
};
