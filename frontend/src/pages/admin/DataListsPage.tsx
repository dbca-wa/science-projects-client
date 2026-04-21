import { useDocumentTitle } from "@/shared/hooks/useDocumentTitle";
import { DataListsTabs } from "@/features/admin/components/data-lists/DataListsTabs";

export default function DataListsPage() {
	useDocumentTitle("Data Lists");

	return (
		<div className="container mx-auto space-y-6 p-6">
			<h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
				Data Lists
			</h1>
			<DataListsTabs />
		</div>
	);
}
