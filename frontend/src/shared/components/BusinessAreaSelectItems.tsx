import { AlertTriangle } from "lucide-react";
import { SelectItem } from "@/shared/components/ui/select";
import type { IBusinessArea, IDivision } from "@/shared/types/org.types";
import {
	formatBusinessAreaName,
	sortBusinessAreasByDisplayName,
} from "@/shared/utils/business-area.utils";
import { filterBusinessAreasByApprovers } from "@/shared/utils/division-filter.utils";

interface BusinessAreaSelectItemsProps {
	businessAreas: IBusinessArea[];
	/** Include a "None" option at the top (default: false) */
	includeNone?: boolean;
	/** Label for the none option (default: "None") */
	noneLabel?: string;
	/** When true, filter out BAs whose division has no approvers or key stakeholder */
	filterByApprovers?: boolean;
	/** Division data required when filterByApprovers is true */
	divisions?: IDivision[];
	/** Current BA value — preserved even if its division lacks approvers */
	currentValue?: number;
}

/**
 * BusinessAreaSelectItems — Renders sorted, formatted SelectItem entries
 * for business area dropdowns. Filters out inactive BAs and sorts by
 * division slug then name.
 *
 * When `filterByApprovers` is true and `divisions` is provided, only BAs
 * whose division has at least one approver or key stakeholder are shown.
 * If a project's current BA belongs to a division without approvers, it is
 * still displayed with a warning indicator.
 */
export const BusinessAreaSelectItems = ({
	businessAreas,
	includeNone = false,
	noneLabel = "None",
	filterByApprovers = false,
	divisions,
	currentValue,
}: BusinessAreaSelectItemsProps) => {
	const sorted = sortBusinessAreasByDisplayName(
		businessAreas.filter((ba) => ba.is_active && ba.id)
	);

	// Build a division lookup map for efficient filtering
	const divisionMap = new Map<number, IDivision>();
	if (divisions) {
		for (const div of divisions) {
			divisionMap.set(div.id, div);
		}
	}

	// Apply division filtering if enabled and division data is available
	const shouldFilter = filterByApprovers && divisions && divisions.length > 0;

	const filtered = shouldFilter
		? filterBusinessAreasByApprovers(sorted, divisions)
		: sorted;

	// Check if the current value's BA is excluded by filtering
	const currentBaExcluded =
		shouldFilter &&
		currentValue &&
		!filtered.some((ba) => ba.id === currentValue);

	const currentBa = currentBaExcluded
		? sorted.find((ba) => ba.id === currentValue)
		: null;

	return (
		<>
			{includeNone && <SelectItem value="0">{noneLabel}</SelectItem>}
			{currentBa && (
				<SelectItem key={currentBa.id} value={currentBa.id!.toString()}>
					<span className="flex items-center gap-1.5">
						<AlertTriangle
							className="size-3.5 shrink-0 text-amber-500"
							aria-hidden="true"
						/>
						<span>{formatBusinessAreaName(currentBa)}</span>
						<span className="text-xs text-muted-foreground">
							(no approvers)
						</span>
					</span>
				</SelectItem>
			)}
			{filtered.length === 0 && !currentBa && (
				<SelectItem value="__empty" disabled>
					<span className="flex items-center gap-1.5 text-amber-700 dark:text-amber-400">
						<AlertTriangle className="size-3.5 shrink-0" aria-hidden="true" />
						<span>Set approvers first (Manage → Approvers)</span>
					</span>
				</SelectItem>
			)}
			{filtered.map((ba) => (
				<SelectItem key={ba.id} value={ba.id!.toString()}>
					{formatBusinessAreaName(ba)}
				</SelectItem>
			))}
		</>
	);
};
