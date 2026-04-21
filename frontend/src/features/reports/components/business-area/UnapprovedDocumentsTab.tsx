import { useState, useMemo, useCallback } from "react";
import { useNavigate } from "react-router";
import { observer } from "mobx-react-lite";
import {
	Loader2,
	AlertCircle,
	ArrowUpDown,
	ArrowUp,
	ArrowDown,
	Search,
} from "lucide-react";
import { Alert, AlertDescription } from "@/shared/components/ui/alert";
import { Input } from "@/shared/components/ui/input";
import { Checkbox } from "@/shared/components/ui/checkbox";
import { UserLink } from "@/shared/components/user";
import {
	useAuthStore,
	useUnapprovedDocsFilterStore,
} from "@/app/stores/store-context";
import { useUnapprovedDocs } from "../../hooks/useBusinessAreaLead";
import {
	getApprovalStage,
	getDocKindLabel,
	getDocKindSlug,
	getDocStatusLabel,
	getFinancialYearLabel,
	getProjectTag,
	isReportKind,
	sortUnapprovedDocs,
	stripHtml,
} from "../../utils/business-area.utils";
import type { SortConfig } from "../../utils/business-area.utils";
import type { IUnapprovedDoc } from "../../types/business-area.types";

interface UnapprovedDocumentsTabProps {
	baId: number;
	enabled: boolean;
}

/** Column definitions for sortable headers */
const COLUMNS: { key: NonNullable<SortConfig["column"]>; label: string }[] = [
	{ key: "title", label: "Title" },
	{ key: "kind", label: "Kind" },
	{ key: "status", label: "Status" },
	{ key: "fy", label: "FY" },
	{ key: "waitingOn", label: "Waiting On" },
];

/** Stage checkbox filter definitions */
const STAGE_FILTERS = [
	{ stage: 1 as const, label: "Waiting on Project Lead" },
	{ stage: 2 as const, label: "Waiting on Me" },
	{ stage: 3 as const, label: "Waiting on Directorate" },
] as const;

/**
 * Displays all unapproved project documents in a single unified table
 * with checkbox stage filters, search, sortable columns, and a "Waiting On" column.
 */
export const UnapprovedDocumentsTab = observer(function UnapprovedDocumentsTab({
	baId,
	enabled,
}: UnapprovedDocumentsTabProps) {
	const navigate = useNavigate();
	const filterStore = useUnapprovedDocsFilterStore();
	const currentUserId = useAuthStore().user?.id;
	const { data, isLoading, error } = useUnapprovedDocs(baId, enabled);

	const [sortConfig, setSortConfig] = useState<SortConfig>({
		column: null,
		direction: null,
	});

	const docs: IUnapprovedDoc[] = useMemo(
		() => data?.[baId]?.linked ?? [],
		[data, baId]
	);

	/** Filtering pipeline: stage filter → search filter → sort */
	const filteredDocs = useMemo(() => {
		const activeStages = filterStore.activeStages;

		// Stage filter
		const stageFiltered = docs.filter((doc) => {
			const stage = getApprovalStage(doc);
			return activeStages.has(stage);
		});

		// Search filter
		const term = filterStore.state.searchTerm.trim().toLowerCase();
		const searchFiltered = term
			? stageFiltered.filter((doc) => {
					const title = stripHtml(doc.project.title).toLowerCase();
					const tag = getProjectTag(doc.project).toLowerCase();
					return title.includes(term) || tag.includes(term);
				})
			: stageFiltered;

		// Sort
		return sortUnapprovedDocs(searchFiltered, sortConfig);
	}, [
		docs,
		filterStore.activeStages,
		filterStore.state.searchTerm,
		sortConfig,
	]);

	/** Cycle sort state: null → asc → desc → null */
	const handleSort = useCallback(
		(column: NonNullable<SortConfig["column"]>) => {
			setSortConfig((prev) => {
				let nextDirection: SortConfig["direction"];

				if (prev.column !== column) {
					nextDirection = "asc";
				} else if (prev.direction === "asc") {
					nextDirection = "desc";
				} else if (prev.direction === "desc") {
					nextDirection = null;
				} else {
					nextDirection = "asc";
				}

				return {
					column: nextDirection ? column : null,
					direction: nextDirection,
				};
			});
		},
		[]
	);

	const handleRowClick = useCallback(
		(e: React.MouseEvent, doc: IUnapprovedDoc) => {
			const path = `/projects/${doc.project.id}/${getDocKindSlug(doc.kind)}`;
			if (e.ctrlKey || e.metaKey) {
				window.open(path, "_blank");
			} else {
				navigate(path);
			}
		},
		[navigate]
	);

	const handleRowKeyDown = useCallback(
		(e: React.KeyboardEvent, doc: IUnapprovedDoc) => {
			if (e.key === "Enter" || e.key === " ") {
				e.preventDefault();
				const path = `/projects/${doc.project.id}/${getDocKindSlug(doc.kind)}`;
				navigate(path);
			}
		},
		[navigate]
	);

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
					Failed to load unapproved documents. Please try again later.
				</AlertDescription>
			</Alert>
		);
	}

	const allUnchecked = filterStore.activeStages.size === 0;
	const hasSearchTerm = filterStore.state.searchTerm.trim().length > 0;

	return (
		<div className="space-y-6">
			<h3 className="text-base font-semibold">
				Total Unapproved ({filteredDocs.length})
			</h3>

			{/* Checkbox stage filters */}
			<div className="flex flex-wrap items-center gap-6">
				{STAGE_FILTERS.map(({ stage, label }) => {
					const key = `stage${stage}` as const;
					const checked = filterStore.state.stageFilters[key];
					return (
						<label
							key={stage}
							className="flex items-center gap-2 cursor-pointer text-sm"
						>
							<Checkbox
								checked={checked}
								onCheckedChange={() => filterStore.toggleStageFilter(stage)}
								aria-label={label}
							/>
							{label}
						</label>
					);
				})}
			</div>

			{/* Search bar */}
			<div className="relative">
				<Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
				<Input
					placeholder="Search by project title or tag…"
					value={filterStore.state.searchTerm}
					onChange={(e) => filterStore.setSearchTerm(e.target.value)}
					className="pl-10"
					aria-label="Search unapproved documents"
				/>
			</div>

			{/* Empty states */}
			{allUnchecked && (
				<div className="text-center py-12">
					<p className="text-muted-foreground">
						No approval stages selected. Check at least one filter to see
						documents.
					</p>
				</div>
			)}

			{!allUnchecked && filteredDocs.length === 0 && (
				<div className="text-center py-12">
					<p className="text-muted-foreground">
						{docs.length === 0 ||
						(!hasSearchTerm && filterStore.activeStages.size === 3)
							? "No unapproved documents for this business area."
							: "No matching documents found."}
					</p>
				</div>
			)}

			{/* Unified table */}
			{!allUnchecked && filteredDocs.length > 0 && (
				<div className="rounded-md border overflow-x-auto">
					<table className="w-full text-sm">
						<thead>
							<tr className="border-b bg-muted/50">
								{COLUMNS.map(({ key, label }) => (
									<th key={key} className="px-4 py-3 text-left font-medium">
										<button
											type="button"
											className="inline-flex items-center gap-1.5 hover:text-foreground transition-colors"
											onClick={() => handleSort(key)}
											aria-label={`Sort by ${label}`}
										>
											{label}
											<SortIcon column={key} config={sortConfig} />
										</button>
									</th>
								))}
							</tr>
						</thead>
						<tbody>
							{filteredDocs.map((doc) => (
								<tr
									key={doc.id}
									className="border-b hover:bg-muted/30 cursor-pointer transition-colors"
									onClick={(e) => handleRowClick(e, doc)}
									role="link"
									tabIndex={0}
									onKeyDown={(e) => handleRowKeyDown(e, doc)}
								>
									<td className="px-4 py-3">
										<div className="font-medium text-blue-600 dark:text-blue-400">
											{stripHtml(doc.project.title)}
										</div>
										<div className="text-xs text-muted-foreground">
											{getProjectTag(doc.project)}
										</div>
									</td>
									<td className="px-4 py-3 text-muted-foreground">
										{getDocKindLabel(doc.kind)}
									</td>
									<td className="px-4 py-3 text-muted-foreground">
										{getDocStatusLabel(doc.status)}
									</td>
									<td className="px-4 py-3 text-muted-foreground">
										{isReportKind(doc.kind)
											? getFinancialYearLabel(doc.report_year)
											: "—"}
									</td>
									<td
										className="px-4 py-3 text-muted-foreground"
										onClick={(e) => e.stopPropagation()}
									>
										<WaitingOnCell doc={doc} currentUserId={currentUserId} />
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			)}
		</div>
	);
});

/** Renders the waiting-on user as a clickable UserLink with role label */
// eslint-disable-next-line react-refresh/only-export-components
function WaitingOnCell({
	doc,
	currentUserId,
}: {
	doc: IUnapprovedDoc;
	currentUserId: number | undefined;
}) {
	if (!doc.waiting_on) return <span>Unknown</span>;

	const { id, display_first_name, display_last_name, role } = doc.waiting_on;
	const name = `${display_first_name} ${display_last_name}`;
	const roleLabel = id === currentUserId ? "You" : role;

	return (
		<div>
			<UserLink userId={id} displayName={name} />
			<div className="text-xs text-muted-foreground">{roleLabel}</div>
		</div>
	);
}

/** Renders the appropriate sort direction icon for a column header */
// eslint-disable-next-line react-refresh/only-export-components
function SortIcon({
	column,
	config,
}: {
	column: SortConfig["column"];
	config: SortConfig;
}) {
	if (config.column !== column || !config.direction) {
		return <ArrowUpDown className="size-3.5 text-muted-foreground/60" />;
	}
	if (config.direction === "asc") {
		return <ArrowUp className="size-3.5" />;
	}
	return <ArrowDown className="size-3.5" />;
}
