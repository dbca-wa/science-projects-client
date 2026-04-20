import { useDocumentTitle } from "@/shared/hooks/useDocumentTitle";
import { ServiceList } from "@/features/admin/components/services/ServiceList";

export default function ServicesPage() {
	useDocumentTitle("Services");

	return (
		<div className="container mx-auto space-y-6 p-6">
			<ServiceList />
		</div>
	);
}
