import { useState, useMemo } from "react";
import { useProjectAreas } from "@/shared/hooks/queries/useProjectAreas";
import { Input } from "@/shared/components/ui/input";
import { Checkbox } from "@/shared/components/ui/checkbox";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { Search, X } from "lucide-react";
import { Spinner } from "@/shared/components/ui/spinner";

interface AreaListFallbackProps {
	selectedAreas: number[];
	onAreasChange: (areas: number[]) => void;
}

/**
 * AreaListFallback component
 *
 * List-based interface for selecting project areas.
 * Features:
 * - Search/filter functionality
 * - Checkbox list of all areas
 * - Display of selected areas with remove buttons
 * - Syncs with map selection
 */
export const AreaListFallback = ({
	selectedAreas,
	onAreasChange,
}: AreaListFallbackProps) => {
	const [searchTerm, setSearchTerm] = useState("");
	const { data: projectAreas, isLoading } = useProjectAreas();

	// Filter areas based on search term
	const filteredAreas = useMemo(() => {
		if (!projectAreas) return [];
		if (!searchTerm) return projectAreas;

		const term = searchTerm.toLowerCase();
		return projectAreas.filter((area) =>
			area.area_name.toLowerCase().includes(term)
		);
	}, [projectAreas, searchTerm]);

	// Get selected area objects
	const selectedAreaObjects = useMemo(() => {
		if (!projectAreas) return [];
		return projectAreas.filter((area) => selectedAreas.includes(area.id));
	}, [projectAreas, selectedAreas]);

	// Toggle area selection
	const toggleArea = (areaId: number) => {
		if (selectedAreas.includes(areaId)) {
			onAreasChange(selectedAreas.filter((id) => id !== areaId));
		} else {
			onAreasChange([...selectedAreas, areaId]);
		}
	};

	// Remove area from selection
	const removeArea = (areaId: number) => {
		onAreasChange(selectedAreas.filter((id) => id !== areaId));
	};

	if (isLoading) {
		return (
			<div className="w-full py-8 flex items-center justify-center">
				<div className="text-center space-y-4">
					<Spinner className="size-6 mx-auto text-blue-600" />
					<div className="text-sm text-muted-foreground">Loading areas...</div>
				</div>
			</div>
		);
	}

	if (!projectAreas || projectAreas.length === 0) {
		return (
			<div className="w-full py-8 text-center text-muted-foreground">
				No project areas available
			</div>
		);
	}

	return (
		<div className="space-y-4">
			{/* Search input */}
			<div className="relative">
				<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
				<Input
					type="text"
					placeholder="Search areas..."
					value={searchTerm}
					onChange={(e) => setSearchTerm(e.target.value)}
					className="pl-9"
				/>
			</div>

			{/* Selected areas */}
			{selectedAreaObjects.length > 0 && (
				<div className="space-y-2">
					<div className="text-sm font-medium">
						Selected Areas ({selectedAreaObjects.length})
					</div>
					<div className="flex flex-wrap gap-2">
						{selectedAreaObjects.map((area) => (
							<Badge
								key={area.id}
								variant="secondary"
								className="flex items-center gap-1 pr-1"
							>
								<span>{area.area_name}</span>
								<Button
									variant="ghost"
									size="sm"
									className="h-4 w-4 p-0 hover:bg-transparent"
									onClick={() => removeArea(area.id)}
									aria-label={`Remove ${area.area_name}`}
								>
									<X className="h-3 w-3" />
								</Button>
							</Badge>
						))}
					</div>
				</div>
			)}

			{/* Area list */}
			<div className="space-y-2">
				<div className="text-sm font-medium">
					All Areas ({filteredAreas.length})
				</div>
				<div className="max-h-[300px] overflow-y-auto border border-border rounded-md">
					{filteredAreas.length === 0 ? (
						<div className="py-8 text-center text-sm text-muted-foreground">
							No areas match your search
						</div>
					) : (
						<div className="divide-y divide-border">
							{filteredAreas.map((area) => (
								<label
									key={area.id}
									className="flex items-center gap-3 px-4 py-3 hover:bg-muted cursor-pointer transition-colors"
								>
									<Checkbox
										checked={selectedAreas.includes(area.id)}
										onCheckedChange={() => toggleArea(area.id)}
									/>
									<span className="text-sm flex-1">{area.area_name}</span>
								</label>
							))}
						</div>
					)}
				</div>
			</div>
		</div>
	);
};
