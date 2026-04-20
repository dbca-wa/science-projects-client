import { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { CrudListLayout } from "../shared/CrudListLayout";
import { DeleteConfirmDialog } from "../shared/DeleteConfirmDialog";
import { UserIdCell } from "../shared/UserIdCell";
import { ServiceForm } from "./ServiceForm";
import { useServices, useDeleteService } from "../../hooks/useServices";
import { filterByName, sortAlphabetically } from "../../utils/crud.utils";
import type { IDepartmentalService } from "../../types/admin.types";

const columns = [
	{ header: "Name", accessor: "name" },
	{
		header: "Executive Director",
		accessor: "director",
		className: "hidden md:table-cell",
	},
	{ header: "Change", accessor: "actions", className: "text-right" },
];

export function ServiceList() {
	const { data: services = [], isLoading, error } = useServices();
	const deleteMutation = useDeleteService();

	const [searchTerm, setSearchTerm] = useState("");
	const [formOpen, setFormOpen] = useState(false);
	const [editingService, setEditingService] = useState<
		IDepartmentalService | undefined
	>();
	const [deleteTarget, setDeleteTarget] = useState<IDepartmentalService | null>(
		null
	);

	const filtered = sortAlphabetically(
		filterByName(services, searchTerm, (s) => s.name),
		(s) => s.name
	);

	const handleAdd = () => {
		setEditingService(undefined);
		setFormOpen(true);
	};

	const handleEdit = (service: IDepartmentalService) => {
		setEditingService(service);
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
			<CrudListLayout<IDepartmentalService>
				title="Services"
				itemCount={filtered.length}
				searchPlaceholder="Search service by name"
				searchValue={searchTerm}
				onSearchChange={setSearchTerm}
				onAddClick={handleAdd}
				columns={columns}
				data={filtered}
				isLoading={isLoading}
				error={error}
				renderRow={(service) => (
					<tr key={service.id} className="border-b last:border-b-0">
						<td className="px-4 py-3">{service.name}</td>
						<td className="hidden px-4 py-3 md:table-cell">
							<UserIdCell userId={service.director} />
						</td>
						<td className="px-4 py-3 text-right">
							<div className="flex justify-end gap-1">
								<Button
									variant="ghost"
									size="icon"
									onClick={() => handleEdit(service)}
									aria-label={`Edit ${service.name}`}
								>
									<Pencil className="size-4" />
								</Button>
								<Button
									variant="ghost"
									size="icon"
									onClick={() => setDeleteTarget(service)}
									aria-label={`Delete ${service.name}`}
								>
									<Trash2 className="size-4 text-destructive" />
								</Button>
							</div>
						</td>
					</tr>
				)}
			/>

			<ServiceForm
				open={formOpen}
				onOpenChange={setFormOpen}
				service={editingService}
			/>

			<DeleteConfirmDialog
				open={!!deleteTarget}
				onOpenChange={(open) => {
					if (!open) setDeleteTarget(null);
				}}
				entityName="service"
				onConfirm={handleDeleteConfirm}
				isPending={deleteMutation.isPending}
			/>
		</>
	);
}
