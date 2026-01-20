import { ImUsers } from "react-icons/im";
import { FaUserPlus } from "react-icons/fa";
import { Button } from "@/shared/components/ui/button";
import { ToggleLayout } from "../ToggleLayout";
import { ToggleDarkMode } from "../ToggleDarkMode";
import { useUIStore, useAuthStore } from "@/app/stores/useStore";

interface TraditionalHeaderContentProps {
  handleNavigation: (path: string) => void;
}

/**
 * TraditionalHeaderContent
 * Navigation menu content for hamburger menu with toggle buttons and menu items
 */
export default function TraditionalHeaderContent({
  handleNavigation: navigateAndClose,
}: TraditionalHeaderContentProps) {
  const uiStore = useUIStore();
  const authStore = useAuthStore();

  return (
    <div className="py-4 flex flex-col gap-4">
      {/* Toggle buttons */}
      <div className="flex justify-center items-center gap-3 pb-4 border-b border-gray-700">
        <ToggleLayout showText onAfterToggle={() => uiStore.setHamburgerMenuOpen(false)} />
        <ToggleDarkMode showText onAfterToggle={() => uiStore.setHamburgerMenuOpen(false)} />
      </div>

      {/* Navigation Menu Items */}
      <div className="flex flex-col gap-1">
        {/* Projects Menu - COMMENTED OUT: Not yet implemented */}
        {/*
        <div className="flex flex-col gap-1">
          <div className="px-3 py-2 text-sm font-semibold text-gray-400 uppercase tracking-wider">
            Projects
          </div>
          <Button
            variant="ghost"
            className="justify-start text-white hover:text-white hover:bg-white/10 h-12 text-base pl-6"
            onClick={() => navigateAndClose("/projects")}
          >
            <span className="flex items-center gap-3">
              <HiMiniSquares2X2 className="text-xl" />
              <span>Browse Projects</span>
            </span>
          </Button>
        </div>
        */}

        {/* Users Section */}
        <div className="flex flex-col gap-1">
          <div className="px-3 py-2 text-sm font-semibold text-gray-400 uppercase tracking-wider">
            Users
          </div>
          <Button
            variant="ghost"
            className="justify-start text-white hover:text-white hover:bg-white/10 h-12 text-base pl-6"
            onClick={() => navigateAndClose("/users")}
          >
            <span className="flex items-center gap-3">
              <ImUsers className="text-xl" />
              <span>Browse Users</span>
            </span>
          </Button>
          <Button
            variant="ghost"
            className="justify-start text-white hover:text-white hover:bg-white/10 h-12 text-base pl-6"
            onClick={() => navigateAndClose("/users/create")}
          >
            <span className="flex items-center gap-3">
              <FaUserPlus className="text-xl" />
              <span>Add User</span>
            </span>
          </Button>
          {authStore.isSuperuser && (
            <Button
              variant="ghost"
              className="justify-start text-white hover:text-white hover:bg-white/10 h-12 text-base pl-6"
              onClick={() => navigateAndClose("/users/create-staff")}
            >
              <span className="flex items-center gap-3">
                <FaUserPlus className="text-xl" />
                <span>Add DBCA User (Admin)</span>
              </span>
            </Button>
          )}
        </div>

        {/* Reports Menu - COMMENTED OUT: Not yet implemented */}
        {/*
        <div className="flex flex-col gap-1">
          <div className="px-3 py-2 text-sm font-semibold text-gray-400 uppercase tracking-wider">
            Reports
          </div>
          <Button
            variant="ghost"
            className="justify-start text-white hover:text-white hover:bg-white/10 h-12 text-base pl-6"
            onClick={() => navigateAndClose("/reports")}
          >
            <span className="flex items-center gap-3">
              <PiBookOpenTextFill className="text-xl" />
              <span>Published Reports</span>
            </span>
          </Button>
        </div>
        */}

        {/* Admin Menu - COMMENTED OUT: Not yet implemented */}
        {/*
        {isSuperuser && (
          <div className="flex flex-col gap-1">
            <div className="px-3 py-2 text-sm font-semibold text-gray-400 uppercase tracking-wider">
              Admin
            </div>
            <Button
              variant="ghost"
              className="justify-start text-white hover:text-white hover:bg-white/10 h-12 text-base pl-6"
              onClick={() => navigateAndClose("/admin")}
            >
              <span className="flex items-center gap-3">
                <RiAdminFill className="text-xl" />
                <span>Admin Dashboard</span>
              </span>
            </Button>
          </div>
        )}
        */}

        {/* Guide Button - COMMENTED OUT: Page not yet created */}
        {/*
        <div className="flex flex-col gap-1">
          <div className="px-3 py-2 text-sm font-semibold text-gray-400 uppercase tracking-wider">
            Guide
          </div>
          <Button
            variant="ghost"
            className="justify-start text-white hover:text-white hover:bg-white/10 h-12 text-base pl-6"
            onClick={() => navigateAndClose("/guide")}
          >
            <span className="flex items-center gap-3">
              <FaBookBookmark className="text-xl" />
              <span>Quick Guide</span>
            </span>
          </Button>
        </div>
        */}
      </div>
    </div>
  );
}
