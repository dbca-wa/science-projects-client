import { useDocumentTitle } from "@/shared/hooks/useDocumentTitle";
import { DivisionList } from "@/features/admin/components/divisions/DivisionList";

export default function DivisionsPage() {
	useDocumentTitle("Divisions");

	return (
		<div className="container mx-auto space-y-6 p-6">
			<DivisionList />
		</div>
	);
}
