import { useDocumentTitle } from "@/shared/hooks/useDocumentTitle";
import { MyDivisionView } from "@/features/reports/components/division/MyDivisionView";

export default function MyDivisionPage() {
	useDocumentTitle("My Division");

	return (
		<div className="container mx-auto space-y-6 p-6">
			<MyDivisionView />
		</div>
	);
}
