import { useDocumentTitle } from "@/shared/hooks/useDocumentTitle";
import { NewCycleContent } from "@/features/admin/components/actions/NewCycleContent";

export default function NewCyclePage() {
	useDocumentTitle("Open New Cycle");

	return (
		<div className="container mx-auto space-y-6 p-6">
			<NewCycleContent />
		</div>
	);
}
