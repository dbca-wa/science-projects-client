import { useState, useMemo } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { CrudListLayout } from "../shared/CrudListLayout";
import { DeleteConfirmDialog } from "../shared/DeleteConfirmDialog";
import { AddressForm } from "./AddressForm";
import { useAddresses, useDeleteAddress } from "../../hooks/useAddresses";
import { useBranches } from "../../hooks/useBranches";
import { filterByName, sortAlphabetically } from "../../utils/crud.utils";
import type { IAddress } from "../../types/admin.types";

const columns = [
	{ header: "Branch", accessor: "branch" },
	{ header: "Street", accessor: "street" },
	{ header: "City", accessor: "city" },
	{ header: "Country", accessor: "country" },
	{ header: "PO Box", accessor: "pobox", className: "hidden md:table-cell" },
	{ header: "Change", accessor: "actions", className: "text-right" },
];

export function AddressList() {
	const { data: addresses = [], isLoading, error } = useAddresses();
	const { data: branches = [] } = useBranches();
	const deleteMutation = useDeleteAddress();

	const [searchTerm, setSearchTerm] = useState("");
	const [formOpen, setFormOpen] = useState(false);
	const [editingAddress, setEditingAddress] = useState<IAddress | undefined>();
	const [deleteTarget, setDeleteTarget] = useState<IAddress | null>(null);

	// Build a lookup map from branch ID to branch name
	const branchMap = useMemo(() => {
		const map = new Map<number, string>();
		for (const b of branches) {
			map.set(b.id, b.name);
		}
		return map;
	}, [branches]);

	// Extract branch name directly from the nested branch object returned by the API
	const getBranchName = (address: IAddress): string => {
		const branch = address.branch;
		if (branch == null) return "—";
		// The list endpoint returns branch as a nested object via TinyBranchSerializer
		if (typeof branch === "object") return branch.name;
		// Fallback: if branch is a plain ID, look it up in the branchMap
		return branchMap.get(branch) ?? "—";
	};

	const filtered = sortAlphabetically(
		filterByName(addresses, searchTerm, getBranchName),
		getBranchName
	);

	const handleAdd = () => {
		setEditingAddress(undefined);
		setFormOpen(true);
	};

	const handleEdit = (address: IAddress) => {
		setEditingAddress(address);
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
			<CrudListLayout<IAddress>
				title="Addresses"
				itemCount={filtered.length}
				searchPlaceholder="Search address by branch name"
				searchValue={searchTerm}
				onSearchChange={setSearchTerm}
				onAddClick={handleAdd}
				columns={columns}
				data={filtered}
				isLoading={isLoading}
				error={error}
				renderRow={(address) => (
					<tr key={address.id} className="border-b last:border-b-0">
						<td className="px-4 py-3">{getBranchName(address)}</td>
						<td className="px-4 py-3">{address.street}</td>
						<td className="px-4 py-3">{address.city}</td>
						<td className="px-4 py-3">{address.country}</td>
						<td className="hidden px-4 py-3 md:table-cell">
							{address.pobox || "—"}
						</td>
						<td className="px-4 py-3 text-right">
							<div className="flex justify-end gap-1">
								<Button
									variant="ghost"
									size="icon"
									onClick={() => handleEdit(address)}
									aria-label={`Edit address for ${getBranchName(address)}`}
								>
									<Pencil className="size-4" />
								</Button>
								<Button
									variant="ghost"
									size="icon"
									onClick={() => setDeleteTarget(address)}
									aria-label={`Delete address for ${getBranchName(address)}`}
								>
									<Trash2 className="size-4 text-destructive" />
								</Button>
							</div>
						</td>
					</tr>
				)}
			/>

			<AddressForm
				open={formOpen}
				onOpenChange={setFormOpen}
				address={editingAddress}
			/>

			<DeleteConfirmDialog
				open={!!deleteTarget}
				onOpenChange={(open) => {
					if (!open) setDeleteTarget(null);
				}}
				entityName="address"
				onConfirm={handleDeleteConfirm}
				isPending={deleteMutation.isPending}
			/>
		</>
	);
}
