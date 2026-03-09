import { Label } from "@/shared/components/ui/label";

interface PublicProfileLivePreviewProps {
	previewUrl: string | null;
}

/**
 * PublicProfileLivePreview Component
 * Shows how the cropped image will appear on the user's public profile page
 */
export const PublicProfileLivePreview = ({
	previewUrl,
}: PublicProfileLivePreviewProps) => {
	return (
		<div className="space-y-3">
			<div>
				<Label className="text-sm font-medium text-muted-foreground">
					Public Profile Preview:
				</Label>
				<p className="text-xs text-muted-foreground mt-1">
					Your profile image will appear like this on your public profile.
				</p>
			</div>
			<div className="w-[200px] h-[200px] rounded-lg overflow-hidden border border-border flex-shrink-0">
				{previewUrl ? (
					<img
						src={previewUrl}
						alt="Public profile preview"
						className="w-full h-full object-cover"
					/>
				) : (
					<div className="h-full w-full bg-muted flex items-center justify-center text-sm text-muted-foreground">
						Preview
					</div>
				)}
			</div>
		</div>
	);
};
