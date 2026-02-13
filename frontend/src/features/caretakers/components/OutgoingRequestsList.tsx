import { useOutgoingCaretakerRequests } from "../hooks/useOutgoingCaretakerRequests";
import { OutgoingCaretakerRequest } from "./OutgoingCaretakerRequest";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { Alert, AlertDescription } from "@/shared/components/ui/alert";
import { AlertCircle, Info } from "lucide-react";

interface OutgoingRequestsListProps {
	userId: number;
	onRequestChange: () => void;
}

/**
 * OutgoingRequestsList component
 * Displays all pending outgoing caretaker requests for a user
 * (requests where the user is the primary_user)
 *
 * Features:
 * - Fetches outgoing requests using useOutgoingCaretakerRequests hook
 * - Displays loading state with skeleton
 * - Displays error state with alert
 * - Displays empty state when no requests
 * - Renders OutgoingCaretakerRequest cards for each request
 *
 * @param userId - User ID to fetch outgoing requests for
 * @param onRequestChange - Callback when a request is cancelled or approved
 */
export const OutgoingRequestsList = ({
	userId,
	onRequestChange,
}: OutgoingRequestsListProps) => {
	const {
		data: requests,
		isLoading,
		error,
	} = useOutgoingCaretakerRequests(userId);

	// Loading state
	if (isLoading) {
		return <Skeleton className="h-64" />;
	}

	// Error state
	if (error) {
		return (
			<Alert variant="destructive">
				<AlertCircle className="h-4 w-4" />
				<AlertDescription>
					Failed to load outgoing requests. Please try again later.
				</AlertDescription>
			</Alert>
		);
	}

	// Empty state
	if (!requests || requests.length === 0) {
		return (
			<Alert>
				<Info className="h-4 w-4" />
				<AlertDescription>
					You have no pending outgoing caretaker requests.
				</AlertDescription>
			</Alert>
		);
	}

	// Render list of requests
	return (
		<div className="space-y-4">
			{requests.map((request) => (
				<OutgoingCaretakerRequest
					key={request.id}
					request={request}
					onCancel={onRequestChange}
				/>
			))}
		</div>
	);
};
