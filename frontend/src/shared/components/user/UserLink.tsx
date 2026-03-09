import { useState } from "react";
import { DocumentUserSheet } from "./DocumentUserSheet";
import { LINK_COLOR } from "@/shared/constants/colors";

interface UserLinkProps {
	userId: number;
	displayName: string;
}

/**
 * UserLink Component
 *
 * Clickable user name that opens DocumentUserSheet on click.
 * Uses consistent link color across the application.
 *
 * Used in:
 * - DocumentDetailsSection (Created By, Modified By)
 * - CommentCard (comment author)
 */
export function UserLink({ userId, displayName }: UserLinkProps) {
	const [isOpen, setIsOpen] = useState(false);

	return (
		<>
			<button
				type="button"
				onClick={() => setIsOpen(true)}
				className="cursor-pointer hover:underline focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2"
				style={{ color: LINK_COLOR }}
			>
				{displayName}
			</button>
			<DocumentUserSheet
				userId={userId}
				open={isOpen}
				onClose={() => setIsOpen(false)}
			/>
		</>
	);
}
