import { useDocumentTitle } from "@/shared/hooks/useDocumentTitle";
import { PublishedReportsList } from "@/features/reports/components/PublishedReportsList";

function PublishedReportsPage() {
	useDocumentTitle("Published Reports");

	return <PublishedReportsList />;
}

export default PublishedReportsPage;
