import { useNavigate } from "react-router";
import { Loader2, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/shared/components/ui/alert";
import { useProblematicProjects } from "../../hooks/useBusinessAreaLead";
import {
	flattenProblematicProjects,
	getProblemLabel,
	getProblemColour,
	getDocStatusLabel,
	stripHtml,
} from "../../utils/business-area.utils";
import type { IProblematicProjectRow } from "../../types/business-area.types";

interface ProblematicProjectsTabProps {
	baId: number;
	enabled: boolean;
}

/**
 * Displays a table of projects with data issues for a given business area.
 * Data is fetched lazily — only when the tab is first activated.
 */
export function ProblematicProjectsTab({
	baId,
	enabled,
}: ProblematicProjectsTabProps) {
	const navigate = useNavigate();
	const { data, isLoading, error } = useProblematicProjects(baId, enabled);

	const rows: IProblematicProjectRow[] = data
		? flattenProblematicProjects(data)
		: [];

	const handleRowClick = (
		e: React.MouseEvent,
		projectId: number | undefined
	) => {
		if (projectId === undefined) return;
		if (e.ctrlKey || e.metaKey) {
			window.open(`/projects/${projectId}/overview`, "_blank");
		} else {
			navigate(`/projects/${projectId}/overview`);
		}
	};

	if (isLoading) {
		return (
			<div className="flex justify-center py-12">
				<Loader2 className="size-8 animate-spin text-blue-600" />
			</div>
		);
	}

	if (error) {
		return (
			<Alert variant="destructive">
				<AlertCircle className="size-4" />
				<AlertDescription>
					Failed to load problematic projects. Please try again later.
				</AlertDescription>
			</Alert>
		);
	}

	return (
		<div className="space-y-4">
			<div>
				<h2 className="text-lg font-semibold">
					Problematic Projects ({rows.length})
				</h2>
				<p className="text-sm text-muted-foreground mt-1">
					Projects belonging to your business area which have data problems that
					may prevent progressing to the annual report.
				</p>
			</div>

			{rows.length === 0 ? (
				<div className="text-center py-12">
					<p className="text-muted-foreground text-lg">:)</p>
					<p className="text-muted-foreground mt-1">
						No problematic projects found.
					</p>
				</div>
			) : (
				<div className="rounded-md border overflow-x-auto">
					<table className="w-full text-sm">
						<thead>
							<tr className="border-b bg-muted/50">
								<th className="px-4 py-3 text-left font-medium">Status</th>
								<th className="px-4 py-3 text-left font-medium">Title</th>
								<th className="px-4 py-3 text-left font-medium">Problem</th>
								<th className="px-4 py-3 text-left font-medium">Created</th>
							</tr>
						</thead>
						<tbody>
							{rows.map((row) => (
								<tr
									key={`${row.id}-${row.problemKind}`}
									className="border-b hover:bg-muted/30 cursor-pointer transition-colors"
									onClick={(e) => handleRowClick(e, row.id)}
								>
									<td className="px-4 py-3 text-muted-foreground">
										{getDocStatusLabel(row.status)}
									</td>
									<td className="px-4 py-3">
										<div className="font-medium text-blue-600 dark:text-blue-400">
											{stripHtml(row.title)}
										</div>
										<div className="text-xs text-muted-foreground">
											{row.tag}
										</div>
									</td>
									<td className="px-4 py-3">
										<ProblemBadge kind={row.problemKind} />
									</td>
									<td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
										{new Date(row.created_at).toLocaleDateString("en-AU")}
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			)}
		</div>
	);
}

/**
 * Colour-coded badge for problem types
 */
function ProblemBadge({
	kind,
}: {
	kind: IProblematicProjectRow["problemKind"];
}) {
	const label = getProblemLabel(kind);
	const colour = getProblemColour(kind);

	const colourClasses: Record<string, string> = {
		red: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
		orange:
			"bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
		yellow:
			"bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
	};

	return (
		<span
			className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${colourClasses[colour] ?? ""}`}
		>
			{label}
		</span>
	);
}
