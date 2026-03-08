import { type ReactNode } from "react";
import { cn } from "@/shared/lib/utils";

interface WizardLayoutProps {
	formPanel: ReactNode;
	previewPanel: ReactNode;
	showPreview: boolean;
	onTogglePreview: () => void;
}

/**
 * WizardLayout - Responsive layout manager for form and preview panels
 *
 * Layout Modes:
 * - Ultra-wide (≥1920px): Side-by-side 50/50 split
 * - Standard (<1920px): Toggle between form and preview
 *
 * Features:
 * - CSS Grid for layout
 * - Tailwind breakpoint: 3xl:grid-cols-2 (1920px)
 * - Smooth transitions between layouts
 */
export function WizardLayout({
	formPanel,
	previewPanel,
	showPreview,
}: WizardLayoutProps) {
	return (
		<div className="h-full flex flex-col">
			{/* Main content area */}
			<div className="flex-1 overflow-hidden">
				{/* Ultra-wide: Side-by-side layout */}
				<div className="hidden 3xl:grid 3xl:grid-cols-2 3xl:gap-8 h-full">
					{/* Form panel */}
					<div className="overflow-y-auto pr-4">
						<div className="max-w-3xl">{formPanel}</div>
					</div>

					{/* Preview panel */}
					<div className="overflow-y-auto pl-4 border-l">
						<div className="sticky top-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 py-2 mb-4 border-b z-10">
							<h3 className="text-lg font-semibold">Live Preview</h3>
							<p className="text-sm text-muted-foreground">
								See how your project will appear in the overview tab
							</p>
						</div>
						{previewPanel}
					</div>
				</div>

				{/* Standard: Toggle between form and preview */}
				<div className="3xl:hidden h-full overflow-y-auto">
					<div
						className={cn(
							"transition-opacity duration-300",
							showPreview ? "hidden" : "block"
						)}
					>
						<div className="max-w-3xl mx-auto">{formPanel}</div>
					</div>

					<div
						className={cn(
							"transition-opacity duration-300",
							showPreview ? "block" : "hidden"
						)}
					>
						<div className="max-w-4xl mx-auto">
							<div className="mb-6">
								<h3 className="text-xl font-semibold">Live Preview</h3>
								<p className="text-sm text-muted-foreground">
									See how your project will appear in the overview tab
								</p>
							</div>
							{previewPanel}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
