interface ChartPreviewProps {
	imageUrl: string | null;
}

/**
 * Scaled mockup of the Service Delivery Structure section in the annual report PDF.
 * Shows the org chart image below the section heading and placeholder intro text.
 */
export function ChartPreview({ imageUrl }: ChartPreviewProps) {
	return (
		<div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 p-4 overflow-hidden">
			{/* Section heading */}
			<h3
				className="text-xs font-bold leading-tight mb-2"
				style={{ color: "#2a6096" }}
			>
				Service Delivery Structure
			</h3>

			{/* Placeholder intro text lines */}
			<div className="space-y-1 mb-3">
				<div className="h-1.5 w-full rounded-full bg-gray-200 dark:bg-gray-700" />
				<div className="h-1.5 w-5/6 rounded-full bg-gray-200 dark:bg-gray-700" />
				<div className="h-1.5 w-2/3 rounded-full bg-gray-200 dark:bg-gray-700" />
			</div>

			{/* Chart image area */}
			<div className="w-full h-[80px] rounded bg-gray-200 dark:bg-gray-700 overflow-hidden">
				{imageUrl ? (
					<img
						src={imageUrl}
						alt="Service delivery org chart"
						className="w-full h-full object-contain"
					/>
				) : (
					<div className="w-full h-full flex items-center justify-center">
						<span className="text-[10px] text-gray-400 dark:text-gray-500">
							No chart uploaded
						</span>
					</div>
				)}
			</div>
		</div>
	);
}
