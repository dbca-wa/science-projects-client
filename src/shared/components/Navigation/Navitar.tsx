// Navitar - shown on both layouts. Uses useLayoutSwitcher to determine style

import { useEditorContext } from "@/shared/hooks/EditorBlockerContext";
import { useNoImage } from "@/shared/hooks/useNoImage";
import {
  Avatar,
  Box,
  Center,
  Menu,
  MenuButton,
  MenuGroup,
  MenuItem,
  MenuList,
  Text,
  type ToastId,
  useColorMode,
  useToast,
  type UseToastOptions,
} from "@chakra-ui/react";
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
  const toast = useToast();
  const ToastIdRef = useRef<ToastId | undefined>(undefined);
  const addToast = (data: UseToastOptions) => {
    ToastIdRef.current = toast(data);
  };
  const VITE_PRODUCTION_BASE_URL = import.meta.env.VITE_PRODUCTION_BASE_URL;

  const mutation = useMutation({
    mutationFn: logOut,
    onMutate: () => {
      // const ToastId =
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
      if (ToastIdRef.current) {
        toast.update(ToastIdRef.current, {
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
                  (userData.display_first_name
                    ? userData.display_first_name.length < 12
                      ? userData.display_first_name
                      : windowSize >= 1150
                        ? userData.display_first_name
                        : `${userData?.display_first_name.substring(0, 9)}...`
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
            color={colorMode === "light" ? "gray.500" : "whiteAlpha.700"}
            textAlign={"center"}
            zIndex={isOpen ? 2 : 1}
          >
            {userData?.pk === maintainerData?.pk && (
              <>
                <MenuItem
                  onClick={() => {
                    navigate("/crud/test");
                  }}
                  zIndex={isOpen ? 2 : 1}
                  color={colorMode === "dark" ? "gray.400" : null}
                >
                  {<FaGamepad />}

                  <Text ml={2}>Test</Text>
                </MenuItem>
              </>
            )}

            <MenuItem
              onClick={() => {
                navigate("/guide");
                // window.open("https://sdis.readthedocs.io", "_blank");
              }}
              zIndex={isOpen ? 2 : 1}
              color={colorMode === "dark" ? "gray.400" : null}
            >
              {<SiReadthedocs />}
              <Text ml={2}>Quick Guide</Text>
            </MenuItem>

            <ToggleLayout asMenuItem />
            <ToggleDarkMode asMenuItem />
          </MenuGroup>

          {/* {isModern && ( */}
          <MenuGroup
            title="Links"
            fontSize={"12px"}
            color={colorMode === "light" ? "gray.500" : "whiteAlpha.700"}
            textAlign={"center"}
            zIndex={isOpen ? 2 : 1}
          >
            <MenuItem
              onClick={() => {
                window.open("https://data.bio.wa.gov.au/", "_blank");
              }}
              zIndex={isOpen ? 2 : 1}
              color={colorMode === "dark" ? "gray.400" : null}
            >
              {<FaBook />}
              <Text ml={2}>Data Catalogue</Text>
            </MenuItem>
            <MenuItem
              onClick={() => {
                window.open(
                  "https://scientificsites.dpaw.wa.gov.au/",
                  "_blank",
                );
              }}
              zIndex={isOpen ? 2 : 1}
              color={colorMode === "dark" ? "gray.400" : null}
            >
              {<TbWorldWww />}
              <Text ml={2}>Scientific Sites Register</Text>
            </MenuItem>
          </MenuGroup>
          {/* )} */}

          <MenuGroup
            title="DBCA Account"
            fontSize={"12px"}
            color={colorMode === "light" ? "gray.500" : "whiteAlpha.700"}
            textAlign={"center"}
            zIndex={isOpen ? 2 : 1}
          >
            <MenuItem
              onClick={() => {
                navigate("/users/me");
              }}
              zIndex={isOpen ? 2 : 1}
              color={colorMode === "dark" ? "gray.400" : null}
            >
              {<FaUserCircle />}
              <Text ml={2}>
                {layout === "modern" ? "My Profile" : "My SPMS Profile"}
              </Text>
            </MenuItem>
            <MenuItem
              // onClick={() => {
              //   window.open("https://sww.dpaw.wa.gov.au/", "_blank");
              // }}
              onClick={() => {
                if (import.meta.env.MODE === "development") {
                  navigate(`/staff/${userData?.pk}`);
                } else {
                  setHref(
                    `${VITE_PRODUCTION_PROFILES_BASE_URL}staff/${userData?.pk}`,
                  );
                }
              }}
              zIndex={isOpen ? 2 : 1}
              color={colorMode === "dark" ? "gray.400" : null}
            >
              {<FaUserCircle />}
              <Text ml={2}>My Public Profile</Text>
            </MenuItem>

            {userData?.is_superuser && (
              <MenuItem
                onClick={onLogOut}
                zIndex={isOpen ? 2 : 1}
                color={colorMode === "dark" ? "gray.400" : null}
              >
                {<FiLogOut />}
                <Text ml={2}>Logout</Text>
              </MenuItem>
            )}
          </MenuGroup>
        </MenuList>
      </Menu>
    </Box>
  );
};
