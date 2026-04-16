import { useState, useMemo } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { CrudListLayout } from "../shared/CrudListLayout";
import { DeleteConfirmDialog } from "../shared/DeleteConfirmDialog";
import { ReportInfoForm } from "./ReportInfoForm";
import { useReportInfo, useDeleteReportInfo } from "../../hooks/useReportInfo";
import { filterByName } from "../../utils/crud.utils";
import type { IAnnualReport } from "@/features/reports/types/report.types";

const columns = [
	{ header: "Year", accessor: "year" },
	{
		header: "Creator",
		accessor: "creator",
		className: "hidden md:table-cell",
	},
	{
		header: "Modifier",
		accessor: "modifier",
		className: "hidden md:table-cell",
	},
	{ header: "Change", accessor: "actions", className: "text-right" },
];

export function ReportInfoList() {
	const { data: reports = [], isLoading, error } = useReportInfo();
	const deleteMutation = useDeleteReportInfo();

	const [searchTerm, setSearchTerm] = useState("");
	const [formOpen, setFormOpen] = useState(false);
	const [editingItem, setEditingItem] = useState<IAnnualReport | undefined>();
	const [deleteTarget, setDeleteTarget] = useState<IAnnualReport | null>(null);

	// Filter by year (convert to string for search) then sort by year descending
	const filtered = useMemo(() => {
		const matched = filterByName(reports, searchTerm, (r) => String(r.year));
		return [...matched].sort((a, b) => b.year - a.year);
	}, [reports, searchTerm]);

	const handleAdd = () => {
		setEditingItem(undefined);
		setFormOpen(true);
	};

	const handleEdit = (item: IAnnualReport) => {
		setEditingItem(item);
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
			<CrudListLayout<IAnnualReport>
				title="Report Info"
				itemCount={filtered.length}
				searchPlaceholder="Search by year"
				searchValue={searchTerm}
				onSearchChange={setSearchTerm}
				onAddClick={handleAdd}
				addButtonLabel="Create Report Info"
				columns={columns}
				data={filtered}
				isLoading={isLoading}
				error={error}
				renderRow={(report) => (
					<tr key={report.id} className="border-b last:border-b-0">
						<td className="px-4 py-3 font-medium">{report.year}</td>
						<td className="hidden px-4 py-3 md:table-cell">
							{report.creator ?? "—"}
						</td>
						<td className="hidden px-4 py-3 md:table-cell">
							{report.modifier ?? "—"}
						</td>
						<td className="px-4 py-3 text-right">
							<div className="flex justify-end gap-1">
								<Button
									variant="ghost"
									size="icon"
									onClick={() => handleEdit(report)}
									aria-label={`Edit report ${report.year}`}
								>
									<Pencil className="size-4" />
								</Button>
								<Button
									variant="ghost"
									size="icon"
									onClick={() => setDeleteTarget(report)}
									aria-label={`Delete report ${report.year}`}
								>
									<Trash2 className="size-4 text-destructive" />
								</Button>
							</div>
						</td>
					</tr>
				)}
			/>

			<ReportInfoForm
				open={formOpen}
				onOpenChange={setFormOpen}
				report={editingItem}
			/>

			<DeleteConfirmDialog
				open={!!deleteTarget}
				onOpenChange={(open) => {
					if (!open) setDeleteTarget(null);
				}}
				entityName="report info"
				onConfirm={handleDeleteConfirm}
				isPending={deleteMutation.isPending}
			/>
		</>
	);
}
