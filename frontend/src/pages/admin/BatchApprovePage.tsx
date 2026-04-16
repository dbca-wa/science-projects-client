import { useDocumentTitle } from "@/shared/hooks/useDocumentTitle";
import { BatchApproveContent } from "@/features/admin/components/actions/BatchApproveContent";

export default function BatchApprovePage() {
	useDocumentTitle("Batch Approve Reports");

	return (
		<div className="container mx-auto space-y-6 p-6">
			<BatchApproveContent />
		</div>
	);
}
