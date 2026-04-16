import { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { CrudListLayout } from "../shared/CrudListLayout";
import { DeleteConfirmDialog } from "../shared/DeleteConfirmDialog";
import { BranchForm } from "./BranchForm";
import { useBranches, useDeleteBranch } from "../../hooks/useBranches";
import { filterByName, sortAlphabetically } from "../../utils/crud.utils";
import type { IBranch } from "../../types/admin.types";

const columns = [
	{ header: "Branch", accessor: "name" },
	{ header: "Manager", accessor: "manager", className: "hidden md:table-cell" },
	{ header: "Change", accessor: "actions", className: "text-right" },
];

export function BranchList() {
	const { data: branches = [], isLoading, error } = useBranches();
	const deleteMutation = useDeleteBranch();

	const [searchTerm, setSearchTerm] = useState("");
	const [formOpen, setFormOpen] = useState(false);
	const [editingBranch, setEditingBranch] = useState<IBranch | undefined>();
	const [deleteTarget, setDeleteTarget] = useState<IBranch | null>(null);

	const filtered = sortAlphabetically(
		filterByName(branches, searchTerm, (b) => b.name),
		(b) => b.name
	);

	const handleAdd = () => {
		setEditingBranch(undefined);
		setFormOpen(true);
	};

	const handleEdit = (branch: IBranch) => {
		setEditingBranch(branch);
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
			<CrudListLayout<IBranch>
				title="Branches"
				itemCount={filtered.length}
				searchPlaceholder="Search branch by name"
				searchValue={searchTerm}
				onSearchChange={setSearchTerm}
				onAddClick={handleAdd}
				columns={columns}
				data={filtered}
				isLoading={isLoading}
				error={error}
				renderRow={(branch) => (
					<tr key={branch.id} className="border-b last:border-b-0">
						<td className="px-4 py-3">{branch.name}</td>
						<td className="hidden px-4 py-3 md:table-cell">
							{branch.manager ?? "—"}
						</td>
						<td className="px-4 py-3 text-right">
							<div className="flex justify-end gap-1">
								<Button
									variant="ghost"
									size="icon"
									onClick={() => handleEdit(branch)}
									aria-label={`Edit ${branch.name}`}
								>
									<Pencil className="size-4" />
								</Button>
								<Button
									variant="ghost"
									size="icon"
									onClick={() => setDeleteTarget(branch)}
									aria-label={`Delete ${branch.name}`}
								>
									<Trash2 className="size-4 text-destructive" />
								</Button>
							</div>
						</td>
					</tr>
				)}
			/>

			<BranchForm
				open={formOpen}
				onOpenChange={setFormOpen}
				branch={editingBranch}
			/>

			<DeleteConfirmDialog
				open={!!deleteTarget}
				onOpenChange={(open) => {
					if (!open) setDeleteTarget(null);
				}}
				entityName="branch"
				onConfirm={handleDeleteConfirm}
				isPending={deleteMutation.isPending}
			/>
		</>
	);
}
