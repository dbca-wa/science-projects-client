import { useColorMode } from "@/shared/utils/theme.utils";
import { useState, useEffect } from "react";
import { Button } from "@/shared/components/ui/button";
import { BsPlus } from "react-icons/bs";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import type {
  DragEndEvent,
  DragStartEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

import { updateTeamMemberPosition } from "@/features/projects/services/projects.service";
import { useProjectTeam } from "@/features/projects/hooks/useProjectTeam";
import { useUser } from "@/features/users/hooks/useUser";
import type { ICaretakerPermissions, IProjectMember } from "@/shared/types";
import { AddUserToProjectModal } from "@/features/projects/components/modals/AddUserToProjectModal";
import { TeamMemberDisplay } from "./TeamMemberDisplay";
import { useBranches } from "@/features/admin/hooks/useBranches";
import { useBusinessAreas } from "@/features/business-areas/hooks/useBusinessAreas";
import { SortableTeamMember } from "./SortableTeamMember";
import { cn } from "@/shared/utils";

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
      if (leaderMember && leaderMember.user) {
        setLeaderPk(leaderMember.user.pk);
      }
      setRearrangedTeam(sortedTeam);
    }
  }, [teamData, isTeamLoading, rerenderKey]);

  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
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
      if (updatedTeam[newIndex].user) {
        newBackgroundColors[updatedTeam[newIndex].user.pk] = "green.400";
        setBackgroundColors(newBackgroundColors);

        setTimeout(() => {
          setBackgroundColors({});
        }, 250);
      }
    }, 150);

    await refetchTeamData();
    setRerenderKey((prevKey) => prevKey + 1);
  };

  const checkInTeam = (pk: number) => {
    return rearrangedTeam.some((tm) => tm?.user.pk === pk);
  };

  const { userLoading, userData } = useUser();
  const { branchesData } = useBranches();
  const { baData } = useBusinessAreas();

  const canManageTeam =
    userData.is_superuser ||
    userIsCaretakerOfAdmin ||
    userIsCaretakerOfProjectLeader ||
    userIsCaretakerOfBaLeader ||
    userData.pk === rearrangedTeam.find((tm) => tm.is_leader)?.user?.pk;

  return (
    !userLoading &&
    !isTeamLoading && (
      <div
        className={cn(
          "min-h-[100px] rounded-lg mb-4 p-4 mt-6",
          colorMode === "light" ? "bg-gray-100" : "bg-gray-700"
        )}
        key={rerenderKey}
      >
        <div className="grid grid-cols-[9fr_3fr] mb-4">
          <h3
            className={cn(
              "font-bold text-lg select-none",
              colorMode === "light" ? "text-gray-800" : "text-gray-100"
            )}
          >
            Project Team
          </h3>

          <div className="w-full flex justify-end">
            {(userData.is_superuser ||
              userIsCaretakerOfAdmin ||
              userData.pk === ba_leader ||
              userIsCaretakerOfBaLeader ||
              checkInTeam(userData?.pk) ||
              userIsCaretakerOfMember) && (
              <>
                <Button
                  size="sm"
                  onClick={() => setIsAddUserModalOpen(true)}
                  className={cn(
                    "text-white select-none",
                    colorMode === "light" 
                      ? "bg-green-500 hover:bg-green-400" 
                      : "bg-green-600 hover:bg-green-500"
                  )}
                >
                  <BsPlus className="mr-2" />
                  Invite Member
                </Button>
                <AddUserToProjectModal
                  isOpen={isAddUserModalOpen}
                  onClose={() => setIsAddUserModalOpen(false)}
                  preselectedProject={project_id}
                  refetchTeamData={refetchTeamData}
                />
              </>
            )}
          </div>
          <div>
            <p
              className={cn(
                "text-sm select-none",
                colorMode === "light" ? "text-gray-600" : "text-gray-400"
              )}
            >
              To reassign the project leader, click a user's name and promote
              them. This will set other users with leader role to Science
              Support or External Collaborator, depending on their staff status.
              Click a member's name to adjust their details and role for this
              project. Project and Business Area leads can click and drag a user
              to re-arrange order.
            </p>
          </div>
        </div>

        {teamData.length > 0 ? (
          canManageTeam ? (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={rearrangedTeam.filter((tm) => tm.user).map((tm) => String(tm.pk))}
                strategy={verticalListSortingStrategy}
              >
                <div>
                  {rearrangedTeam.filter((tm) => tm.user).map((tm, index) => (
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
            <div className="rounded-xl mt-4 overflow-hidden">
              {rearrangedTeam.filter((tm) => tm.user).map((tm, index) => (
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
            </div>
          )
        ) : null}
      </div>
    )
  );
};
