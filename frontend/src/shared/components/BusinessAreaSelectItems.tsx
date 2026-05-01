import { SelectItem } from "@/shared/components/ui/select";
import type { IBusinessArea } from "@/shared/types/org.types";
import {
	formatBusinessAreaName,
	sortBusinessAreasByDisplayName,
} from "@/features/projects/utils/business-area.utils";

interface BusinessAreaSelectItemsProps {
	businessAreas: IBusinessArea[];
	/** Include a "None" option at the top (default: false) */
	includeNone?: boolean;
	/** Label for the none option (default: "None") */
	noneLabel?: string;
}

/**
 * BusinessAreaSelectItems — Renders sorted, formatted SelectItem entries
 * for business area dropdowns. Filters out inactive BAs and sorts by
 * division slug then name.
 *
 * Usage:
 * ```tsx
 * <Select value={...} onValueChange={...}>
 *   <SelectTrigger>...</SelectTrigger>
 *   <SelectContent>
 *     <BusinessAreaSelectItems businessAreas={businessAreas} />
 *   </SelectContent>
 * </Select>
 * ```
 */
export const BusinessAreaSelectItems = ({
	businessAreas,
	includeNone = false,
	noneLabel = "None",
}: BusinessAreaSelectItemsProps) => {
	const sorted = sortBusinessAreasByDisplayName(
		businessAreas.filter((ba) => ba.is_active && ba.id)
	);

	return (
		<>
			{includeNone && <SelectItem value="0">{noneLabel}</SelectItem>}
			{sorted.map((ba) => (
				<SelectItem key={ba.id} value={ba.id!.toString()}>
					{formatBusinessAreaName(ba)}
				</SelectItem>
			))}
		</>
	);
};
