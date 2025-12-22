import useApiEndpoint from "@/shared/hooks/useApiEndpoint";
import { Avatar, AvatarImage } from "@/shared/components/ui/avatar";
import { Button } from "@/shared/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/shared/components/ui/sheet";
import { Badge } from "@/shared/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/shared/components/ui/tooltip";
import { useColorMode } from "@/shared/utils/theme.utils";
import { FaCrown } from "react-icons/fa";
import {
  IBranch,
  IBusinessArea,
  ICaretakerSimpleUserData,
  IImageData,
  IUserData,
  IUserMe,
} from "@/shared/types";
import { ProjectUserDetails } from "./ProjectUserDetails";
import { UserProfile } from "@/features/users/components/UserProfile";
import { useState } from "react";

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
    "Science Support": { bg: "bg-green-700", color: "text-white" },
    "Project Leader": { bg: "bg-orange-700", color: "text-white" },
    "Academic Supervisor": { bg: "bg-blue-500", color: "text-white" },
    "Supervised Student": { bg: "bg-blue-400", color: "text-white" },
    "Technical Support": { bg: "bg-orange-900", color: "text-white" },
    "Consulted Peer": { bg: "bg-green-200", color: "text-black" },
    "External Collaborator": { bg: "bg-gray-200", color: "text-black" },
    "External Peer": { bg: "bg-gray-300", color: "text-black" },
    "Involved Group": { bg: "bg-gray-500", color: "text-white" },
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

  const draggedStyles = {
    transform: "scale(1.1)",
    borderRadius: "10px",
    cursor: "grabbing",
    zIndex: 999,
  };

  const baseURL = useApiEndpoint();

  return (
    <>
      <Sheet open={isUserOpen} onOpenChange={setIsUserOpen}>
        <SheetContent side="right" className="w-96">
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
        style={isCurrentlyDragging ? draggedStyles : {}}
        className={`flex justify-between items-center p-4 border rounded-lg transition-all duration-200 ${
          colorMode === "light" ? "border-gray-200" : "border-gray-600"
        } ${
          isCurrentlyDragging 
            ? "bg-blue-500 z-[999] shadow-lg" 
            : backgroundColor ? `bg-[${backgroundColor}]` : "bg-background"
        } hover:shadow-lg ${
          colorMode === "light"
            ? "hover:shadow-black/15"
            : "hover:shadow-white/5"
        }`}
      >
        <div className="flex p-4 w-full">
          <div className="relative">
            <Avatar className="mt-1 w-12 h-12 select-none cursor-pointer">
              <AvatarImage
                src={
                  image?.file
                    ? `${baseURL}${image.file}`
                    : image?.old_file
                      ? `${baseURL}${image.old_file}`
                      : ""
                }
                onClick={onUserOpen}
              />
            </Avatar>
            {is_leader && (
              <div className="absolute -top-1 right-[38%] text-yellow-300">
                <FaCrown />
              </div>
            )}
          </div>

          <div className="ml-4 grid grid-cols-1 select-none flex-1">
            <div className="flex flex-row gap-2 items-center">
              <Button
                variant="link"
                className={`ml-0.5 justify-start text-lg p-0 h-auto ${
                  isCurrentlyDragging
                    ? "text-white"
                    : colorMode === "light"
                      ? "text-blue-500 hover:text-blue-400"
                      : "text-blue-600 hover:text-blue-500"
                } cursor-pointer`}
                onClick={onUserOpen}
              >
                {name !== "undefined undefined" && name !== "None None"
                  ? name
                  : username}
              </Button>
              {caretaker && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div
                        className="flex items-center gap-2 select-none cursor-pointer"
                        onClick={onCaretakerOpen}
                      >
                        <Avatar className="mt-1 w-6 h-6 pointer-events-none select-none">
                          <AvatarImage
                            src={
                              caretaker?.image ? `${baseURL}${caretaker?.image}` : ""
                            }
                          />
                        </Avatar>
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
                className={`mt-1 mb-1 justify-center ${
                  roleArray.find((item) => item.role === role)?.bg || "bg-gray-500"
                } ${
                  roleArray.find((item) => item.role === role)?.color || "text-white"
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
