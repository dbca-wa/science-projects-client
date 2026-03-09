/**
 * TableButton Component
 *
 * Toolbar button for inserting tables with custom row/column selection.
 * Opens a dialog for specifying table dimensions.
 */

import React, { useState } from "react";
import { Table } from "lucide-react";
import { BaseToolbarButton } from "./BaseToolbarButton";
import { InsertTableDialog } from "../dialogs/InsertTableDialog";
import type { TableButtonProps } from "@/shared/types/editor.types";

export const TableButton: React.FC<TableButtonProps> = ({
	disabled = false,
	onInsertTable,
}) => {
	const [isDialogOpen, setIsDialogOpen] = useState(false);

	const handleInsert = (rows: number, columns: number) => {
		onInsertTable(rows, columns);
	};

	return (
		<>
			<BaseToolbarButton
				icon={Table}
				label="Insert table"
				onClick={() => setIsDialogOpen(true)}
				disabled={disabled}
			/>

			<InsertTableDialog
				isOpen={isDialogOpen}
				onClose={() => setIsDialogOpen(false)}
				onInsert={handleInsert}
			/>
		</>
	);
};
