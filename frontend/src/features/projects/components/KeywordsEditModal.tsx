import { useState, useEffect, useCallback } from "react";
import { X, Tag } from "lucide-react";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Badge } from "@/shared/components/ui/badge";
import { useUpdateProject } from "../hooks/useUpdateProject";

interface KeywordsEditModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	projectId: number;
	initialKeywords: string | null | undefined;
}

/**
 * KeywordsEditModal component
 *
 * Modal for editing project keywords with tag-based interface.
 * - Add keywords as comma-separated list
 * - Press Enter or blur to add tags
 * - Remove keywords by clicking X
 * - Prevents duplicate keywords (case-insensitive)
 * - Capitalizes first letter of each keyword
 */
export function KeywordsEditModal({
	open,
	onOpenChange,
	projectId,
	initialKeywords,
}: KeywordsEditModalProps) {
	const [keywords, setKeywords] = useState<string[]>([]);
	const [inputValue, setInputValue] = useState("");
	const [initialKeywordsList, setInitialKeywordsList] = useState<string[]>([]);
	const [animationKey, setAnimationKey] = useState(0);

	// Mutation for updating project
	const updateProjectMutation = useUpdateProject();

	// Capitalize first letter
	const capitalizeFirstLetter = (text: string): string => {
		return text.charAt(0).toUpperCase() + text.slice(1);
	};

	// Check if keywords have changed from initial state
	const hasChanges = useCallback((): boolean => {
		if (keywords.length !== initialKeywordsList.length) return true;

		// Sort both arrays and compare
		const sortedCurrent = [...keywords].sort();
		const sortedInitial = [...initialKeywordsList].sort();

		return !sortedCurrent.every(
			(keyword, index) => keyword === sortedInitial[index]
		);
	}, [keywords, initialKeywordsList]);

	// Check if input has valid keywords to add
	const hasValidInput = (): boolean => {
		if (!inputValue.trim()) return false;

		// Split by comma and clean up
		const inputKeywords = inputValue
			.split(/,\s*/)
			.map((keyword) => keyword.trim())
			.filter((keyword) => keyword !== "");

		// Deduplicate within input (case-insensitive)
		const uniqueInputKeywords: string[] = [];
		const seenLowercase = new Set<string>();

		for (const keyword of inputKeywords) {
			const lowerKeyword = keyword.toLowerCase();
			if (!seenLowercase.has(lowerKeyword)) {
				seenLowercase.add(lowerKeyword);
				uniqueInputKeywords.push(keyword);
			}
		}

		// Check if any unique keywords don't already exist
		const newKeywords = uniqueInputKeywords.filter(
			(keyword) =>
				!keywords.some(
					(existing) => existing.toLowerCase() === keyword.toLowerCase()
				)
		);

		return newKeywords.length > 0;
	};

	// Parse initial keywords when modal opens - synchronizing with props
	useEffect(() => {
		if (open) {
			const parsed = initialKeywords
				? initialKeywords.split(", ").filter((k) => k.trim() !== "")
				: [];
			// eslint-disable-next-line react-hooks/set-state-in-effect
			setKeywords(parsed);

			setInitialKeywordsList(parsed);

			setInputValue("");
		}
	}, [open, initialKeywords]);

	// Trigger animation when changes are detected - use effect to respond to hasChanges
	// This is necessary for the animation to trigger when keywords change
	const hasChangesValue = hasChanges();
	useEffect(() => {
		if (hasChangesValue) {
			// eslint-disable-next-line react-hooks/set-state-in-effect
			setAnimationKey((prev) => prev + 1);
		}
	}, [hasChangesValue]);

	// Add keywords from input
	const addKeywords = () => {
		if (!inputValue.trim()) return;

		// Split by comma and clean up
		const inputKeywords = inputValue
			.split(/,\s*/) // Split on comma with optional whitespace
			.map((keyword) => keyword.trim())
			.filter((keyword) => keyword !== "");

		// Deduplicate within input (case-insensitive)
		const uniqueInputKeywords: string[] = [];
		const seenLowercase = new Set<string>();

		for (const keyword of inputKeywords) {
			const lowerKeyword = keyword.toLowerCase();
			if (!seenLowercase.has(lowerKeyword)) {
				seenLowercase.add(lowerKeyword);
				uniqueInputKeywords.push(keyword);
			}
		}

		// Filter out keywords that already exist (case-insensitive)
		const newKeywords = uniqueInputKeywords.filter(
			(keyword) =>
				!keywords.some(
					(existing) => existing.toLowerCase() === keyword.toLowerCase()
				)
		);

		if (newKeywords.length > 0) {
			const updatedKeywords = [
				...keywords,
				...newKeywords.map(capitalizeFirstLetter),
			];
			setKeywords(updatedKeywords);
		}

		setInputValue("");
	};

	// Remove keyword
	const handleRemoveKeyword = (index: number) => {
		setKeywords(keywords.filter((_, i) => i !== index));
	};

	// Handle Enter key in input
	const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === "Enter") {
			e.preventDefault();
			addKeywords();
		}
	};

	// Handle blur (clicking away from input)
	const handleBlur = () => {
		if (inputValue.trim()) {
			addKeywords();
		}
	};

	// Handle save
	const handleSave = async () => {
		try {
			const keywordsString = keywords.join(", ");
			await updateProjectMutation.mutateAsync({
				id: projectId,
				data: { keywords: keywordsString },
			});
			onOpenChange(false);
		} catch (error) {
			// Error is handled by the mutation hook
			console.error("Failed to save keywords:", error);
		}
	};

	// Handle cancel
	const handleCancel = () => {
		onOpenChange(false);
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-[600px]">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						<Tag className="h-5 w-5 text-purple-600 dark:text-purple-400" />
						Edit Keywords
					</DialogTitle>
					<DialogDescription>
						Add keywords as a comma-separated list. Press Enter or click away to
						add the tag/s.
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-4 py-4">
					{/* Input for adding keywords with Add button inside */}
					<div className="relative">
						<Input
							placeholder="Add some keywords..."
							value={inputValue}
							onChange={(e) => setInputValue(e.target.value)}
							onKeyDown={handleKeyDown}
							onBlur={handleBlur}
							className="h-10 pr-20"
						/>
						<Button
							type="button"
							size="sm"
							onClick={addKeywords}
							disabled={!hasValidInput()}
							className="absolute right-1 top-1 h-8"
						>
							Add
						</Button>
					</div>

					{/* Display current keywords */}
					<div className="min-h-[120px] max-h-[300px] overflow-y-auto border rounded-md p-4">
						{keywords.length === 0 ? (
							<p className="text-sm text-muted-foreground text-center py-8">
								No keywords added yet. Add keywords using the input above.
							</p>
						) : (
							<div className="flex flex-wrap gap-2">
								{keywords.map((keyword, index) => (
									<Badge
										key={index}
										variant="secondary"
										className="flex items-center gap-1 px-3 py-1.5 text-sm bg-purple-100 dark:bg-purple-900/30 text-purple-900 dark:text-purple-100 border border-purple-200 dark:border-purple-800"
									>
										{keyword}
										<button
											type="button"
											onClick={() => handleRemoveKeyword(index)}
											className="cursor-pointer ml-1 hover:text-destructive transition-colors"
											aria-label={`Remove ${keyword}`}
										>
											<X className="h-3 w-3" />
										</button>
									</Badge>
								))}
							</div>
						)}
					</div>

					{/* Keyword count */}
					<p className="text-xs text-muted-foreground">
						{keywords.length} {keywords.length === 1 ? "keyword" : "keywords"}
					</p>
				</div>

				<DialogFooter>
					<Button
						type="button"
						variant="outline"
						onClick={handleCancel}
						disabled={updateProjectMutation.isPending}
					>
						Cancel
					</Button>
					<Button
						key={animationKey}
						type="button"
						onClick={handleSave}
						disabled={updateProjectMutation.isPending || !hasChanges()}
						className={
							hasChanges() && !updateProjectMutation.isPending
								? "relative overflow-hidden bg-green-600 hover:bg-green-700 dark:bg-green-600 dark:hover:bg-green-700 animate-buttonBounce before:absolute before:inset-0 before:animate-[shimmer_2s_ease-in-out_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent"
								: ""
						}
					>
						{updateProjectMutation.isPending ? "Saving..." : "Save Keywords"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
