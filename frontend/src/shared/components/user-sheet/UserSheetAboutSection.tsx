/**
 * UserSheetAboutSection Component
 *
 * Reusable about/expertise section for user detail sheets.
 * Displays HTML content with fallback for empty fields.
 */

import { SectionContainer } from "./SectionContainer";
import { getStyledHtmlOrFallback } from "@/shared/utils/html-display.utils";
import type { IUserData } from "@/shared/types/user.types";

interface UserSheetAboutSectionProps {
	user: IUserData;
}

export function UserSheetAboutSection({ user }: UserSheetAboutSectionProps) {
	return (
		<SectionContainer>
			<p className="font-bold text-sm mb-1 text-gray-600 dark:text-gray-300">
				About
			</p>
			<div
				className="mt-1"
				dangerouslySetInnerHTML={{
					__html: getStyledHtmlOrFallback(user.about),
				}}
			/>
			<p className="font-bold text-sm mb-1 mt-4 text-gray-600 dark:text-gray-300">
				Expertise
			</p>
			<div
				className="mt-1"
				dangerouslySetInnerHTML={{
					__html: getStyledHtmlOrFallback(user.expertise),
				}}
			/>
		</SectionContainer>
	);
}
