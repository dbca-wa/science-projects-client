import { useStaffProfileCV } from "../../hooks/useStaffProfileCV";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { Separator } from "@/shared/components/ui/separator";
import { Button } from "@/shared/components/ui/button";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import EmploymentEntryModal from "../modals/EmploymentEntryModal";
import EducationEntryModal from "../modals/EducationEntryModal";
import DeleteEntryModal from "../modals/DeleteEntryModal";
import {
	useDeleteEmploymentEntry,
	useDeleteEducationEntry,
} from "../../hooks/useStaffProfileMutations";
import type {
	IEmploymentEntry,
	IEducationEntry,
} from "../../types/staff-profile.types";

interface CVSectionProps {
	profilePk: number;
	canEdit: boolean;
}

const CVSection = ({ profilePk, canEdit }: CVSectionProps) => {
	const { data, isLoading } = useStaffProfileCV(profilePk);

	const [empModalOpen, setEmpModalOpen] = useState(false);
	const [editingEmp, setEditingEmp] = useState<IEmploymentEntry | undefined>();
	const [deletingEmpId, setDeletingEmpId] = useState<number | null>(null);
	const deleteEmpMutation = useDeleteEmploymentEntry(profilePk);

	const [eduModalOpen, setEduModalOpen] = useState(false);
	const [editingEdu, setEditingEdu] = useState<IEducationEntry | undefined>();
	const [deletingEduId, setDeletingEduId] = useState<number | null>(null);
	const deleteEduMutation = useDeleteEducationEntry(profilePk);

	const currentYear = new Date().getFullYear();
	const formatYear = (value: number | null) => {
		if (!value || currentYear <= value) return "Present";
		return `${value}`;
	};

	if (isLoading) {
		return (
			<div className="space-y-6 p-4">
				<Skeleton className="h-20 w-full" />
				<Skeleton className="h-20 w-full" />
			</div>
		);
	}

	if (!data) return null;

	const sortedEmployment = [...data.employment_entries].sort((a, b) => {
		if (a.start_year !== b.start_year) return b.start_year - a.start_year;
		if ((a.end_year ?? 9999) !== (b.end_year ?? 9999))
			return (b.end_year ?? 9999) - (a.end_year ?? 9999);
		return a.position_title.localeCompare(b.position_title);
	});

	const sortedEducation = [...data.education_entries].sort((a, b) => {
		if (a.end_year !== b.end_year) return b.end_year - a.end_year;
		return a.qualification_name.localeCompare(b.qualification_name);
	});

	return (
		<div className="w-full pb-6">
			{/* Employment */}
			<div className="w-full p-4">
				<div className="flex w-full items-center justify-between">
					<p className="text-lg font-semibold text-slate-900">Employment</p>
					{canEdit && (
						<Button
							variant="ghost"
							size="sm"
							onClick={() => {
								setEditingEmp(undefined);
								setEmpModalOpen(true);
							}}
							className="gap-1 text-slate-500 hover:text-slate-700"
						>
							<Plus className="size-4" />
							Add
						</Button>
					)}
				</div>
				<Separator className="mt-2 mb-3 bg-slate-200" />
				{sortedEmployment.length > 0 ? (
					<div className="space-y-3">
						{sortedEmployment.map((entry) => (
							<div
								key={entry.id}
								className="rounded-lg border border-slate-200 bg-white shadow-sm p-4"
							>
								<div className="flex items-start justify-between gap-2">
									<div className="flex-1 min-w-0">
										<p className="font-semibold text-slate-800">
											{entry.position_title}
										</p>
										{(entry.employer || entry.section) && (
											<p className="text-sm text-slate-500 mt-0.5">
												{entry.employer}
												{entry.section && entry.employer
													? ` · ${entry.section}`
													: entry.section}
											</p>
										)}
										<p className="text-xs text-slate-400 mt-1">
											{entry.start_year === entry.end_year
												? `${entry.start_year}`
												: `${entry.start_year} – ${formatYear(entry.end_year)}`}
										</p>
									</div>
									{canEdit && (
										<div className="flex gap-1 shrink-0">
											<Button
												variant="ghost"
												size="icon"
												className="size-7"
												onClick={() => {
													setEditingEmp(entry);
													setEmpModalOpen(true);
												}}
											>
												<Pencil className="size-3.5 text-slate-400" />
											</Button>
											<Button
												variant="ghost"
												size="icon"
												className="size-7"
												onClick={() => setDeletingEmpId(entry.id)}
											>
												<Trash2 className="size-3.5 text-red-400" />
											</Button>
										</div>
									)}
								</div>
							</div>
						))}
					</div>
				) : (
					<p className="text-muted-foreground">No information available.</p>
				)}
			</div>

			{/* Qualifications */}
			<div className="w-full p-4">
				<div className="flex w-full items-center justify-between">
					<p className="text-lg font-semibold text-slate-900">Qualifications</p>
					{canEdit && (
						<Button
							variant="ghost"
							size="sm"
							onClick={() => {
								setEditingEdu(undefined);
								setEduModalOpen(true);
							}}
							className="gap-1 text-slate-500 hover:text-slate-700"
						>
							<Plus className="size-4" />
							Add
						</Button>
					)}
				</div>
				<Separator className="mt-2 mb-3 bg-slate-200" />
				{sortedEducation.length > 0 ? (
					<div className="space-y-3">
						{sortedEducation.map((entry) => (
							<div
								key={entry.id}
								className="rounded-lg border border-slate-200 bg-white shadow-sm p-4"
							>
								<div className="flex items-start justify-between gap-2">
									<div className="flex-1 min-w-0">
										<p className="font-semibold text-slate-800">
											{entry.qualification_name}
										</p>
										<p className="text-sm text-slate-500 mt-0.5">
											{entry.institution}
											{entry.location ? ` · ${entry.location}` : ""}
										</p>
										<p className="text-xs text-slate-400 mt-1">
											{formatYear(entry.end_year)}
										</p>
									</div>
									{canEdit && (
										<div className="flex gap-1 shrink-0">
											<Button
												variant="ghost"
												size="icon"
												className="size-7"
												onClick={() => {
													setEditingEdu(entry);
													setEduModalOpen(true);
												}}
											>
												<Pencil className="size-3.5 text-slate-400" />
											</Button>
											<Button
												variant="ghost"
												size="icon"
												className="size-7"
												onClick={() => setDeletingEduId(entry.id)}
											>
												<Trash2 className="size-3.5 text-red-400" />
											</Button>
										</div>
									)}
								</div>
							</div>
						))}
					</div>
				) : (
					<p className="text-muted-foreground">No information available.</p>
				)}
			</div>

			{/* Modals */}
			<EmploymentEntryModal
				profilePk={profilePk}
				entry={editingEmp}
				open={empModalOpen}
				onOpenChange={setEmpModalOpen}
			/>
			<EducationEntryModal
				profilePk={profilePk}
				entry={editingEdu}
				open={eduModalOpen}
				onOpenChange={setEduModalOpen}
			/>
			<DeleteEntryModal
				title="Delete Employment Entry"
				description="Are you sure? This cannot be undone."
				open={deletingEmpId !== null}
				onOpenChange={(open) => !open && setDeletingEmpId(null)}
				onConfirm={() => {
					if (deletingEmpId)
						deleteEmpMutation.mutate(deletingEmpId, {
							onSuccess: () => setDeletingEmpId(null),
						});
				}}
				isPending={deleteEmpMutation.isPending}
			/>
			<DeleteEntryModal
				title="Delete Qualification"
				description="Are you sure? This cannot be undone."
				open={deletingEduId !== null}
				onOpenChange={(open) => !open && setDeletingEduId(null)}
				onConfirm={() => {
					if (deletingEduId)
						deleteEduMutation.mutate(deletingEduId, {
							onSuccess: () => setDeletingEduId(null),
						});
				}}
				isPending={deleteEduMutation.isPending}
			/>
		</div>
	);
};

export default CVSection;
