import { useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router";
import { observer } from "mobx-react-lite";
import { GiHamburgerMenu } from "react-icons/gi";
import { ImUsers } from "react-icons/im";
import { FaUserPlus } from "react-icons/fa";
import { CgBrowse, CgPlayListAdd } from "react-icons/cg";
import { IoCaretDown } from "react-icons/io5";
import { Navitar } from "../Navitar";
import { Button } from "@/shared/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/shared/components/ui/custom/CustomSheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/shared/components/ui/custom/CustomDropdownMenu";
import { useWindowSize } from "@/shared/hooks/useWindowSize";
import { BREAKPOINTS } from "@/shared/constants/breakpoints";
import { useUIStore, useAuthStore } from "@/app/stores/store-context";
import TraditionalHeaderContent from "./TraditionalHeaderContent";

/**
 * HamburgerMenuSheet - Observer-wrapped Sheet component
 * Uses CustomSheet (no animations, returns null when closed)
 */
const HamburgerMenuSheet = observer(({ handleNavigation }: { handleNavigation: (path: string) => void }) => {
  const uiStore = useUIStore();

  return (
    <>
      <Button
        variant="default"
        size="icon"
        className="bg-gray-600 hover:bg-white hover:text-black text-white"
        aria-label="Open navigation menu"
        onClick={() => uiStore.setHamburgerMenuOpen(true)}
      >
        <GiHamburgerMenu size={22} />
      </Button>
      
      <Sheet open={uiStore.hamburgerMenuOpen} onOpenChange={(open) => uiStore.setHamburgerMenuOpen(open)} modal={true}>
        <SheetContent side="right" className="bg-gray-900 text-white border-gray-700 w-3/4 sm:max-w-sm">
          <SheetHeader className="border-b border-gray-700 pb-4">
            <div className="flex items-center justify-between">
              <SheetTitle className="text-white text-xl font-bold">SPMS</SheetTitle>
              <Navitar isModern={false} shouldShowName={false} />
            </div>
          </SheetHeader>

          <TraditionalHeaderContent handleNavigation={handleNavigation} />
        </SheetContent>
      </Sheet>
    </>
  );
});

/**
 * TraditionalHeader component
 * Header with navigation menu, user avatar, and responsive hamburger menu
 */
export const TraditionalHeader = observer(() => {
  const navigate = useNavigate();
  const location = useLocation();
  const uiStore = useUIStore();
  const authStore = useAuthStore();
  const { width } = useWindowSize();

  // Show hamburger menu on screens smaller than lg breakpoint
  const shouldShowHamburger = width < BREAKPOINTS.lg;

  // Close drawer on route change
  useEffect(() => {
    uiStore.setHamburgerMenuOpen(false);
  }, [location.pathname, uiStore]);

  const handleNavigation = (path: string) => {
    uiStore.setHamburgerMenuOpen(false);
    navigate(path);
  };

  return (
    <header className="bg-gray-900 rounded-b py-0.5">
      <div className="px-4 sm:px-6 md:px-[10%] lg:px-[15%] py-4 lg:py-1">
        <div className="flex items-center justify-between">
          {/* Left side - Logo */}
          <div className="flex items-center">
            {/* SPMS Logo/Title */}
            <Link
              to="/"
              className="px-5 text-white/70 hover:text-white/90 text-lg font-bold select-none no-underline transition-colors"
            >
              SPMS
            </Link>
          </div>

          {shouldShowHamburger ? (
            /* Mobile/Tablet - Hamburger Menu */
            <div className="flex items-center">
              <HamburgerMenuSheet handleNavigation={handleNavigation} />
            </div>
          ) : (
            /* Desktop - Full Navigation */
            <div className="flex items-center justify-between flex-grow">
              <div className="flex items-center gap-1">
                {/* Projects Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="text-white/70 hover:text-white hover:bg-white/10 select-none"
                    >
                      Projects
                      <IoCaretDown className="ml-1 h-3 w-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="bg-white text-gray-900 border-gray-200">
                    <DropdownMenuLabel className="text-center text-xs text-gray-500">
                      Projects
                    </DropdownMenuLabel>
                    <DropdownMenuItem
                      onClick={() => navigate("/projects")}
                      className="hover:bg-gray-100 cursor-pointer select-none"
                    >
                      <CgBrowse className="mr-2 size-4" />
                      Browse Projects
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => navigate("/projects/create")}
                      className="hover:bg-gray-100 cursor-pointer select-none"
                    >
                      <CgPlayListAdd className="mr-2 size-4" />
                      Create New Project
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Users Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="text-white/70 hover:text-white hover:bg-white/10 select-none"
                    >
                      Users
                      <IoCaretDown className="ml-1 h-3 w-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="bg-white text-gray-900 border-gray-200">
                    <DropdownMenuLabel className="text-center text-xs text-gray-500">
                      Users
                    </DropdownMenuLabel>
                    <DropdownMenuItem
                      onClick={() => navigate("/users")}
                      className="hover:bg-gray-100 cursor-pointer select-none"
                    >
                      <ImUsers className="mr-2 size-4" />
                      Browse Users
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => navigate("/users/create")}
                      className="hover:bg-gray-100 cursor-pointer select-none"
                    >
                      <FaUserPlus className="mr-2 size-4" />
                      Add User
                    </DropdownMenuItem>
                    {authStore.isSuperuser && (
                      <DropdownMenuItem
                        onClick={() => navigate("/users/create-staff")}
                        className="hover:bg-gray-100 cursor-pointer select-none"
                      >
                        <FaUserPlus className="mr-2 size-4" />
                        Add DBCA User (Admin)
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Reports Menu - COMMENTED OUT: Not yet implemented */}
                {/*
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="text-white/70 hover:text-white hover:bg-white/10 select-none"
                    >
                      Reports
                      <IoCaretDown className="ml-1 h-3 w-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="bg-white text-gray-900 border-gray-200">
                    <DropdownMenuLabel className="text-center text-xs text-gray-500">
                      Annual Research Activity Report
                    </DropdownMenuLabel>
                    <DropdownMenuItem
                      onClick={() => navigate("/reports")}
                      className="hover:bg-gray-100 cursor-pointer select-none"
                    >
                      <CgViewList className="mr-2 size-4" />
                      Published Reports
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                */}


                {/* Admin Menu - COMMENTED OUT: Not yet implemented */}
                {/*
                {isSuperuser && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        className="text-white/70 hover:text-white hover:bg-white/10 select-none"
                      >
                        Admin
                        <IoCaretDown className="ml-1 h-3 w-3" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="bg-white text-gray-900 border-gray-200">
                      <DropdownMenuLabel className="text-center text-xs text-gray-500">
                        Manage
                      </DropdownMenuLabel>
                      <DropdownMenuItem
                        onClick={() => navigate("/admin")}
                        className="hover:bg-gray-100 cursor-pointer select-none"
                      >
                        <RiAdminFill className="mr-2 size-4" />
                        Admin Dashboard
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}


                {/* Guide Button - COMMENTED OUT: Page not yet created */}
                {/*
                <Button
                  variant="ghost"
                  className="text-white/70 hover:text-white hover:bg-white/10 select-none"
                  onClick={() => navigate("/guide")}
                >
                  Guide
                </Button>
                */}
              </div>

              {/* Right side - Navitar with name */}
              <div className="flex items-center px-3">
                <Navitar isModern={false} shouldShowName />
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
});