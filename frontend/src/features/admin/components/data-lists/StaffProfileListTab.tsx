import { Users } from "lucide-react";

/** Placeholder for the Staff Profile List tab */
export function StaffProfileListTab() {
	return (
		<div className="flex flex-col items-center justify-center py-12 text-center">
			<Users className="size-10 text-gray-400 dark:text-gray-500 mb-3" />
			<p className="text-gray-500 dark:text-gray-400">
				Staff profile list will be displayed here.
			</p>
		</div>
	);
}
