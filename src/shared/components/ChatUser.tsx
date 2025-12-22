// Display of users above their message in chat route

import type { IBranch, IBusinessArea, IImageData, IUserData } from "@/shared/types";
import { type FC, memo, useState } from "react";
import { UserProfile } from "@/features/users/components/UserProfile";
import { useColorMode } from "@/shared/utils/theme.utils";
import { Sheet, SheetContent, SheetTrigger } from "@/shared/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/components/ui/avatar";

interface ChatUserProps {
	baseAPI: string;
	displayName: string;
	user: IUserData;
	otherUser: boolean;
	avatarSrc: IImageData | null;
	withoutName?: boolean;
	nameCentered?: boolean;
	iconSize?: "xs" | "sm" | "md" | "lg" | "xl";
	displayDate?: string;
	//   created_at?: string;
	//   updated_at?: string;

	businessAreas: IBusinessArea[];
	branches: IBranch[];
	usernameColour?: string;
}

const getAvatarSize = (size?: string) => {
	switch (size) {
		case "xs": return "h-6 w-6";
		case "sm": return "h-8 w-8";
		case "md": return "h-10 w-10";
		case "lg": return "h-12 w-12";
		case "xl": return "h-16 w-16";
		default: return "h-10 w-10";
	}
};

export const ChatUser: FC<ChatUserProps> = memo(
	({
		baseAPI,
		displayName,
		avatarSrc,
		user,
		otherUser,
		iconSize,
		withoutName,
		displayDate,
		// created_at,
		// updated_at,
		businessAreas,
		branches,
		nameCentered,
		usernameColour,
	}) => {
		const { colorMode } = useColorMode();

		// Replace useDisclosure with React state
		const [isUserOpen, setIsUserOpen] = useState(false);
		const onUserOpen = () => setIsUserOpen(true);
		const onUserClose = () => setIsUserOpen(false);

		const openUserDrawer = () => {
			onUserOpen();
		};

		const avatarUrl = avatarSrc?.file
			? avatarSrc?.file?.startsWith("http")
				? `${avatarSrc?.file}`
				: `${baseAPI}${avatarSrc?.file}`
			: avatarSrc?.old_file
				? avatarSrc?.old_file
				: undefined;

		return (
			<>
				<Sheet open={isUserOpen} onOpenChange={setIsUserOpen}>
					<SheetContent className="w-full sm:max-w-sm">
						<UserProfile
							pk={user.pk}
							branches={branches}
							businessAreas={businessAreas}
						/>
					</SheetContent>
				</Sheet>
				
				<div
					className={`flex flex-row mt-2 ${
						displayName === "You" ? "self-end" : "self-start"
					}`}
				>
					{!withoutName ? (
						<div className="flex w-full">
							<Avatar className={`${getAvatarSize(iconSize)} mr-2 select-none pointer-events-none`}>
								<AvatarImage 
									src={avatarUrl}
									draggable={false}
								/>
								<AvatarFallback>{displayName.charAt(0).toUpperCase()}</AvatarFallback>
							</Avatar>
							<div
								className={`pl-1 pr-0 w-full h-full flex justify-between pr-10 ${
									nameCentered === true ? "items-center" : ""
								}`}
							>
								<div className="select-none">
									<p
										onClick={otherUser ? openUserDrawer : undefined}
										className={`font-bold pl-1 mt-0 ${
											otherUser ? "cursor-pointer" : ""
										}`}
										style={{
											color: usernameColour
												? usernameColour
												: otherUser
													? colorMode === "light"
														? "#3182ce"
														: "#63b3ed"
													: colorMode === "light"
														? "rgba(0, 0, 0, 0.7)"
														: "rgba(255, 255, 255, 0.8)"
										}}
									>
										{displayName}
									</p>
								</div>

								{displayDate ? (
									<div className="select-none mt-0.5">
										<p
											className={`text-sm ${
												colorMode === "light"
													? "text-gray-500"
													: "text-gray-300"
											}`}
										>
											{displayDate}
										</p>
									</div>
								) : null}
							</div>
						</div>
					) : (
						<Avatar className={`${getAvatarSize(iconSize)} mr-2 select-none pointer-events-none`}>
							<AvatarImage 
								src={avatarSrc?.file !== undefined && avatarSrc?.file !== null ? avatarSrc?.file : undefined}
								draggable={false}
							/>
							<AvatarFallback>{displayName.charAt(0).toUpperCase()}</AvatarFallback>
						</Avatar>
					)}
				</div>
			</>
		);
	}
);
