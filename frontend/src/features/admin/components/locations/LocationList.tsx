import { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { CrudListLayout } from "../shared/CrudListLayout";
import { DeleteConfirmDialog } from "../shared/DeleteConfirmDialog";
import { LocationForm } from "./LocationForm";
import { useLocations, useDeleteLocation } from "../../hooks/useLocations";
import { filterByName, sortAlphabetically } from "../../utils/crud.utils";
import type { ISimpleLocationData } from "../../types/admin.types";

const columns = [
	{ header: "Name", accessor: "name" },
	{ header: "Change", accessor: "actions", className: "text-right" },
];

export function LocationList() {
	const { data: locations = [], isLoading, error } = useLocations();
	const deleteMutation = useDeleteLocation();

	const [searchTerm, setSearchTerm] = useState("");
	const [formOpen, setFormOpen] = useState(false);
	const [editingLocation, setEditingLocation] = useState<
		ISimpleLocationData | undefined
	>();
	const [deleteTarget, setDeleteTarget] = useState<ISimpleLocationData | null>(
		null
	);

	const filtered = sortAlphabetically(
		filterByName(locations, searchTerm, (l) => l.name),
		(l) => l.name
	);

	const handleAdd = () => {
		setEditingLocation(undefined);
		setFormOpen(true);
	};

	const handleEdit = (location: ISimpleLocationData) => {
		setEditingLocation(location);
		setFormOpen(true);
	};

	const handleDeleteConfirm = () => {
		if (deleteTarget) {
			deleteMutation.mutate(deleteTarget.id, {
				onSuccess: () => setDeleteTarget(null),
			});
		}
	};

	return (
		<>
			<CrudListLayout<ISimpleLocationData>
				title="Locations"
				itemCount={filtered.length}
				searchPlaceholder="Search location by name"
				searchValue={searchTerm}
				onSearchChange={setSearchTerm}
				onAddClick={handleAdd}
				columns={columns}
				data={filtered}
				isLoading={isLoading}
				error={error}
				renderRow={(location) => (
					<tr key={location.id} className="border-b last:border-b-0">
						<td className="px-4 py-3">{location.name}</td>
						<td className="px-4 py-3 text-right">
							<div className="flex justify-end gap-1">
								<Button
									variant="ghost"
									size="icon"
									onClick={() => handleEdit(location)}
									aria-label={`Edit ${location.name}`}
								>
									<Pencil className="size-4" />
								</Button>
								<Button
									variant="ghost"
									size="icon"
									onClick={() => setDeleteTarget(location)}
									aria-label={`Delete ${location.name}`}
								>
									<Trash2 className="size-4 text-destructive" />
								</Button>
							</div>
						</td>
					</tr>
				)}
			/>

			<LocationForm
				open={formOpen}
				onOpenChange={setFormOpen}
				location={editingLocation}
			/>

			<DeleteConfirmDialog
				open={!!deleteTarget}
				onOpenChange={(open) => {
					if (!open) setDeleteTarget(null);
				}}
				entityName="location"
				onConfirm={handleDeleteConfirm}
				isPending={deleteMutation.isPending}
			/>
		</>
	);
}
