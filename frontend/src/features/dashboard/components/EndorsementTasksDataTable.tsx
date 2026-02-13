/**
 * EndorsementTasksDataTable Component
 *
 * Displays endorsement tasks (AEC, Biometrician, Herbarium Curator) using the generic DataTable.
 */

import { useMemo } from "react";
import { useNavigate } from "react-router";
import { DataTable, type ColumnDef } from "@/shared/components/DataTable";
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
		description:
			"Upload the Animal Ethics Committee Approval form (PDF) to provide AEC approval",
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

export const EndorsementTasksDataTable = ({
	tasks,
	kind,
}: EndorsementTasksDataTableProps) => {
	const navigate = useNavigate();
	const config = endorsementConfig[kind];
	const Icon = config.icon;

	// Column definitions
	const columns: ColumnDef<IEndorsement>[] = useMemo(
		() => [
			{
				id: "type",
				header: "Type",
				accessor: () => config.title,
				cell: () => (
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
				),
				sortable: false,
				width: "320px",
				hideOnMobile: true,
			},
			{
				id: "project",
				header: "Project",
				accessor: (row) =>
					extractTextFromHTML(row.project_plan.document.project.title),
				cell: (row) => {
					const projectTitle = extractTextFromHTML(
						row.project_plan.document.project.title
					);
					return (
						<div>
							<div className="font-semibold text-blue-600 dark:text-blue-400 break-words">
								{projectTitle}
							</div>
							{/* Type description - visible only on mobile */}
							<div className="md:hidden mt-2 text-xs text-gray-500 dark:text-gray-400 break-words">
								{config.description}
							</div>
						</div>
					);
				},
				sortable: true,
				sortFn: (a, b) => {
					const titleA = extractTextFromHTML(
						a.project_plan.document.project.title
					);
					const titleB = extractTextFromHTML(
						b.project_plan.document.project.title
					);
					return titleA.localeCompare(titleB);
				},
			},
		],
		[config, Icon]
	);

	// Handle row click - navigate to project
	const handleRowClick = (
		endorsement: IEndorsement,
		event: React.MouseEvent
	) => {
		const projectId = endorsement.project_plan.document.project.id;
		const url = `/projects/${projectId}/project`;

		if (event.ctrlKey || event.metaKey) {
			window.open(url, "_blank");
		} else {
			navigate(url);
		}
	};

	return (
		<DataTable
			data={tasks}
			columns={columns}
			getRowKey={(row) => row.id}
			onRowClick={handleRowClick}
			defaultSort={{ column: "project", direction: "asc" }}
			emptyMessage={`All done! No pending ${config.title.toLowerCase()} endorsements.`}
			ariaLabel={`${config.title} endorsement tasks`}
		/>
	);
};
