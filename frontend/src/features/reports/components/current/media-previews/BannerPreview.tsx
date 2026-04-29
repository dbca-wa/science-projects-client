import { getFinancialYearLabel } from "@/shared/utils/date.utils";

interface BannerPreviewProps {
	imageUrl: string | null;
	variant: "full" | "cropped";
	reportYear: number;
}

/**
 * Scaled mockup of the DBCA banner position in the annual report PDF.
 *
 * "full" variant: banner at the bottom of the cover page with report title and FY text.
 * "cropped" variant: banner in the page header alongside the FY text.
 */
export function BannerPreview({
	imageUrl,
	variant,
	reportYear,
}: BannerPreviewProps) {
	const fyString = getFinancialYearLabel(reportYear);

	if (variant === "full") {
		return (
			<div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 p-4 overflow-hidden">
				{/* Mock cover page */}
				<div className="flex flex-col items-center">
					{/* Report title area */}
					<div className="text-center mb-3">
						<p
							className="text-xs font-bold leading-tight"
							style={{ color: "#2a6096" }}
						>
							BCS Annual Report
						</p>
						<p className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">
							{fyString}
						</p>
					</div>

					{/* Banner image at bottom of cover */}
					<div className="w-full h-[40px] rounded bg-gray-200 dark:bg-gray-700 overflow-hidden">
						{imageUrl ? (
							<img
								src={imageUrl}
								alt="DBCA banner — cover page"
								className="w-full h-full object-cover"
							/>
						) : (
							<div className="w-full h-full flex items-center justify-center">
								<span className="text-[10px] text-gray-400 dark:text-gray-500">
									No banner
								</span>
							</div>
						)}
					</div>
				</div>
			</div>
		);
	}

	/* "cropped" variant — page header with FY text alongside */
	return (
		<div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 p-4 overflow-hidden">
			{/* Mock page header */}
			<div className="flex items-center gap-3">
				{/* Cropped banner image */}
				<div className="flex-1 h-[32px] rounded bg-gray-200 dark:bg-gray-700 overflow-hidden">
					{imageUrl ? (
						<img
							src={imageUrl}
							alt="DBCA banner — page header"
							className="w-full h-full object-cover"
						/>
					) : (
						<div className="w-full h-full flex items-center justify-center">
							<span className="text-[10px] text-gray-400 dark:text-gray-500">
								No banner
							</span>
						</div>
					)}
				</div>

				{/* FY text alongside */}
				<p
					className="text-[10px] font-semibold whitespace-nowrap flex-shrink-0"
					style={{ color: "#2a6096" }}
				>
					{fyString}
				</p>
			</div>

			{/* Placeholder body lines to mimic page content */}
			<div className="mt-3 space-y-1.5">
				<div className="h-1.5 w-full rounded-full bg-gray-200 dark:bg-gray-700" />
				<div className="h-1.5 w-3/4 rounded-full bg-gray-200 dark:bg-gray-700" />
			</div>
		</div>
	);
}
