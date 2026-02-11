import { ClickToEditBadge } from "@/shared/components/ClickToEditBadge";
import { RichTextDisplay } from "@/shared/components/editor";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@/shared/components/ui/card";
import type { IUserData, IUserMe } from "@/shared/types/user.types";
import { useState } from "react";
import { UserAvatar } from "./UserAvatar";

interface ProfileSectionProps {
	user: IUserData | IUserMe;
	onClick?: () => void;
}

/**
 * ProfileSection component
 * Displays user's profile information (avatar, about, expertise)
 * Clickable to open edit modal
 *
 * @param user - User data to display
 * @param onClick - Callback when section is clicked
 */
export const ProfileSection = ({ user, onClick }: ProfileSectionProps) => {
	const [isHovered, setIsHovered] = useState(false);

	return (
		<Card
			className={
				onClick ? "cursor-pointer transition-shadow hover:shadow-md" : ""
			}
			onClick={onClick}
			onMouseEnter={() => setIsHovered(true)}
			onMouseLeave={() => setIsHovered(false)}
		>
			<CardHeader>
				<div className="flex items-center justify-between">
					<CardTitle className="text-lg font-bold">Profile</CardTitle>
					{onClick && <ClickToEditBadge isVisible={isHovered} />}
				</div>
			</CardHeader>
			<CardContent className="space-y-6">
				<p className="text-xs text-muted-foreground">
					Your profile image, about section, and expertise. This information is
					visible to other users within SPMS
					{"is_staff" in user && user.is_staff
						? " and will appear on your public staff profile when visibility is enabled"
						: ""}
					.
				</p>
				{/* Avatar */}
				<div className="flex justify-center">
					<UserAvatar user={user} size="3xl" />
				</div>

				{/* About */}
				<div>
					<h4 className="text-sm font-medium mb-2">About</h4>
					{user.about ? (
						<div className="text-sm text-muted-foreground">
							<RichTextDisplay content={user.about} />
						</div>
					) : (
						<p className="text-sm text-muted-foreground italic">
							(Not Provided)
						</p>
					)}
				</div>

				{/* Expertise */}
				<div>
					<h4 className="text-sm font-medium mb-2">Expertise</h4>
					{user.expertise ? (
						<div className="text-sm text-muted-foreground">
							<RichTextDisplay content={user.expertise} />
						</div>
					) : (
						<p className="text-sm text-muted-foreground italic">
							(Not Provided)
						</p>
					)}
				</div>
			</CardContent>
		</Card>
	);
};
