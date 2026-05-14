import { useState, useMemo } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import {
	Select,
	SelectContent,
	SelectTrigger,
	SelectValue,
} from "@/shared/components/ui/select";
import { CrudListLayout } from "../shared/CrudListLayout";
import { UserIdCell } from "../shared/UserIdCell";
import { ReportInfoForm } from "./ReportInfoForm";
import { DeleteAnnualReportDialog } from "./DeleteAnnualReportDialog";
import { useReportInfo, useDeleteReportInfo } from "../../hooks/useReportInfo";
import { useDivisions } from "../../hooks/useDivisions";
import { DivisionSelectItems } from "@/shared/components/DivisionSelectItems";
import { filterByName } from "../../utils/crud.utils";
import type { IAnnualReport } from "@/shared/types/report.types";

const columns = [
	{ header: "Year", accessor: "year" },
	{
		header: "Creator",
		accessor: "creator",
		className: "hidden md:table-cell",
	},
	{
		header: "Division",
		accessor: "division",
		className: "hidden md:table-cell",
	},
	{ header: "Change", accessor: "actions", className: "text-right" },
];

export const ReportInfoList = () => {
	const { data: reports = [], isLoading, error } = useReportInfo();
	const { data: divisions } = useDivisions();
	const deleteMutation = useDeleteReportInfo();

	const [searchTerm, setSearchTerm] = useState("");
	const [selectedDivision, setSelectedDivision] = useState<number | "all">(
		"all"
	);
	const [formOpen, setFormOpen] = useState(false);
	const [editingItem, setEditingItem] = useState<IAnnualReport | undefined>();
	const [deleteTarget, setDeleteTarget] = useState<IAnnualReport | null>(null);

	// Filter by year search, then by division, then sort descending
	const filtered = useMemo(() => {
		let matched = filterByName(reports, searchTerm, (r) => String(r.year));
		if (selectedDivision !== "all") {
			matched = matched.filter((r) => r.division?.id === selectedDivision);
		}
		return [...matched].sort((a, b) => b.year - a.year);
	}, [reports, searchTerm, selectedDivision]);

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
				extraActions={
					<Select
						value={
							selectedDivision === "all" ? "all" : selectedDivision.toString()
						}
						onValueChange={(v) =>
							setSelectedDivision(v === "all" ? "all" : Number(v))
						}
					>
						<SelectTrigger
							className="w-[200px]"
							aria-label="Filter by division"
						>
							<SelectValue placeholder="All Divisions" />
						</SelectTrigger>
						<SelectContent>
							<DivisionSelectItems
								divisions={divisions ?? []}
								includeAll
								requireKeyStakeholder={false}
							/>
						</SelectContent>
					</Select>
				}
				columns={columns}
				data={filtered}
				isLoading={isLoading}
				error={error}
				renderRow={(report) => (
					<tr key={report.id} className="border-b last:border-b-0">
						<td className="px-4 py-3 font-medium">{report.year}</td>
						<td className="hidden px-4 py-3 md:table-cell">
							<UserIdCell userId={report.creator} />
						</td>
						<td className="hidden px-4 py-3 md:table-cell">
							{report.division?.name ?? "—"}
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

			<DeleteAnnualReportDialog
				open={!!deleteTarget}
				onOpenChange={(open) => {
					if (!open) setDeleteTarget(null);
				}}
				report={deleteTarget}
				onConfirm={handleDeleteConfirm}
				isPending={deleteMutation.isPending}
			/>
		</>
	);
};
