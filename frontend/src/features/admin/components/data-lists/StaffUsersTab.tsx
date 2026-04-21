import { UserCheck } from "lucide-react";

/** Placeholder for the Staff Users tab */
export function StaffUsersTab() {
	return (
		<div className="flex flex-col items-center justify-center py-12 text-center">
			<UserCheck className="size-10 text-gray-400 dark:text-gray-500 mb-3" />
			<p className="text-gray-500 dark:text-gray-400">
				Staff users will be displayed here.
			</p>
		</div>
	);
}
