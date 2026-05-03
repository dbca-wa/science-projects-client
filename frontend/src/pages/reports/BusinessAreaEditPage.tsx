import { useSearchParams } from "react-router";
import { Loader2, AlertTriangle } from "lucide-react";
import { useDocumentTitle } from "@/shared/hooks/useDocumentTitle";
import { useMyBusinessAreas } from "@/shared/hooks/queries/useMyBusinessAreas";
import { useBusinessAreas } from "@/shared/hooks/queries/useBusinessAreas";
import { useAuthStore } from "@/app/stores/store-context";
import { BusinessAreaEditForm } from "@/features/reports/components/business-area/BusinessAreaEditForm";
import { Alert, AlertDescription } from "@/shared/components/ui/alert";

/**
 * Page wrapper for editing a business area's name, image, and introduction.
 * Reads the BA ID from the `?id=` query param. Falls back to the user's first BA.
 */
export default function BusinessAreaEditPage() {
	useDocumentTitle("Edit Business Area");
	const [searchParams] = useSearchParams();
	const authStore = useAuthStore();

	const { data: myBusinessAreas, isLoading: myLoading } = useMyBusinessAreas();
	const { data: allBusinessAreas, isLoading: allLoading } = useBusinessAreas();

	const isLoading = myLoading || (authStore.isSuperuser && allLoading);
	const businessAreas = authStore.isSuperuser
		? (allBusinessAreas ?? myBusinessAreas ?? [])
		: (myBusinessAreas ?? []);

	// Get BA ID from query param, fall back to first BA
	const requestedId = searchParams.get("id");
	const businessArea = requestedId
		? (businessAreas.find((ba) => ba.id === Number(requestedId)) ??
			businessAreas[0])
		: businessAreas[0];

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
