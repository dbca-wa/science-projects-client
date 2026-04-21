import { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { CrudListLayout } from "../shared/CrudListLayout";
import { DeleteConfirmDialog } from "../shared/DeleteConfirmDialog";
import { AffiliationForm } from "./AffiliationForm";
import { AffiliationCleanDialog } from "./AffiliationCleanDialog";
import { AffiliationMergeDialog } from "./AffiliationMergeDialog";
import {
	useAffiliations,
	useDeleteAffiliation,
} from "../../hooks/useAffiliations";
import { filterByName, sortAlphabetically } from "../../utils/crud.utils";
import type { IAffiliation } from "../../types/admin.types";

const columns = [
	{ header: "Name", accessor: "name" },
	{ header: "Change", accessor: "actions", className: "text-right" },
];

export function AffiliationList() {
	const { data: affiliations = [], isLoading, error } = useAffiliations();
	const deleteMutation = useDeleteAffiliation();

	const [searchTerm, setSearchTerm] = useState("");
	const [formOpen, setFormOpen] = useState(false);
	const [editingAffiliation, setEditingAffiliation] = useState<
		IAffiliation | undefined
	>();
	const [deleteTarget, setDeleteTarget] = useState<IAffiliation | null>(null);
	const [cleanDialogOpen, setCleanDialogOpen] = useState(false);
	const [mergeDialogOpen, setMergeDialogOpen] = useState(false);

	const filtered = sortAlphabetically(
		filterByName(affiliations, searchTerm, (a) => a.name),
		(a) => a.name
	);

	const handleAdd = () => {
		setEditingAffiliation(undefined);
		setFormOpen(true);
	};

	const handleEdit = (affiliation: IAffiliation) => {
		setEditingAffiliation(affiliation);
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
			<CrudListLayout<IAffiliation>
				title="Affiliations"
				itemCount={filtered.length}
				searchPlaceholder="Search affiliation by name"
				searchValue={searchTerm}
				onSearchChange={setSearchTerm}
				onAddClick={handleAdd}
				extraActions={
					<>
						<Button
							variant="outline"
							onClick={() => setCleanDialogOpen(true)}
							className="bg-blue-600 text-white hover:bg-blue-700 hover:text-white"
						>
							Clean
						</Button>
						<Button
							variant="outline"
							onClick={() => setMergeDialogOpen(true)}
							className="bg-orange-600 text-white hover:bg-orange-700 hover:text-white"
						>
							Merge
						</Button>
					</>
				}
				columns={columns}
				data={filtered}
				isLoading={isLoading}
				error={error}
				renderRow={(affiliation) => (
					<tr key={affiliation.id} className="border-b last:border-b-0">
						<td className="px-4 py-3">{affiliation.name}</td>
						<td className="px-4 py-3 text-right">
							<div className="flex justify-end gap-1">
								<Button
									variant="ghost"
									size="icon"
									onClick={() => handleEdit(affiliation)}
									aria-label={`Edit ${affiliation.name}`}
								>
									<Pencil className="size-4" />
								</Button>
								<Button
									variant="ghost"
									size="icon"
									onClick={() => setDeleteTarget(affiliation)}
									aria-label={`Delete ${affiliation.name}`}
								>
									<Trash2 className="size-4 text-destructive" />
								</Button>
							</div>
						</td>
					</tr>
				)}
			/>

			<AffiliationForm
				open={formOpen}
				onOpenChange={setFormOpen}
				affiliation={editingAffiliation}
			/>

			<DeleteConfirmDialog
				open={!!deleteTarget}
				onOpenChange={(open) => {
					if (!open) setDeleteTarget(null);
				}}
				entityName="affiliation"
				onConfirm={handleDeleteConfirm}
				isPending={deleteMutation.isPending}
			/>

			<AffiliationCleanDialog
				open={cleanDialogOpen}
				onOpenChange={setCleanDialogOpen}
			/>

			<AffiliationMergeDialog
				open={mergeDialogOpen}
				onOpenChange={setMergeDialogOpen}
			/>
		</>
	);
}
