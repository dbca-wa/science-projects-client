import { Label } from "@/shared/components/ui/label";

interface AnnualReportLivePreviewProps {
	previewUrl: string | null;
}

/**
 * AnnualReportLivePreview Component
 * Shows how the cropped image will appear in the annual report PDF
 * Matches exact styling from prince_ar_document_styles.css
 */
export const AnnualReportLivePreview = ({
	previewUrl,
}: AnnualReportLivePreviewProps) => {
	return (
		<div className="space-y-3">
			<div>
				<Label className="text-sm font-medium text-muted-foreground">
					Annual Report Preview:
				</Label>
				<p className="text-xs text-muted-foreground mt-1">
					Your project image will appear like this on the annual report.
				</p>
			</div>
			<div className="w-fit">
				{/* Top section with image and data side by side */}
				<div className="flex">
					{/* Image on left - 180×130px */}
					<div className="flex-shrink-0 w-[180px] h-[130px] rounded-lg overflow-hidden bg-muted">
						{previewUrl ? (
							<img
								src={previewUrl}
								alt="Annual report preview"
								className="w-full h-full object-cover"
							/>
						) : (
							<div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">
								Preview
							</div>
						)}
					</div>
					{/* Data on right - matching pr_data_rhs */}
					<div
						className="flex flex-col justify-start"
						style={{ paddingLeft: "18px" }}
					>
						{/* Title - matching pr_title_container (16px, #2a6096, bold) */}
						<h2
							className="text-base font-bold leading-tight whitespace-nowrap"
							style={{ color: "#2a6096", margin: 0, padding: 0 }}
						>
							Sample Project Title
						</h2>
						{/* Project tag - matching project_tag_container (12px, 10px margin-top, black) */}
						<p
							className="text-xs whitespace-nowrap"
							style={{
								color: "#000000",
								margin: 0,
								padding: 0,
								marginTop: "10px",
							}}
						>
							SP-1971-123
						</p>
						{/* Members - matching pr_member_container (12px, 10px margin-top, black) */}
						<p
							className="text-xs whitespace-nowrap"
							style={{
								color: "#000000",
								margin: 0,
								padding: 0,
								marginTop: "10px",
							}}
						>
							J Smith, A Jones
						</p>
					</div>
				</div>
				{/* Progress section - matching pr_subsection_content_container */}
				<div
					style={{
						paddingTop: "7.5px",
						paddingBottom: "7.5px",
						marginTop: "7.5px",
					}}
				>
					<h3
						className="text-xs font-bold"
						style={{
							color: "#000000",
							margin: 0,
							padding: 0,
							marginBottom: "5px",
						}}
					>
						Progress
					</h3>
					<p
						className="text-xs text-justify"
						style={{
							color: "#000000",
							margin: 0,
							padding: 0,
							lineHeight: "1.15em",
						}}
					>
						Sample progress report text showing how the project content will
						appear in the annual report PDF document with proper text
						justification and spacing.
					</p>
				</div>
			</div>
		</div>
	);
};
