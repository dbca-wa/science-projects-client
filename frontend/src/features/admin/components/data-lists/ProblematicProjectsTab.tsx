import { AlertTriangle } from "lucide-react";

/** Placeholder for the Problematic Projects tab */
export function ProblematicProjectsTab() {
	return (
		<div className="flex flex-col items-center justify-center py-12 text-center">
			<AlertTriangle className="size-10 text-gray-400 dark:text-gray-500 mb-3" />
			<p className="text-gray-500 dark:text-gray-400">
				Problematic projects will be displayed here.
			</p>
		</div>
	);
}
