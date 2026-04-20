import { useDocumentTitle } from "@/shared/hooks/useDocumentTitle";
import { LocationList } from "@/features/admin/components/locations/LocationList";

export default function LocationsPage() {
	useDocumentTitle("Locations");

	return (
		<div className="container mx-auto space-y-6 p-6">
			<LocationList />
		</div>
	);
}
