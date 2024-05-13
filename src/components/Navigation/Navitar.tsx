// Navitar - shown on both layouts. Uses useLayoutSwitcher to determine style

import {
  Avatar,
  Menu,
  Text,
  MenuButton,
  MenuGroup,
  MenuItem,
  MenuList,
  Center,
  Box,
  useColorMode,
  useToast,
  ToastId,
  Flex,
} from "@chakra-ui/react";
import { FaBook, FaUserCircle } from "react-icons/fa";
import { FiLogOut } from "react-icons/fi";
import { SiReadthedocs } from "react-icons/si";
import { GoTriangleDown } from "react-icons/go";
import { INavitar } from "../../types";
import { useEffect, useRef, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { logOut } from "../../lib/api";
import { useUser } from "../../lib/hooks/tanstack/useUser";
import { useLayoutSwitcher } from "../../lib/hooks/helper/LayoutSwitcherContext";
import { TbWorldWww } from "react-icons/tb";
import { ToggleLayout } from "../ToggleLayout";
import { ToggleDarkMode } from "../ToggleDarkMode";
import useApiEndpoint from "../../lib/hooks/helper/useApiEndpoint";
import { useNoImage } from "@/lib/hooks/helper/useNoImage";

export const Navitar = ({
  isModern,
  shouldShowName = false,
  windowSize,
}: INavitar) => {
  const { colorMode } = useColorMode();
  const { userData } = useUser();

  const baseAPI = useApiEndpoint();
  const noImage = useNoImage();

  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const toast = useToast();
  const toastIdRef = useRef<ToastId>();
  const addToast = (data) => {
    toastIdRef.current = toast(data);
  };
  const VITE_PRODUCTION_BACKEND_BASE_URL = import.meta.env.VITE_PRODUCTION_BACKEND_BASE_URL

  const mutation = useMutation({
    mutationFn: logOut,
    onMutate: () => {
      // const toastID =
      addToast({
        title: "Logging out...",
        description: "One moment!",
        status: "loading",
        position: "bottom-right",
        duration: 1000,
      });
    },
    onSuccess: () => {
      console.log("logout success");
      if (toastIdRef.current) {
        toast.update(toastIdRef.current, {
          title: "Logged out",
          description: "Thank you, come again!",
          status: "success",
          duration: 3000,
        });
      }
      // queryClient.refetchQueries(['me']);
      queryClient.invalidateQueries({ queryKey: ["me"] });
      // navigate("/login");
      window.location.href = VITE_PRODUCTION_BACKEND_BASE_URL;
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
                  (userData.first_name
                    ? userData.first_name.length < 12
                      ? userData.first_name
                      : windowSize >= 1150
                        ? userData.first_name
                        : `${userData?.first_name.substring(0, 9)}...`
                    : userData.username)}
              </Text>
            ) : null}
            <Avatar
              size="sm"
              name={userData?.username}
              src={
                userData?.image
                  ? userData.image?.file.startsWith("http")
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
          {!isModern && (
            <MenuGroup
              title="Docs, Settings & Layout"
              fontSize={"12px"}
              color={colorMode === "light" ? "gray.500" : "whiteAlpha.700"}
              textAlign={"center"}
              zIndex={isOpen ? 2 : 1}
            >
              <Flex>
                <ToggleLayout />
                <ToggleDarkMode />
              </Flex>

              <MenuItem
                onClick={() => {
                  window.open("https://sdis.readthedocs.io", "_blank");
                }}
                zIndex={isOpen ? 2 : 1}
              >
                {<SiReadthedocs />}
                <Text ml={2}>User Manual</Text>
              </MenuItem>
            </MenuGroup>
          )}

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
            >
              {<FaUserCircle />}
              <Text ml={2}>
                {layout === "modern" ? "My Profile" : "My SPMS Profile"}
              </Text>
            </MenuItem>
            <MenuItem
              onClick={() => {
                window.open("https://sww.dpaw.wa.gov.au/", "_blank");
              }}
              zIndex={isOpen ? 2 : 1}
            >
              {<FaUserCircle />}
              <Text ml={2}>My Public Profile</Text>
            </MenuItem>
            <MenuItem onClick={onLogOut} zIndex={isOpen ? 2 : 1}>
              {<FiLogOut />}
              <Text ml={2}>Logout</Text>
            </MenuItem>
          </MenuGroup>
          {isModern && (
            <MenuGroup
              title="Links"
              fontSize={"12px"}
              color={colorMode === "light" ? "gray.500" : "whiteAlpha.700"}
              textAlign={"center"}
              zIndex={isOpen ? 2 : 1}
            >
              <MenuItem
                onClick={() => {
                  window.open("https://data.dbca.wa.gov.au/", "_blank");
                }}
                zIndex={isOpen ? 2 : 1}
              >
                {<FaBook />}
                <Text ml={2}>Data Catalogue</Text>
              </MenuItem>
              <MenuItem
                onClick={() => {
                  window.open(
                    "https://scientificsites.dpaw.wa.gov.au/",
                    "_blank"
                  );
                }}
                zIndex={isOpen ? 2 : 1}
              >
                {<TbWorldWww />}
                <Text ml={2}>Scientific Site Register</Text>
              </MenuItem>
            </MenuGroup>
          )}
        </MenuList>
      </Menu>
    </Box>
  );
};
