import { useDocumentTitle } from "@/shared/hooks/useDocumentTitle";
import { ApproversPageContent } from "@/features/admin/components/approvers/ApproversPageContent";

const ApproversPage = () => {
	useDocumentTitle("Divisional Approvers");

	return (
		<div className="container mx-auto space-y-6 p-6">
			<h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
				Divisional Approvers
			</h1>
			<ApproversPageContent />
		</div>
	);
};

export default ApproversPage;
