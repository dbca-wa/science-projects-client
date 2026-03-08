import { AlertCircle, MessageSquare, User } from "lucide-react";
import {
	Alert,
	AlertDescription,
	AlertTitle,
} from "@/shared/components/ui/alert";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/shared/components/ui/card";

interface CommentSectionPlaceholderProps {
	documentId: number;
	documentKind: string;
}

export function CommentSectionPlaceholder({
	documentId,
	documentKind,
}: CommentSectionPlaceholderProps) {
	return (
		<div className="space-y-4 mt-8">
			<Alert
				variant="default"
				className="border-blue-500 bg-blue-50 dark:bg-blue-950/20"
			>
				<AlertCircle className="h-4 w-4 text-blue-600" />
				<AlertTitle className="text-blue-900 dark:text-blue-100">
					Document Comments - Coming Soon
				</AlertTitle>
				<AlertDescription className="text-blue-800 dark:text-blue-200">
					This feature allows team members to discuss and comment on document
					content. The comment system with threading, editing, and notifications
					is currently being implemented.
				</AlertDescription>
			</Alert>

			{/* Visual placeholder for comments */}
			<Card className="border-2 border-dashed border-gray-300 dark:border-gray-600">
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<MessageSquare className="h-5 w-5" />
						Comments
					</CardTitle>
					<CardDescription>
						Document: {documentKind} (ID: {documentId}) - Comment system in
						development
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					{/* Example comment placeholder */}
					<div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50 space-y-2">
						<div className="flex items-start gap-3">
							<div className="rounded-full bg-gray-200 dark:bg-gray-700 p-2">
								<User className="h-4 w-4 text-gray-500" />
							</div>
							<div className="flex-1 space-y-1">
								<div className="flex items-center gap-2">
									<span className="text-sm font-medium text-gray-400">
										User Name
									</span>
									<span className="text-xs text-gray-400">• timestamp</span>
								</div>
								<p className="text-sm text-gray-400 italic">
									Comment content will appear here...
								</p>
							</div>
						</div>
					</div>

					{/* Add comment placeholder */}
					<div className="p-4 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/50">
						<p className="text-sm text-gray-500 dark:text-gray-400 text-center">
							Add comment area (coming soon)
						</p>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
