// Navitar - shown on both layouts. Uses useLayoutSwitcher to determine style

import { useEditorContext } from "@/shared/hooks/EditorBlockerContext";
import { useNoImage } from "@/shared/hooks/useNoImage";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import { useColorMode } from "@/shared/utils/theme.utils";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRef, useState } from "react";
import { FaBook, FaFileCode, FaGamepad, FaUserCircle } from "react-icons/fa";
import { FiLogOut } from "react-icons/fi";
import { GoTriangleDown } from "react-icons/go";
import { SiReadthedocs } from "react-icons/si";
import { TbWorldWww } from "react-icons/tb";
import { useNavigate } from "react-router-dom";
import { logOut } from "@/features/auth/services/auth.service";
import { useLayoutSwitcher } from "@/shared/hooks/LayoutSwitcherContext";
import useApiEndpoint from "@/shared/hooks/useApiEndpoint";
import { useUser } from "@/features/users/hooks/useUser";
import type { INavitar } from "@/shared/types";
import { ToggleDarkMode } from "../ToggleDarkMode";
import { ToggleLayout } from "../ToggleLayout";
import { useMaintainer } from "@/features/admin/hooks/useMaintainer";
import { MdSpeakerNotes } from "react-icons/md";
import { cn } from "@/shared/utils";

export const Navitar = ({
  isModern,
  shouldShowName = false,
  windowSize,
}: INavitar) => {
  const { manuallyCheckAndToggleDialog } = useEditorContext();

  const { colorMode } = useColorMode();
  const { userData } = useUser();

  const baseAPI = useApiEndpoint();
  const noImage = useNoImage();
  const { maintainerData, maintainerLoading } = useMaintainer();

  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const VITE_PRODUCTION_BASE_URL = import.meta.env.VITE_PRODUCTION_BASE_URL;

  const mutation = useMutation({
    mutationFn: logOut,
    onMutate: () => {
      toast.loading("Logging out...", {
        description: "One moment!",
      });
    },
    onSuccess: (data) => {
      console.log("logout success");
      toast.success("Logged out", {
        description: "Thank you, come again!",
      });
      // queryClient.refetchQueries(['me']);
      queryClient.invalidateQueries({ queryKey: ["me"] });
      console.log("DATA IS:", data);
      if (data?.logoutUrl) {
        window.location.href = `${VITE_PRODUCTION_BASE_URL}${data.logoutUrl.slice(
          1,
        )}`;
      }
      // sso/signedout?relogin
      else {
        window.location.href = `${VITE_PRODUCTION_BASE_URL}`;
      }
      // navigate("/login");
      // window.location.href = VITE_PRODUCTION_BASE_URL;
      // window.location.assign('https://dbcab2c.b2clogin.com/dbcab2c.onmicrosoft.com/B2C_1A_Default_uat/oauth2/v2.0/logout?post_logout_redirect_uri=https%3A//login.microsoftonline.com/7b934664-cdcf-4e28-a3ee-1a5bcca0a1b6/oauth2/logout')
    },
    onError: (error) => {
      console.log("logout error, navigating to login");
      console.log(error);
      window.location.href = `${VITE_PRODUCTION_BASE_URL}login`;
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
  const setHref = (url: string) => {
    window.location.href = url;
  };
  const VITE_PRODUCTION_PROFILES_BASE_URL = import.meta.env
    .VITE_PRODUCTION_PROFILES_BASE_URL;

  return (
    <div className={cn("select-none", isOpen ? "z-20" : "z-10")}>
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger
          className={cn("z-20 outline-none", isOpen ? "z-20" : "z-10")}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <div className="flex items-center justify-center">
            {shouldShowName ? (
              <span
                className={cn(
                  "mx-3",
                  isModern
                    ? colorMode === "dark"
                      ? "text-white/80"
                      : "text-black/80"
                    : "text-white/90"
                )}
              >
                {userData !== undefined &&
                  userData &&
                  (userData.display_first_name
                    ? userData.display_first_name.length < 12
                      ? userData.display_first_name
                      : windowSize >= 1150
                        ? userData.display_first_name
                        : `${userData?.display_first_name.substring(0, 9)}...`
                    : userData.username)}
              </span>
            ) : null}
            <Avatar className="w-8 h-8">
              <AvatarImage
                src={
                  userData?.image
                    ? userData.image?.file?.startsWith("http")
                      ? `${userData.image?.file}`
                      : `${baseAPI}${userData.image?.file}`
                    : userData.image?.old_file
                      ? userData.image?.old_file
                      : noImage
                }
                alt={userData?.username}
              />
              <AvatarFallback>{userData?.username?.charAt(0)?.toUpperCase()}</AvatarFallback>
            </Avatar>
            <div
              className={cn(
                "flex items-center justify-center ml-1",
                isModern
                  ? colorMode === "dark"
                    ? "text-white/80"
                    : "text-black/80"
                  : "text-white/90"
              )}
            >
              <GoTriangleDown size={13} />
            </div>
          </div>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          className={cn("mt-[-7.5px]", isOpen ? "z-20" : "z-10")}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <DropdownMenuLabel className="text-xs text-center text-gray-500 dark:text-white/70">
            Docs & Layout
          </DropdownMenuLabel>
          <DropdownMenuGroup>
            {userData?.pk === maintainerData?.pk && (
              <DropdownMenuItem
                onClick={() => {
                  navigate("/crud/test");
                }}
                className={cn("cursor-pointer", colorMode === "dark" ? "text-gray-400" : "")}
              >
                <FaGamepad className="mr-2" />
                <span>Test</span>
              </DropdownMenuItem>
            )}

            <DropdownMenuItem
              onClick={() => {
                navigate("/guide");
              }}
              className={cn("cursor-pointer", colorMode === "dark" ? "text-gray-400" : "")}
            >
              <SiReadthedocs className="mr-2" />
              <span>Quick Guide</span>
            </DropdownMenuItem>

            <ToggleLayout asMenuItem />
            <ToggleDarkMode asMenuItem />
          </DropdownMenuGroup>

          <DropdownMenuSeparator />
          
          <DropdownMenuLabel className="text-xs text-center text-gray-500 dark:text-white/70">
            Links
          </DropdownMenuLabel>
          <DropdownMenuGroup>
            <DropdownMenuItem
              onClick={() => {
                window.open("https://data.bio.wa.gov.au/", "_blank");
              }}
              className={cn("cursor-pointer", colorMode === "dark" ? "text-gray-400" : "")}
            >
              <FaBook className="mr-2" />
              <span>Data Catalogue</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                window.open(
                  "https://scientificsites.dpaw.wa.gov.au/",
                  "_blank",
                );
              }}
              className={cn("cursor-pointer", colorMode === "dark" ? "text-gray-400" : "")}
            >
              <TbWorldWww className="mr-2" />
              <span>Scientific Sites Register</span>
            </DropdownMenuItem>
          </DropdownMenuGroup>

          <DropdownMenuSeparator />

          <DropdownMenuLabel className="text-xs text-center text-gray-500 dark:text-white/70">
            DBCA Account
          </DropdownMenuLabel>
          <DropdownMenuGroup>
            <DropdownMenuItem
              onClick={() => {
                navigate("/users/me");
              }}
              className={cn("cursor-pointer", colorMode === "dark" ? "text-gray-400" : "")}
            >
              <FaUserCircle className="mr-2" />
              <span>
                {layout === "modern" ? "My Profile" : "My SPMS Profile"}
              </span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                if (import.meta.env.MODE === "development") {
                  navigate(`/staff/${userData?.pk}`);
                } else {
                  setHref(
                    `${VITE_PRODUCTION_PROFILES_BASE_URL}staff/${userData?.pk}`,
                  );
                }
              }}
              className={cn("cursor-pointer", colorMode === "dark" ? "text-gray-400" : "")}
            >
              <FaUserCircle className="mr-2" />
              <span>My Public Profile</span>
            </DropdownMenuItem>

            {userData?.is_superuser && (
              <DropdownMenuItem
                onClick={onLogOut}
                className={cn("cursor-pointer", colorMode === "dark" ? "text-gray-400" : "")}
              >
                <FiLogOut className="mr-2" />
                <span>Logout</span>
              </DropdownMenuItem>
            )}
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
