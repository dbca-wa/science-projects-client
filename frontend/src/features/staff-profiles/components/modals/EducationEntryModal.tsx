import { useState } from "react";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import {
	useCreateEducationEntry,
	useUpdateEducationEntry,
} from "../../hooks/useStaffProfileMutations";
import type { IEducationEntry } from "../../types/staff-profile.types";

interface EducationEntryModalProps {
	profilePk: number;
	entry?: IEducationEntry;
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

const EducationEntryModal = ({
	profilePk,
	entry,
	open,
	onOpenChange,
}: EducationEntryModalProps) => {
	const isEdit = !!entry;
	const [form, setForm] = useState({
		qualification_name: entry?.qualification_name || "",
		institution: entry?.institution || "",
		location: entry?.location || "",
		end_year: entry?.end_year?.toString() || "",
	});

	const createMutation = useCreateEducationEntry(profilePk);
	const updateMutation = useUpdateEducationEntry(profilePk);
	const isPending = createMutation.isPending || updateMutation.isPending;

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
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-[500px]">
				<DialogHeader>
					<DialogTitle>{isEdit ? "Edit" : "Add"} Education Entry</DialogTitle>
				</DialogHeader>
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
							value={form.end_year}
							onChange={(e) => update("end_year", e.target.value)}
						/>
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
							!form.end_year
						}
					>
						{isPending ? "Saving..." : "Save"}
					</Button>
				</div>
			</DialogContent>
		</Dialog>
	);
};

export default EducationEntryModal;
