import { Button } from "@/shared/components/ui/button";
import { Pencil, ChevronDown } from "lucide-react";

interface EditProjectButtonProps {
	onClick: () => void;
	className?: string;
}

/**
 * EditProjectButton component
 *
 * Displays "Edit Project" dropdown menu button.
 * Includes pencil icon and dropdown caret for visual clarity.
 * Fully keyboard accessible with proper button semantics.
 */
export function EditProjectButton({
	onClick,
	className,
}: EditProjectButtonProps) {
	return (
		<Button
			type="button"
			variant="outline"
			size="lg"
			onClick={onClick}
			className={className}
		>
			<Pencil className="mr-2 h-4 w-4" />
			Edit Project
			<ChevronDown className="ml-2 h-4 w-4" />
		</Button>
	);
}
