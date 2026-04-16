import { useDocumentTitle } from "@/shared/hooks/useDocumentTitle";
import { BatchApproveOldContent } from "@/features/admin/components/actions/BatchApproveOldContent";

export default function BatchApproveOldPage() {
	useDocumentTitle("Batch Approve Old Reports");

	return (
		<div className="container mx-auto space-y-6 p-6">
			<BatchApproveOldContent />
		</div>
	);
}
