import { Checkbox } from "@/shared/components/ui/checkbox";
import { Label } from "@/shared/components/ui/label";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { X } from "lucide-react";
import { cn } from "../lib/utils";

interface SearchControlsProps {
	saveSearch: boolean;
	onToggleSaveSearch: () => void;
	filterCount: number;
	onClearFilters: () => void;
	className?: string;
}

/**
 * SearchControls component
 * Reusable "Remember my search" checkbox and "Clear search" button
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
		<div className={cn("", className)}>
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
					className="gap-1 shrink-0 bg-red-50 border-red-200 text-red-700 hover:bg-red-100 hover:border-red-300 dark:bg-red-950/50 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-950 dark:hover:border-red-800"
				>
					<X className="size-4" />
					<span className="hidden sm:inline">Clear Search</span>
					<span className="sm:hidden">Clear</span>
					<Badge
						variant="secondary"
						className="ml-0.5 bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
					>
						{filterCount}
					</Badge>
				</Button>
			)}
		</div>
	);
};
