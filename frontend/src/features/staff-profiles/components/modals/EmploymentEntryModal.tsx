import { useState, useEffect } from "react";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import {
	useCreateEmploymentEntry,
	useUpdateEmploymentEntry,
} from "../../hooks/useStaffProfileMutations";
import type { IEmploymentEntry } from "../../types/staff-profile.types";
import ResponsiveModal from "./ResponsiveModal";

interface EmploymentEntryModalProps {
	profilePk: number;
	entry?: IEmploymentEntry;
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

const EmploymentEntryModal = ({
	profilePk,
	entry,
	open,
	onOpenChange,
}: EmploymentEntryModalProps) => {
	const isEdit = !!entry;
	const [form, setForm] = useState({
		position_title: "",
		employer: "",
		section: "",
		start_year: "",
		end_year: "",
	});

	// Prepopulate on edit
	useEffect(() => {
		if (entry) {
			setForm({
				position_title: entry.position_title || "",
				employer: entry.employer || "",
				section: entry.section || "",
				start_year: entry.start_year?.toString() || "",
				end_year: entry.end_year?.toString() || "",
			});
		} else {
			setForm({
				position_title: "",
				employer: "",
				section: "",
				start_year: "",
				end_year: "",
			});
		}
	}, [entry, open]);

	const createMutation = useCreateEmploymentEntry(profilePk);
	const updateMutation = useUpdateEmploymentEntry(profilePk);
	const isPending = createMutation.isPending || updateMutation.isPending;

	const handleSave = () => {
		const data = {
			position_title: form.position_title,
			employer: form.employer || undefined,
			section: form.section || undefined,
			start_year: parseInt(form.start_year, 10),
			end_year: form.end_year ? parseInt(form.end_year, 10) : null,
		};

		if (isEdit && entry) {
			updateMutation.mutate(
				{ pk: entry.id, data },
				{ onSuccess: () => onOpenChange(false) }
			);
		} else {
			createMutation.mutate(data, {
				onSuccess: () => onOpenChange(false),
			});
		}
	};

	const update = (field: string, value: string) =>
		setForm((prev) => ({ ...prev, [field]: value }));

	return (
		<ResponsiveModal
			title={`${isEdit ? "Edit" : "Add"} Employment`}
			open={open}
			onOpenChange={onOpenChange}
		>
			<div className="space-y-4">
				<div>
					<Label htmlFor="position_title">Position Title</Label>
					<Input
						id="position_title"
						value={form.position_title}
						onChange={(e) => update("position_title", e.target.value)}
					/>
				</div>
				<div>
					<Label htmlFor="employer">Employer</Label>
					<Input
						id="employer"
						value={form.employer}
						onChange={(e) => update("employer", e.target.value)}
					/>
				</div>
				<div>
					<Label htmlFor="section">Section/Department</Label>
					<Input
						id="section"
						value={form.section}
						onChange={(e) => update("section", e.target.value)}
					/>
				</div>
				<div className="grid grid-cols-2 gap-4">
					<div>
						<Label htmlFor="start_year">Start Year</Label>
						<Input
							id="start_year"
							type="number"
							value={form.start_year}
							onChange={(e) => update("start_year", e.target.value)}
						/>
					</div>
					<div>
						<Label htmlFor="end_year">End Year</Label>
						<Input
							id="end_year"
							type="number"
							value={form.end_year}
							onChange={(e) => update("end_year", e.target.value)}
							placeholder="Blank = current"
						/>
					</div>
				</div>
			</div>
			<div className="flex justify-end gap-2 mt-4">
				<Button variant="outline" onClick={() => onOpenChange(false)}>
					Cancel
				</Button>
				<Button
					onClick={handleSave}
					disabled={isPending || !form.position_title || !form.start_year}
				>
					{isPending ? "Saving..." : "Save"}
				</Button>
			</div>
		</ResponsiveModal>
	);
};

export default EmploymentEntryModal;
