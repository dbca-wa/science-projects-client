import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@/shared/components/ui/card";
import { Eye, EyeOff } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import type { IUserMe } from "@/shared/types/user.types";

interface PublicAppearanceSectionProps {
	user: IUserMe;
	onClick?: () => void;
}

/**
 * PublicAppearanceSection component
 * Displays user's public staff profile visibility status
 * Clickable to toggle visibility
 *
 * @param user - User data to display
 * @param onClick - Callback when section is clicked
 */
export const PublicAppearanceSection = ({
	user,
	onClick,
}: PublicAppearanceSectionProps) => {
	const [isHovered, setIsHovered] = useState(false);
	const isVisible = !user.staff_profile_hidden;

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
					<CardTitle>Public Appearance</CardTitle>
					{onClick && (
						<motion.span
							initial={{ opacity: 0 }}
							animate={{ opacity: isHovered ? 1 : 0 }}
							transition={{ duration: 0.2 }}
							className="text-sm text-muted-foreground"
						>
							Click to toggle
						</motion.span>
					)}
				</div>
			</CardHeader>
			<CardContent className="space-y-4">
				{/* Staff Profile Visibility */}
				<div className="flex items-start gap-3">
					{isVisible ? (
						<Eye className="size-4 mt-0.5 text-muted-foreground" />
					) : (
						<EyeOff className="size-4 mt-0.5 text-muted-foreground" />
					)}
					<div className="flex-1 min-w-0">
						<p className="text-sm font-medium">Staff Profile Visibility</p>
						<p className="text-sm text-muted-foreground">
							{isVisible ? (
								<>
									Your profile is{" "}
									<span className="font-medium text-foreground">visible</span>{" "}
									on the public staff directory
								</>
							) : (
								<>
									Your profile is{" "}
									<span className="font-medium text-foreground">hidden</span>{" "}
									from the public staff directory
								</>
							)}
						</p>
					</div>
				</div>

				{/* Description */}
				<div className="text-sm text-muted-foreground">
					{isVisible ? (
						<p>
							Your profile appears in the public staff directory. Other users
							can view your contact information and expertise.
						</p>
					) : (
						<p>
							Your profile is hidden from the public staff directory. Only
							administrators can view your full profile.
						</p>
					)}
				</div>
			</CardContent>
		</Card>
	);
};
