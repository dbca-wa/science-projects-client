interface ChapterImagePreviewProps {
	imageUrl: string | null;
	chapterTitle: string;
	isPlaceholder: boolean;
}

/**
 * Scaled mockup of the annual report chapter header layout.
 * Shows the chapter image on the left with the title text on the right,
 * matching the proportions from the annual_report.html template.
 */
export function ChapterImagePreview({
	imageUrl,
	chapterTitle,
	isPlaceholder,
}: ChapterImagePreviewProps) {
	return (
		<div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 p-4 overflow-hidden">
			{/* Mock page area */}
			<div className="flex gap-3">
				{/* Image on the left */}
				<div className="relative flex-shrink-0 w-[120px] h-[80px] rounded bg-gray-200 dark:bg-gray-700 overflow-hidden">
					{imageUrl ? (
						<>
							<img
								src={imageUrl}
								alt={`${chapterTitle} chapter image`}
								className={`w-full h-full object-cover${isPlaceholder ? " opacity-50" : ""}`}
							/>
							{isPlaceholder && (
								<div className="absolute inset-0 border-2 border-dashed border-gray-400 dark:border-gray-500 rounded" />
							)}
						</>
					) : (
						<div className="w-full h-full flex items-center justify-center">
							<span className="text-[10px] text-gray-400 dark:text-gray-500">
								No image
							</span>
						</div>
					)}
				</div>

				{/* Chapter title on the right */}
				<div className="flex flex-col justify-center min-w-0">
					<h3
						className="text-sm font-bold leading-tight truncate"
						style={{ color: "#2a6096" }}
					>
						{chapterTitle}
					</h3>
					{/* Placeholder text lines to mimic page content */}
					<div className="mt-2 space-y-1">
						<div className="h-1.5 w-24 rounded-full bg-gray-200 dark:bg-gray-700" />
						<div className="h-1.5 w-20 rounded-full bg-gray-200 dark:bg-gray-700" />
					</div>
				</div>
			</div>
		</div>
	);
}
