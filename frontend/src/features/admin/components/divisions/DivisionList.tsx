import { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { CrudListLayout } from "../shared/CrudListLayout";
import { DeleteConfirmDialog } from "../shared/DeleteConfirmDialog";
import { UserIdCell } from "../shared/UserIdCell";
import { DivisionForm } from "./DivisionForm";
import { useDivisions, useDeleteDivision } from "../../hooks/useDivisions";
import { filterByName, sortAlphabetically } from "../../utils/crud.utils";
import type { IDivision } from "../../types/admin.types";

const columns = [
	{ header: "Name", accessor: "name" },
	{ header: "Slug", accessor: "slug", className: "hidden md:table-cell" },
	{
		header: "Director",
		accessor: "director",
		className: "hidden md:table-cell",
	},
	{
		header: "Approver",
		accessor: "approver",
		className: "hidden md:table-cell",
	},
	{ header: "Change", accessor: "actions", className: "text-right" },
];

export function DivisionList() {
	const { data: divisions = [], isLoading, error } = useDivisions();
	const deleteMutation = useDeleteDivision();

	const [searchTerm, setSearchTerm] = useState("");
	const [formOpen, setFormOpen] = useState(false);
	const [editingDivision, setEditingDivision] = useState<
		IDivision | undefined
	>();
	const [deleteTarget, setDeleteTarget] = useState<IDivision | null>(null);

	const filtered = sortAlphabetically(
		filterByName(divisions, searchTerm, (d) => d.name),
		(d) => d.name
	);

	const handleAdd = () => {
		setEditingDivision(undefined);
		setFormOpen(true);
	};

	const handleEdit = (division: IDivision) => {
		setEditingDivision(division);
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
			<CrudListLayout<IDivision>
				title="Divisions"
				itemCount={filtered.length}
				searchPlaceholder="Search division by name"
				searchValue={searchTerm}
				onSearchChange={setSearchTerm}
				onAddClick={handleAdd}
				columns={columns}
				data={filtered}
				isLoading={isLoading}
				error={error}
				renderRow={(division) => (
					<tr key={division.id} className="border-b last:border-b-0">
						<td className="px-4 py-3">{division.name}</td>
						<td className="hidden px-4 py-3 md:table-cell">{division.slug}</td>
						<td className="hidden px-4 py-3 md:table-cell">
							<UserIdCell userId={division.director} />
						</td>
						<td className="hidden px-4 py-3 md:table-cell">
							<UserIdCell userId={division.approver} />
						</td>
						<td className="px-4 py-3 text-right">
							<div className="flex justify-end gap-1">
								<Button
									variant="ghost"
									size="icon"
									onClick={() => handleEdit(division)}
									aria-label={`Edit ${division.name}`}
								>
									<Pencil className="size-4" />
								</Button>
								<Button
									variant="ghost"
									size="icon"
									onClick={() => setDeleteTarget(division)}
									aria-label={`Delete ${division.name}`}
								>
									<Trash2 className="size-4 text-destructive" />
								</Button>
							</div>
						</td>
					</tr>
				)}
			/>

			<DivisionForm
				open={formOpen}
				onOpenChange={setFormOpen}
				division={editingDivision}
			/>

			<DeleteConfirmDialog
				open={!!deleteTarget}
				onOpenChange={(open) => {
					if (!open) setDeleteTarget(null);
				}}
				entityName="division"
				onConfirm={handleDeleteConfirm}
				isPending={deleteMutation.isPending}
			/>
		</>
	);
}
