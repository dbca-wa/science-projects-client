// Navitar - shown on both layouts. Uses useLayoutSwitcher to determine style

import { useNoImage } from "@/lib/hooks/helper/useNoImage";
import {
	Avatar,
	Box,
	Center,
	Flex,
	Menu,
	MenuButton,
	MenuGroup,
	MenuItem,
	MenuList,
	Text,
	ToastId,
	useColorMode,
	useToast,
} from "@chakra-ui/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRef, useState } from "react";
import { FaBook, FaUserCircle } from "react-icons/fa";
import { FiLogOut } from "react-icons/fi";
import { GoTriangleDown } from "react-icons/go";
import { SiReadthedocs } from "react-icons/si";
import { TbWorldWww } from "react-icons/tb";
import { useNavigate } from "react-router-dom";
import { logOut } from "../../lib/api";
import { useLayoutSwitcher } from "../../lib/hooks/helper/LayoutSwitcherContext";
import useApiEndpoint from "../../lib/hooks/helper/useApiEndpoint";
import { useUser } from "../../lib/hooks/tanstack/useUser";
import { INavitar } from "../../types";
import { ToggleDarkMode } from "../ToggleDarkMode";
import { ToggleLayout } from "../ToggleLayout";

export const Navitar = ({
	isModern,
	shouldShowName = false,
	windowSize,
}: INavitar) => {
	const { colorMode } = useColorMode();
	const { userData } = useUser();

	const baseAPI = useApiEndpoint();
	const noImage = useNoImage();

	const queryClient = useQueryClient();
	const navigate = useNavigate();
	const toast = useToast();
	const toastIdRef = useRef<ToastId>();
	const addToast = (data) => {
		toastIdRef.current = toast(data);
	};
	const VITE_PRODUCTION_BACKEND_BASE_URL = import.meta.env
		.VITE_PRODUCTION_BACKEND_BASE_URL;

	const mutation = useMutation({
		mutationFn: logOut,
		onMutate: () => {
			// const toastID =
			addToast({
				title: "Logging out...",
				description: "One moment!",
				status: "loading",
				position: "bottom-right",
				duration: 1000,
			});
		},
		onSuccess: (data) => {
			console.log("logout success");
			if (toastIdRef.current) {
				toast.update(toastIdRef.current, {
					title: "Logged out",
					description: "Thank you, come again!",
					status: "success",
					duration: 3000,
				});
			}
			// queryClient.refetchQueries(['me']);
			queryClient.invalidateQueries({ queryKey: ["me"] });
			console.log("DATA IS:", data);
			if (data?.logoutUrl) {
				window.location.href = `${VITE_PRODUCTION_BACKEND_BASE_URL}${data.logoutUrl.slice(
					1
				)}`;
			}
			// sso/signedout?relogin
			else {
				window.location.href = `${VITE_PRODUCTION_BACKEND_BASE_URL}`;
			}
			// navigate("/login");
			// window.location.href = VITE_PRODUCTION_BACKEND_BASE_URL;
			// window.location.assign('https://dbcab2c.b2clogin.com/dbcab2c.onmicrosoft.com/B2C_1A_Default_uat/oauth2/v2.0/logout?post_logout_redirect_uri=https%3A//login.microsoftonline.com/7b934664-cdcf-4e28-a3ee-1a5bcca0a1b6/oauth2/logout')
		},
		onError: (error) => {
			console.log("logout error, navigating to login");
			console.log(error);
			window.location.href = `${VITE_PRODUCTION_BACKEND_BASE_URL}login`;
		},
	});

	const onLogOut = async () => {
		mutation.mutate();
	};

	//   const [isHovered, setIsHovered] = useState(false);
	const [isOpen, setIsOpen] = useState(false);

	const handleMouseEnter = () => {
		// setIsHovered(true);
		setIsOpen(true);
	};

	const handleMouseLeave = () => {
		// setIsHovered(false);
		setIsOpen(false);
	};

	const { layout } = useLayoutSwitcher();

	// useEffect(() => console.log(userData), [userData])

	return (
		<Box userSelect={"none"} zIndex={isOpen ? 2 : 1}>
			<Menu isOpen={isOpen}>
				<MenuButton
					zIndex={isOpen ? 2 : 1}
					onMouseEnter={handleMouseEnter}
					onMouseLeave={handleMouseLeave}
				>
					<Center>
						{shouldShowName ? (
							<Text
								color={
									isModern
										? colorMode === "dark"
											? "whiteAlpha.800"
											: "blackAlpha.800"
										: "whiteAlpha.900"
								}
								mx={3}
							>
								{userData !== undefined &&
									userData &&
									(userData.first_name
										? userData.first_name.length < 12
											? userData.first_name
											: windowSize >= 1150
												? userData.first_name
												: `${userData?.first_name.substring(0, 9)}...`
										: userData.username)}
							</Text>
						) : null}
						<Avatar
							size="sm"
							name={userData?.username}
							src={
								userData?.image
									? userData.image?.file?.startsWith("http")
										? `${userData.image?.file}`
										: `${baseAPI}${userData.image?.file}`
									: userData.image?.old_file
										? userData.image?.old_file
										: noImage
							}
						></Avatar>
						<Center
							color={
								isModern
									? colorMode === "dark"
										? "whiteAlpha.800"
										: "blackAlpha.800"
									: "whiteAlpha.900"
							}
							ml={1}
						>
							<GoTriangleDown size={"13px"} />
						</Center>
					</Center>
				</MenuButton>

				<MenuList
					onMouseEnter={handleMouseEnter}
					onMouseLeave={handleMouseLeave}
					mt={"-7.5px"}
					zIndex={isOpen ? 2 : 1}
				>
					<MenuGroup
						title="Docs & Layout"
						fontSize={"12px"}
						color={
							colorMode === "light"
								? "gray.500"
								: "whiteAlpha.700"
						}
						textAlign={"center"}
						zIndex={isOpen ? 2 : 1}
					>
						<MenuItem
							onClick={() => {
								navigate("/guide");
								// window.open("https://sdis.readthedocs.io", "_blank");
							}}
							zIndex={isOpen ? 2 : 1}
						>
							{<SiReadthedocs />}
							<Text ml={2}>Quick Guide</Text>
						</MenuItem>

						<ToggleLayout asMenuItem />
						<ToggleDarkMode asMenuItem />
					</MenuGroup>

					<MenuGroup
						title="DBCA Account"
						fontSize={"12px"}
						color={
							colorMode === "light"
								? "gray.500"
								: "whiteAlpha.700"
						}
						textAlign={"center"}
						zIndex={isOpen ? 2 : 1}
					>
						<MenuItem
							onClick={() => {
								navigate("/users/me");
							}}
							zIndex={isOpen ? 2 : 1}
						>
							{<FaUserCircle />}
							<Text ml={2}>
								{layout === "modern"
									? "My Profile"
									: "My SPMS Profile"}
							</Text>
						</MenuItem>
						<MenuItem
							onClick={() => {
								window.open(
									"https://sww.dpaw.wa.gov.au/",
									"_blank"
								);
							}}
							zIndex={isOpen ? 2 : 1}
						>
							{<FaUserCircle />}
							<Text ml={2}>My Public Profile</Text>
						</MenuItem>
						{userData?.is_superuser && (
							<MenuItem
								onClick={onLogOut}
								zIndex={isOpen ? 2 : 1}
							>
								{<FiLogOut />}
								<Text ml={2}>Logout</Text>
							</MenuItem>
						)}
					</MenuGroup>
					{isModern && (
						<MenuGroup
							title="Links"
							fontSize={"12px"}
							color={
								colorMode === "light"
									? "gray.500"
									: "whiteAlpha.700"
							}
							textAlign={"center"}
							zIndex={isOpen ? 2 : 1}
						>
							<MenuItem
								onClick={() => {
									window.open(
										"https://data.dbca.wa.gov.au/",
										"_blank"
									);
								}}
								zIndex={isOpen ? 2 : 1}
							>
								{<FaBook />}
								<Text ml={2}>Data Catalogue</Text>
							</MenuItem>
							<MenuItem
								onClick={() => {
									window.open(
										"https://scientificsites.dpaw.wa.gov.au/",
										"_blank"
									);
								}}
								zIndex={isOpen ? 2 : 1}
							>
								{<TbWorldWww />}
								<Text ml={2}>Scientific Sites Register</Text>
							</MenuItem>
						</MenuGroup>
					)}
				</MenuList>
			</Menu>
		</Box>
	);
};
