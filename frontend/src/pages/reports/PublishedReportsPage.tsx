import { useDocumentTitle } from "@/shared/hooks/useDocumentTitle";
import { PublishedReportsList } from "@/features/reports/components/PublishedReportsList";

interface PublishedReportsPageProps {
	selectedTab?: "official" | "drafts" | "legacy";
}

const PublishedReportsPage = ({
	selectedTab = "official",
}: PublishedReportsPageProps) => {
	useDocumentTitle("Published Reports");

	return <PublishedReportsList selectedTab={selectedTab} />;
};

export default PublishedReportsPage;
