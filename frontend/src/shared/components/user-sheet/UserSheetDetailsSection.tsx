/**
 * UserSheetDetailsSection Component
 *
 * Reusable details section showing Active/Staff/Admin status with checkmarks.
 */

import { Check } from "lucide-react";
import { AiFillCloseCircle } from "react-icons/ai";
import { SectionContainer } from "./SectionContainer";
import { formatDetailedDateTime } from "@/shared/utils/date.utils";
import type { IUserData } from "@/shared/types/user.types";

interface UserSheetDetailsSectionProps {
	user: IUserData;
	showJoinedDate?: boolean;
}

export function UserSheetDetailsSection({
	user,
	showJoinedDate = false,
}: UserSheetDetailsSectionProps) {
	return (
		<SectionContainer>
			<p className="font-bold text-sm mb-1 text-gray-600 dark:text-gray-300">
				Details
			</p>

			{showJoinedDate && (
				<div className="grid grid-cols-2 gap-2 text-sm mb-4">
					<span className="text-muted-foreground">Joined:</span>
					<span className="text-right">
						{user.date_joined
							? formatDetailedDateTime(user.date_joined)
							: "N/A"}
					</span>
				</div>
			)}

			<div className="mt-4 rounded-xl p-4 bg-gray-50 dark:bg-gray-600">
				<div className="grid grid-cols-3 gap-3 w-full">
					{/* Active Status */}
					<div className="flex flex-col justify-center items-center">
						<p className="mb-2 font-bold text-gray-500 dark:text-gray-400 text-sm">
							Active?
						</p>
						{user.is_active ? (
							<Check className="size-6 text-green-500" />
						) : (
							<AiFillCloseCircle className="size-6 text-red-500 dark:text-red-600" />
						)}
					</div>

					{/* Staff Status */}
					<div className="flex flex-col justify-center items-center">
						<p className="mb-2 font-bold text-gray-500 dark:text-gray-400 text-sm">
							Staff?
						</p>
						{user.is_staff ? (
							<Check className="size-6 text-green-500" />
						) : (
							<AiFillCloseCircle className="size-6 text-red-500 dark:text-red-600" />
						)}
					</div>

					{/* Admin Status */}
					<div className="flex flex-col justify-center items-center">
						<p className="mb-2 font-bold text-gray-500 dark:text-gray-400 text-sm">
							Admin?
						</p>
						{user.is_superuser ? (
							<Check className="size-6 text-green-500" />
						) : (
							<AiFillCloseCircle className="size-6 text-red-500 dark:text-red-600" />
						)}
					</div>
				</div>
			</div>
		</SectionContainer>
	);
}
