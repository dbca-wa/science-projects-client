import { Label } from "@/shared/components/ui/label";
import { ProjectCardLivePreview } from "./ProjectCardLivePreview.tsx";
import { AnnualReportLivePreview } from "./AnnualReportLivePreview.tsx";
import { AvatarLivePreview } from "./AvatarLivePreview.tsx";
import { PublicProfileLivePreview } from "./PublicProfileLivePreview.tsx";
import { ReportMediaLivePreview } from "./ReportMediaLivePreview.tsx";

interface LivePreviewsProps {
	variant: "avatar" | "project" | "banner" | "report" | "default";
	previewUrls: {
		avatar: string | null;
		profile: string | null;
		projectCard: string | null;
	};
	completedCrop: boolean;
	/** Section label for report media previews (e.g. "Service Delivery Structure") */
	reportSectionLabel?: string;
	/** Preview layout type for report media */
	reportPreviewType?: "chapter" | "banner-full" | "banner-cropped" | "chart";
}

/**
 * LivePreviews Component
 * Container for all live preview variants
 * Shows appropriate previews based on image variant
 */
export const LivePreviews = ({
	variant,
	previewUrls,
	completedCrop,
	reportSectionLabel,
	reportPreviewType,
}: LivePreviewsProps) => {
	if (!completedCrop) {
		return null;
	}

	return (
		<div>
			<Label className="text-base font-semibold mb-4 block">
				Live Previews
			</Label>

			{/* Avatar variant previews */}
			{variant === "avatar" && (
				<div className="space-y-6 flex flex-col items-start">
					<AvatarLivePreview previewUrl={previewUrls.avatar} />
					<PublicProfileLivePreview previewUrl={previewUrls.profile} />
				</div>
			)}

			{/* Project variant preview */}
			{variant === "project" && (
				<div className="space-y-6 flex flex-col items-start">
					<ProjectCardLivePreview previewUrl={previewUrls.projectCard} />
					<AnnualReportLivePreview previewUrl={previewUrls.profile} />
				</div>
			)}

			{/* Report media variant preview */}
			{variant === "report" && (
				<div className="space-y-6 flex flex-col items-start">
					<ReportMediaLivePreview
						previewUrl={previewUrls.projectCard}
						sectionLabel={reportSectionLabel ?? "Chapter"}
						previewType={reportPreviewType ?? "chapter"}
					/>
				</div>
			)}

			{/* Banner variant preview */}
			{variant === "banner" && (
				<div className="space-y-2">
					<Label className="text-sm text-muted-foreground">
						Banner Preview:
					</Label>
					<div className="w-full max-w-[250px] mx-auto">
						<div className="relative h-[140px] w-full rounded-lg overflow-hidden border border-border bg-muted">
							{previewUrls.projectCard ? (
								<img
									src={previewUrls.projectCard}
									alt="Banner preview"
									className="h-full w-full object-cover"
								/>
							) : (
								<div className="h-full w-full flex items-center justify-center text-sm text-muted-foreground">
									Preview
								</div>
							)}
						</div>
					</div>
				</div>
			)}

			{/* Default variant preview */}
			{variant === "default" && (
				<div className="space-y-2">
					<Label className="text-sm text-muted-foreground">Preview:</Label>
					<div className="w-[200px] h-[200px] mx-auto rounded-lg overflow-hidden border border-border">
						{previewUrls.projectCard ? (
							<img
								src={previewUrls.projectCard}
								alt="Image preview"
								className="h-full w-full object-cover"
							/>
						) : (
							<div className="h-full w-full bg-muted flex items-center justify-center text-sm text-muted-foreground">
								Preview
							</div>
						)}
					</div>
				</div>
			)}
		</div>
	);
};
