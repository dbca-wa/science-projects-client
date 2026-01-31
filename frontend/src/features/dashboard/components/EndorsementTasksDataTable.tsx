import { useState } from "react";
import { useNavigate } from "react-router";
import { ArrowDown, ArrowUp } from "lucide-react";
import { FaShieldDog } from "react-icons/fa6";
import { FaBiohazard } from "react-icons/fa";
import { PiPlantFill } from "react-icons/pi";
import type { IEndorsement } from "../types/dashboard.types";
import { extractTextFromHTML } from "../utils/dashboard.utils";

interface EndorsementTasksDataTableProps {
	tasks: IEndorsement[];
	kind: "aec" | "bm" | "hc";
}

const endorsementConfig = {
	aec: {
		title: "Animal Ethics Committee",
		description: "Upload the Animal Ethics Committee Approval form (PDF) to provide AEC approval",
		color: "text-blue-600 dark:text-blue-400",
		bgColor: "bg-blue-50 dark:bg-blue-900/20",
		icon: FaShieldDog,
	},
	bm: {
		title: "Biometrician",
		description: "Provide Biometrician Approval",
		color: "text-red-600 dark:text-red-400",
		bgColor: "bg-red-50 dark:bg-red-900/20",
		icon: FaBiohazard,
	},
	hc: {
		title: "Herbarium Curator",
		description: "Provide Herbarium Curator Approval",
		color: "text-green-600 dark:text-green-400",
		bgColor: "bg-green-50 dark:bg-green-900/20",
		icon: PiPlantFill,
	},
};

export const EndorsementTasksDataTable = ({ tasks, kind }: EndorsementTasksDataTableProps) => {
	const navigate = useNavigate();
	const config = endorsementConfig[kind];
	const Icon = config.icon;

	const handleRowClick = (endorsement: IEndorsement, e: React.MouseEvent) => {
		const projectId = endorsement.project_plan.document.project.id;
		const url = `/projects/${projectId}/project`;
		
		if (e.ctrlKey || e.metaKey) {
			window.open(url, "_blank");
		} else {
			navigate(url);
		}
	};

	const [sorting, setSorting] = useState<{ column: "project"; direction: "asc" | "desc" }>({
		column: "project",
		direction: "asc",
	});

	const sortedTasks = [...tasks].sort((a, b) => {
		const titleA = extractTextFromHTML(a.project_plan.document.project.title);
		const titleB = extractTextFromHTML(b.project_plan.document.project.title);
		const comparison = titleA.localeCompare(titleB);
		return sorting.direction === "asc" ? comparison : -comparison;
	});

	const toggleSort = () => {
		setSorting(prev => ({
			column: "project",
			direction: prev.direction === "asc" ? "desc" : "asc",
		}));
	};

	const SortIcon = sorting.direction === "asc" ? ArrowDown : ArrowUp;

	if (tasks.length === 0) {
		return (
			<div className="rounded-lg border border-gray-200 dark:border-gray-700 p-8 text-center">
				<div className="text-gray-500 dark:text-gray-400">
					All done! No pending {config.title.toLowerCase()} endorsements.
				</div>
			</div>
		);
	}

	return (
		<div className="rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
			{/* Header - hidden on mobile */}
			<div className="hidden md:grid grid-cols-[320px_1fr] gap-4 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
				<div className="px-4 py-3 font-semibold text-sm">Type</div>
				<div className="px-4 py-3">
					<button
						onClick={toggleSort}
						className="flex items-center gap-2 font-semibold text-sm hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
					>
						Project
						<SortIcon className="h-4 w-4" />
					</button>
				</div>
			</div>

			{/* Mobile header - visible only on mobile */}
			<div className="md:hidden bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3">
				<button
					onClick={toggleSort}
					className="flex items-center gap-2 font-semibold text-sm hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
				>
					Project
					<SortIcon className="h-4 w-4" />
				</button>
			</div>

			{/* Rows */}
			<div>
				{sortedTasks.map((endorsement) => {
					const projectTitle = extractTextFromHTML(endorsement.project_plan.document.project.title);
					
					return (
						<div
							key={endorsement.id}
							onClick={(e) => handleRowClick(endorsement, e)}
							className="grid grid-cols-1 md:grid-cols-[320px_1fr] gap-4 border-b border-gray-200 dark:border-gray-700 last:border-b-0 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
						>
							{/* Type column - hidden on mobile */}
							<div className="hidden md:block px-4 py-4">
								<div className="flex items-start gap-3">
									<div className={`p-2 rounded-lg ${config.bgColor} flex-shrink-0`}>
										<Icon className={`w-5 h-5 ${config.color}`} />
									</div>
									<div className="flex-1 min-w-0">
										<div className={`font-semibold ${config.color} break-words`}>
											{config.title}
										</div>
										<div className="text-xs text-gray-500 dark:text-gray-400 mt-1 break-words">
											{config.description}
										</div>
									</div>
								</div>
							</div>

							{/* Project column */}
							<div className="px-4 py-4">
								<div className="font-semibold text-blue-600 dark:text-blue-400 break-words">
									{projectTitle}
								</div>
								{/* Type description - visible only on mobile, shown under project title */}
								<div className="md:hidden mt-2 text-xs text-gray-500 dark:text-gray-400 break-words">
									{config.description}
								</div>
							</div>
						</div>
					);
				})}
			</div>
		</div>
	);
};
