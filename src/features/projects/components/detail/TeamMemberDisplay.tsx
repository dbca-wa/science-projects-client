// Component for showing details regarding a team member. Dragging adjusts the position of the team member.

import { Avatar } from "@/shared/components/ui/avatar";
import { Button } from "@/shared/components/ui/button";
import { Sheet, SheetContent } from "@/shared/components/ui/sheet";
import { Badge } from "@/shared/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/shared/components/ui/tooltip";
import { useColorMode } from "@/shared/utils/theme.utils";
import { FaCrown } from "react-icons/fa";
import type {
  IBranch,
  IBusinessArea,
  ICaretakerSimpleUserData,
  IImageData,
} from "@/shared/types";
import { ProjectUserDetails } from "./ProjectUserDetails";
import { UserProfile } from "@/features/users/components/UserProfile";
import useApiEndpoint from "@/shared/hooks/useApiEndpoint";
import { useState } from "react";

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

  const [isUserOpen, setIsUserOpen] = useState(false);
  const onUserOpen = () => setIsUserOpen(true);
  const onUserClose = () => setIsUserOpen(false);

  const [isCaretakerOpen, setIsCaretakerOpen] = useState(false);
  const onCaretakerOpen = () => setIsCaretakerOpen(true);
  const onCaretakerClose = () => setIsCaretakerOpen(false);

  const baseURL = useApiEndpoint();

  return (
    <>
      <Sheet open={isUserOpen} onOpenChange={setIsUserOpen}>
        <SheetContent side="right" className="w-96">
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
        </SheetContent>
      </Sheet>
      
      <Sheet open={isCaretakerOpen} onOpenChange={setIsCaretakerOpen}>
        <SheetContent side="right" className="w-[32rem] z-[999]">
          <UserProfile
            pk={caretaker?.pk}
            branches={branchesData}
            businessAreas={baData}
          />
        </SheetContent>
      </Sheet>
      <div
        className={`flex justify-between items-center p-4 ${
          colorMode === "light" ? "bg-white" : "bg-gray-800"
        } hover:shadow-xl hover:z-[999] ${
          colorMode === "light"
            ? "hover:shadow-black/30"
            : "hover:shadow-white/10"
        }`}
      >
        {/* Left Section */}
        <div className="flex p-4">
          <div className="relative">
            <Avatar
              className="mt-1 w-12 h-12 select-none pointer-events-none cursor-pointer"
              src={
                image?.file
                  ? `${baseURL}${image.file}`
                  : image?.old_file
                    ? `${baseURL}${image.old_file}`
                    : ""
              }
              onClick={onUserOpen}
            />
            {is_leader && (
              <div className="absolute -top-1 right-[38%] text-yellow-300">
                <FaCrown />
              </div>
            )}
          </div>

          <div className="ml-4 grid grid-cols-1 select-none">
            <div className="flex flex-row gap-2 items-center">
              <Button
                variant="link"
                className={`ml-0.5 justify-start text-lg cursor-pointer ${
                  colorMode === "light" 
                    ? "text-blue-500 hover:text-blue-400" 
                    : "text-blue-600 hover:text-blue-500"
                }`}
                onClick={onUserOpen}
              >
                {name !== "undefined undefined" && name !== "None None"
                  ? name
                  : username}
              </Button>
              {/* Display caretaker info if there is one */}
              {caretaker && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div
                        className="flex items-center gap-2 select-none cursor-pointer"
                        onClick={onCaretakerOpen}
                      >
                        <Avatar
                          className="mt-1 w-6 h-6"
                          src={
                            caretaker?.image ? `${baseURL}${caretaker?.image}` : ""
                          }
                        />
                        <p className="text-blue-500 text-xs flex justify-center">
                          ({caretaker.display_first_name}{" "}
                          {caretaker.display_last_name} is caretaking)
                        </p>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>This user is away and {caretaker.display_first_name} {caretaker.display_last_name} is caretaking</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
            <div>
              <Badge
                className={`justify-center ${
                  roleArray.find((item) => item.role === role)?.bg ? 
                    `bg-${roleArray.find((item) => item.role === role)?.bg}` : ""
                } ${
                  roleArray.find((item) => item.role === role)?.color ?
                    `text-${roleArray.find((item) => item.role === role)?.color}` : ""
                }`}
              >
                {roleArray.find((item) => item.role === role)?.displayName ??
                  ""}
              </Badge>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
