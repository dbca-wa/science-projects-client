import { Mail } from "lucide-react";

/** Placeholder for the Email List tab */
export function EmailListTab() {
	return (
		<div className="flex flex-col items-center justify-center py-12 text-center">
			<Mail className="size-10 text-gray-400 dark:text-gray-500 mb-3" />
			<p className="text-gray-500 dark:text-gray-400">
				Email list will be displayed here.
			</p>
		</div>
	);
}
