/**
 * DataTableEmpty Component
 * 
 * Empty state display for DataTable when no data is available.
 */

interface DataTableEmptyProps {
	message: string;
}

export function DataTableEmpty({ message }: DataTableEmptyProps) {
	return (
		<div className="rounded-lg border border-gray-200 dark:border-gray-700 p-8 text-center">
			<div className="text-gray-500 dark:text-gray-400">{message}</div>
		</div>
	);
}
