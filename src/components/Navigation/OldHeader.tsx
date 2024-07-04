// Header for traditional layout

// Components
import { CgBrowse, CgPlayListAdd } from "react-icons/cg";
import { NavMenu } from "./NavMenu";

// Chakra
import {
	Box,
	Button,
	Drawer,
	DrawerBody,
	DrawerCloseButton,
	DrawerContent,
	DrawerHeader,
	DrawerOverlay,
	Flex,
	Grid,
	HStack,
	MenuGroup,
	MenuItem,
	Text,
	VStack,
	useColorMode,
	useDisclosure,
} from "@chakra-ui/react";

// React, Settings, & Nav
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import theme from "../../theme";

// Icon imports
import { CgViewList } from "react-icons/cg";
import {
	FaAddressCard,
	FaLocationArrow,
	FaUserPlus,
	FaUsers,
} from "react-icons/fa";
import { GiHamburgerMenu } from "react-icons/gi";
import { ImBriefcase, ImUsers } from "react-icons/im";

import { FaBookBookmark } from "react-icons/fa6";
import { FcApproval } from "react-icons/fc";
import { GoOrganization } from "react-icons/go";
import { HiDocumentPlus, HiMiniSquares2X2 } from "react-icons/hi2";
import {
	MdEmail,
	MdManageHistory,
	MdOutlineAccessTimeFilled,
	MdOutlineSettingsSuggest,
	MdVerifiedUser,
} from "react-icons/md";
import {
	PiBookOpenTextFill,
	PiListMagnifyingGlassDuotone,
} from "react-icons/pi";
import { RiAdminFill, RiOrganizationChart, RiTeamFill } from "react-icons/ri";
import { VscFeedback } from "react-icons/vsc";
import { useUser } from "../../lib/hooks/tanstack/useUser";
import { BatchApproveModal } from "../Modals/BatchApproveModal";
import { BatchApproveOldModal } from "../Modals/BatchApproveOldModal";
import { CreateUserModal } from "../Modals/CreateUserModal";
import { NewCycleModal } from "../Modals/NewCycleModal";
import { ToggleDarkMode } from "../ToggleDarkMode";
import { ToggleLayout } from "../ToggleLayout";
import { NavButton } from "./NavButton";
import { Navitar } from "./Navitar";
import { SidebarNavButton } from "./SidebarNavButton";
import { SidebarNavMenu } from "./SidebarNavMenu";

const ProjectMenuContents = () => {
	const navigate = useNavigate();
	return (
		<>
			<MenuGroup
				title="Create or Browse"
				fontSize={"12px"}
				color={"gray.500"}
				textAlign={"center"}
			>
				<MenuItem
					onClick={(e) => {
						if (e.ctrlKey || e.metaKey) {
							// Handle Ctrl + Click (or Command + Click on Mac)
							window.open(`/projects/browse`, "_blank"); // Opens in a new tab
						} else {
							// Normal click handling
							navigate("/projects/browse");
						}
					}}
				>
					{<CgBrowse />}
					<Text ml={2}>Browse Projects</Text>
				</MenuItem>
				<MenuItem
					onClick={(e) => {
						if (e.ctrlKey || e.metaKey) {
							// Handle Ctrl + Click (or Command + Click on Mac)
							window.open(`/projects/add`, "_blank"); // Opens in a new tab
						} else {
							// Normal click handling
							navigate("/projects/add");
						}
					}}
				>
					{<CgPlayListAdd />}
					<Text ml={2}>Create New Project</Text>
				</MenuItem>
			</MenuGroup>
		</>
	);
};

// const GuideContents = () => {
//   const navigate = useNavigate();

//   return (
//     <>
//       <MenuGroup
//         title="View"
//         fontSize={"12px"}
//         color={"gray.500"}
//         textAlign={"center"}
//       >
//         <MenuItem
//           onClick={(e) => {
//             if (e.ctrlKey || e.metaKey) {
//               // Handle Ctrl + Click (or Command + Click on Mac)
//               window.open(`/guide`, "_blank"); // Opens in a new tab
//             } else {
//               // Normal click handling
//               navigate("/guide");
//             }
//           }}
//         >
//           <FaBookBookmark />

//           {/* {<AiFillPrinter />} */}
//           <Text ml={2}>View Quick Guide</Text>
//         </MenuItem>
//       </MenuGroup>
//     </>
//   );
// };

const ReportMenuContents = () => {
	const navigate = useNavigate();

	const { userData } = useUser();

	return (
		<>
			<MenuGroup
				title="Annual Research Activity Report"
				fontSize={"12px"}
				color={"gray.500"}
				textAlign={"center"}
			>
				{userData?.is_superuser ? (
					<MenuItem
						onClick={(e) => {
							if (e.ctrlKey || e.metaKey) {
								// Handle Ctrl + Click (or Command + Click on Mac)
								window.open(`/reports/current`, "_blank"); // Opens in a new tab
							} else {
								// Normal click handling
								navigate("/reports/current");
							}
						}}
					>
						<MdOutlineAccessTimeFilled />

						{/* {<AiFillPrinter />} */}
						<Text ml={2}>Latest Report</Text>
					</MenuItem>
				) : null}

				<MenuItem
					onClick={(e) => {
						if (e.ctrlKey || e.metaKey) {
							// Handle Ctrl + Click (or Command + Click on Mac)
							window.open(`/reports`, "_blank"); // Opens in a new tab
						} else {
							// Normal click handling
							navigate("/reports");
						}
					}}
				>
					{<CgViewList />}
					<Text ml={2}>Published Reports</Text>
				</MenuItem>
			</MenuGroup>
		</>
	);
};

const UserMenuContents = () => {
	const navigate = useNavigate();
	const {
		isOpen: isCreateUserModalOpen,
		onOpen: onCreateUserOpen,
		onClose: onCreateUserClose,
	} = useDisclosure();

	return (
		<>
			<CreateUserModal
				isOpen={isCreateUserModalOpen}
				onClose={onCreateUserClose}
			/>

			<MenuGroup
				title="Users"
				fontSize={"12px"}
				color={"gray.500"}
				textAlign={"center"}
			>
				<MenuItem
					onClick={(e) => {
						if (e.ctrlKey || e.metaKey) {
							// Handle Ctrl + Click (or Command + Click on Mac)
							window.open(`/users`, "_blank"); // Opens in a new tab
						} else {
							// Normal click handling
							navigate("/users");
						}
					}}
				>
					{<ImUsers />}
					<Text ml={2}>Browse SPMS Users</Text>
				</MenuItem>

				<MenuItem onClick={onCreateUserOpen}>
					{<FaUserPlus />}
					<Text ml={2}>Add New User</Text>
				</MenuItem>
			</MenuGroup>
		</>
	);
};

interface AdminProps {
	handleDataDump: () => void;
	handleNewReportCycle: () => void;
	handleBatchApproveReports: () => void;
	handleBatchApproveOldReports: () => void;
	// handleSendEmailToProjectLeads: () => void;
	handleReviewData: (e) => void;
}
const AdminMenuContents = ({
	// handleDataDump,
	handleNewReportCycle,
	handleBatchApproveReports,
	handleBatchApproveOldReports,
	// handleSendEmailToProjectLeads,
	handleReviewData,
}: AdminProps) => {
	const navigate = useNavigate();
	return (
		<>
			<MenuGroup
				title="Manage"
				fontSize={"12px"}
				color={"gray.500"}
				textAlign={"center"}
			>
				<MenuItem
					onClick={(e) => {
						if (e.ctrlKey || e.metaKey) {
							// Handle Ctrl + Click (or Command + Click on Mac)
							window.open(`/crud/addresses`, "_blank"); // Opens in a new tab
						} else {
							// Normal click handling
							navigate("/crud/addresses");
						}
					}}
				>
					{<FaAddressCard />}
					<Text ml={2}>Addresses</Text>
				</MenuItem>
				<MenuItem
					onClick={(e) => {
						if (e.ctrlKey || e.metaKey) {
							// Handle Ctrl + Click (or Command + Click on Mac)
							window.open(`/crud/affiliations`, "_blank"); // Opens in a new tab
						} else {
							// Normal click handling
							navigate("/crud/affiliations");
						}
					}}
				>
					{<RiTeamFill />}
					<Text ml={2}>Affiliations</Text>
				</MenuItem>

				<MenuItem
					onClick={(e) => {
						if (e.ctrlKey || e.metaKey) {
							// Handle Ctrl + Click (or Command + Click on Mac)
							window.open(`/crud/branches`, "_blank"); // Opens in a new tab
						} else {
							// Normal click handling
							navigate("/crud/branches");
						}
					}}
				>
					{<RiOrganizationChart />}
					<Text ml={2}>Branches</Text>
				</MenuItem>
				<MenuItem
					onClick={(e) => {
						if (e.ctrlKey || e.metaKey) {
							// Handle Ctrl + Click (or Command + Click on Mac)
							window.open(`/crud/businessareas`, "_blank"); // Opens in a new tab
						} else {
							// Normal click handling
							navigate("/crud/businessareas");
						}
					}}
				>
					{<ImBriefcase />}
					<Text ml={2}>Business Areas</Text>
				</MenuItem>
				<MenuItem
					onClick={(e) => {
						if (e.ctrlKey || e.metaKey) {
							// Handle Ctrl + Click (or Command + Click on Mac)
							window.open(`/crud/divisions`, "_blank"); // Opens in a new tab
						} else {
							// Normal click handling
							navigate("/crud/divisions");
						}
					}}
				>
					{<GoOrganization />}
					<Text ml={2}>Divisions</Text>
				</MenuItem>
				<MenuItem
					onClick={(e) => {
						if (e.ctrlKey || e.metaKey) {
							// Handle Ctrl + Click (or Command + Click on Mac)
							window.open(`/crud/emails`, "_blank"); // Opens in a new tab
						} else {
							// Normal click handling
							navigate("/crud/emails");
						}
					}}
				>
					{<MdEmail />}
					<Text ml={2}>Emails</Text>
				</MenuItem>

				<MenuItem
					onClick={(e) => {
						if (e.ctrlKey || e.metaKey) {
							// Handle Ctrl + Click (or Command + Click on Mac)
							window.open(`/crud/locations`, "_blank"); // Opens in a new tab
						} else {
							// Normal click handling
							navigate("/crud/locations");
						}
					}}
				>
					{<FaLocationArrow />}
					<Text ml={2}>Locations</Text>
				</MenuItem>
				<MenuItem
					onClick={(e) => {
						if (e.ctrlKey || e.metaKey) {
							// Handle Ctrl + Click (or Command + Click on Mac)
							window.open(`/crud/reports`, "_blank"); // Opens in a new tab
						} else {
							// Normal click handling
							navigate("/crud/reports");
						}
					}}
				>
					{<MdManageHistory />}
					<Text ml={2}>Report Info</Text>
				</MenuItem>

				<MenuItem
					onClick={(e) => {
						if (e.ctrlKey || e.metaKey) {
							// Handle Ctrl + Click (or Command + Click on Mac)
							window.open(`/crud/services`, "_blank"); // Opens in a new tab
						} else {
							// Normal click handling
							navigate("/crud/services");
						}
					}}
				>
					{<MdOutlineSettingsSuggest />}
					<Text ml={2}>Services</Text>
				</MenuItem>

				<MenuItem
					onClick={(e) => {
						if (e.ctrlKey || e.metaKey) {
							// Handle Ctrl + Click (or Command + Click on Mac)
							window.open(`/crud/feedback`, "_blank"); // Opens in a new tab
						} else {
							// Normal click handling
							navigate("/crud/feedback");
						}
					}}
				>
					{<VscFeedback />}
					<Text ml={2}>View Feedback</Text>
				</MenuItem>
				<MenuItem onClick={handleReviewData}>
					{<PiListMagnifyingGlassDuotone />}
					<Text ml={2}>View Data Lists</Text>
				</MenuItem>
			</MenuGroup>

			<MenuGroup
				title="AR Actions"
				fontSize={"12px"}
				color={"gray.500"}
				textAlign={"center"}
			>
				{/* <MenuItem onClick={handleDataDump}>
          {<FcDataBackup />}
          <Text ml={2}>Dump Data</Text>
        </MenuItem> */}

				<MenuItem onClick={handleBatchApproveOldReports}>
					{<MdVerifiedUser />}
					<Text ml={2}>Batch Approve Old Reports</Text>
				</MenuItem>
				<MenuItem onClick={handleBatchApproveReports}>
					{<FcApproval />}
					<Text ml={2}>Batch Approve Reports</Text>
				</MenuItem>
				<MenuItem onClick={handleNewReportCycle}>
					{<HiDocumentPlus />}
					<Text ml={2}>Open Annual Report Cycle</Text>
				</MenuItem>
				{/* <MenuItem onClick={handleSendEmailToProjectLeads}>
          {<MdEmail />}
          <Text ml={2}>Send Project Lead Email</Text>
        </MenuItem> */}
			</MenuGroup>
		</>
	);
};

const OldHeader = () => {
	const navigate = useNavigate();
	const {
		isOpen: isBatchApproveOpen,
		onClose: onBatchApproveClose,
		onOpen: onBatchApproveOpen,
	} = useDisclosure();
	const {
		isOpen: isBatchApproveOldOpen,
		onClose: onBatchApproveOldClose,
		onOpen: onBatchApproveOldOpen,
	} = useDisclosure();
	const {
		isOpen: isNewCycleOpen,
		onClose: onNewCycleClose,
		onOpen: onNewCycleOpen,
	} = useDisclosure();

	const handleDataDump = () => {
		console.log("Dumping data...");
	};

	const handleNewReportCycle = () => {
		console.log("Handling new report cycle...");
		onNewCycleOpen();
		// 'opennewcycle'
	};

	const handleBatchApproveReports = () => {
		onBatchApproveOpen();
	};

	const handleBatchApproveOldReports = () => {
		onBatchApproveOldOpen();
	};

	const handleReviewData = (e) => {
		if (e.ctrlKey || e.metaKey) {
			// Handle Ctrl + Click (or Command + Click on Mac)
			window.open(`/crud/data`, "_blank"); // Opens in a new tab
		} else {
			// Normal click handling
			navigate("/crud/data");
		}
	};

	const [shouldShowHamburger, setShouldShowHamburger] = useState(false);
	const [shouldShowGuide, setShouldShowGuide] = useState(true);
	const [windowSizeValue, setWindowSizeValue] = useState<number>(480);

	const {
		isOpen: drawerIsOpen,
		onOpen: onDrawerOpen,
		onClose: onDrawerClose,
	} = useDisclosure();
	const drawerBtnRef = React.useRef<HTMLButtonElement>(null);

	const handleResize = () => {
		if (window.innerWidth < parseFloat(theme.breakpoints.lg)) {
			setShouldShowHamburger(true);
		} else {
			setShouldShowHamburger(false);
		}
		if (
			window.innerWidth < parseFloat(theme.breakpoints["1200px"]) &&
			userData?.is_superuser
		) {
			setShouldShowGuide(false);
		} else {
			setShouldShowGuide(true);
		}
		setWindowSizeValue(window.innerWidth);
	};

	useEffect(() => {
		handleResize(); // initial check
		window.addEventListener("resize", handleResize);

		return () => {
			window.removeEventListener("resize", handleResize);
		};
	}, [theme.breakpoints.lg]);

	const { colorMode } = useColorMode();
	const location = useLocation();
	const [shouldRenderUserSearch, setShouldRenderUserSearch] = useState(false);
	const [shouldRenderProjectSearch, setShouldRenderProjectSearch] =
		useState(false);
	useEffect(() => {
		if (location.pathname === "/users") {
			if (shouldRenderUserSearch === false)
				setShouldRenderUserSearch(true);
		} else {
			if (shouldRenderUserSearch === true)
				setShouldRenderUserSearch(false);
		}

		if (location.pathname === "/projects") {
			if (shouldRenderProjectSearch === false)
				setShouldRenderProjectSearch(true);
		} else {
			if (shouldRenderProjectSearch === true)
				setShouldRenderProjectSearch(false);
		}
	}, [location.pathname]);

	const { userLoading, userData } = useUser();
	// const { layout } = useLayoutSwitcher();

	return (
		<Box>
			{/* Nav background */}

			<BatchApproveModal
				isOpen={isBatchApproveOpen}
				onClose={onBatchApproveClose}
			/>
			<BatchApproveOldModal
				isOpen={isBatchApproveOldOpen}
				onClose={onBatchApproveOldClose}
			/>
			<NewCycleModal isOpen={isNewCycleOpen} onClose={onNewCycleClose} />

			<HStack
				bg={colorMode === "light" ? "blackAlpha.800" : "gray.900"}
				py={{
					base: 4,
					md: 4,
					lg: 1,
				}}
				roundedBottom={6}
				alignItems="center"
				justifyContent="space-between"
			>
				<HStack spacing={2} flexGrow={1}>
					{/* SMPS Logo/Title */}
					<Box>
						<Button
							px={5}
							color={"whiteAlpha.700"}
							size={"md"}
							variant={"unstyled"}
							onClick={(e) => {
								if (e.ctrlKey || e.metaKey) {
									// Handle Ctrl + Click (or Command + Click on Mac)
									window.open("/", "_blank"); // Opens in a new tab
								} else {
									// Normal click handling
									navigate("/");
								}
							}}
						>
							<Text fontSize={18}>SPMS</Text>
						</Button>
					</Box>
					{shouldShowHamburger ? (
						<Box
							flexGrow={1}
							// bg={"red"}
							justifyContent={"end"}
							display={"flex"}
						>
							<Box mx={3}>
								<Button
									ref={drawerBtnRef}
									onClick={onDrawerOpen}
									variant={"solid"}
									color={"white"}
									bg={"gray.600"}
									_hover={{
										bg: "white",
										color: "black",
									}}
								>
									<GiHamburgerMenu size={"22px"} />
								</Button>
								<Drawer
									isOpen={drawerIsOpen}
									placement="right"
									onClose={onDrawerClose}
									finalFocusRef={drawerBtnRef}
								>
									<DrawerOverlay />
									<DrawerContent bg={"blackAlpha.900"}>
										<DrawerCloseButton color={"white"} />

										<DrawerHeader
											borderBottomWidth="1px"
											borderBottomColor={
												colorMode === "light"
													? "gray.500"
													: "gray.500"
											}
											color="white"
										>
											SPMS
										</DrawerHeader>
										<DrawerBody>
											<VStack py={3}>
												<HStack w={"100%"} zIndex={60}>
													<Flex
														ml={"auto"}
														justifyContent={"right"}
														alignItems={"center"}
													>
														{/* <Center mr={4}> */}
														<Flex
															justifyContent={
																"center"
															}
															textAlign={"center"}
															// bg={"red"}
															flexDir={"row"}
															// pr={3}
															pr={0}
														>
															<ToggleLayout
																showText
															/>
															<ToggleDarkMode
																showText
															/>
														</Flex>

														{/* </Center> */}
														<Box ml={3} flex={1}>
															<Navitar
																isModern={false}
																windowSize={
																	windowSizeValue
																}
															/>
														</Box>
													</Flex>
												</HStack>

												<Grid
													w={"100%"}
													py={2}
													zIndex={50}
												>
													{/* Projects */}
													<SidebarNavMenu
														menuName="Projects"
														leftIcon={
															<HiMiniSquares2X2 />
														}
														children={
															<ProjectMenuContents />
														}
													/>

													{/* Staff */}
													<SidebarNavMenu
														menuName="Users"
														leftIcon={<FaUsers />}
														children={
															<UserMenuContents />
														}
													/>

													{/* Reports */}
													<SidebarNavMenu
														menuName="Reports"
														leftIcon={
															<PiBookOpenTextFill />
														}
														children={
															<ReportMenuContents />
														}
													/>

													{!userLoading &&
														userData.is_superuser && (
															<SidebarNavMenu
																menuName="Admin"
																leftIcon={
																	<RiAdminFill />
																}
																children={
																	<AdminMenuContents
																		handleReviewData={
																			handleReviewData
																		}
																		handleDataDump={
																			handleDataDump
																		}
																		handleNewReportCycle={
																			handleNewReportCycle
																		}
																		handleBatchApproveReports={
																			handleBatchApproveReports
																		}
																		handleBatchApproveOldReports={
																			handleBatchApproveOldReports
																		}
																	/>
																}
															/>
														)}

													{/* Guide */}
													{/* {!userLoading && userData.is_superuser && ( */}
													<SidebarNavButton
														leftIcon={
															FaBookBookmark
														}
														buttonName="Guide"
														onClick={() =>
															navigate("/guide")
														}
													/>
													{/* {
                            userData?.business_areas_led?.length > 0 ? (

                              <SidebarNavButton
                                leftIcon={FaBookBookmark}
                                buttonName="My Business Area"
                                onClick={() => navigate("/my_business_area")}
                              />
                            ) : null
                          } */}
													{/* )} */}
												</Grid>
											</VStack>
										</DrawerBody>
									</DrawerContent>
								</Drawer>
							</Box>
						</Box>
					) : (
						<Box
							flexGrow={1}
							justifyContent={"space-between"}
							display={"flex"}
							zIndex={99}
						>
							{/* Basic Navigation */}
							<HStack>
								{/* Projects */}
								<NavMenu
									menuName="Projects"
									children={<ProjectMenuContents />}
								// leftIcon={HiMiniSquares2X2}
								/>

								{/* Staff */}
								<NavMenu
									menuName="Users"
									children={<UserMenuContents />}
								// leftIcon={FaUsers}
								/>

								{/* Reports */}
								<NavMenu
									menuName="Reports"
									children={<ReportMenuContents />}
								// leftIcon={PiBookOpenTextFill}
								/>

								{!userLoading && userData.is_superuser && (
									<NavMenu
										menuName="Admin"
										// leftIcon={RiAdminFill}
										children={
											<AdminMenuContents
												handleReviewData={
													handleReviewData
												}
												handleDataDump={handleDataDump}
												handleNewReportCycle={
													handleNewReportCycle
												}
												handleBatchApproveReports={
													handleBatchApproveReports
												}
												handleBatchApproveOldReports={
													handleBatchApproveOldReports
												}
											/>
										}
									/>
								)}

								{!userLoading &&
									userData?.business_areas_led?.length > 0 ? (
									<NavButton
										buttonName="My Business Area"
										onClick={(e) => {
											if (e.ctrlKey || e.metaKey) {
												// Handle Ctrl + Click (or Command + Click on Mac)
												window.open(
													`/my_business_area`,
													"_blank"
												); // Opens in a new tab
											} else {
												// Normal click handling
												navigate("/my_business_area");
											}
										}}
									/>
								) : null}

								{/* Guide */}
								{/* {!userLoading && !userData.is_superuser && ( */}
								{shouldShowGuide ? (
									<NavButton
										// leftIcon={FaBookBookmark}
										buttonName="Guide"
										onClick={(e) => {
											if (e.ctrlKey || e.metaKey) {
												// Handle Ctrl + Click (or Command + Click on Mac)
												window.open(`/guide`, "_blank"); // Opens in a new tab
											} else {
												// Normal click handling
												navigate("/guide");
											}
										}}
									/>
								) : null}


								{/* )} */}
							</HStack>

							{/* RHS Items */}
							<HStack px={3}>
								<Navitar
									shouldShowName
									windowSize={windowSizeValue}
									isModern={false}
								/>
							</HStack>
						</Box>
					)}
				</HStack>
			</HStack>
		</Box>
	);
};

export default OldHeader;
