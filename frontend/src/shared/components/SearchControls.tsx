import { Checkbox } from "@/shared/components/ui/checkbox";
import { Label } from "@/shared/components/ui/label";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { X } from "lucide-react";

interface SearchControlsProps {
	saveSearch: boolean;
	onToggleSaveSearch: () => void;
	filterCount: number;
	onClearFilters: () => void;
	className?: string;
}

/**
 * SearchControls component
 * Reusable "Remember my search" checkbox and "Clear filters" button
 * Used across search pages (users, projects, etc.)
 */
export const SearchControls = ({
	saveSearch,
	onToggleSaveSearch,
	filterCount,
	onClearFilters,
	className,
}: SearchControlsProps) => {
	return (
		<div className={className}>
			{/* Remember my search */}
			<div className="flex items-center space-x-2 px-3 py-1.5 rounded-md bg-muted/50">
				<Checkbox
					id="save-search"
					checked={saveSearch}
					onCheckedChange={onToggleSaveSearch}
				/>
				<Label
					htmlFor="save-search"
					className="text-sm font-normal cursor-pointer whitespace-nowrap"
				>
					Remember my search
				</Label>
			</div>

			{/* Clear button */}
			{filterCount > 0 && (
				<Button
					variant="outline"
					size="sm"
					onClick={onClearFilters}
					className="gap-1.5 shrink-0"
				>
					<X className="size-4" />
					<span className="hidden sm:inline">Clear Filters</span>
					<span className="sm:hidden">Clear</span>
					<Badge variant="secondary" className="ml-1">
						{filterCount}
					</Badge>
				</Button>
			)}
		</div>
	);
};
