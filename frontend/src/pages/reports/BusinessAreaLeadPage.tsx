import { useDocumentTitle } from "@/shared/hooks/useDocumentTitle";
import { BusinessAreaLeadView } from "@/features/reports/components/BusinessAreaLeadView";

/**
 * Page wrapper for the Business Area Lead view
 */
export default function BusinessAreaLeadPage() {
	useDocumentTitle("My Business Areas");

	return <BusinessAreaLeadView />;
}
