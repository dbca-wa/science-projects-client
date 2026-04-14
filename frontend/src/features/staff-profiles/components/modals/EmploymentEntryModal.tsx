import { useState, useMemo } from "react";
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

const getInitialEmploymentForm = (entry?: IEmploymentEntry) => ({
	position_title: entry?.position_title || "",
	employer: entry?.employer || "",
	section: entry?.section || "",
	start_year: entry?.start_year?.toString() || "",
	end_year: entry?.end_year?.toString() || "",
});

const EmploymentEntryModal = ({
	profilePk,
	entry,
	open,
	onOpenChange,
}: EmploymentEntryModalProps) => {
	const isEdit = !!entry;
	const initialForm = useMemo(
		() => getInitialEmploymentForm(entry),
		[entry, open]
	);
	const [form, setForm] = useState(initialForm);

	// Reset form when modal opens with new/different data
	const formKey = `${entry?.id ?? "new"}-${open}`;
	const [prevKey, setPrevKey] = useState(formKey);
	if (formKey !== prevKey) {
		setPrevKey(formKey);
		setForm(initialForm);
	}

	const createMutation = useCreateEmploymentEntry(profilePk);
	const updateMutation = useUpdateEmploymentEntry(profilePk);
	const isPending = createMutation.isPending || updateMutation.isPending;

	const currentYear = new Date().getFullYear();
	const minYear = currentYear - 100;
	const maxYear = currentYear + 10;

	const isYearValid = (yearStr: string) => {
		if (!yearStr) return true; // empty is OK for optional fields
		const y = parseInt(yearStr, 10);
		return !isNaN(y) && y >= minYear && y <= maxYear;
	};

	const startYearValid = isYearValid(form.start_year);
	const endYearValid = isYearValid(form.end_year);
	const yearsValid = startYearValid && endYearValid;

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
							min={minYear}
							max={maxYear}
							value={form.start_year}
							onChange={(e) => update("start_year", e.target.value)}
						/>
						{form.start_year && !startYearValid && (
							<p className="text-xs text-red-500 mt-1">
								Year must be between {minYear} and {maxYear}
							</p>
						)}
					</div>
					<div>
						<Label htmlFor="end_year">End Year</Label>
						<Input
							id="end_year"
							type="number"
							min={minYear}
							max={maxYear}
							value={form.end_year}
							onChange={(e) => update("end_year", e.target.value)}
							placeholder="Blank = current"
						/>
						{form.end_year && !endYearValid && (
							<p className="text-xs text-red-500 mt-1">
								Year must be between {minYear} and {maxYear}
							</p>
						)}
					</div>
				</div>
			</div>
			<div className="flex justify-end gap-2 mt-4">
				<Button variant="outline" onClick={() => onOpenChange(false)}>
					Cancel
				</Button>
				<Button
					onClick={handleSave}
					disabled={
						isPending || !form.position_title || !form.start_year || !yearsValid
					}
				>
					{isPending ? "Saving..." : "Save"}
				</Button>
			</div>
		</ResponsiveModal>
	);
};

export default EmploymentEntryModal;
