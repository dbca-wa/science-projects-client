// Display for a single user on the Users page (mapped over for each user on a grid). Also with drawer for more details.

import useServerImageUrl from "@/shared/hooks/useServerImageUrl";
import type { IUserData } from "@/shared/types";
import { UserProfile } from "./UserProfile";
import { Box, type BoxProps } from "@chakra-ui/react/box";
import type { FC, ReactNode } from "react";
import { Grid } from "@chakra-ui/react/grid";
import { useBreakpointValue } from "@chakra-ui/react/media-query";
import { useColorMode } from "@chakra-ui/react/color-mode";
import { useDisclosure } from "@chakra-ui/react";
import {
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerFooter,
  DrawerOverlay,
} from "@chakra-ui/react/modal";
import { Flex } from "@chakra-ui/react/flex";
import { Avatar } from "@chakra-ui/react/avatar";
import { Button } from "@chakra-ui/react/button";
import { cn } from "@/shared/utils";

interface BoxContainerProps extends BoxProps {
  children: ReactNode;
}

export const BoxContainer: FC<BoxContainerProps> = ({ children, ...props }) => {
  return (
    <Grid whiteSpace="normal" maxWidth="100%" {...props}>
      {children}
    </Grid>
  );
};

export const UserGridItem = ({
  pk,
  username,
  email,
  display_first_name,
  display_last_name,
  is_staff,
  is_superuser,
  is_active,
  business_area,
  role,
  branch,
  image,
  affiliation,
  branches,
  businessAreas,
}: IUserData) => {
  const fullName =
    display_first_name !== null && display_last_name !== null
      ? `${display_first_name} ${display_last_name}`
      : `No Name (${username})`;
  const isXlOrLarger = useBreakpointValue({
    base: false,
    sm: false,
    md: false,
    lg: false,
    xl: true,
  });
  const isLargerOrLarger = useBreakpointValue({
    base: false,
    sm: false,
    md: false,
    lg: true,
    xl: true,
  });
  const isOver690 = useBreakpointValue({
    false: true,
    sm: false,
    md: false,
    over690: true,
    mdlg: true,
    lg: true,
    xlg: true,
  });

  // const baseAPI = useApiEndpoint();
  const imageUrl = useServerImageUrl(image?.file);

  const { colorMode } = useColorMode();

  const {
    isOpen: isUserOpen,
    onOpen: onUserOpen,
    onClose: onUserClose,
  } = useDisclosure();

  const drawerFunction = () => {
    // console.log(`${first_name} clicked`);
    onUserOpen();
  };

  // useEffect(() => {
  //   console.log(is_active);
  // }, [is_active]);

  return (
    <>
      <Drawer
        isOpen={isUserOpen}
        placement="right"
        onClose={onUserClose}
        size={"lg"} //by default is xs
      >
        <DrawerOverlay zIndex={999} />
        <DrawerContent>
          <DrawerBody>
            <UserProfile
              pk={pk}
              branches={branches}
              businessAreas={businessAreas}
            />
          </DrawerBody>

          <DrawerFooter></DrawerFooter>
        </DrawerContent>
      </Drawer>

      <Grid
        templateColumns={{
          base: "1fr",
          lg: "8fr 4fr",
          xl: "4fr 4fr 2.5fr",
          // base: "4fr 4fr 2.5fr",
          // base: "4fr 4fr 2.5fr",
          //   lg: "4fr 4fr 2.5fr",
        }}
        alignItems="center"
        p={4}
        borderWidth={1}
        width="100%"
        key={pk}
        userSelect={"none"}
        cursor={"pointer"}
        onClick={drawerFunction}
        _hover={{
          scale: 1.1,
          boxShadow:
            colorMode === "light"
              ? "0px 5px 10px -2.5px rgba(0, 0, 0, 0.15), -0.5px 1px 2px -0.5px rgba(0, 0, 0, 0.03), -1.5px 0px 2.5px -0.5px rgba(0, 0, 0, 0.0375), 0.5px 0px 2.5px -0.5px rgba(0, 0, 0, 0.0375)"
              : "0px 1.5px 2.25px -0.75px rgba(255, 255, 255, 0.02), -0.5px 0.5px 1px -0.5px rgba(255, 255, 255, 0.015)",
        }}
      >
        {
          // isXlOrLarger ?
          <Flex
            ml={2}
            // bg={"red"}
          >
            <Box minW={55} mr={4}>
              <Avatar
                className="pointer-events-none"
                draggable="false"
                src={imageUrl}
                userSelect={"none"}
                h={55}
                w={55}
                objectFit="cover"
                cursor={"pointer"}
                onClick={drawerFunction}
              />
            </Box>

            {/* Full Name */}
            <BoxContainer
              ml={isXlOrLarger ? 4 : 2}
              w="100%"
              overflow="hidden"
              textOverflow={"ellipsis"}
              justifyContent={"start"}
              gridTemplateColumns={"repeat(1, 1fr)"}
            >
              <Button
                fontWeight="bold"
                variant={"link"}
                as={"a"}
                cursor={"pointer"}
                onClick={drawerFunction}
                justifyContent={"start"}
              >
                {/* {is_staff
									? isXlOrLarger
										? fullName
											: fullName.length > 16
												? `${fullName.substring(0, 10)}...`
												: fullName
										: isXlOrLarger
									? fullName?.startsWith("None")
											? username
											: `${fullName}`
										: username} */}

                {fullName
                  ? fullName?.startsWith("None ")
                    ? username
                    : fullName.length > 30
                      ? `${fullName.substring(0, 30)}...`
                      : fullName
                  : username}
              </Button>
              <p
                className={cn(
                  "text-sm",
                  is_superuser
                    ? role === "Executive"
                      ? "text-orange-500"
                      : "text-blue-500"
                    : is_staff
                      ? "text-green-500"
                      : "text-gray-500",
                )}
              >
                {
                  // If no role set
                  is_superuser
                    ? role == "Executive"
                      ? "Executive"
                      : "Admin"
                    : is_staff
                      ? `Staff${
                          business_area?.leader === pk
                            ? " (Business Area Leader)"
                            : ""
                        }`
                      : "External User"
                }
                {is_active === false && ` (Inactive)`}
              </p>
              {is_staff ? (
                <p
                  className={cn(
                    "text-sm",
                    colorMode === "light" ? "text-gray-500" : "text-gray-300",
                  )}
                >
                  {branch ? branch.name : `Branch Not Set`}
                </p>
              ) : (
                <p
                  className={cn(
                    "text-sm",
                    colorMode === "light" ? "text-gray-600" : "text-gray-300",
                  )}
                >
                  {affiliation?.pk ? affiliation.name : "No Affiliations"}
                </p>
              )}
            </BoxContainer>
          </Flex>
          // :null
        }

        {/* Email Address */}
        {isXlOrLarger ? (
          <Box
            // bg={"green"}

            ml={4}
            w="100%"
            overflow="hidden"
            textOverflow={"ellipsis"}
            draggable={false}
          >
            <p>{email ? (email.endsWith("email.com") ? "-" : email) : email}</p>
          </Box>
        ) : !isOver690 ? (
          <Box
            ml={4}
            w="100%"
            overflow="hidden"
            textOverflow={"ellipsis"}
            draggable={false}
          >
            <p>
              {email
                ? email.endsWith("email.com")
                  ? "(Not Provided)"
                  : email.length >= 15
                    ? `${email.substring(0, 13)}...`
                    : email
                : "-"}
            </p>
          </Box>
        ) : isLargerOrLarger ? (
          <Box
            // ml={4}
            flex={1}
            // bg={"red"}
            px={4}
            w="100%"
            overflow="hidden"
            textOverflow={"ellipsis"}
            draggable={false}
          >
            <p>
              {email
                ? email.endsWith("email.com")
                  ? "(Not Provided)"
                  : email.length >= 25
                    ? `${email.substring(0, 20)}...`
                    : email
                : "-"}
            </p>
          </Box>
        ) : null}

        {/* Business Area */}
        {isXlOrLarger ? (
          <BoxContainer
            ml={4}
            w="100%"
            overflow="hidden"
            textOverflow={"ellipsis"}
          >
            <p>{business_area ? business_area.name : "-"}</p>
          </BoxContainer>
        ) : null}
      </Grid>
    </>
  );
};
