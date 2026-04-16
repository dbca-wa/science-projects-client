import { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { CrudListLayout } from "../shared/CrudListLayout";
import { DeleteConfirmDialog } from "../shared/DeleteConfirmDialog";
import { BusinessAreaForm } from "./BusinessAreaForm";
import {
	useBusinessAreas,
	useDeleteBusinessArea,
} from "../../hooks/useBusinessAreas";
import { filterByName, sortAlphabetically } from "../../utils/crud.utils";
import type { IBusinessArea } from "../../types/admin.types";
import { getImageUrl } from "@/shared/utils/image.utils";

const columns = [
	{ header: "Image", accessor: "image", className: "w-16" },
	{ header: "Name", accessor: "name" },
	{
		header: "Leader",
		accessor: "leader",
		className: "hidden md:table-cell",
	},
	{
		header: "Finance Admin",
		accessor: "finance_admin",
		className: "hidden md:table-cell",
	},
	{
		header: "Data Custodian",
		accessor: "data_custodian",
		className: "hidden md:table-cell",
	},
	{ header: "Change", accessor: "actions", className: "text-right" },
];

export function BusinessAreaList() {
	const { data: businessAreas = [], isLoading, error } = useBusinessAreas();
	const deleteMutation = useDeleteBusinessArea();

	const [searchTerm, setSearchTerm] = useState("");
	const [formOpen, setFormOpen] = useState(false);
	const [editingItem, setEditingItem] = useState<IBusinessArea | undefined>();
	const [deleteTarget, setDeleteTarget] = useState<IBusinessArea | null>(null);

	const filtered = sortAlphabetically(
		filterByName(businessAreas, searchTerm, (ba) => ba.name),
		(ba) => ba.name
	);

	const handleAdd = () => {
		setEditingItem(undefined);
		setFormOpen(true);
	};

	const handleEdit = (item: IBusinessArea) => {
		setEditingItem(item);
		setFormOpen(true);
	};

	const handleDeleteConfirm = () => {
		if (deleteTarget?.id) {
			deleteMutation.mutate(deleteTarget.id, {
				onSuccess: () => setDeleteTarget(null),
			});
		}
	};

	/** Resolve the image URL from the business area's image field */
	const getThumbUrl = (ba: IBusinessArea): string | null => {
		if (!ba.image) return null;
		if (typeof ba.image === "string") return getImageUrl(ba.image) ?? null;
		if (typeof ba.image === "object" && "file" in ba.image) {
			return getImageUrl(ba.image) ?? null;
		}
		return null;
	};

	return (
		<>
			<CrudListLayout<IBusinessArea>
				title="Business Areas"
				itemCount={filtered.length}
				searchPlaceholder="Search business area by name"
				searchValue={searchTerm}
				onSearchChange={setSearchTerm}
				onAddClick={handleAdd}
				columns={columns}
				data={filtered}
				isLoading={isLoading}
				error={error}
				renderRow={(ba) => (
					<tr key={ba.id} className="border-b last:border-b-0">
						<td className="w-16 px-4 py-3">
							{getThumbUrl(ba) ? (
								<img
									src={getThumbUrl(ba)!}
									alt={ba.name}
									className="size-10 rounded object-cover"
								/>
							) : (
								<div className="flex size-10 items-center justify-center rounded bg-muted text-xs text-muted-foreground">
									—
								</div>
							)}
						</td>
						<td className="px-4 py-3">{ba.name}</td>
						<td className="hidden px-4 py-3 md:table-cell">
							{ba.leader ?? "—"}
						</td>
						<td className="hidden px-4 py-3 md:table-cell">
							{ba.finance_admin ?? "—"}
						</td>
						<td className="hidden px-4 py-3 md:table-cell">
							{ba.data_custodian ?? "—"}
						</td>
						<td className="px-4 py-3 text-right">
							<div className="flex justify-end gap-1">
								<Button
									variant="ghost"
									size="icon"
									onClick={() => handleEdit(ba)}
									aria-label={`Edit ${ba.name}`}
								>
									<Pencil className="size-4" />
								</Button>
								<Button
									variant="ghost"
									size="icon"
									onClick={() => setDeleteTarget(ba)}
									aria-label={`Delete ${ba.name}`}
								>
									<Trash2 className="size-4 text-destructive" />
								</Button>
							</div>
						</td>
					</tr>
				)}
			/>

			<BusinessAreaForm
				open={formOpen}
				onOpenChange={setFormOpen}
				businessArea={editingItem}
			/>

			<DeleteConfirmDialog
				open={!!deleteTarget}
				onOpenChange={(open) => {
					if (!open) setDeleteTarget(null);
				}}
				entityName="business area"
				onConfirm={handleDeleteConfirm}
				isPending={deleteMutation.isPending}
			/>
		</>
	);
}
