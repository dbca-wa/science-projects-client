import { useDocumentTitle } from "@/shared/hooks/useDocumentTitle";
import { BusinessAreaPageForm } from "@/features/admin/components/business-areas/BusinessAreaPageForm";

export default function BusinessAreaAddPage() {
	useDocumentTitle("Add Business Area");

	return <BusinessAreaPageForm />;
}
