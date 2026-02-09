import { Alert, AlertDescription } from "@/shared/components/ui/alert";
import { Button } from "@/shared/components/ui/button";
import { AlertCircle } from "lucide-react";

interface ErrorStateProps {
	message: string;
	onRetry?: () => void;
	retryButtonText?: string;
}

/**
 * ErrorState component
 * Displays when an error occurs loading data
 */
export const ErrorState = ({
	message,
	onRetry,
	retryButtonText = "Retry",
}: ErrorStateProps) => {
	return (
		<div className="container mx-auto px-4 py-8">
			<Alert variant="destructive">
				<AlertCircle className="size-4" />
				<AlertDescription>{message}</AlertDescription>
			</Alert>
			{onRetry && (
				<Button onClick={onRetry} className="mt-4">
					{retryButtonText}
				</Button>
			)}
		</div>
	);
};
