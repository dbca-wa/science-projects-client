import { useDocumentTitle } from "@/shared/hooks/useDocumentTitle";
import { AffiliationList } from "@/features/admin/components/affiliations/AffiliationList";

export default function AffiliationsPage() {
	useDocumentTitle("Affiliations");

	return (
		<div className="container mx-auto space-y-6 p-6">
			<AffiliationList />
		</div>
	);
}
