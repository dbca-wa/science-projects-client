import { useParams } from "react-router";
import { useDocumentTitle } from "@/shared/hooks/useDocumentTitle";
import { BusinessAreaPageForm } from "@/features/admin/components/business-areas/BusinessAreaPageForm";

export default function BusinessAreaEditPage() {
	const { id } = useParams<{ id: string }>();
	useDocumentTitle("Edit Business Area");

	return <BusinessAreaPageForm businessAreaId={id ? Number(id) : undefined} />;
}
