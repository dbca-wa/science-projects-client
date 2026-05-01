import { Loader2, AlertTriangle } from "lucide-react";
import { useDocumentTitle } from "@/shared/hooks/useDocumentTitle";
import { useMyBusinessAreas } from "@/shared/hooks/queries/useMyBusinessAreas";
import { BusinessAreaEditForm } from "@/features/reports/components/business-area/BusinessAreaEditForm";
import { Alert, AlertDescription } from "@/shared/components/ui/alert";

/**
 * Page wrapper for editing a business area's name, image, and introduction.
 * Derives the BA ID from the current user's business areas (one per user).
 */
export default function BusinessAreaEditPage() {
	useDocumentTitle("Edit Business Area");

	const { data: myBusinessAreas, isLoading } = useMyBusinessAreas();

	// For superusers with multiple BAs, show a selector; for BA leads, use their single BA
	const businessArea = myBusinessAreas?.[0];

	if (isLoading) {
		return (
			<div className="container mx-auto flex justify-center p-12">
				<Loader2 className="size-8 animate-spin text-muted-foreground" />
			</div>
		);
	}

	if (!businessArea) {
		return (
			<div className="container mx-auto max-w-3xl p-6">
				<Alert variant="destructive">
					<AlertTriangle className="size-4" />
					<AlertDescription>
						No business area found. You must be assigned as a business area
						leader to edit.
					</AlertDescription>
				</Alert>
			</div>
		);
	}

	return <BusinessAreaEditForm businessAreaId={businessArea.id!} />;
}
