import { Button } from "@/shared/components/ui/button";

interface NoResultsStateProps {
	searchTerm?: string;
	message?: string;
	description?: string;
	onClear: () => void;
	clearButtonText?: string;
}

/**
 * NoResultsState component
 * Displays when search/filters return no results
 */
export const NoResultsState = ({
	searchTerm,
	message,
	description = "Try adjusting your search or filters",
	onClear,
	clearButtonText = "Clear search and filters",
}: NoResultsStateProps) => {
	const displayMessage = message || (searchTerm ? `No results for "${searchTerm}"` : "No results found");

	return (
		<div className="text-center py-12">
			<p className="text-muted-foreground mb-2">{displayMessage}</p>
			<p className="text-sm text-muted-foreground mb-4">{description}</p>
			<Button variant="outline" onClick={onClear}>
				{clearButtonText}
			</Button>
		</div>
	);
};
