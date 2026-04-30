import { Badge } from "@/shared/components/ui/badge";
import { Input } from "@/shared/components/ui/input";
import { X } from "lucide-react";
import { parseKeywords, mergeKeywords } from "@/shared/utils/keyword.utils";

interface KeywordInputProps {
	keywords: string[];
	onKeywordsChange: (keywords: string[]) => void;
	disabled?: boolean;
	placeholder?: string;
	onBlur?: () => void;
}

/**
 * KeywordInput — Shared keyword entry component with semicolon splitting,
 * deduplication, and badge display.
 *
 * Used by both the project creation wizard and the edit project form.
 */
export const KeywordInput = ({
	keywords,
	onKeywordsChange,
	disabled = false,
	placeholder = "Type a keyword and press Enter (use ; for multiple)",
	onBlur,
}: KeywordInputProps) => {
	const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === "Enter" && e.currentTarget.value.trim()) {
			e.preventDefault();
			const parsed = parseKeywords(e.currentTarget.value);
			const updated = mergeKeywords(keywords, parsed);
			onKeywordsChange(updated);
			e.currentTarget.value = "";
		}
	};

	const handleRemove = (keyword: string) => {
		onKeywordsChange(keywords.filter((k) => k !== keyword));
	};

	return (
		<div className="space-y-2">
			<Input
				placeholder={placeholder}
				onKeyDown={handleKeyDown}
				disabled={disabled}
				className="px-3 text-base"
				onBlur={onBlur}
			/>
			{keywords.length > 0 && (
				<div className="flex flex-wrap gap-2">
					{keywords.map((keyword) => (
						<Badge
							key={keyword}
							variant="secondary"
							className="gap-1 pr-1 text-sm"
						>
							{keyword}
							<button
								type="button"
								onClick={() => handleRemove(keyword)}
								disabled={disabled}
								className="ml-1 rounded-full hover:bg-muted p-0.5"
							>
								<X className="h-3 w-3" />
							</button>
						</Badge>
					))}
				</div>
			)}
		</div>
	);
};
