import { Loader2 } from "lucide-react";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
	DialogFooter,
} from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
import { useAffiliationClean } from "../../hooks/useAffiliations";

interface AffiliationCleanDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export function AffiliationCleanDialog({
	open,
	onOpenChange,
}: AffiliationCleanDialogProps) {
	const cleanMutation = useAffiliationClean();

	const handleClean = () => {
		cleanMutation.mutate(undefined, {
			onSuccess: () => onOpenChange(false),
		});
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Clean Orphaned Affiliations</DialogTitle>
					<DialogDescription>
						This will remove all affiliations that have no links to any projects
						or users.
					</DialogDescription>
				</DialogHeader>

				<p className="text-sm text-orange-600 dark:text-orange-400">
					Warning: This action cannot be undone. Orphaned affiliations will be
					permanently deleted.
				</p>

				<DialogFooter>
					<Button
						variant="outline"
						onClick={() => onOpenChange(false)}
						disabled={cleanMutation.isPending}
					>
						Cancel
					</Button>
					<Button
						onClick={handleClean}
						disabled={cleanMutation.isPending}
						className="bg-blue-600 hover:bg-blue-700"
					>
						{cleanMutation.isPending && (
							<Loader2 className="mr-2 size-4 animate-spin" />
						)}
						Clean
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
