// Display of users above their message in chat route

import { IBranch, IBusinessArea, IImageData, IUserData } from "@/types";
import {
	Avatar,
	Box,
	Drawer,
	DrawerBody,
	DrawerContent,
	DrawerFooter,
	DrawerOverlay,
	Flex,
	Text,
	useColorMode,
	useDisclosure,
} from "@chakra-ui/react";
import React from "react";
import { UserProfile } from "../Users/UserProfile";

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

export const ChatUser: React.FC<ChatUserProps> = React.memo(
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

		const openUserDrawer = () => {
			onUserOpen();
		};
		const {
			isOpen: isUserOpen,
			onOpen: onUserOpen,
			onClose: onUserClose,
		} = useDisclosure();
		return (
			<>
				<Drawer
					isOpen={isUserOpen}
					placement="right"
					onClose={onUserClose}
					size={"sm"} //by default is xs
				>
					<DrawerOverlay />
					<DrawerContent>
						<DrawerBody>
							<UserProfile
								pk={user.pk}
								branches={branches}
								businessAreas={businessAreas}
							/>
						</DrawerBody>

						<DrawerFooter></DrawerFooter>
					</DrawerContent>
				</Drawer>
				<Flex
					flexDir="row"
					// color="gray.500"
					sx={{
						alignSelf:
							displayName === "You" ? "flex-end" : "flex-start",
					}}
					mt={2}
				>
					{!withoutName ? (
						<Flex w={"100%"}>
							<Avatar
								size={iconSize ? iconSize : "md"}
								src={
									avatarSrc?.file
										? avatarSrc?.file?.startsWith("http")
											? `${avatarSrc?.file}`
											: `${baseAPI}${avatarSrc?.file}`
										: avatarSrc?.old_file
											? avatarSrc?.old_file
											: undefined
								}
								name={displayName}
								mr={2}
								userSelect={"none"}
								style={{ pointerEvents: "none" }}
								draggable={false}
							/>
							<Flex
								pl={1}
								pr={0}
								w={"100%"}
								h={"100%"}
								justifyContent={"space-between"}
								paddingRight={"40px"}
								// bg={"red"}
								alignItems={
									nameCentered === true ? "center" : undefined
								}
							>
								{/* {nameCentered ? } */}
								<Box userSelect={"none"}>
									<Text
										onClick={
											otherUser
												? openUserDrawer
												: undefined
										}
										cursor={
											otherUser ? "pointer" : undefined
										}
										//   bg={"red"}
										fontWeight="bold"
										pl={1}
										mt={0}
										color={
											usernameColour
												? usernameColour
												: otherUser
													? colorMode === "light"
														? "blue.500"
														: "blue.300"
													: colorMode === "light"
														? "blackAlpha.700"
														: "whiteAlpha.800"
										}
									>
										{displayName}
									</Text>
								</Box>

								{displayDate ? (
									<Box
										userSelect={"none"}
										mt={"2px"}
										//   right={12} pos={"absolute"}
									>
										<Text
											alignItems={"center"}
											fontSize={"sm"}
											color={
												colorMode === "light"
													? "gray.500"
													: "gray.300"
											}
										>
											{displayDate}
										</Text>
									</Box>
								) : null}
							</Flex>
						</Flex>
					) : (
						<Avatar
							size={iconSize ? iconSize : "md"}
							src={
								avatarSrc?.file !== undefined &&
								avatarSrc?.file !== null
									? avatarSrc?.file
									: undefined
							}
							name={displayName}
							mr={2}
							userSelect={"none"}
							style={{ pointerEvents: "none" }}
							draggable={false}
						/>
					)}
				</Flex>
			</>
		);
	}
);
