import { SelectContent, SelectItem } from "@/shared/components/ui/select";
import { useBranches } from "@/shared/hooks/queries/useBranches";

interface BranchSelectContentProps {
	/** Value for the "no branch" option. Pass null to hide it. */
	noneValue?: string | null;
	/** Label for the "no branch" option */
	noneLabel?: string;
}

/**
 * Shared branch select content (options list).
 * Renders the SelectContent with all branches from the API.
 * Branches are pre-sorted alphabetically by the useBranches hook.
 *
 * Usage:
 * ```tsx
 * <Select value={value} onValueChange={onChange}>
 *   <SelectTrigger><SelectValue placeholder="Select a branch" /></SelectTrigger>
 *   <BranchSelectContent noneValue="none" />
 * </Select>
 * ```
 */
export const BranchSelectContent = ({
	noneValue = null,
	noneLabel = "None",
}: BranchSelectContentProps) => {
	const { data: branches } = useBranches();

	return (
		<SelectContent>
			{noneValue !== null && (
				<SelectItem value={noneValue}>{noneLabel}</SelectItem>
			)}
			{branches?.map((branch) => (
				<SelectItem key={branch.id} value={branch.id.toString()}>
					{branch.name}
				</SelectItem>
			))}
		</SelectContent>
	);
};
