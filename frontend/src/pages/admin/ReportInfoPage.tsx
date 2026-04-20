import { useDocumentTitle } from "@/shared/hooks/useDocumentTitle";
import { ReportInfoList } from "@/features/admin/components/report-info/ReportInfoList";

export default function ReportInfoPage() {
	useDocumentTitle("Report Info");

	return (
		<div className="container mx-auto space-y-6 p-6">
			<ReportInfoList />
		</div>
	);
}
