import { Label } from "@/shared/components/ui/label";

interface ReportMediaLivePreviewProps {
	previewUrl: string | null;
	sectionLabel: string;
	previewType: "chapter" | "banner-full" | "banner-cropped" | "chart";
}

/**
 * ReportMediaLivePreview Component
 *
 * Shows how the cropped image will appear in the annual report PDF.
 * Matches the exact layout from prince_ar_document_styles.css.
 */
export const ReportMediaLivePreview = ({
	previewUrl,
	sectionLabel,
	previewType,
}: ReportMediaLivePreviewProps) => {
	return (
		<div className="space-y-3 w-full">
			<div>
				<Label className="text-sm font-medium text-muted-foreground">
					Annual Report Preview:
				</Label>
				<p className="text-xs text-muted-foreground mt-1">
					{previewType === "chapter" &&
						"How this image will appear as a chapter header."}
					{previewType === "banner-full" &&
						"How this banner will appear on the cover page."}
					{previewType === "banner-cropped" &&
						"How this banner will appear in page headers."}
					{previewType === "chart" &&
						"How this chart will appear in the SDS section."}
				</p>
			</div>

			{previewType === "chapter" && (
				<ChapterPreview previewUrl={previewUrl} sectionLabel={sectionLabel} />
			)}
			{previewType === "banner-full" && (
				<BannerFullPreview previewUrl={previewUrl} />
			)}
			{previewType === "banner-cropped" && (
				<BannerCroppedPreview previewUrl={previewUrl} />
			)}
			{previewType === "chart" && (
				<ChartSectionPreview previewUrl={previewUrl} />
			)}
		</div>
	);
};

/**
 * Chapter header preview — matches .generic_chapter_image_container
 * and .chapter_title_text_container from prince_ar_document_styles.css.
 *
 * Layout: full-width landscape image with a title pill overlaid at
 * bottom-right (80% width, rounded left corners, #396494 border,
 * semi-transparent white background, no right border).
 */
function ChapterPreview({
	previewUrl,
	sectionLabel,
}: {
	previewUrl: string | null;
	sectionLabel: string;
}) {
	return (
		<div className="w-full max-w-[360px] rounded-lg border border-border overflow-hidden">
			{/* Image container — the PDF pushes the image up via top:-15px,
			    cropping ~5% off the top. We simulate by oversizing the image
			    and shifting it up within the clipped container. */}
			<div
				className="relative w-full overflow-hidden"
				style={{ aspectRatio: "210 / 78" }}
			>
				{previewUrl ? (
					<img
						src={previewUrl}
						alt={`${sectionLabel} chapter preview`}
						className="absolute w-full"
						style={{
							top: "-6%",
							left: 0,
							height: "105%",
							objectFit: "cover",
							objectPosition: "center center",
						}}
					/>
				) : (
					<div className="absolute inset-0 bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
						<span className="text-xs text-muted-foreground">Preview</span>
					</div>
				)}

				{/* Title pill — matches .chapter_title_text_container
				    PDF: 80% width, 70px/310px ≈ 22.5% height, bottom: 30px/310px ≈ 9.7% */}
				<div
					className="absolute flex items-center"
					style={{
						width: "80%",
						height: "22.5%",
						bottom: "9.7%",
						right: 0,
						borderLeft: "2px solid #396494",
						borderTop: "2px solid #396494",
						borderBottom: "2px solid #396494",
						borderRight: "none",
						borderRadius: "14px 0 0 14px",
						backgroundColor: "rgba(255, 255, 255, 0.6)",
						paddingLeft: "10px",
					}}
				>
					<span
						className="text-[10px] font-bold leading-tight truncate"
						style={{ color: "#000" }}
					>
						{sectionLabel}
					</span>
				</div>
			</div>

			{/* Mock page content */}
			<div className="p-3 space-y-1.5 bg-white dark:bg-gray-900">
				<div className="h-1.5 w-full rounded-full bg-gray-100 dark:bg-gray-800" />
				<div className="h-1.5 w-5/6 rounded-full bg-gray-100 dark:bg-gray-800" />
				<div className="h-1.5 w-3/4 rounded-full bg-gray-100 dark:bg-gray-800" />
			</div>
		</div>
	);
}

/**
 * Cover page banner preview — matches .cover_logo_container and .cover_logo
 * from prince_ar_document_styles.css.
 *
 * Layout: centred banner at the bottom of a mock cover page with
 * department text and year above it. Banner is 150mm wide in PDF
 * (roughly 71% of A4 width).
 */
function BannerFullPreview({ previewUrl }: { previewUrl: string | null }) {
	return (
		<div className="w-full max-w-[360px] rounded-lg border border-border overflow-hidden bg-white dark:bg-gray-900">
			{/* Mock cover page content */}
			<div className="flex flex-col items-center px-4 pt-6 pb-3">
				<p className="text-[9px] font-bold text-center">Department of</p>
				<p className="text-[13px] font-black text-center leading-tight">
					Biodiversity, Conservation and Attractions
				</p>
				<p className="text-[8px] text-center mt-2 text-gray-600 dark:text-gray-400">
					Biodiversity and Conservation Science
					<br />
					Annual Report
				</p>
				<p className="text-[9px] font-bold text-center mt-1.5">2024-2025</p>
			</div>

			{/* Banner at bottom — matches .cover_logo (width: 150mm ≈ 71% of A4) */}
			<div className="flex justify-center px-4 pb-4">
				<div className="w-[71%] overflow-hidden">
					{previewUrl ? (
						<img
							src={previewUrl}
							alt="Cover page banner preview"
							className="w-full h-auto object-contain"
						/>
					) : (
						<div className="w-full h-[30px] bg-gray-200 dark:bg-gray-700 rounded flex items-center justify-center">
							<span className="text-[9px] text-muted-foreground">Banner</span>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}

/**
 * Page header banner preview — matches .header-logo-left/right
 * from the template inline styles.
 *
 * Layout: banner (200px wide in PDF) in the top-left of a mock page
 * with "Annual Report 2024-2025" text on the right side, separated
 * by a thin border line below.
 */
function BannerCroppedPreview({ previewUrl }: { previewUrl: string | null }) {
	return (
		<div className="w-full max-w-[360px] rounded-lg border border-border overflow-hidden bg-white dark:bg-gray-900">
			{/* Mock page header — matches @page main_pages:right @top-left */}
			<div
				className="flex items-center justify-between px-3 py-2"
				style={{ borderBottom: "0.5px solid #666" }}
			>
				{/* Cropped banner — matches .header-logo-left (200px wide) */}
				<div className="w-[45%] overflow-hidden">
					{previewUrl ? (
						<img
							src={previewUrl}
							alt="Page header banner preview"
							className="w-full h-auto object-contain"
						/>
					) : (
						<div className="w-full h-[18px] bg-gray-200 dark:bg-gray-700 rounded flex items-center justify-center">
							<span className="text-[8px] text-muted-foreground">Banner</span>
						</div>
					)}
				</div>

				{/* Year text — matches @top-left content */}
				<span className="text-[9px] font-bold text-gray-700 dark:text-gray-300">
					Annual Report 2024-2025
				</span>
			</div>

			{/* Mock page body */}
			<div className="p-3 space-y-1.5">
				<div className="h-1.5 w-full rounded-full bg-gray-100 dark:bg-gray-800" />
				<div className="h-1.5 w-5/6 rounded-full bg-gray-100 dark:bg-gray-800" />
				<div className="h-1.5 w-3/4 rounded-full bg-gray-100 dark:bg-gray-800" />
				<div className="h-1.5 w-full rounded-full bg-gray-100 dark:bg-gray-800" />
			</div>
		</div>
	);
}

/**
 * SDS chart preview — matches .sds_chart_image_container
 * from prince_ar_document_styles.css.
 */
function ChartSectionPreview({ previewUrl }: { previewUrl: string | null }) {
	return (
		<div className="w-full max-w-[360px] rounded-lg border border-border overflow-hidden bg-white dark:bg-gray-900">
			{/* Section heading */}
			<div className="px-3 pt-3">
				<p className="text-[10px] font-bold" style={{ color: "#396494" }}>
					Service Delivery Structure
				</p>
			</div>

			{/* Mock intro text */}
			<div className="px-3 pt-2 space-y-1">
				<div className="h-1.5 w-full rounded-full bg-gray-100 dark:bg-gray-800" />
				<div className="h-1.5 w-4/5 rounded-full bg-gray-100 dark:bg-gray-800" />
			</div>

			{/* Chart image */}
			<div className="p-3">
				{previewUrl ? (
					<img
						src={previewUrl}
						alt="SDS chart preview"
						className="w-full h-auto object-contain rounded"
					/>
				) : (
					<div className="w-full h-[60px] bg-gray-200 dark:bg-gray-700 rounded flex items-center justify-center">
						<span className="text-[9px] text-muted-foreground">Chart</span>
					</div>
				)}
			</div>
		</div>
	);
}
