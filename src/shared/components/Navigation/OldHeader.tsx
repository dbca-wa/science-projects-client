// Header for traditional layout

// Components
import { CgBrowse, CgPlayListAdd } from "react-icons/cg";
import { NavMenu } from "./NavMenu";

// Migrated imports
import { useColorMode } from "@/shared/utils/theme.utils";
import { Button } from "@/shared/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
} from "@/shared/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuGroup,
  DropdownMenuSeparator,
} from "@/shared/components/ui/dropdown-menu";

// React, Settings, & Nav
import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import theme from "@/theme";

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
  MdSpeakerNotes,
  MdVerifiedUser,
} from "react-icons/md";
import {
  PiBookOpenTextFill,
  PiListMagnifyingGlassDuotone,
} from "react-icons/pi";
import { RiAdminFill, RiOrganizationChart, RiTeamFill } from "react-icons/ri";
import { useUser } from "@/features/users/hooks/useUser";
import { BatchApproveModal } from "@/features/documents/components/modals/BatchApproveModal";
import { BatchApproveOldModal } from "@/features/documents/components/modals/BatchApproveOldModal";
import { CreateUserModal } from "@/features/users/components/modals/CreateUserModal";
import { NewCycleModal } from "@/features/reports/components/modals/NewCycleModal";
import { ToggleDarkMode } from "../ToggleDarkMode";
import { ToggleLayout } from "../ToggleLayout";
import { NavButton } from "./NavButton";
import { Navitar } from "./Navitar";
import { SidebarNavButton } from "./SidebarNavButton";
import { SidebarNavMenu } from "./SidebarNavMenu";

const ProjectMenuContents = () => {
  const navigate = useNavigate();
  const { colorMode } = useColorMode();
  return (
    <>
      <DropdownMenuGroup>
        <div className="text-xs text-gray-500 text-center mb-2">Create or Browse</div>
        <DropdownMenuItem
          onClick={(e) => {
            if (e.ctrlKey || e.metaKey) {
              // Handle Ctrl + Click (or Command + Click on Mac)
              window.open(`/projects/browse`, "_blank"); // Opens in a new tab
            } else {
              // Normal click handling
              navigate("/projects/browse");
            }
          }}
          className={colorMode === "dark" ? "text-gray-400" : ""}
        >
          <CgBrowse className="mr-2" />
          <span>Browse Projects</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={(e) => {
            if (e.ctrlKey || e.metaKey) {
              // Handle Ctrl + Click (or Command + Click on Mac)
              window.open(`/projects/add`, "_blank"); // Opens in a new tab
            } else {
              // Normal click handling
              navigate("/projects/add");
            }
          }}
          className={colorMode === "dark" ? "text-gray-400" : ""}
        >
          <CgPlayListAdd className="mr-2" />
          <span>Create New Project</span>
        </DropdownMenuItem>
      </DropdownMenuGroup>
    </>
  );
};

const ReportMenuContents = () => {
  const navigate = useNavigate();

  const { userData } = useUser();
  const { colorMode } = useColorMode();
  return (
    <>
      <DropdownMenuGroup>
        <div className="text-xs text-gray-500 text-center mb-2">Annual Research Activity Report</div>
        {userData?.is_superuser ? (
          <DropdownMenuItem
            onClick={(e) => {
              if (e.ctrlKey || e.metaKey) {
                // Handle Ctrl + Click (or Command + Click on Mac)
                window.open(`/reports/current`, "_blank"); // Opens in a new tab
              } else {
                // Normal click handling
                navigate("/reports/current");
              }
            }}
            className={colorMode === "dark" ? "text-gray-400" : ""}
          >
            <MdOutlineAccessTimeFilled className="mr-2" />
            <span>Latest Report</span>
          </DropdownMenuItem>
        ) : null}

        <DropdownMenuItem
          onClick={(e) => {
            if (e.ctrlKey || e.metaKey) {
              // Handle Ctrl + Click (or Command + Click on Mac)
              window.open(`/reports`, "_blank"); // Opens in a new tab
            } else {
              // Normal click handling
              navigate("/reports");
            }
          }}
          className={colorMode === "dark" ? "text-gray-400" : ""}
        >
          <CgViewList className="mr-2" />
          <span>Published Reports</span>
        </DropdownMenuItem>
      </DropdownMenuGroup>
    </>
  );
};

const UserMenuContents = () => {
  const navigate = useNavigate();
  const [isCreateUserModalOpen, setIsCreateUserModalOpen] = useState(false);
  const onCreateUserOpen = () => setIsCreateUserModalOpen(true);
  const onCreateUserClose = () => setIsCreateUserModalOpen(false);
  const { colorMode } = useColorMode();

  return (
    <>
      <CreateUserModal
        isOpen={isCreateUserModalOpen}
        onClose={onCreateUserClose}
      />

      <DropdownMenuGroup>
        <div className="text-xs text-gray-500 text-center mb-2">Users</div>
        <DropdownMenuItem
          onClick={(e) => {
            if (e.ctrlKey || e.metaKey) {
              // Handle Ctrl + Click (or Command + Click on Mac)
              window.open(`/users`, "_blank"); // Opens in a new tab
            } else {
              // Normal click handling
              navigate("/users");
            }
          }}
          className={colorMode === "dark" ? "text-gray-400" : ""}
        >
          <ImUsers className="mr-2" />
          <span>Browse SPMS Users</span>
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={onCreateUserOpen}
          className={colorMode === "dark" ? "text-gray-400" : ""}
        >
          <FaUserPlus className="mr-2" />
          <span>Add New User</span>
        </DropdownMenuItem>
      </DropdownMenuGroup>
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
  const { colorMode } = useColorMode();
  return (
    <>
      <DropdownMenuGroup>
        <div className="text-xs text-gray-500 text-center mb-2">Manage</div>
        <DropdownMenuItem
          onClick={() => {
            navigate("/patchnotes");
          }}
          className={colorMode === "dark" ? "text-gray-400" : ""}
        >
          <MdSpeakerNotes className="mr-2" />
          <span>Patch Notes</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          className={colorMode === "dark" ? "text-gray-400" : ""}
          onClick={handleReviewData}
        >
          <PiListMagnifyingGlassDuotone className="mr-2" />
          <span>Lists</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          className={colorMode === "dark" ? "text-gray-400" : ""}
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
          <MdEmail className="mr-2" />
          <span>Emails</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className={colorMode === "dark" ? "text-gray-400" : ""}
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
          <FaAddressCard className="mr-2" />
          <span>Addresses</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          className={colorMode === "dark" ? "text-gray-400" : ""}
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
          <RiTeamFill className="mr-2" />
          <span>Affiliations</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          className={colorMode === "dark" ? "text-gray-400" : ""}
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
          <RiOrganizationChart className="mr-2" />
          <span>Branches</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          className={colorMode === "dark" ? "text-gray-400" : ""}
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
          <ImBriefcase className="mr-2" />
          <span>Business Areas</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          className={colorMode === "dark" ? "text-gray-400" : ""}
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
          <GoOrganization className="mr-2" />
          <span>Divisions</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          className={colorMode === "dark" ? "text-gray-400" : ""}
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
          <FaLocationArrow className="mr-2" />
          <span>Locations</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          className={colorMode === "dark" ? "text-gray-400" : ""}
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
          <MdManageHistory className="mr-2" />
          <span>Report Info</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          className={colorMode === "dark" ? "text-gray-400" : ""}
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
          <MdOutlineSettingsSuggest className="mr-2" />
          <span>Services</span>
        </DropdownMenuItem>
      </DropdownMenuGroup>

      <DropdownMenuGroup>
        <div className="text-xs text-gray-500 text-center mb-2">AR Actions</div>
        <DropdownMenuItem
          className={colorMode === "dark" ? "text-gray-400" : ""}
          onClick={handleBatchApproveOldReports}
        >
          <MdVerifiedUser className="mr-2" />
          <span>Batch Approve Old Reports</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          className={colorMode === "dark" ? "text-gray-400" : ""}
          onClick={handleBatchApproveReports}
        >
          <FcApproval className="mr-2" />
          <span>Batch Approve Reports</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          className={colorMode === "dark" ? "text-gray-400" : ""}
          onClick={handleNewReportCycle}
        >
          <HiDocumentPlus className="mr-2" />
          <span>Open Annual Report Cycle</span>
        </DropdownMenuItem>
      </DropdownMenuGroup>
    </>
  );
};

const OldHeader = () => {
  const navigate = useNavigate();
  
  // State for all modals (replacing useDisclosure hooks)
  const [isBatchApproveOpen, setIsBatchApproveOpen] = useState(false);
  const [isBatchApproveOldOpen, setIsBatchApproveOldOpen] = useState(false);
  const [isNewCycleOpen, setIsNewCycleOpen] = useState(false);
  const [drawerIsOpen, setDrawerIsOpen] = useState(false);

  // Modal control functions
  const onBatchApproveClose = () => setIsBatchApproveOpen(false);
  const onBatchApproveOpen = () => setIsBatchApproveOpen(true);
  const onBatchApproveOldClose = () => setIsBatchApproveOldOpen(false);
  const onBatchApproveOldOpen = () => setIsBatchApproveOldOpen(true);
  const onNewCycleClose = () => setIsNewCycleOpen(false);
  const onNewCycleOpen = () => setIsNewCycleOpen(true);
  const onDrawerOpen = () => setDrawerIsOpen(true);
  const onDrawerClose = () => setDrawerIsOpen(false);

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

  const drawerBtnRef = useRef<HTMLButtonElement>(null);

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
  // const { layout } = useLayoutSwitcher();

  return (
    <div>
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

      <div
        className={`${
          colorMode === "light" ? "bg-black/80" : "bg-gray-900"
        } py-4 md:py-4 lg:py-1 px-4 sm:px-6 md:px-[10%] lg:px-[15%] rounded-b-md flex items-center justify-between`}
      >
        <div className="flex space-x-2 flex-grow">
          {/* SMPS Logo/Title */}
          <div>
            <a
              href="/"
              className="px-5 text-white/70 inline-block text-lg no-underline hover:no-underline hover:text-white/90"
              onClick={(e) => {
                if (
                  !(e.ctrlKey || e.metaKey || e.button === 2) &&
                  e.button === 0
                ) {
                  e.preventDefault();
                  navigate("/");
                }
              }}
            >
              <span className="text-xl font-bold select-none">SPMS</span>
            </a>
          </div>
          {shouldShowHamburger ? (
            <div className="flex-grow flex justify-end">
              <div className="mx-3">
                <Button
                  ref={drawerBtnRef}
                  onClick={onDrawerOpen}
                  className="text-white bg-gray-600 hover:bg-white hover:text-black"
                >
                  <GiHamburgerMenu size={"22px"} />
                </Button>
                <Sheet open={drawerIsOpen} onOpenChange={(open) => !open && onDrawerClose()}>
                  <SheetContent side="right" className="bg-black/90">
                    <SheetHeader className="border-b border-gray-500 text-white">
                      SPMS
                    </SheetHeader>
                    <div className="p-4">
                      <div className="py-3 flex flex-col space-y-4">
                        <div className="w-full z-60 flex">
                          <div className="ml-auto flex justify-right items-center">
                            <div className="flex justify-center text-center flex-row pr-0">
                              <ToggleLayout showText />
                              <ToggleDarkMode showText />
                            </div>
                            <div className="ml-3 flex-1">
                              <Navitar
                                isModern={false}
                                windowSize={windowSizeValue}
                              />
                            </div>
                          </div>
                        </div>

                        <div className="w-full py-2 z-50 grid gap-2">
                          {/* Projects */}
                          <SidebarNavMenu
                            menuName="Projects"
                            leftIcon={<HiMiniSquares2X2 />}
                            children={<ProjectMenuContents />}
                          />

                          {/* Staff */}
                          <SidebarNavMenu
                            menuName="Users"
                            leftIcon={<FaUsers />}
                            children={<UserMenuContents />}
                          />

                          {/* Reports */}
                          <SidebarNavMenu
                            menuName="Reports"
                            leftIcon={<PiBookOpenTextFill />}
                            children={<ReportMenuContents />}
                          />

                          {!userLoading && userData.is_superuser && (
                            <SidebarNavMenu
                              menuName="Admin"
                              leftIcon={<RiAdminFill />}
                              children={
                                <AdminMenuContents
                                  handleReviewData={handleReviewData}
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

                          {/* Guide */}
                          <SidebarNavButton
                            leftIcon={FaBookBookmark}
                            buttonName="Guide"
                            onClick={() => navigate("/guide")}
                          />
                        </div>
                      </div>
                    </div>
                  </SheetContent>
                </Sheet>
              </div>
            </div>
          ) : (
            <div className="flex-grow flex justify-between z-[99]">
              {/* Basic Navigation */}
              <div className="flex space-x-4">
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
                        handleReviewData={handleReviewData}
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

                {!userLoading && userData?.business_areas_led?.length > 0 ? (
                  <NavButton
                    buttonName="My Business Area"
                    onClick={(e) => {
                      if (e.ctrlKey || e.metaKey) {
                        // Handle Ctrl + Click (or Command + Click on Mac)
                        window.open(`/my_business_area`, "_blank"); // Opens in a new tab
                      } else {
                        // Normal click handling
                        navigate("/my_business_area");
                      }
                    }}
                  />
                ) : null}

                {/* Guide */}
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
              </div>

              {/* RHS Items */}
              <div className="flex items-center px-3">
                <Navitar
                  shouldShowName
                  windowSize={windowSizeValue}
                  isModern={false}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OldHeader;
