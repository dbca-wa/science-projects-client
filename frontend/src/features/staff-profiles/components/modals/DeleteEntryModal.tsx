import { Button } from "@/shared/components/ui/button";
import ResponsiveModal from "./ResponsiveModal";

interface DeleteEntryModalProps {
	title: string;
	description: string;
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onConfirm: () => void;
	isPending: boolean;
}

const DeleteEntryModal = ({
	title,
	description,
	open,
	onOpenChange,
	onConfirm,
	isPending,
}: DeleteEntryModalProps) => {
	return (
		<ResponsiveModal
			title={title}
			open={open}
			onOpenChange={onOpenChange}
			maxWidth="sm:max-w-[400px]"
		>
			<p className="text-sm text-muted-foreground mb-4">{description}</p>
			<div className="flex justify-end gap-2">
				<Button variant="outline" onClick={() => onOpenChange(false)}>
					Cancel
				</Button>
				<Button variant="destructive" onClick={onConfirm} disabled={isPending}>
					{isPending ? "Deleting..." : "Delete"}
				</Button>
			</div>
		</ResponsiveModal>
	);
};

export default DeleteEntryModal;
