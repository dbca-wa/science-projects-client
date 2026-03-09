import { useState } from "react";
import { Label } from "@/shared/components/ui/label";

interface ProjectCardLivePreviewProps {
	previewUrl: string | null;
}

/**
 * ProjectCardLivePreview Component
 * Shows how the cropped image will appear on a project card
 * with gradient overlay, project tag, and hover status badge
 */
export const ProjectCardLivePreview = ({
	previewUrl,
}: ProjectCardLivePreviewProps) => {
	const [isHovered, setIsHovered] = useState(false);

	return (
		<div className="space-y-3">
			<div>
				<Label className="text-sm font-medium text-muted-foreground">
					Project Card Preview:
				</Label>
				<p className="text-xs text-muted-foreground mt-1">
					Your project will appear like this when appearing in search results.
					Note, the display will be dynamic based on the viewer's browser width.
				</p>
			</div>
			<div
				className="relative w-[225px] h-[162px] rounded-3xl overflow-hidden border border-gray-200 bg-muted cursor-default shadow-sm"
				onMouseEnter={() => setIsHovered(true)}
				onMouseLeave={() => setIsHovered(false)}
			>
				{previewUrl ? (
					<>
						{/* Project Tag (top-left) */}
						<div className="absolute left-2 top-2 z-10">
							<span className="inline-flex items-center justify-center rounded-md px-2 py-1 text-xs font-semibold text-white bg-[#2A6096]">
								SP-1971-123
							</span>
						</div>

						{/* Status Badge (top-right, shows on hover) */}
						{isHovered && (
							<div className="absolute right-0 top-2 z-10 animate-in slide-in-from-right duration-300">
								<span
									className="inline-flex items-center justify-center rounded-l-2xl px-3 py-1 text-xs font-normal text-white"
									style={{ backgroundColor: "#22C55E" }}
								>
									Active
								</span>
							</div>
						)}

						{/* Image */}
						<img
							src={previewUrl}
							alt="Project card preview"
							className="h-full w-full object-cover"
						/>

						{/* Gradient overlay */}
						<div className="absolute bottom-0 left-0 h-1/2 w-full bg-gradient-to-t from-black/75 to-transparent" />

						{/* Sample project title */}
						<div className="absolute bottom-0 left-0 z-10 p-3">
							<h3 className="text-sm font-semibold text-white line-clamp-2">
								Sample Project Title
							</h3>
						</div>
					</>
				) : (
					<div className="h-full w-full flex items-center justify-center text-sm text-muted-foreground">
						Preview
					</div>
				)}
			</div>
		</div>
	);
};
