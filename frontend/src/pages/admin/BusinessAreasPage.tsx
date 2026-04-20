import { useDocumentTitle } from "@/shared/hooks/useDocumentTitle";
import { BusinessAreaList } from "@/features/admin/components/business-areas/BusinessAreaList";

export default function BusinessAreasPage() {
	useDocumentTitle("Business Areas");

	return (
		<div className="container mx-auto space-y-6 p-6">
			<BusinessAreaList />
		</div>
	);
}
