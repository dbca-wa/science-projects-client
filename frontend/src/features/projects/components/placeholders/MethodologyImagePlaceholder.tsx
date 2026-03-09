import { AlertCircle, Upload } from "lucide-react";
import {
	Alert,
	AlertDescription,
	AlertTitle,
} from "@/shared/components/ui/alert";

interface MethodologyImagePlaceholderProps {
	projectPlanId: number;
}

export function MethodologyImagePlaceholder({
	projectPlanId,
}: MethodologyImagePlaceholderProps) {
	return (
		<div className="space-y-4">
			<Alert
				variant="default"
				className="border-blue-500 bg-blue-50 dark:bg-blue-950/20"
			>
				<AlertCircle className="h-4 w-4 text-blue-600" />
				<AlertTitle className="text-blue-900 dark:text-blue-100">
					Methodology Image Upload - Coming Soon
				</AlertTitle>
				<AlertDescription className="text-blue-800 dark:text-blue-200">
					This feature allows you to upload a methodology diagram image
					(JPEG/PNG, max 3MB). The upload component with drag-and-drop, preview,
					and compression is currently being implemented.
				</AlertDescription>
			</Alert>

			{/* Visual placeholder for the upload area */}
			<div className="rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/50 p-12">
				<div className="flex flex-col items-center justify-center text-center space-y-4">
					<div className="rounded-full bg-blue-100 dark:bg-blue-900/30 p-4">
						<Upload className="h-8 w-8 text-blue-600 dark:text-blue-400" />
					</div>
					<div className="space-y-2">
						<p className="text-sm font-medium text-gray-700 dark:text-gray-300">
							Methodology Image Upload Area
						</p>
						<p className="text-xs text-gray-500 dark:text-gray-400">
							Drag and drop or click to upload (JPEG/PNG, max 3MB)
						</p>
						<p className="text-xs text-blue-600 dark:text-blue-400 font-medium">
							Feature in development - Project Plan ID: {projectPlanId}
						</p>
					</div>
				</div>
			</div>
		</div>
	);
}
