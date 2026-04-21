import { useDocumentTitle } from "@/shared/hooks/useDocumentTitle";
import { BranchList } from "@/features/admin/components/branches/BranchList";

export default function BranchesPage() {
	useDocumentTitle("Branches");

	return (
		<div className="container mx-auto space-y-6 p-6">
			<BranchList />
		</div>
	);
}
