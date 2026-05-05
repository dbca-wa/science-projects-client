import { useState } from "react";
import { Button } from "@/shared/components/ui/button";
import { FormRichTextEditor } from "@/shared/components/editor/FormRichTextEditor";
import { useUpdateOverview } from "../../hooks/useStaffProfileMutations";
import ResponsiveModal from "./ResponsiveModal";

interface EditOverviewFieldModalProps {
	profilePk: number;
	field: "about" | "expertise";
	title: string;
	currentValue: string | null;
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

const EditOverviewFieldModal = ({
	profilePk,
	field,
	title,
	currentValue,
	open,
	onOpenChange,
}: EditOverviewFieldModalProps) => {
	const [value, setValue] = useState(currentValue || "");
	const mutation = useUpdateOverview(profilePk);

	const handleSave = () => {
		mutation.mutate(
			{ [field]: value },
			{ onSuccess: () => onOpenChange(false) }
		);
	};

	return (
		<ResponsiveModal
			title={`Edit ${title}`}
			open={open}
			onOpenChange={onOpenChange}
			maxWidth="sm:max-w-[700px]"
		>
			<div className="max-h-[500px] overflow-y-auto">
				<FormRichTextEditor
					value={value}
					onChange={setValue}
					placeholder={`Enter your ${title.toLowerCase()}...`}
					toolbar="profile"
					wordLimit={1000}
				/>
			</div>
			<div className="flex justify-end gap-2 mt-4">
				<Button variant="outline" onClick={() => onOpenChange(false)}>
					Cancel
				</Button>
				<Button onClick={handleSave} disabled={mutation.isPending}>
					{mutation.isPending ? "Saving..." : "Save"}
				</Button>
			</div>
		</ResponsiveModal>
	);
};

export default EditOverviewFieldModal;
