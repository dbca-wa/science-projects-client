import useApiEndpoint from "@/shared/hooks/useApiEndpoint";
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
  Text,
  Tag,
  useColorMode,
  useDisclosure,
  Tooltip,
} from "@chakra-ui/react";
import { FaCrown } from "react-icons/fa";
import {
  IBranch,
  IBusinessArea,
  ICaretakerSimpleUserData,
  IImageData,
  IUserData,
  IUserMe,
} from "@/shared/types/index.d";
import { ProjectUserDetails } from "./ProjectUserDetails";
import { UserProfile } from "../Users/UserProfile";

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
  isCurrentlyDragging: boolean;
  draggingUser: IUserData | IUserMe;
  backgroundColor: string | undefined;
  refetchTeamData: (options?: any) => Promise<any>;
  ba_leader: number;
  caretaker: ICaretakerSimpleUserData;
  baData: IBusinessArea[];
  branchesData: IBranch[];
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
  username,
  usersCount,
  project_id,
  isCurrentlyDragging,
  backgroundColor,
  ba_leader,
  caretaker,
  baData,
  branchesData,
}: ITeamMember) => {
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

  const draggedStyles = {
    background: "blue.500",
    transform: "scale(1.1)",
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
        size="sm"
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

      <Drawer
        isOpen={isCaretakerOpen}
        placement="right"
        onClose={onCaretakerClose}
        size="lg"
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
        style={isCurrentlyDragging ? draggedStyles : {}}
        bg={isCurrentlyDragging ? "blue.500" : backgroundColor}
        justifyContent="space-between"
        zIndex={isCurrentlyDragging ? 999 : 1}
        _hover={{
          boxShadow:
            colorMode === "light"
              ? "0px 10px 15px -5px rgba(0, 0, 0, 0.15), 0px 2px 2.5px -1px rgba(0, 0, 0, 0.03), -1.5px 0px 5px -1px rgba(0, 0, 0, 0.05), 1.5px 0px 5px -1px rgba(0, 0, 0, 0.05)"
              : "0px 2px 3px -0.5px rgba(255, 255, 255, 0.05), 0px 1px 2px -0.5px rgba(255, 255, 255, 0.03)",
          // zIndex: 999,
        }}
        border="1px solid"
        borderColor={colorMode === "light" ? "gray.200" : "gray.600"}
      >
        <Flex p={4}>
          <Box pos="relative">
            <Avatar
              mt={1}
              size="lg"
              src={
                image?.file
                  ? `${baseURL}${image.file}`
                  : image?.old_file
                    ? `${baseURL}${image.old_file}`
                    : ""
              }
              userSelect="none"
              onClick={onUserOpen}
              cursor="pointer"
              className="pointer-events-none select-none"
            />
            {is_leader && (
              <Box pos="absolute" color="yellow.300" top={-1} right="38%">
                <FaCrown />
              </Box>
            )}
          </Box>

          <Grid ml={4} gridTemplateColumns="repeat(1, 1fr)" userSelect="none">
            <Box display="flex" flexDirection="row" gap={2} alignItems="center">
              <Button
                ml="2px"
                variant="link"
                justifyContent="start"
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
                fontSize="lg"
              >
                {name !== "undefined undefined" && name !== "None None"
                  ? name
                  : username}
              </Button>
              {caretaker && (
                <Tooltip
                  label={`This user is away and ${caretaker.display_first_name} ${caretaker.display_last_name} is caretaking`}
                  aria-label="Caretaker"
                >
                  <Box
                    display="flex"
                    alignItems="center"
                    gap={2}
                    userSelect="none"
                    onClick={onCaretakerOpen}
                    cursor="pointer"
                  >
                    <Avatar
                      mt={1}
                      size="xs"
                      src={
                        caretaker?.image ? `${baseURL}${caretaker?.image}` : ""
                      }
                      className="pointer-events-none select-none"
                    />
                    <Text
                      color="blue.500"
                      fontSize="xs"
                      justifyContent="center"
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
                mt={1}
                mb={1}
                bg={roleArray.find((item) => item.role === role)?.bg ?? ""}
                color={
                  roleArray.find((item) => item.role === role)?.color ?? ""
                }
                size="md"
                justifyContent="center"
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
