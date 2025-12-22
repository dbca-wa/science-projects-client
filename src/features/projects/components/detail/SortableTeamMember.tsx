import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { BsGripVertical } from "react-icons/bs";
import { TeamMember } from "./TeamMember";
import type { IProjectMember, IUserData, IUserMe } from "@/shared/types";

interface SortableTeamMemberProps {
  tm: IProjectMember;
  index: number;
  ba_leader: number;
  leader_pk: number;
  currentlyDraggingIndex: number | null;
  colorMode: string;
  backgroundColors: { [key: number]: string | undefined };
  usersCount: number;
  project_id: number;
  refetchTeamData: (options?: any) => Promise<any>;
  userData: IUserData | IUserMe;
  branchesData: any;
  baData: any;
}

export const SortableTeamMember = ({
  tm,
  index,
  ba_leader,
  leader_pk,
  currentlyDraggingIndex,
  colorMode,
  backgroundColors,
  usersCount,
  project_id,
  refetchTeamData,
  userData,
  branchesData,
  baData,
}: SortableTeamMemberProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: String(tm.pk),
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    // Apply a very high z-index when dragging
    zIndex: isDragging ? 9999 : 1,
    position: "relative" as const,
  };

  return (
    <div ref={setNodeRef} style={style} className="mb-0">
      <TeamMember
        ba_leader={ba_leader}
        leader_pk={leader_pk}
        user_id={tm.user.pk}
        name={`${tm.user.display_first_name ?? tm.user.first_name} ${tm.user.display_last_name ?? tm.user.last_name}`}
        username={tm.user.username}
        image={tm.user.image}
        is_leader={tm.is_leader}
        role={tm.role}
        position={tm.position}
        short_code={tm.short_code}
        time_allocation={tm.time_allocation}
        usersCount={usersCount}
        project_id={project_id}
        isCurrentlyDragging={isDragging}
        backgroundColor={
          backgroundColors[tm.user.pk] ||
          (colorMode === "light" ? "white" : "gray.800")
        }
        refetchTeamData={refetchTeamData}
        caretaker={
          tm.user.caretakers.length > 0 ? tm.user.caretakers[0] : undefined
        }
        branchesData={branchesData}
        baData={baData}
        draggingUser={userData}
      />
      <div
        {...listeners}
        className={`absolute select-none right-0 top-1 h-full p-12 flex-1 cursor-grab active:cursor-grabbing flex justify-center items-center ${
          isDragging ? "text-white" : colorMode === "light" ? "text-black" : "text-gray-100"
        }`}
      >
        <BsGripVertical />
      </div>
    </div>
  );
};
