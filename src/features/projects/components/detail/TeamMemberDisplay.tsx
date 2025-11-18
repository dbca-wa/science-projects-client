// Component for showing details regarding a team member. Dragging adjusts the position of the team member.

import {
  Avatar,
  Box,
  Button,
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerFooter,
  DrawerOverlay,
  Flex,
  Grid,
  HStack,
  Tag,
  Tooltip,
  useColorMode,
  useDisclosure,
  Text,
} from "@chakra-ui/react";
import { FaCrown } from "react-icons/fa";
import type {
  IBranch,
  IBusinessArea,
  ICaretakerSimpleUserData,
  IImageData,
} from "@/shared/types/index.d";
import { ProjectUserDetails } from "./ProjectUserDetails";
import { UserProfile } from "../Users/UserProfile";
import useApiEndpoint from "@/shared/hooks/useApiEndpoint";

interface ITeamMember {
  user_id: number;
  username: string | null;
  is_leader: boolean;
  name: string;
  role: string;
  image: IImageData;
  short_code: string | number;
  time_allocation: number;
  position: number;
  usersCount: number;
  project_id: number;
  leader_pk: number;
  refetchTeamData: () => void;
  ba_leader: number;
  caretaker: ICaretakerSimpleUserData;
  baData: IBusinessArea[];
  branchesData: IBranch[];
}

export const TeamMemberDisplay = ({
  refetchTeamData,
  user_id,
  is_leader,
  leader_pk,
  name,
  role,
  image,
  short_code,
  time_allocation,
  caretaker,
  // position,
  username,
  usersCount,
  project_id,
  ba_leader,
  baData,
  branchesData,
}: ITeamMember) => {
  console.log("Image", caretaker);
  const { colorMode } = useColorMode();

  const roleColors: { [key: string]: { bg: string; color: string } } = {
    "Science Support": { bg: "green.700", color: "white" },
    "Project Leader": { bg: "orange.700", color: "white" },
    "Academic Supervisor": { bg: "blue.500", color: "white" },
    "Supervised Student": { bg: "blue.400", color: "whiteAlpha.900" },
    "Technical Support": { bg: "orange.900", color: "white" },
    "Consulted Peer": { bg: "green.200", color: "black" },
    "External Collaborator": { bg: "gray.200", color: "black" },
    "External Peer": { bg: "gray.300", color: "black" },
    "Involved Group": { bg: "gray.500", color: "white" },
  };

  type Role =
    | "research"
    | "supervising"
    | "academicsuper"
    | "student"
    | "technical"
    | "consulted"
    | "externalcol"
    | "externalpeer"
    | "group";

  const roleDefinitions: [Role, string][] = [
    ["research", "Science Support"],
    ["supervising", "Project Leader"],
    ["academicsuper", "Academic Supervisor"],
    ["student", "Supervised Student"],
    ["technical", "Technical Support"],
    ["consulted", "Consulted Peer"],
    ["externalcol", "External Collaborator"],
    ["externalpeer", "External Peer"],
    ["group", "Involved Group"],
  ];

  const roleArray = roleDefinitions.map(([roleKey, displayName]) => {
    const { bg, color } = roleColors[displayName];
    return {
      role: roleKey,
      displayName: displayName,
      bg: bg,
      color: color,
    };
  });

  const {
    isOpen: isUserOpen,
    onOpen: onUserOpen,
    onClose: onUserClose,
  } = useDisclosure();

  const {
    isOpen: isCaretakerOpen,
    onOpen: onCaretakerOpen,
    onClose: onCaretakerClose,
  } = useDisclosure();

  const baseURL = useApiEndpoint();

  return (
    <>
      <Drawer
        isOpen={isUserOpen}
        placement="right"
        onClose={onUserClose}
        size={"sm"} //by default is xs
      >
        <DrawerOverlay />
        <DrawerContent>
          <DrawerBody>
            <ProjectUserDetails
              ba_leader={ba_leader}
              leader_pk={leader_pk}
              project_id={project_id}
              pk={user_id}
              is_leader={is_leader}
              role={role}
              shortCode={short_code}
              // position={position}
              time_allocation={time_allocation}
              usersCount={usersCount}
              refetchTeamData={refetchTeamData}
              onClose={() => {
                onUserClose();
                refetchTeamData();
              }}
            />
          </DrawerBody>

          <DrawerFooter></DrawerFooter>
        </DrawerContent>
      </Drawer>
      <Drawer
        isOpen={isCaretakerOpen}
        placement="right"
        onClose={onCaretakerClose}
        size={"lg"} //by default is xs
      >
        <DrawerOverlay zIndex={999} />
        <DrawerContent>
          <DrawerBody>
            <UserProfile
              pk={caretaker?.pk}
              branches={branchesData}
              businessAreas={baData}
            />
          </DrawerBody>

          <DrawerFooter></DrawerFooter>
        </DrawerContent>
      </Drawer>
      <HStack
        bg={colorMode === "light" ? "white" : "gray.800"}
        justifyContent={"space-between"}
        _hover={{
          boxShadow:
            colorMode === "light"
              ? "0px 20px 30px -10px rgba(0, 0, 0, 0.3), 0px 4px 5px -2px rgba(0, 0, 0, 0.06), -3px 0px 10px -2px rgba(0, 0, 0, 0.1), 3px 0px 10px -2px rgba(0, 0, 0, 0.1)"
              : "0px 4px 6px -1px rgba(255, 255, 255, 0.1), 0px 2px 4px -1px rgba(255, 255, 255, 0.06)",
          zIndex: 999,
        }}
      >
        {/* Left Section */}
        <Flex p={4}>
          <Box pos={"relative"}>
            {/* <Avatar
              src={
                image?.file
                  ? image.file
                  : image?.old_file
                    ? image.old_file
                    : undefined
              }
              userSelect={"none"}
              onClick={onUserOpen}
              cursor="pointer"
            /> */}
            <Avatar
              mt={1}
              size={"lg"}
              src={
                image?.file
                  ? `${baseURL}${image.file}`
                  : image?.old_file
                    ? `${baseURL}${image.old_file}`
                    : ""
              }
              userSelect={"none"}
              onClick={onUserOpen}
              cursor="pointer"
              className="pointer-events-none select-none"
            />
            {is_leader && (
              <Box pos={"absolute"} color={"yellow.300"} top={-1} right={"38%"}>
                <FaCrown />
              </Box>
            )}
          </Box>

          <Grid
            ml={4}
            gridTemplateColumns={"repeat(1, 1fr)"}
            userSelect={"none"}
          >
            <Box
              display={"flex"}
              flexDirection={"row"}
              gap={2}
              alignItems={"center"}
            >
              <Button
                ml={"2px"}
                variant={"link"}
                justifyContent={"start"}
                // color={"white"}
                color={colorMode === "light" ? "blue.500" : "blue.600"}
                _hover={{
                  color: colorMode === "light" ? "blue.400" : "blue.500",
                }}
                onClick={onUserOpen}
                cursor="pointer"
                fontSize={"lg"}
              >
                {name !== "undefined undefined" && name !== "None None"
                  ? name
                  : username}
              </Button>
              {/* Display caretaker info if there is one */}
              {caretaker && (
                <Tooltip
                  label={`This user is away and ${caretaker.display_first_name} ${caretaker.display_last_name} is caretaking`}
                  aria-label="Caretaker"
                >
                  <Box
                    display={"flex"}
                    alignItems={"center"}
                    gap={2}
                    userSelect={"none"}
                    onClick={onCaretakerOpen}
                    cursor="pointer"
                  >
                    <Avatar
                      mt={1}
                      size={"xs"}
                      src={
                        caretaker?.image ? `${baseURL}${caretaker?.image}` : ""
                      }
                    />
                    <Text
                      color={"blue.500"}
                      fontSize={"xs"}
                      justifyContent={"center"}
                    >
                      ({caretaker.display_first_name}{" "}
                      {caretaker.display_last_name} is caretaking)
                    </Text>
                  </Box>
                </Tooltip>
              )}
            </Box>
            <Box>
              <Tag
                bg={roleArray.find((item) => item.role === role)?.bg ?? ""}
                color={
                  roleArray.find((item) => item.role === role)?.color ?? ""
                }
                size={"md"}
                justifyContent={"center"}
              >
                {roleArray.find((item) => item.role === role)?.displayName ??
                  ""}
              </Tag>
            </Box>
          </Grid>
        </Flex>
      </HStack>
    </>
  );
};
