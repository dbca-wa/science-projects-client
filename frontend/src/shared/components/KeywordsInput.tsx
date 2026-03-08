import { useState } from "react";
import { X } from "lucide-react";
import { Input } from "@/shared/components/ui/input";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";

interface KeywordsInputProps {
	value: string[];
	onChange: (keywords: string[]) => void;
	placeholder?: string;
	error?: string;
	disabled?: boolean;
}

/**
 * KeywordsInput component
 *
 * Reusable keyword input with tag-based interface.
 *
 * Features:
 * - Add keywords as comma-separated list
 * - Press Enter or click Add to add tags
 * - Remove keywords by clicking X
 * - Prevents duplicate keywords (case-insensitive)
 * - Capitalises first letter of each keyword
 * - Displays validation errors
 */
export function KeywordsInput({
	value,
	onChange,
	placeholder = "Add some keywords...",
	error,
	disabled = false,
}: KeywordsInputProps) {
	const [inputValue, setInputValue] = useState("");

	// Capitalise first letter
	const capitaliseFirstLetter = (text: string): string => {
		return text.charAt(0).toUpperCase() + text.slice(1);
	};

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
				!value.some(
					(existing) => existing.toLowerCase() === keyword.toLowerCase()
				)
		);

		return newKeywords.length > 0;
	};

	// Add keywords from input
	const addKeywords = () => {
		if (!inputValue.trim()) return;

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

		// Filter out keywords that already exist (case-insensitive)
		const newKeywords = uniqueInputKeywords.filter(
			(keyword) =>
				!value.some(
					(existing) => existing.toLowerCase() === keyword.toLowerCase()
				)
		);

		if (newKeywords.length > 0) {
			const updatedKeywords = [
				...value,
				...newKeywords.map(capitaliseFirstLetter),
			];
			onChange(updatedKeywords);
		}

		setInputValue("");
	};

	// Remove keyword
	const handleRemoveKeyword = (index: number) => {
		onChange(value.filter((_, i) => i !== index));
	};

	// Handle Enter key in input
	const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === "Enter") {
			e.preventDefault();
			addKeywords();
		}
	};

	return (
		<div className="space-y-3">
			{/* Input for adding keywords with Add button inside */}
			<div className="relative">
				<Input
					placeholder={placeholder}
					value={inputValue}
					onChange={(e) => setInputValue(e.target.value)}
					onKeyDown={handleKeyDown}
					disabled={disabled}
					className="h-10 pr-20"
					aria-label="Keyword input"
					aria-invalid={!!error}
					aria-describedby={error ? "keywords-error" : "keywords-help"}
				/>
				<Button
					type="button"
					size="sm"
					onClick={addKeywords}
					disabled={!hasValidInput() || disabled}
					className="absolute right-1 top-1 h-8"
				>
					Add
				</Button>
			</div>

			{/* Helper text */}
			<p id="keywords-help" className="text-xs text-muted-foreground">
				Separate multiple keywords with commas. Duplicates will be ignored.
			</p>

			{/* Display current keywords */}
			{value.length > 0 && (
				<div className="flex flex-wrap gap-2">
					{value.map((keyword: string, index: number) => (
						<Badge
							key={index}
							variant="secondary"
							className="flex items-center gap-1 px-3 py-1.5 text-sm bg-purple-100 dark:bg-purple-900/30 text-purple-900 dark:text-purple-100 border border-purple-200 dark:border-purple-800"
						>
							{keyword}
							<button
								type="button"
								onClick={() => handleRemoveKeyword(index)}
								disabled={disabled}
								className="cursor-pointer ml-1 hover:text-destructive transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
								aria-label={`Remove ${keyword}`}
							>
								<X className="h-3 w-3" />
							</button>
						</Badge>
					))}
				</div>
			)}

			{/* Keyword count */}
			<p className="text-xs text-muted-foreground">
				{value.length} {value.length === 1 ? "keyword" : "keywords"}
			</p>

			{/* Error message */}
			{error && (
				<p
					id="keywords-error"
					className="text-sm text-destructive"
					role="alert"
				>
					{error}
				</p>
			)}
		</div>
	);
}
