import { useDocumentTitle } from "@/shared/hooks/useDocumentTitle";
import { AddressList } from "@/features/admin/components/addresses/AddressList";

export default function AddressesPage() {
	useDocumentTitle("Addresses");

	return (
		<div className="container mx-auto space-y-6 p-6">
			<AddressList />
		</div>
	);
}
