import { Label } from "@/shared/components/ui/label";

interface AvatarLivePreviewProps {
	previewUrl: string | null;
}

/**
 * AvatarLivePreview Component
 * Shows how the cropped image will appear as a user avatar
 * in search results and next to user information
 */
export const AvatarLivePreview = ({ previewUrl }: AvatarLivePreviewProps) => {
	return (
		<div className="space-y-3">
			<div>
				<Label className="text-sm font-medium text-muted-foreground">
					Avatar Preview:
				</Label>
				<p className="text-xs text-muted-foreground mt-1">
					Your profile image will appear like this when appearing in search
					results, next to your information.
				</p>
			</div>
			<div className="w-[200px] h-[200px] rounded-full overflow-hidden border border-border bg-muted flex-shrink-0">
				{previewUrl ? (
					<img
						src={previewUrl}
						alt="Avatar preview"
						className="w-full h-full object-cover"
					/>
				) : (
					<div className="h-full w-full flex items-center justify-center text-sm text-muted-foreground">
						Preview
					</div>
				)}
			</div>
		</div>
	);
};
