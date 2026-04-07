import { useState } from "react";
import { useStaffProfileCV } from "../../hooks/useStaffProfileCV";
import {
	useDeleteEmploymentEntry,
	useDeleteEducationEntry,
} from "../../hooks/useStaffProfileMutations";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { Button } from "@/shared/components/ui/button";
import { Plus, Pencil, Trash2 } from "lucide-react";
import EmploymentEntryModal from "../modals/EmploymentEntryModal";
import EducationEntryModal from "../modals/EducationEntryModal";
import DeleteEntryModal from "../modals/DeleteEntryModal";
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

	// Employment modal state
	const [empModalOpen, setEmpModalOpen] = useState(false);
	const [editingEmp, setEditingEmp] = useState<IEmploymentEntry | undefined>();
	const [deletingEmpId, setDeletingEmpId] = useState<number | null>(null);
	const deleteEmpMutation = useDeleteEmploymentEntry(profilePk);

	// Education modal state
	const [eduModalOpen, setEduModalOpen] = useState(false);
	const [editingEdu, setEditingEdu] = useState<IEducationEntry | undefined>();
	const [deletingEduId, setDeletingEduId] = useState<number | null>(null);
	const deleteEduMutation = useDeleteEducationEntry(profilePk);

	if (isLoading) {
		return (
			<div className="space-y-6">
				<Skeleton className="h-20 w-full" />
				<Skeleton className="h-20 w-full" />
			</div>
		);
	}

	if (!data) return null;

	return (
		<div className="space-y-8">
			{/* Employment */}
			<section>
				<div className="flex items-center justify-between mb-3">
					<h3 className="text-lg font-semibold text-slate-900">Employment</h3>
					{canEdit && (
						<Button
							variant="ghost"
							size="sm"
							onClick={() => {
								setEditingEmp(undefined);
								setEmpModalOpen(true);
							}}
							className="gap-1"
						>
							<Plus className="size-4" />
							Add
						</Button>
					)}
				</div>
				{data.employment_entries.length > 0 ? (
					<div className="space-y-3">
						{data.employment_entries.map((entry) => (
							<div
								key={entry.id}
								className="rounded-lg border border-slate-200 p-4 flex justify-between items-start"
							>
								<div>
									<h4 className="font-medium text-slate-900">
										{entry.position_title}
									</h4>
									{entry.employer && (
										<p className="text-sm text-slate-600">{entry.employer}</p>
									)}
									<p className="text-sm text-slate-500 mt-1">
										{entry.start_year}
										{entry.end_year ? ` – ${entry.end_year}` : " – Present"}
									</p>
								</div>
								{canEdit && (
									<div className="flex gap-1 shrink-0">
										<Button
											variant="ghost"
											size="icon"
											className="size-8"
											onClick={() => {
												setEditingEmp(entry);
												setEmpModalOpen(true);
											}}
										>
											<Pencil className="size-3.5" />
										</Button>
										<Button
											variant="ghost"
											size="icon"
											className="size-8 text-red-600 hover:text-red-700"
											onClick={() => setDeletingEmpId(entry.id)}
										>
											<Trash2 className="size-3.5" />
										</Button>
									</div>
								)}
							</div>
						))}
					</div>
				) : (
					<p className="text-slate-500">No employment history.</p>
				)}
			</section>

			{/* Education */}
			<section>
				<div className="flex items-center justify-between mb-3">
					<h3 className="text-lg font-semibold text-slate-900">Education</h3>
					{canEdit && (
						<Button
							variant="ghost"
							size="sm"
							onClick={() => {
								setEditingEdu(undefined);
								setEduModalOpen(true);
							}}
							className="gap-1"
						>
							<Plus className="size-4" />
							Add
						</Button>
					)}
				</div>
				{data.education_entries.length > 0 ? (
					<div className="space-y-3">
						{data.education_entries.map((entry) => (
							<div
								key={entry.id}
								className="rounded-lg border border-slate-200 p-4 flex justify-between items-start"
							>
								<div>
									<h4 className="font-medium text-slate-900">
										{entry.qualification_name}
									</h4>
									<p className="text-sm text-slate-600">
										{entry.institution}
										{entry.location && `, ${entry.location}`}
									</p>
									<p className="text-sm text-slate-500 mt-1">
										{entry.end_year}
									</p>
								</div>
								{canEdit && (
									<div className="flex gap-1 shrink-0">
										<Button
											variant="ghost"
											size="icon"
											className="size-8"
											onClick={() => {
												setEditingEdu(entry);
												setEduModalOpen(true);
											}}
										>
											<Pencil className="size-3.5" />
										</Button>
										<Button
											variant="ghost"
											size="icon"
											className="size-8 text-red-600 hover:text-red-700"
											onClick={() => setDeletingEduId(entry.id)}
										>
											<Trash2 className="size-3.5" />
										</Button>
									</div>
								)}
							</div>
						))}
					</div>
				) : (
					<p className="text-slate-500">No education history.</p>
				)}
			</section>

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
				description="Are you sure you want to delete this employment entry? This cannot be undone."
				open={deletingEmpId !== null}
				onOpenChange={(open) => !open && setDeletingEmpId(null)}
				onConfirm={() => {
					if (deletingEmpId) {
						deleteEmpMutation.mutate(deletingEmpId, {
							onSuccess: () => setDeletingEmpId(null),
						});
					}
				}}
				isPending={deleteEmpMutation.isPending}
			/>

			<DeleteEntryModal
				title="Delete Education Entry"
				description="Are you sure you want to delete this education entry? This cannot be undone."
				open={deletingEduId !== null}
				onOpenChange={(open) => !open && setDeletingEduId(null)}
				onConfirm={() => {
					if (deletingEduId) {
						deleteEduMutation.mutate(deletingEduId, {
							onSuccess: () => setDeletingEduId(null),
						});
					}
				}}
				isPending={deleteEduMutation.isPending}
			/>
		</div>
	);
};

export default CVSection;
