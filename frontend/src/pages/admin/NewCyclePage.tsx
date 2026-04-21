import { useDocumentTitle } from "@/shared/hooks/useDocumentTitle";
import { NewCycleContent } from "@/features/admin/components/actions/NewCycleContent";
import { DivisionYearSafeguard } from "@/features/admin/components/actions/DivisionYearSafeguard";

export default function NewCyclePage() {
	useDocumentTitle("Open New Cycle");

	return (
		<div className="container mx-auto space-y-6 p-6">
			<DivisionYearSafeguard title="Open New Cycle">
				{({ divisionSlug }) => <NewCycleContent divisionSlug={divisionSlug} />}
			</DivisionYearSafeguard>
		</div>
	);
}
