import { ChevronDown } from "lucide-react";
import { HiMiniSquares2X2 } from "react-icons/hi2";
import { FaUsers } from "react-icons/fa";
import { FaBookBookmark } from "react-icons/fa6";
import { PiBookOpenTextFill } from "react-icons/pi";
import { RiAdminFill } from "react-icons/ri";
import { Navitar } from "../Navitar";
import { Button } from "@/shared/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/components/ui/custom/CustomDropdownMenu";
import { ToggleLayout } from "../ToggleLayout";
import { ToggleDarkMode } from "../ToggleDarkMode";
import { useUIStore } from "@/app/stores/useStore";

interface TraditionalHeaderContentProps {
  handleNavigation: (path: string) => void;
  isSuperuser: boolean;
}

/**
 * TraditionalHeaderContent
 * Navigation menu content for hamburger menu with toggle buttons and menu items
 */
export default function TraditionalHeaderContent({
  handleNavigation,
  isSuperuser,
}: TraditionalHeaderContentProps) {
  const uiStore = useUIStore();

  return (
    <div className="py-3 flex flex-col gap-2">
      {/* Toggle buttons and Navitar */}
      <div className="flex justify-end items-center gap-2 mb-4 z-50">
        <ToggleLayout showText onAfterToggle={() => uiStore.setHamburgerMenuOpen(false)} />
        <ToggleDarkMode showText onAfterToggle={() => uiStore.setHamburgerMenuOpen(false)} />
        <div className="ml-3">
          <Navitar isModern={false} shouldShowName={false} />
        </div>
      </div>

      {/* Navigation Menu Items */}
      <div className="flex flex-col gap-2 z-40">
        {/* Projects Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="justify-between text-white/70 hover:text-white hover:bg-white/10 w-full"
            >
              <span className="flex items-center gap-2">
                <HiMiniSquares2X2 className="text-lg" />
                <span>Projects</span>
              </span>
              <ChevronDown className="h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="bg-gray-800 text-white border-gray-700">
            <DropdownMenuItem
              onClick={() => handleNavigation("/projects")}
              className="hover:bg-white/10 cursor-pointer"
            >
              Browse Projects
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Users Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="justify-between text-white/70 hover:text-white hover:bg-white/10 w-full"
            >
              <span className="flex items-center gap-2">
                <FaUsers className="text-lg" />
                <span>Users</span>
              </span>
              <ChevronDown className="h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="bg-gray-800 text-white border-gray-700">
            <DropdownMenuItem
              onClick={() => handleNavigation("/users")}
              className="hover:bg-white/10 cursor-pointer"
            >
              Browse SPMS Users
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Reports Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="justify-between text-white/70 hover:text-white hover:bg-white/10 w-full"
            >
              <span className="flex items-center gap-2">
                <PiBookOpenTextFill className="text-lg" />
                <span>Reports</span>
              </span>
              <ChevronDown className="h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="bg-gray-800 text-white border-gray-700">
            <DropdownMenuItem
              onClick={() => handleNavigation("/reports")}
              className="hover:bg-white/10 cursor-pointer"
            >
              Published Reports
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Admin Menu - Only for superusers */}
        {isSuperuser && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="justify-between text-white/70 hover:text-white hover:bg-white/10 w-full"
              >
                <span className="flex items-center gap-2">
                  <RiAdminFill className="text-lg" />
                  <span>Admin</span>
                </span>
                <ChevronDown className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-gray-800 text-white border-gray-700">
              <DropdownMenuItem
                onClick={() => handleNavigation("/admin")}
                className="hover:bg-white/10 cursor-pointer"
              >
                Admin Dashboard
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        {/* Guide Button */}
        <Button
          variant="ghost"
          className="justify-start text-white/70 hover:text-white hover:bg-white/10"
          onClick={() => handleNavigation("/guide")}
        >
          <span className="flex items-center gap-2">
            <FaBookBookmark className="text-lg" />
            <span>Guide</span>
          </span>
        </Button>
      </div>
    </div>
  );
}
