import type { ReactNode } from "react";
import { CrudHeader } from "./CrudHeader";
import { CrudSearchInput } from "./CrudSearchInput";
import { Spinner } from "@/shared/components/ui/spinner";
import { Alert, AlertDescription } from "@/shared/components/ui/alert";
import { AlertCircle } from "lucide-react";

export interface ColumnDef {
	header: string;
	accessor: string;
	className?: string;
}

interface CrudListLayoutProps<T> {
	title: string;
	itemCount: number;
	searchPlaceholder: string;
	searchValue: string;
	onSearchChange: (value: string) => void;
	onAddClick: () => void;
	addButtonLabel?: string;
	/** Additional action buttons rendered alongside the Add button */
	extraActions?: ReactNode;
	/** Filter controls rendered between search and table */
	filterContent?: ReactNode;
	columns: ColumnDef[];
	data: T[];
	renderRow: (item: T) => ReactNode;
	isLoading: boolean;
	error: Error | null;
	emptyMessage?: string;
}

export function CrudListLayout<T>({
	title,
	itemCount,
	searchPlaceholder,
	searchValue,
	onSearchChange,
	onAddClick,
	addButtonLabel,
	extraActions,
	filterContent,
	columns,
	data,
	renderRow,
	isLoading,
	error,
	emptyMessage = "No results found.",
}: CrudListLayoutProps<T>) {
	return (
		<div className="space-y-4">
			<CrudHeader
				title={title}
				itemCount={itemCount}
				onAddClick={onAddClick}
				addButtonLabel={addButtonLabel}
				extraActions={extraActions}
			/>

			<CrudSearchInput
				value={searchValue}
				onChange={onSearchChange}
				placeholder={searchPlaceholder}
			/>

			{filterContent && <div className="py-1">{filterContent}</div>}

			{isLoading && (
				<div className="flex justify-center py-12">
					<Spinner className="size-8" />
				</div>
			)}

			{error && (
				<Alert variant="destructive">
					<AlertCircle className="size-4" />
					<AlertDescription>{error.message}</AlertDescription>
				</Alert>
			)}

			{!isLoading && !error && (
				<div className="overflow-x-auto rounded-md border">
					<table className="w-full text-sm">
						<thead className="border-b bg-muted/50">
							<tr>
								{columns.map((col) => (
									<th
										key={col.accessor}
										className={`px-4 py-3 text-left font-medium ${col.className ?? ""}`}
									>
										{col.header}
									</th>
								))}
							</tr>
						</thead>
						<tbody>
							{data.length === 0 ? (
								<tr>
									<td
										colSpan={columns.length}
										className="text-muted-foreground px-4 py-8 text-center"
									>
										{emptyMessage}
									</td>
								</tr>
							) : (
								data.map((item) => renderRow(item))
							)}
						</tbody>
					</table>
				</div>
			)}
		</div>
	);
}
