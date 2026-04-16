import { useMyBusinessAreas } from "../hooks/useBusinessAreaLead";
import { getImageUrl } from "@/shared/utils/image.utils";
import { Alert, AlertDescription } from "@/shared/components/ui/alert";
import { Loader2, AlertCircle, Briefcase } from "lucide-react";
import type { IBusinessArea } from "@/shared/types/org.types";

/**
 * Renders a single business area card
 */
function BusinessAreaCard({ area }: { area: IBusinessArea }) {
	const imageUrl = area.image
		? typeof area.image === "string"
			? getImageUrl(area.image)
			: getImageUrl(area.image)
		: null;

	return (
		<div className="rounded-lg border bg-card text-card-foreground shadow-sm overflow-hidden">
			{imageUrl && (
				<div className="h-40 w-full overflow-hidden bg-muted">
					<img
						src={imageUrl}
						alt={area.name}
						className="h-full w-full object-cover"
					/>
				</div>
			)}
			<div className="p-4 space-y-2">
				<h3 className="text-lg font-semibold">{area.name}</h3>
				{area.project_count !== undefined && (
					<p className="text-sm text-muted-foreground">
						{area.project_count} project{area.project_count !== 1 ? "s" : ""}
					</p>
				)}
			</div>
		</div>
	);
}

/**
 * Displays business areas the current user leads in a responsive grid
 */
export function BusinessAreaLeadView() {
	const { data: businessAreas, isLoading, error } = useMyBusinessAreas();

	if (isLoading) {
		return (
			<div className="flex items-center justify-center min-h-[300px]">
				<div className="text-center space-y-4">
					<Loader2 className="size-12 mx-auto animate-spin text-blue-600" />
					<p className="text-muted-foreground">Loading business areas...</p>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<Alert variant="destructive">
				<AlertCircle className="size-4" />
				<AlertDescription>
					Failed to load business areas. Please try again later.
				</AlertDescription>
			</Alert>
		);
	}

	if (!businessAreas || businessAreas.length === 0) {
		return (
			<div className="flex flex-col items-center justify-center min-h-[300px] text-center">
				<Briefcase className="size-12 text-muted-foreground mb-4" />
				<h2 className="text-xl font-semibold mb-2">No Business Areas</h2>
				<p className="text-muted-foreground">
					You are not currently leading any business areas.
				</p>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-2xl font-bold">My Business Areas</h1>
				<p className="text-muted-foreground mt-1">
					Business areas you lead and their current status
				</p>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
				{businessAreas.map((area) => (
					<BusinessAreaCard key={area.id} area={area} />
				))}
			</div>
		</div>
	);
}
