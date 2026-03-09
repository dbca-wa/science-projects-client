/**
 * UserSheetHeader Component
 *
 * Reusable header for user detail sheets showing avatar, name, contact info,
 * and copy email button.
 */

import {
	Avatar,
	AvatarFallback,
	AvatarImage,
} from "@/shared/components/ui/avatar";
import { Button } from "@/shared/components/ui/button";
import { Copy } from "lucide-react";
import { toast } from "sonner";
import {
	getUserDisplayName,
	getUserInitials,
	getUserPhone,
	getUserEmail,
	hasValidEmail,
} from "@/shared/utils/user.utils";
import { getImageUrl } from "@/shared/utils/image.utils";
import type { IUserData } from "@/shared/types/user.types";

interface UserSheetHeaderProps {
	user: IUserData;
}

export function UserSheetHeader({ user }: UserSheetHeaderProps) {
	const handleCopyEmail = () => {
		const email = getUserEmail(user);
		if (email) {
			navigator.clipboard.writeText(email);
			toast.success("Email copied to clipboard");
		}
	};

	return (
		<div className="flex gap-4 mb-4">
			<Avatar className="size-24">
				<AvatarImage src={getImageUrl(user.image)} />
				<AvatarFallback>{getUserInitials(user)}</AvatarFallback>
			</Avatar>

			<div className="flex-1 flex flex-col justify-center overflow-auto">
				<p className="font-bold text-base">{getUserDisplayName(user)}</p>
				<p className="text-sm">{getUserPhone(user)}</p>
				<div className="flex items-center gap-2">
					<p className="text-sm">{getUserEmail(user)}</p>
				</div>
				{hasValidEmail(user) && (
					<Button
						size="sm"
						variant="ghost"
						onClick={handleCopyEmail}
						className="mt-2 w-fit px-4 bg-blue-500 hover:bg-blue-400 text-white"
					>
						<Copy className="size-4 mr-2" />
						Copy Email
					</Button>
				)}
			</div>
		</div>
	);
}
