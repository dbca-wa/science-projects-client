import {
  Box,
  Button,
  Flex,
  Grid,
  Text,
  useColorMode,
  useDisclosure,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { BsPlus, BsGripVertical } from "react-icons/bs";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

import { updateTeamMemberPosition } from "@/lib/api";
import { useProjectTeam } from "@/lib/hooks/tanstack/useProjectTeam";
import { useUser } from "@/lib/hooks/tanstack/useUser";
import { ICaretakerPermissions, IProjectMember } from "@/types";
import { AddUserToProjectModal } from "../../Modals/AddUserToProjectModal";
import { TeamMember } from "./TeamMember";
import { TeamMemberDisplay } from "./TeamMemberDisplay";
import { useBranches } from "@/lib/hooks/tanstack/useBranches";
import { useBusinessAreas } from "@/lib/hooks/tanstack/useBusinessAreas";
import { SortableTeamMember } from "./SortableTeamMember";

interface Props extends ICaretakerPermissions {
  project_id: number;
  ba_leader: number;
}

export const ManageTeam = ({
  project_id,
  ba_leader,
  userIsCaretakerOfAdmin,
  userIsCaretakerOfBaLeader,
  userIsCaretakerOfMember,
  userIsCaretakerOfProjectLeader,
}: Props) => {
  const [rearrangedTeam, setRearrangedTeam] = useState<IProjectMember[]>([]);
  const [currentlyDraggingIndex, setCurrentlyDraggingIndex] = useState<
    number | null
  >(null);
  const [rerenderKey, setRerenderKey] = useState<number>(0);
  const [backgroundColors, setBackgroundColors] = useState<{
    [key: number]: string | undefined;
  }>({});

  const { teamData, isTeamLoading, refetchTeamData } = useProjectTeam(
    String(project_id),
  );

  const [leaderPk, setLeaderPk] = useState();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  useEffect(() => {
    if (!isTeamLoading) {
      const sortedTeam = [...teamData].sort((a, b) => a.position - b.position);
      const leaderMember = sortedTeam.find(
        (member) => member.is_leader === true,
      );
      if (leaderMember) {
        setLeaderPk(leaderMember.user.pk);
      }
      setRearrangedTeam(sortedTeam);
    }
  }, [teamData, isTeamLoading, rerenderKey]);

  const {
    isOpen: isAddUserModalOpen,
    onOpen: onOpenAddUserModal,
    onClose: onCloseAddUserModal,
  } = useDisclosure();
  const { colorMode } = useColorMode();

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const index = rearrangedTeam.findIndex(
      (item) => String(item.pk) === active.id,
    );
    setCurrentlyDraggingIndex(index);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setCurrentlyDraggingIndex(null);

    if (!over || active.id === over.id) {
      return;
    }

    const oldIndex = rearrangedTeam.findIndex(
      (item) => String(item.pk) === active.id,
    );
    const newIndex = rearrangedTeam.findIndex(
      (item) => String(item.pk) === over.id,
    );

    const reorderedTeam = arrayMove(rearrangedTeam, oldIndex, newIndex);

    // Update positions
    const updatedTeam = reorderedTeam.map((member, index) => {
      let newPosition = index + 1;
      if (member.is_leader) {
        newPosition = 1;
      }
      return { ...member, position: newPosition };
    });

    await updateTeamMemberPosition(project_id, updatedTeam);

    // Visual feedback
    setTimeout(() => {
      const newBackgroundColors = { ...backgroundColors };
      newBackgroundColors[updatedTeam[newIndex].user.pk] = "green.400";
      setBackgroundColors(newBackgroundColors);

      setTimeout(() => {
        setBackgroundColors({});
      }, 250);
    }, 150);

    await refetchTeamData();
    setRerenderKey((prevKey) => prevKey + 1);
  };

  const checkInTeam = (pk: number) => {
    return rearrangedTeam.some((tm) => tm?.user.pk === pk);
  };

  const { userLoading, userData } = useUser();
  const { branchesLoading, branchesData } = useBranches();
  const { baLoading, baData } = useBusinessAreas();

  const canManageTeam =
    userData.is_superuser ||
    userIsCaretakerOfAdmin ||
    userIsCaretakerOfProjectLeader ||
    userIsCaretakerOfBaLeader ||
    userData.pk === rearrangedTeam.find((tm) => tm.is_leader)?.user.pk;

  return (
    !userLoading &&
    !isTeamLoading && (
      <Box
        minH="100px"
        key={rerenderKey}
        bg={colorMode === "light" ? "gray.100" : "gray.700"}
        rounded="lg"
        mb={4}
        p={4}
        mt={6}
      >
        <Grid gridTemplateColumns="9fr 3fr" mb={4}>
          <Text
            fontWeight="bold"
            fontSize="lg"
            color={colorMode === "light" ? "gray.800" : "gray.100"}
            userSelect="none"
          >
            Project Team
          </Text>

          <Flex w="100%" justifyContent="flex-end">
            {(userData.is_superuser ||
              userIsCaretakerOfAdmin ||
              userData.pk === ba_leader ||
              userIsCaretakerOfBaLeader ||
              checkInTeam(userData?.pk) ||
              userIsCaretakerOfMember) && (
              <>
                <Button
                  size="sm"
                  onClick={onOpenAddUserModal}
                  leftIcon={<BsPlus />}
                  bg={colorMode === "light" ? "green.500" : "green.600"}
                  _hover={{
                    bg: colorMode === "light" ? "green.400" : "green.500",
                  }}
                  color="white"
                  userSelect="none"
                >
                  Invite Member
                </Button>
                <AddUserToProjectModal
                  isOpen={isAddUserModalOpen}
                  onClose={onCloseAddUserModal}
                  preselectedProject={project_id}
                  refetchTeamData={refetchTeamData}
                />
              </>
            )}
          </Flex>
          <Box>
            <Text
              fontSize="sm"
              color={colorMode === "light" ? "gray.600" : "gray.400"}
              userSelect="none"
            >
              To reassign the project leader, click a user's name and promote
              them. This will set other users with leader role to Science
              Support or External Collaborator, depending on their staff status.
              Click a member's name to adjust their details and role for this
              project. Project and Business Area leads can click and drag a user
              to re-arrange order.
            </Text>
          </Box>
        </Grid>

        {teamData.length > 0 ? (
          canManageTeam ? (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={rearrangedTeam.map((tm) => String(tm.pk))}
                strategy={verticalListSortingStrategy}
              >
                <div>
                  {rearrangedTeam.map((tm, index) => (
                    <SortableTeamMember
                      key={tm.pk}
                      tm={tm}
                      index={index}
                      ba_leader={ba_leader}
                      leader_pk={leaderPk}
                      currentlyDraggingIndex={currentlyDraggingIndex}
                      colorMode={colorMode}
                      backgroundColors={backgroundColors}
                      usersCount={rearrangedTeam.length}
                      project_id={project_id}
                      refetchTeamData={refetchTeamData}
                      userData={userData}
                      branchesData={branchesData}
                      baData={baData}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          ) : (
            <Grid rounded="xl" mt={4} overflow="hidden">
              {rearrangedTeam.map((tm, index) => (
                <TeamMemberDisplay
                  key={index}
                  ba_leader={ba_leader}
                  leader_pk={leaderPk}
                  user_id={tm.user.pk}
                  name={`${tm.user.first_name} ${tm.user.last_name}`}
                  short_code={tm.short_code}
                  username={tm.user.username}
                  image={tm.user.image}
                  is_leader={tm.is_leader}
                  role={tm.role}
                  position={tm.position}
                  time_allocation={tm.time_allocation}
                  usersCount={rearrangedTeam.length}
                  project_id={project_id}
                  refetchTeamData={refetchTeamData}
                  caretaker={
                    tm.user.caretakers.length > 0
                      ? tm.user.caretakers[0]
                      : undefined
                  }
                  branchesData={branchesData}
                  baData={baData}
                />
              ))}
            </Grid>
          )
        ) : null}
      </Box>
    )
  );
};
