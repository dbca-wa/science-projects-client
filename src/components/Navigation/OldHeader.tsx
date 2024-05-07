// Header for traditional layout

// Components
import { CgBrowse, CgPlayListAdd } from "react-icons/cg";
import { NavMenu } from "./NavMenu";

// Chakra
import {
  Box,
  Button,
  Center,
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
import {
  useNavigate,
  // useLocation,
  useRouterState,
} from "@tanstack/react-router";
import React, { useEffect, useState } from "react";
import theme from "../../theme";

// Icon imports
import { AiFillProject } from "react-icons/ai";
import { BsFillPeopleFill } from "react-icons/bs";
import { CgViewList } from "react-icons/cg";
import { FaAddressCard, FaLocationArrow, FaUserPlus } from "react-icons/fa";
import { GiHamburgerMenu } from "react-icons/gi";
import { ImBriefcase, ImUsers } from "react-icons/im";
import { IoMdDocument } from "react-icons/io";

import { FcApproval } from "react-icons/fc";
import { GoOrganization } from "react-icons/go";
import { HiDocumentPlus } from "react-icons/hi2";
import {
  MdEmail,
  MdManageHistory,
  MdOutlineAccessTimeFilled,
  MdOutlineSettingsSuggest,
  MdVerifiedUser,
} from "react-icons/md";
import { RiAdminFill, RiOrganizationChart, RiTeamFill } from "react-icons/ri";
import { VscFeedback } from "react-icons/vsc";
import { useUser } from "../../lib/hooks/tanstack/useUser";
import { BatchApproveModal } from "../Modals/BatchApproveModal";
import { BatchApproveOldModal } from "../Modals/BatchApproveOldModal";
import { CreateUserModal } from "../Modals/CreateUserModal";
import { NewCycleModal } from "../Modals/NewCycleModal";
import { ToggleDarkMode } from "../ToggleDarkMode";
import { ToggleLayout } from "../ToggleLayout";
import { Navitar } from "./Navitar";
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
          onClick={() => {
            navigate({ to: "/projects/browse" });
          }}
        >
          {<CgBrowse />}
          <Text ml={2}>Browse Projects</Text>
        </MenuItem>
        <MenuItem
          onClick={() => {
            navigate({ to: "/projects/add" });
          }}
        >
          {<CgPlayListAdd />}
          <Text ml={2}>Create New Project</Text>
        </MenuItem>
      </MenuGroup>
    </>
  );
};

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
            onClick={() => {
              navigate({ to: "/reports/current" });
            }}
          >
            <MdOutlineAccessTimeFilled />

            {/* {<AiFillPrinter />} */}
            <Text ml={2}>Latest Report</Text>
          </MenuItem>
        ) : null}

        <MenuItem
          onClick={() => {
            navigate({ to: "/reports" });
          }}
        >
          {<CgViewList />}
          <Text ml={2}>Finalised Reports</Text>
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
          onClick={() => {
            navigate({ to: "/users" });
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
}
const AdminMenuContents = ({
  // handleDataDump,
  handleNewReportCycle,
  handleBatchApproveReports,
  handleBatchApproveOldReports,
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
          onClick={() => {
            navigate({ to: "/crud/addresses" });
          }}
        >
          {<FaAddressCard />}
          <Text ml={2}>Addresses</Text>
        </MenuItem>
        <MenuItem
          onClick={() => {
            navigate({ to: "/crud/affiliations" });
          }}
        >
          {<RiTeamFill />}
          <Text ml={2}>Affiliations</Text>
        </MenuItem>

        <MenuItem
          onClick={() => {
            navigate({ to: "/crud/branches" });
          }}
        >
          {<RiOrganizationChart />}
          <Text ml={2}>Branches</Text>
        </MenuItem>
        <MenuItem
          onClick={() => {
            navigate({ to: "/crud/businessareas" });
          }}
        >
          {<ImBriefcase />}
          <Text ml={2}>Business Areas</Text>
        </MenuItem>
        <MenuItem
          onClick={() => {
            navigate({ to: "/crud/divisions" });
          }}
        >
          {<GoOrganization />}
          <Text ml={2}>Divisions</Text>
        </MenuItem>
        <MenuItem
          onClick={() => {
            navigate({ to: "/crud/emails" });
          }}
        >
          {<MdEmail />}
          <Text ml={2}>Emails</Text>
        </MenuItem>

        <MenuItem
          onClick={() => {
            navigate({ to: "/crud/locations" });
          }}
        >
          {<FaLocationArrow />}
          <Text ml={2}>Locations</Text>
        </MenuItem>
        <MenuItem
          onClick={() => {
            navigate({ to: "/crud/reports" });
          }}
        >
          {<MdManageHistory />}
          <Text ml={2}>Report Info</Text>
        </MenuItem>

        <MenuItem
          onClick={() => {
            navigate({ to: "/crud/services" });
          }}
        >
          {<MdOutlineSettingsSuggest />}
          <Text ml={2}>Services</Text>
        </MenuItem>

        <MenuItem onClick={() => navigate({ to: "/crud/feedback" })}>
          {<VscFeedback />}
          <Text ml={2}>View Feedback</Text>
        </MenuItem>
      </MenuGroup>

      <MenuGroup
        title="Actions"
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

  const [shouldShowHamburger, setShouldShowHamburger] = useState(false);
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
  const location = useRouterState().location;
  const [shouldRenderUserSearch, setShouldRenderUserSearch] = useState(false);
  const [shouldRenderProjectSearch, setShouldRenderProjectSearch] =
    useState(false);
  useEffect(() => {
    if (location.pathname === "/users") {
      if (shouldRenderUserSearch === false) setShouldRenderUserSearch(true);
    } else {
      if (shouldRenderUserSearch === true) setShouldRenderUserSearch(false);
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
              onClick={() => {
                navigate({ to: "/" });
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

                    <DrawerHeader borderBottomWidth="1px" color="white">
                      SPMS
                    </DrawerHeader>
                    <DrawerBody>
                      <VStack py={3}>
                        <HStack w={"100%"} zIndex={60}>
                          {/* <Flex
                            mr={"auto"}
                            justifyContent={"left"}
                            alignItems={"center"}
                            w={"100%"}
                          >
                            <Center>
                              <Text
                                alignItems={"center"}
                                fontSize={"lg"}
                                color={"whiteAlpha.800"}
                              >
                                MENU
                              </Text>
                            </Center>
                          </Flex> */}
                          <Flex
                            ml={"auto"}
                            justifyContent={"right"}
                            alignItems={"center"}
                          >
                            <Center mr={4}>
                              <ToggleLayout />
                              <ToggleDarkMode />
                            </Center>

                            <Navitar
                              isModern={false}
                              windowSize={windowSizeValue}
                            />
                          </Flex>
                        </HStack>

                        <Grid w={"100%"} py={2} zIndex={50}>
                          {/* Projects */}
                          <SidebarNavMenu
                            menuName="Projects"
                            leftIcon={<AiFillProject />}
                            children={<ProjectMenuContents />}
                          />

                          {/* Staff */}
                          <SidebarNavMenu
                            menuName="Users"
                            leftIcon={<BsFillPeopleFill />}
                            children={<UserMenuContents />}
                          />

                          {/* Reports */}
                          <SidebarNavMenu
                            menuName="Reports"
                            leftIcon={<IoMdDocument />}
                            children={<ReportMenuContents />}
                          />

                          {!userLoading && userData.is_superuser && (
                            <SidebarNavMenu
                              menuName="Admin"
                              leftIcon={<RiAdminFill />}
                              children={
                                <AdminMenuContents
                                  handleDataDump={handleDataDump}
                                  handleNewReportCycle={handleNewReportCycle}
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
                />

                {/* Staff */}
                <NavMenu menuName="Users" children={<UserMenuContents />} />

                {/* Reports */}
                <NavMenu menuName="Reports" children={<ReportMenuContents />} />

                {!userLoading && userData.is_superuser && (
                  <NavMenu
                    menuName="Admin"
                    children={
                      <AdminMenuContents
                        handleDataDump={handleDataDump}
                        handleNewReportCycle={handleNewReportCycle}
                        handleBatchApproveReports={handleBatchApproveReports}
                        handleBatchApproveOldReports={
                          handleBatchApproveOldReports
                        }
                      />
                    }
                  />
                )}
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
