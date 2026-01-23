import { useNavigate } from "react-router";
import { useAuthStore, useUIStore } from "@/app/stores/store-context";
import { useLogout } from "@/features/auth/hooks/useAuth";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/components/ui/avatar";
import { Separator } from "@/shared/components/ui/separator";
import { User, LogOut, LayoutGrid, LayoutList, Moon, Sun, BookOpen } from "lucide-react";
import { useState } from "react";
import { getUserDisplayName, getUserInitials } from "@/shared/utils/user.utils";
import { getImageUrl } from "@/shared/utils/image.utils";

interface NavitarContentProps {
  onClose: () => void;
}

/**
 * NavitarContent - The content inside the Navitar popover
 * Captures MobX state on mount to prevent flickering during close animation
 */
export default function NavitarContent({ onClose }: NavitarContentProps) {
  const navigate = useNavigate();
  const authStore = useAuthStore();
  const uiStore = useUIStore();
  const { mutate: logout } = useLogout();

  // Capture store values once on mount using useState with initializer function
  const [snapshot] = useState(() => ({
    userData: authStore.user,
    layout: uiStore.layout,
    theme: uiStore.theme,
  }));

  const avatarSrc = getImageUrl(snapshot.userData?.image);
  const displayName = getUserDisplayName(snapshot.userData);
  const initials = getUserInitials(snapshot.userData);

  return (
    <div className="flex flex-col">
      {/* User Info Section */}
      <div className="p-4">
        <div className="flex gap-3 items-center">
          <Avatar className="h-12 w-12">
            <AvatarImage src={avatarSrc} alt={displayName} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col overflow-hidden">
            <h4 className="text-lg font-bold truncate">
              {displayName}
            </h4>
            <span className="text-xs text-gray-500 dark:text-gray-400 truncate">
              {snapshot.userData?.email}
            </span>
          </div>
        </div>
      </div>

      <Separator />


      {/* DBCA Account Section */}
      <div className="py-1">
        <div className="px-4 py-2">
          <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">
            DBCA Account
          </span>
        </div>
        
        {/* My SPMS Profile */}
        <div
          onClick={() => {
            navigate("/users/me");
            onClose();
          }}
          className="cursor-pointer p-2.5 px-4 hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          <div className="flex gap-2 items-center">
            <User className="h-4 w-4" />
            <span className="text-sm">
              {snapshot.layout === "modern" ? "My Profile" : "My SPMS Profile"}
            </span>
          </div>
        </div>
      </div>
      
      <Separator />

      {/* Appearance Section */}
      <div className="py-1">
        <div className="px-4 py-2">
          <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">
            Appearance
          </span>
        </div>

        {/* Toggle Layout */}
        <div
          onClick={() => uiStore.toggleLayout()}
          className="cursor-pointer p-2.5 px-4 hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          <div className="flex gap-2 items-center">
            {snapshot.layout === "modern" ? (
              <LayoutList className="h-4 w-4" />
            ) : (
              <LayoutGrid className="h-4 w-4" />
            )}
            <span className="text-sm">Toggle Layout</span>
          </div>
        </div>

        {/* Toggle Dark Mode */}
        <div
          onClick={() => uiStore.toggleTheme()}
          className="cursor-pointer p-2.5 px-4 hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          <div className="flex gap-2 items-center">
            {snapshot.theme === "dark" ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
            <span className="text-sm">Toggle Dark Mode</span>
          </div>
        </div>
      </div>

      <Separator />

      {/* Links Section */}
      <div className="py-1">
        <div className="px-4 py-2">
          <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">
            Links
          </span>
        </div>
        
        {/* Quick Guide */}
        <div
          onClick={() => {
            navigate("/guide");
            onClose();
          }}
          className="cursor-pointer p-2.5 px-4 hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          <div className="flex gap-2 items-center">
            <BookOpen className="h-4 w-4" />
            <span className="text-sm">Quick Guide</span>
          </div>
        </div>
        
        {/* Data Catalogue */}
        <div
          onClick={() => {
            window.open("https://data.bio.wa.gov.au/", "_blank");
            onClose();
          }}
          className="cursor-pointer p-2.5 px-4 hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          <div className="flex gap-2 items-center">
            <BookOpen className="h-4 w-4" />
            <span className="text-sm">Data Catalogue</span>
          </div>
        </div>

        {/* Scientific Sites Register */}
        <div
          onClick={() => {
            window.open("https://scientificsites.dpaw.wa.gov.au/", "_blank");
            onClose();
          }}
          className="cursor-pointer p-2.5 px-4 hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          <div className="flex gap-2 items-center">
            <BookOpen className="h-4 w-4" />
            <span className="text-sm">Scientific Sites Register</span>
          </div>
        </div>
      </div>

      <Separator />

      {/* Logout Section */}
      <div className="py-1">
        <div
          onClick={() => {
            logout(undefined, {
              onSuccess: () => {
                navigate("/login", { replace: true });
              },
            });
            onClose();
          }}
          className="cursor-pointer p-2.5 px-4 hover:bg-gray-100 dark:hover:bg-gray-800 text-red-600 dark:text-red-400"
        >
          <div className="flex gap-2 items-center">
            <LogOut className="h-4 w-4" />
            <span className="text-sm font-medium">Logout</span>
          </div>
        </div>
      </div>

    </div>
  );
}