import { useState, useMemo } from "react";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Checkbox } from "@/shared/components/ui/checkbox";
import { useLocations } from "@/shared/hooks/queries/useLocations";
import { useSetProjectAreas } from "../../hooks/useSetProjectAreas";
import type { IProjectData } from "@/shared/types/project.types";
import type { ISimpleLocationData } from "@/shared/types/org.types";

interface SetAreasModalProps {
	isOpen: boolean;
	onClose: () => void;
	project: IProjectData;
	currentAreas: ISimpleLocationData[];
}

export function SetAreasModal({
	isOpen,
	onClose,
	project,
	currentAreas,
}: SetAreasModalProps) {
	const { dbcaRegions, dbcaDistricts, ibra, imcra, nrm, locationsLoading } =
		useLocations();

	// Combine all areas into a single list
	const allAreas = useMemo(() => {
		return [
			...dbcaRegions.map((area) => ({ ...area, type: "DBCA Region" })),
			...dbcaDistricts.map((area) => ({ ...area, type: "DBCA District" })),
			...ibra.map((area) => ({ ...area, type: "IBRA" })),
			...imcra.map((area) => ({ ...area, type: "IMCRA" })),
			...nrm.map((area) => ({ ...area, type: "NRM" })),
		];
	}, [dbcaRegions, dbcaDistricts, ibra, imcra, nrm]);

	// Initialize selected areas from current areas
	const [selectedAreas, setSelectedAreas] = useState<number[]>(() =>
		currentAreas.map((area) => area.id)
	);

	const [searchTerm, setSearchTerm] = useState("");

	// Filter areas based on search term
	const filteredAreas = useMemo(() => {
		if (!searchTerm.trim()) return allAreas;

		const lowerSearch = searchTerm.toLowerCase();
		return allAreas.filter(
			(area) =>
				area.name.toLowerCase().includes(lowerSearch) ||
				area.area_type.toLowerCase().includes(lowerSearch)
		);
	}, [allAreas, searchTerm]);

	const setAreasMutation = useSetProjectAreas();

	const handleSave = () => {
		setAreasMutation.mutate(
			{
				projectId: project.id,
				areas: selectedAreas,
			},
			{
				onSuccess: () => {
					onClose();
				},
			}
		);
	};

	const handleToggleArea = (areaId: number, checked: boolean) => {
		if (checked) {
			setSelectedAreas([...selectedAreas, areaId]);
		} else {
			setSelectedAreas(selectedAreas.filter((id) => id !== areaId));
		}
	};

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className="sm:max-w-2xl">
				<DialogHeader>
					<DialogTitle>Set Project Areas</DialogTitle>
					<DialogDescription>
						Select the areas where this project will be conducted.
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-4">
					{/* Search Input */}
					<div className="space-y-2">
						<Label htmlFor="area-search">Search Areas</Label>
						<Input
							id="area-search"
							type="text"
							placeholder="Search by name or type..."
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
						/>
					</div>

					{/* Area List */}
					<div className="border rounded-lg max-h-96 overflow-y-auto">
						{locationsLoading && (
							<div className="p-8 text-center text-muted-foreground">
								Loading areas...
							</div>
						)}

						{!locationsLoading && filteredAreas.length === 0 && (
							<div className="p-8 text-center text-muted-foreground">
								No areas found
							</div>
						)}

						{!locationsLoading &&
							filteredAreas.map((area) => (
								<div
									key={area.id}
									className="flex items-center gap-3 p-3 border-b last:border-b-0 hover:bg-muted/50"
								>
									<Checkbox
										id={`area-${area.id}`}
										checked={selectedAreas.includes(area.id)}
										onCheckedChange={(checked) =>
											handleToggleArea(area.id, checked as boolean)
										}
									/>
									<Label
										htmlFor={`area-${area.id}`}
										className="flex-1 cursor-pointer"
									>
										<div className="font-medium">{area.name}</div>
										<div className="text-sm text-muted-foreground">
											{area.type}
										</div>
									</Label>
								</div>
							))}
					</div>

					{/* Selected Count */}
					<div className="text-sm text-muted-foreground">
						{selectedAreas.length} area{selectedAreas.length !== 1 ? "s" : ""}{" "}
						selected
					</div>
				</div>

				<DialogFooter>
					<Button type="button" variant="outline" onClick={onClose}>
						Cancel
					</Button>
					<Button
						onClick={handleSave}
						disabled={setAreasMutation.isPending || selectedAreas.length === 0}
					>
						{setAreasMutation.isPending ? "Saving..." : "Save Areas"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
