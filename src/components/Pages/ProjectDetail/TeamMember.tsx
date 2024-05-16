// Component for showing details regarding a team member. Dragging adjusts the position of the team member.

import useApiEndpoint from "@/lib/hooks/helper/useApiEndpoint";
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
import { DraggableProvided } from "react-beautiful-dnd"; // Import DraggableProvided
import { FaCrown } from "react-icons/fa";
import { IImageData, IUserData, IUserMe } from "../../../types";
import { ProjectUserDetails } from "./ProjectUserDetails";

interface ITeamMember {
  user_id: number;
  username: string | null;
  is_leader: boolean;
  leader_pk: number;
  name: string;
  role: string;
  image: IImageData;
  time_allocation: number;
  short_code: number | string;
  position: number;
  usersCount: number;
  project_id: number;
  draggableProps: DraggableProvided["draggableProps"];
  dragHandleProps: DraggableProvided["dragHandleProps"];
  isCurrentlyDragging: boolean;
  draggingUser: IUserData | IUserMe;
  backgroundColor: string | undefined; // Add backgroundColor prop
  refetchTeamData: () => void;
  ba_leader: number;
}

export const TeamMember = ({
  refetchTeamData,
  user_id,
  is_leader,
  leader_pk,
  name,
  short_code,
  role,
  image,
  time_allocation,
  // position,
  username,
  usersCount,
  project_id,
  isCurrentlyDragging,
  draggableProps,
  dragHandleProps,
  backgroundColor, // Accept backgroundColor prop
  ba_leader,
}: ITeamMember) => {
  // Define your styles for the dragged state
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

  const draggedStyles = {
    background: "blue.500",
    scale: 1.1,
    borderRadius: "10px",
    cursor: "grabbing",
    zIndex: 999,
  };

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
              project_id={project_id}
              pk={user_id}
              is_leader={is_leader}
              leader_pk={leader_pk}
              role={role}
              // position={position}
              shortCode={short_code}
              time_allocation={time_allocation}
              usersCount={usersCount}
              refetchTeamData={refetchTeamData}
              onClose={onUserClose}
            />
          </DrawerBody>

          <DrawerFooter></DrawerFooter>
        </DrawerContent>
      </Drawer>

      <HStack
        {...draggableProps}
        {...dragHandleProps}
        style={isCurrentlyDragging ? draggedStyles : {}}
        scale={isCurrentlyDragging ? 1.1 : 1}
        borderRadius={isCurrentlyDragging ? "10px" : "0px"}
        bg={isCurrentlyDragging ? "blue.500" : backgroundColor}
        justifyContent={"space-between"}
        _hover={{
          boxShadow:
            colorMode === "light"
              ? "0px 10px 15px -5px rgba(0, 0, 0, 0.15), 0px 2px 2.5px -1px rgba(0, 0, 0, 0.03), -1.5px 0px 5px -1px rgba(0, 0, 0, 0.05), 1.5px 0px 5px -1px rgba(0, 0, 0, 0.05)"
              : "0px 2px 3px -0.5px rgba(255, 255, 255, 0.05), 0px 1px 2px -0.5px rgba(255, 255, 255, 0.03)",
          zIndex: 999,
        }}
        border={"1px solid"}
        borderColor={colorMode === "light" ? "gray.200" : "gray.600"}
      >
        {/* Left Section */}
        <Flex p={4}>
          <Box pos={"relative"}>
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
            <Button
              ml={"2px"}
              variant={"link"}
              justifyContent={"start"}
              color={
                isCurrentlyDragging
                  ? "white"
                  : colorMode === "light"
                    ? "blue.500"
                    : "blue.600"
              }
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
                mt={1}
                mb={1}
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
