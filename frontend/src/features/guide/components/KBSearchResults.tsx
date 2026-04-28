import { useNavigate } from "react-router";
import { FileText } from "lucide-react";
import { getIconComponent } from "../utils/icon.utils";
import type { KBSearchResult } from "../hooks/useKBSearch";

interface KBSearchResultsProps {
	results: KBSearchResult[];
	query: string;
}

/** Highlight matching text within a string */
const HighlightedText = ({ text, query }: { text: string; query: string }) => {
	if (!query.trim()) return <>{text}</>;

	const regex = new RegExp(
		`(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`,
		"gi"
	);
	const parts = text.split(regex);

	return (
		<>
			{parts.map((part, i) =>
				regex.test(part) ? (
					<mark
						key={i}
						className="rounded bg-yellow-200 px-0.5 dark:bg-yellow-800"
					>
						{part}
					</mark>
				) : (
					<span key={i}>{part}</span>
				)
			)}
		</>
	);
};

export const KBSearchResults = ({ results, query }: KBSearchResultsProps) => {
	const navigate = useNavigate();

	if (results.length === 0) {
		return (
			<div className="py-12 text-center text-muted-foreground">
				<FileText className="mx-auto mb-3 h-10 w-10 opacity-40" />
				<p>No articles found for &ldquo;{query}&rdquo;</p>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			<p className="text-sm text-muted-foreground">
				{results.reduce((sum, r) => sum + r.matchingFields.length, 0)} result
				{results.reduce((sum, r) => sum + r.matchingFields.length, 0) !== 1
					? "s"
					: ""}{" "}
				found
			</p>

			{results.map(({ section, matchingFields }) => {
				const Icon = getIconComponent(section.icon);

				return (
					<div key={section.id} className="space-y-2">
						<div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
							<Icon className="h-4 w-4" />
							<span>{section.title}</span>
						</div>

						<div className="space-y-1 pl-6">
							{matchingFields.map((field) => (
								<button
									key={field.id}
									type="button"
									className="w-full rounded-lg px-3 py-2 text-left transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
									onClick={() => navigate(`/guide/${section.id}`)}
								>
									<p className="text-sm font-medium">
										<HighlightedText
											text={field.title ?? field.field_key}
											query={query}
										/>
									</p>
								</button>
							))}
						</div>
					</div>
				);
			})}
		</div>
	);
};
