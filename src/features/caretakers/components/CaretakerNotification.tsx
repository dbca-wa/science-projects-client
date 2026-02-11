import { Link } from "react-router";
import { Users, ChevronRight } from "lucide-react";
import { Alert, AlertDescription } from "@/shared/components/ui/alert";
import type { ICaretakerSimpleUserData } from "@/shared/types/user.types";

interface CaretakerNotificationProps {
	caretakers: ICaretakerSimpleUserData[];
}

/**
 * CaretakerNotification - Shows when user has active caretakers
 *
 * Displays a notification banner when the user has one or more active caretakers.
 * Links to the caretaker mode page for full details.
 */
export const CaretakerNotification = ({
	caretakers,
}: CaretakerNotificationProps) => {
	if (!caretakers || caretakers.length === 0) {
		return null;
	}

	const caretakerCount = caretakers.length;
	const caretakerNames = caretakers
		.map((c) => `${c.display_first_name} ${c.display_last_name}`)
		.join(", ");

	return (
		<Link to="/users/me/caretaker" className="block mt-4">
			<Alert className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors cursor-pointer">
				<Users className="size-4 text-blue-600 dark:text-blue-400" />
				<AlertDescription className="flex items-center justify-between gap-2">
					<div className="flex-1">
						<span className="font-semibold text-blue-900 dark:text-blue-100">
							{caretakerCount === 1
								? "You have a caretaker"
								: `You have ${caretakerCount} caretakers`}
						</span>
						<span className="text-blue-700 dark:text-blue-300 ml-2">
							{caretakerCount === 1
								? `${caretakerNames} is managing work on your behalf`
								: `${caretakerNames} are managing work on your behalf`}
						</span>
					</div>
					<ChevronRight className="size-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
				</AlertDescription>
			</Alert>
		</Link>
	);
};
