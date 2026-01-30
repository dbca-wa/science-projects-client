import { ImUsers } from "react-icons/im";
import { FaUserPlus, FaMapMarkedAlt } from "react-icons/fa";
import { CgBrowse, CgPlayListAdd } from "react-icons/cg";
import { User, LogOut, BookOpen } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Separator } from "@/shared/components/ui/separator";
import { ToggleDarkMode } from "./ToggleDarkMode";
import { useAuthStore } from "@/app/stores/store-context";
import { useLogout } from "@/features/auth/hooks/useAuth";

interface HeaderContentProps {
  handleNavigation: (path: string) => void;
  onClose: () => void;
}

/**
 * HeaderContent
 * Navigation menu content for hamburger menu with navigation items and quick links
 */
export default function HeaderContent({
  handleNavigation,
  onClose,
}: HeaderContentProps) {
  const authStore = useAuthStore();
  const { mutate: logout } = useLogout();
  
  const navigateAndClose = (path: string) => {
    onClose(); // Trigger close animation
    handleNavigation(path); // Navigate
  };

  const handleLogout = () => {
    onClose();
    logout(undefined, {
      onSuccess: () => {
        handleNavigation("/login");
      },
    });
  };

  return (
    <div className="flex flex-col h-full">
      {/* Top Section - My Profile & Dark Mode Toggle */}
      <div className="border-b border-gray-700 py-3">
        <div className="flex items-center gap-2 px-3">
          <Button
            variant="ghost"
            className="justify-start text-white hover:text-white hover:bg-white/10 h-12 text-base flex-1 pl-6"
            onClick={() => navigateAndClose("/users/me")}
          >
            <span className="flex items-center gap-3">
              <User className="text-xl" />
              <span>My Profile</span>
            </span>
          </Button>
          <ToggleDarkMode showText={false} onAfterToggle={onClose} withBackground />
        </div>
      </div>

      {/* Main Navigation - Scrollable */}
      <div className="flex-1 overflow-y-auto py-4">
        <div className="flex flex-col gap-1">
          {/* Projects Section */}
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
                <CgBrowse className="text-xl" />
                <span>Browse Projects</span>
              </span>
            </Button>
            <Button
              variant="ghost"
              className="justify-start text-white hover:text-white hover:bg-white/10 h-12 text-base pl-6"
              onClick={() => navigateAndClose("/projects/map")}
            >
              <span className="flex items-center gap-3">
                <FaMapMarkedAlt className="text-xl" />
                <span>Project Map</span>
              </span>
            </Button>
            <Button
              variant="ghost"
              className="justify-start text-white hover:text-white hover:bg-white/10 h-12 text-base pl-6"
              onClick={() => navigateAndClose("/projects/create")}
            >
              <span className="flex items-center gap-3">
                <CgPlayListAdd className="text-xl" />
                <span>Create New Project</span>
              </span>
            </Button>
          </div>

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

          {/* Quick Links Section */}
          <div className="flex flex-col gap-1">
            <div className="px-3 py-2 text-sm font-semibold text-gray-400 uppercase tracking-wider">
              Quick Links
            </div>
            
            <Button
              variant="ghost"
              className="justify-start text-white hover:text-white hover:bg-white/10 h-12 text-base pl-6"
              onClick={() => navigateAndClose("/guide")}
            >
              <span className="flex items-center gap-3">
                <BookOpen className="text-xl" />
                <span>Quick Guide</span>
              </span>
            </Button>

            <Button
              variant="ghost"
              className="justify-start text-white hover:text-white hover:bg-white/10 h-12 text-base pl-6"
              onClick={() => {
                window.open("https://data.bio.wa.gov.au/", "_blank");
                onClose();
              }}
            >
              <span className="flex items-center gap-3">
                <BookOpen className="text-xl" />
                <span>Data Catalogue</span>
              </span>
            </Button>

            <Button
              variant="ghost"
              className="justify-start text-white hover:text-white hover:bg-white/10 h-12 text-base pl-6"
              onClick={() => {
                window.open("https://scientificsites.dpaw.wa.gov.au/", "_blank");
                onClose();
              }}
            >
              <span className="flex items-center gap-3">
                <BookOpen className="text-xl" />
                <span>Scientific Sites Register</span>
              </span>
            </Button>
          </div>
        </div>
      </div>

      {/* Logout Section - Fixed at bottom */}
      <div className="border-t border-gray-700 py-2">
        <Button
          variant="ghost"
          className="w-full justify-start text-red-400 hover:text-red-300 hover:bg-red-900/20 h-12 text-base pl-6"
          onClick={handleLogout}
        >
          <span className="flex items-center gap-3">
            <LogOut className="text-xl" />
            <span>Logout</span>
          </span>
        </Button>
      </div>
    </div>
  );
}
