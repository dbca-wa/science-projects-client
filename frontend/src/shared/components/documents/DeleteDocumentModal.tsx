import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "../ui/alert-dialog";
import { AlertTriangle } from "lucide-react";
import type { DocumentType } from "@/shared/utils/document.utils";

interface DeleteDocumentModalProps {
	isOpen: boolean;
	onClose: () => void;
	onConfirm: () => void;
	documentType: DocumentType;
	isDeleting?: boolean;
}

export function DeleteDocumentModal({
	isOpen,
	onClose,
	onConfirm,
	documentType,
	isDeleting = false,
}: DeleteDocumentModalProps) {
	const docTypeName = documentType.replace(/_/g, " ");

	return (
		<AlertDialog open={isOpen} onOpenChange={onClose}>
			<AlertDialogContent>
				<AlertDialogHeader>
					<div className="flex items-center gap-3">
						<div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10">
							<AlertTriangle className="h-5 w-5 text-destructive" />
						</div>
						<AlertDialogTitle>Delete {docTypeName}?</AlertDialogTitle>
					</div>
					<AlertDialogDescription className="pt-3">
						This action cannot be undone. This will permanently delete the{" "}
						{docTypeName} and all associated data.
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
					<AlertDialogAction
						onClick={onConfirm}
						disabled={isDeleting}
						className="bg-destructive hover:bg-destructive/90 focus-visible:ring-destructive"
					>
						{isDeleting ? "Deleting..." : "Delete"}
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}
