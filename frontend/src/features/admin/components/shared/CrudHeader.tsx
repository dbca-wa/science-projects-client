import type { ReactNode } from "react";
import { Button } from "@/shared/components/ui/button";
import { Plus } from "lucide-react";

interface CrudHeaderProps {
	title: string;
	itemCount: number;
	onAddClick: () => void;
	addButtonLabel?: string;
	/** Additional action buttons rendered alongside the Add button */
	extraActions?: ReactNode;
}

export function CrudHeader({
	title,
	itemCount,
	onAddClick,
	addButtonLabel = "Add",
	extraActions,
}: CrudHeaderProps) {
	return (
		<div className="flex items-center justify-between">
			<h1 className="text-2xl font-bold tracking-tight">
				{title}{" "}
				<span className="text-muted-foreground text-lg font-normal">
					({itemCount})
				</span>
			</h1>
			<div className="flex items-center gap-2">
				{extraActions}
				<Button
					onClick={onAddClick}
					className="bg-green-600 hover:bg-green-700"
				>
					<Plus className="mr-1 size-4" />
					{addButtonLabel}
				</Button>
			</div>
		</div>
	);
}
