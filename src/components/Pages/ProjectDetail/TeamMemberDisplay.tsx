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
  useColorMode,
  useDisclosure,
} from "@chakra-ui/react";
import { ProjectUserDetails } from "./ProjectUserDetails";
import { IImageData } from "../../../types";
import { FaCrown } from "react-icons/fa";

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
  // position,
  username,
  usersCount,
  project_id,
}: ITeamMember) => {
  const { colorMode } = useColorMode();

  const roleColors: { [key: string]: { bg: string; color: string } } = {
    "Research Scientist": { bg: "green.700", color: "white" },
    "Supervising Scientist": { bg: "orange.700", color: "white" },
    "Academic Supervisor": { bg: "blue.500", color: "white" },
    "Supervised Student": { bg: "blue.400", color: "whiteAlpha.900" },
    "Technical Officer": { bg: "orange.900", color: "white" },
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
    ["research", "Research Scientist"],
    ["supervising", "Supervising Scientist"],
    ["academicsuper", "Academic Supervisor"],
    ["student", "Supervised Student"],
    ["technical", "Technical Officer"],
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
            <Avatar
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
            />
            {is_leader && (
              <Box pos={"absolute"} color={"yellow.300"} top={-1} right={"33%"}>
                <FaCrown />
              </Box>
            )}
          </Box>

          <Grid
            ml={4}
            gridTemplateColumns={"repeat(1, 1fr)"}
            userSelect={"none"}
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
