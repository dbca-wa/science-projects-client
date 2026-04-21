import { useState, useMemo } from "react";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import {
	useCreateEducationEntry,
	useUpdateEducationEntry,
} from "../../hooks/useStaffProfileMutations";
import type { IEducationEntry } from "../../types/staff-profile.types";
import ResponsiveModal from "./ResponsiveModal";

interface EducationEntryModalProps {
	profilePk: number;
	entry?: IEducationEntry;
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

const getInitialEducationForm = (entry?: IEducationEntry) => ({
	qualification_name: entry?.qualification_name || "",
	institution: entry?.institution || "",
	location: entry?.location || "",
	end_year: entry?.end_year?.toString() || "",
});

const EducationEntryModal = ({
	profilePk,
	entry,
	open,
	onOpenChange,
}: EducationEntryModalProps) => {
	const isEdit = !!entry;
	const initialForm = useMemo(() => getInitialEducationForm(entry), [entry]);
	const [form, setForm] = useState(initialForm);

	// Reset form when initialForm changes (modal opens/entry changes)
	if (form !== initialForm && !open) {
		setForm(initialForm);
	}
	// Sync form when modal opens with new data
	const formKey = `${entry?.id ?? "new"}-${open}`;
	const [prevKey, setPrevKey] = useState(formKey);
	if (formKey !== prevKey) {
		setPrevKey(formKey);
		setForm(initialForm);
	}

	const createMutation = useCreateEducationEntry(profilePk);
	const updateMutation = useUpdateEducationEntry(profilePk);
	const isPending = createMutation.isPending || updateMutation.isPending;

	const currentYear = new Date().getFullYear();
	const minYear = currentYear - 100;

	const endYearValid =
		!form.end_year ||
		(!isNaN(parseInt(form.end_year, 10)) &&
			parseInt(form.end_year, 10) >= minYear &&
			parseInt(form.end_year, 10) <= currentYear);

	const handleSave = () => {
		const data = {
			qualification_name: form.qualification_name,
			institution: form.institution,
			location: form.location,
			end_year: parseInt(form.end_year, 10),
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
			title={`${isEdit ? "Edit" : "Add"} Qualification`}
			open={open}
			onOpenChange={onOpenChange}
		>
			<div className="space-y-4">
				<div>
					<Label htmlFor="qualification_name">Qualification</Label>
					<Input
						id="qualification_name"
						value={form.qualification_name}
						onChange={(e) => update("qualification_name", e.target.value)}
					/>
				</div>
				<div>
					<Label htmlFor="institution">Institution</Label>
					<Input
						id="institution"
						value={form.institution}
						onChange={(e) => update("institution", e.target.value)}
					/>
				</div>
				<div>
					<Label htmlFor="location">Location</Label>
					<Input
						id="location"
						value={form.location}
						onChange={(e) => update("location", e.target.value)}
					/>
				</div>
				<div>
					<Label htmlFor="end_year">Year Completed</Label>
					<Input
						id="end_year"
						type="number"
						min={minYear}
						max={currentYear}
						value={form.end_year}
						onChange={(e) => update("end_year", e.target.value)}
					/>
					{form.end_year && !endYearValid && (
						<p className="text-xs text-red-500 mt-1">
							Year must be between {minYear} and {currentYear}
						</p>
					)}
				</div>
			</div>
			<div className="flex justify-end gap-2 mt-4">
				<Button variant="outline" onClick={() => onOpenChange(false)}>
					Cancel
				</Button>
				<Button
					onClick={handleSave}
					disabled={
						isPending ||
						!form.qualification_name ||
						!form.institution ||
						!form.end_year ||
						!endYearValid
					}
				>
					{isPending ? "Saving..." : "Save"}
				</Button>
			</div>
		</ResponsiveModal>
	);
};

export default EducationEntryModal;
