import { useMemo } from "react";
import { SelectItem } from "@/shared/components/ui/select";
import type { IDivision } from "@/shared/types/org.types";

interface DivisionSelectItemsProps {
	divisions: IDivision[];
	/** Use slug as the value instead of id (default: false — uses id) */
	valueAsSlug?: boolean;
	/** Include an "All Divisions" option at the top */
	includeAll?: boolean;
	/** Label for the all option (default: "All Divisions") */
	allLabel?: string;
	/** Value for the all option (default: "all") */
	allValue?: string;
	/**
	 * When true, divisions without a key stakeholder are disabled.
	 * They still appear in the list but cannot be selected.
	 * Default: true
	 */
	requireKeyStakeholder?: boolean;
}

/**
 * DivisionSelectItems — Renders sorted, formatted SelectItem entries
 * for division dropdowns. Divisions are always sorted alphabetically by name.
 * Divisions without a key stakeholder are disabled by default.
 *
 * Usage:
 * ```tsx
 * <Select value={...} onValueChange={...}>
 *   <SelectTrigger>...</SelectTrigger>
 *   <SelectContent>
 *     <DivisionSelectItems divisions={divisions} />
 *   </SelectContent>
 * </Select>
 * ```
 */
export const DivisionSelectItems = ({
	divisions,
	valueAsSlug = false,
	includeAll = false,
	allLabel = "All Divisions",
	allValue = "all",
	requireKeyStakeholder = true,
}: DivisionSelectItemsProps) => {
	const sorted = useMemo(
		() => [...divisions].sort((a, b) => a.name.localeCompare(b.name)),
		[divisions]
	);

	return (
		<>
			{includeAll && <SelectItem value={allValue}>{allLabel}</SelectItem>}
			{sorted.map((div) => {
				const hasKs = !!div.key_stakeholder;
				const isDisabled = requireKeyStakeholder && !hasKs;
				const value = valueAsSlug ? div.slug : String(div.id);

				return (
					<SelectItem key={div.id} value={value} disabled={isDisabled}>
						{div.name}
						{isDisabled && (
							<span className="ml-1 text-xs text-muted-foreground">
								(no key stakeholder)
							</span>
						)}
					</SelectItem>
				);
			})}
		</>
	);
};
