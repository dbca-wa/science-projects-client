/**
 * InsertTableDialog Component
 *
 * Dialog for inserting tables with custom row and column counts.
 * Validates input to ensure reasonable table sizes.
 */

import React, { useState, useMemo } from "react";
import { Button } from "@/shared/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/shared/components/ui/dialog";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";

interface InsertTableDialogProps {
	isOpen: boolean;
	onClose: () => void;
	onInsert: (rows: number, columns: number) => void;
}

export const InsertTableDialog: React.FC<InsertTableDialogProps> = ({
	isOpen,
	onClose,
	onInsert,
}) => {
	const [rows, setRows] = useState("3");
	const [columns, setColumns] = useState("3");

	// Derive validation state from rows and columns
	const isValid = useMemo(() => {
		const rowNum = Number(rows);
		const colNum = Number(columns);

		// Validate: rows 1-11, columns 1-7
		return (
			rowNum > 0 &&
			rowNum <= 11 &&
			colNum > 0 &&
			colNum <= 7 &&
			!isNaN(rowNum) &&
			!isNaN(colNum)
		);
	}, [rows, columns]);

	const handleInsert = () => {
		if (isValid) {
			onInsert(Number(rows), Number(columns));
			onClose();
			// Reset to defaults
			setRows("3");
			setColumns("3");
		}
	};

	const handleCancel = () => {
		onClose();
		// Reset to defaults
		setRows("3");
		setColumns("3");
	};

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Insert Table</DialogTitle>
					<DialogDescription>
						Specify the number of rows and columns for your table.
					</DialogDescription>
				</DialogHeader>

				<div className="grid gap-4 py-4">
					<div className="grid gap-2">
						<Label htmlFor="table-rows">Rows</Label>
						<Input
							id="table-rows"
							type="number"
							min="1"
							max="11"
							placeholder="Number of rows (1-11)"
							value={rows}
							onChange={(e) => setRows(e.target.value)}
							onKeyDown={(e) => {
								if (e.key === "Enter" && isValid) {
									e.preventDefault();
									handleInsert();
								}
							}}
							autoFocus
						/>
						<p className="text-xs text-muted-foreground">
							Maximum 11 rows (including header)
						</p>
					</div>

					<div className="grid gap-2">
						<Label htmlFor="table-columns">Columns</Label>
						<Input
							id="table-columns"
							type="number"
							min="1"
							max="7"
							placeholder="Number of columns (1-7)"
							value={columns}
							onChange={(e) => setColumns(e.target.value)}
							onKeyDown={(e) => {
								if (e.key === "Enter" && isValid) {
									e.preventDefault();
									handleInsert();
								}
							}}
						/>
						<p className="text-xs text-muted-foreground">Maximum 7 columns</p>
					</div>
				</div>

				<DialogFooter className="gap-2">
					<Button type="button" variant="outline" onClick={handleCancel}>
						Cancel
					</Button>
					<Button type="button" onClick={handleInsert} disabled={!isValid}>
						Insert Table
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};
