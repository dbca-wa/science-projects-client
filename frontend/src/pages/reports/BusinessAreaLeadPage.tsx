import { useDocumentTitle } from "@/shared/hooks/useDocumentTitle";
import { BusinessAreaLeadView } from "@/features/reports/components/business-area/BusinessAreaLeadView";

interface BusinessAreaLeadPageProps {
	selectedTab?: string;
}

/**
 * Page wrapper for the Business Area Lead view.
 * Accepts a selectedTab prop via route-based componentProps for tab navigation.
 */
export default function BusinessAreaLeadPage({
	selectedTab = "appearance",
}: BusinessAreaLeadPageProps) {
	useDocumentTitle("My Business Areas");

	return <BusinessAreaLeadView selectedTab={selectedTab} />;
}
