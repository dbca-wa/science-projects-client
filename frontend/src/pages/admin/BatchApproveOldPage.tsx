import { useDocumentTitle } from "@/shared/hooks/useDocumentTitle";
import { BatchApproveOldContent } from "@/features/admin/components/actions/BatchApproveOldContent";
import { DivisionYearSafeguard } from "@/features/admin/components/actions/DivisionYearSafeguard";

export default function BatchApproveOldPage() {
	useDocumentTitle("Batch Approve Old Reports");

	return (
		<div className="container mx-auto space-y-6 p-6">
			<DivisionYearSafeguard title="Batch Approve Old Reports">
				{({ divisionSlug }) => (
					<BatchApproveOldContent divisionSlug={divisionSlug} />
				)}
			</DivisionYearSafeguard>
		</div>
	);
}
