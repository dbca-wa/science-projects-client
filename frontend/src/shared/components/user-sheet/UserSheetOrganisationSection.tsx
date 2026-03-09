/**
 * UserSheetOrganisationSection Component
 *
 * Reusable organisation/agency section for user detail sheets.
 * Shows DBCA logo + branch + business area for staff, or external user message.
 */

import { SectionContainer } from "./SectionContainer";
import type { IUserData } from "@/shared/types/user.types";

interface UserSheetOrganisationSectionProps {
	user: IUserData;
}

export function UserSheetOrganisationSection({
	user,
}: UserSheetOrganisationSectionProps) {
	const isStaff = user.is_staff;

	return (
		<SectionContainer>
			<div className="flex flex-col p-2">
				{isStaff && (
					<div className="flex h-[60px]">
						<img
							src="/dbca.jpg"
							alt="Agency logo"
							className="rounded-lg size-[75px] object-cover pointer-events-none select-none"
						/>
						<div className="flex ml-3 flex-col justify-center">
							<p className="font-bold text-gray-600 dark:text-gray-300">
								Department of Biodiversity, Conservation and Attractions
							</p>
							<p className="text-sm text-gray-600 dark:text-gray-400">
								{user.branch?.name
									? `${user.branch.name} Branch`
									: "Branch not set"}
							</p>
							<p className="text-sm text-blue-600 dark:text-gray-400">
								{user.business_area?.name ? (
									<>{user.business_area.name}</>
								) : (
									"Business Area not set"
								)}
							</p>
						</div>
					</div>
				)}
				{!isStaff && (
					<p className="text-gray-600 dark:text-gray-300">
						<b>External User</b> - This user does not belong to DBCA
					</p>
				)}
			</div>
		</SectionContainer>
	);
}
