import { FileText } from "lucide-react";

/** Placeholder for the Unapproved Documents tab */
export function UnapprovedDocsTab() {
	return (
		<div className="flex flex-col items-center justify-center py-12 text-center">
			<FileText className="size-10 text-gray-400 dark:text-gray-500 mb-3" />
			<p className="text-gray-500 dark:text-gray-400">
				Unapproved documents will be displayed here.
			</p>
		</div>
	);
}
