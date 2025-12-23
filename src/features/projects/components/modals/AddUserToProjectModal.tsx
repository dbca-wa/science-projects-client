// Component for adding users to a project

import { toast } from "sonner";
import { useColorMode } from "@/shared/utils/theme.utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { Slider } from "@/shared/components/ui/slider";
import { Label } from "@/shared/components/ui/label";
import { useEffect, useRef, useState } from "react";
import { UserSearchDropdown } from "@/features/users/components/UserSearchDropdown";
import { ProjectSearchDropdown } from "@/features/projects/components/ProjectSearchDropdown";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type {
  RegisterOptions,
  UseFormRegister,
  UseFormSetValue,
  UseFormWatch,
} from "react-hook-form";
import { useForm } from "react-hook-form";
import {
  type INewMember,
  createTeamMember,
} from "@/features/projects/services/projects.service";
import { checkStaffStatusApiCall } from "@/features/users/services/users.service";
import { useLocation, useNavigate } from "react-router-dom";
import type { CustomAxiosError } from "@/shared/types";
import { cn } from "@/shared/utils";

interface IAddUserToProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedUser?: number;
  preselectedProject?: number;
  refetchTeamData?: () => void;
}

export const AddUserToProjectModal = ({
  isOpen,
  onClose,
  preselectedUser,
  preselectedProject,
  refetchTeamData,
}: IAddUserToProjectModalProps) => {
  // Styling and display
  const humanReadableRoleName = (role: string) => {
    let humanReadable = "";
    switch (role) {
      case "academicsuper":
        humanReadable = "Academic Supervisor";
        break;
      case "consulted":
        humanReadable = "Consulted Peer";
        break;
      case "externalcol":
        humanReadable = "External Collaborator";
        break;
      case "externalpeer":
        humanReadable = "External Peer";
        break;
      case "group":
        humanReadable = "Involved Group";
        break;
      case "research":
        humanReadable = "Science Support";
        break;
      case "supervising":
        humanReadable = "Project Leader";
        break;
      case "student":
        humanReadable = "Supervised Student";
        break;
      case "technical":
        humanReadable = "Technical Support";
        break;

      default:
        humanReadable = "None";
        break;
    }
    return humanReadable;
  };
  const { colorMode } = useColorMode();
  const borderColor = colorMode === "light" ? "border-gray-300" : "border-gray-500";
  const sectionTitleColor = colorMode === "light" ? "text-gray-600" : "text-gray-300";

  // Toast
  const toastIdRef = useRef<string | number | undefined>(undefined);

  const location = useLocation();

  const navigate = useNavigate();

  // Query client, Mutation & Submission
  const queryClient = useQueryClient();
  const { register, reset, setValue, watch } = useForm<INewMember>({
    defaultValues: {
      // Set the default value for the "role" field to 'research'
      role: "research",
      timeAllocation: 0,
    },
  });
  const membershipCreationMutation = useMutation({
    mutationFn: createTeamMember,
    onMutate: () => {
      toastIdRef.current = toast.loading("Creating Membership");
    },
    onSuccess: () => {
      if (toastIdRef.current) {
        toast.success("Membership Created", {
          id: toastIdRef.current,
        });
      }
      reset();
      onClose();

      setTimeout(() => {
        queryClient.invalidateQueries({
          queryKey: [
            "projects",
            preselectedProject !== undefined &&
            preselectedProject !== null &&
            preselectedProject !== 0
              ? preselectedProject
              : selectedProject,
          ],
        });
        refetchTeamData?.();
        if (!location.pathname.includes("project")) {
          navigate(
            `/projects/${
              preselectedProject !== undefined &&
              preselectedProject !== null &&
              preselectedProject !== 0
                ? preselectedProject
                : selectedProject
            }`,
          );
        }
      }, 350);
    },
    onError: (error: CustomAxiosError) => {
      const nonFieldErrors = error?.response?.data?.non_field_errors;
      const errorMessage =
        nonFieldErrors &&
        nonFieldErrors.includes(
          "The fields project, user must make a unique set.",
        )
          ? "Cannot add a user to a project they are already in."
          : nonFieldErrors?.join(", ") || "An error occurred";

      if (toastIdRef.current) {
        toast.error(`Could Not Create Project Membership: ${errorMessage}`, {
          id: toastIdRef.current,
        });
      }
    },
  });

  const onSubmitMembershipCreation = async (formData: INewMember) => {
    await membershipCreationMutation.mutateAsync(formData);
  };

  // State
  const [selectedUser, setSelectedUser] = useState<number>();
  const [selectedProject, setSelectedProject] = useState<number>(
    preselectedProject ? preselectedProject : 0,
  );

  // Watched Variables
  const role = watch("role");
  const timeAllocation = watch("timeAllocation");
  const shortCode = watch("shortCode");

  const [userIsStaff, setUserIsStaff] = useState<boolean>(false);

  useEffect(() => {
    const checkStaffStatus = async (userId: number) => {
      try {
        const res = await checkStaffStatusApiCall(userId);
        setUserIsStaff(res.is_staff); // Use res.is_staff directly
      } catch (err) {
        console.error("Error checking staff status", err);
      }
    };

    if (selectedUser) {
      checkStaffStatus(selectedUser);
    }
  }, [selectedUser]);

  useEffect(() => {
    if (
      preselectedProject !== undefined &&
      preselectedProject !== null &&
      selectedProject === undefined
    ) {
      setSelectedProject(preselectedProject);
    }
  }, [selectedProject, preselectedProject]);

  const projectSearchInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!preselectedProject) {
      if (isOpen && projectSearchInputRef.current) {
        projectSearchInputRef.current.focus();
      }
      // console.log(projectSearchInputRef.current);
    } else {
      setSelectedProject(preselectedProject);
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={cn(
        "max-w-2xl max-h-[80vh] overflow-y-auto",
        colorMode === "dark" ? "text-gray-400 bg-gray-800" : "text-gray-900 bg-white"
      )}>
        <DialogHeader>
          <DialogTitle>Add To Project</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <div className={cn(
              "border rounded-xl p-4 mb-4 flex flex-col mt-2",
              borderColor
            )}>
              {preselectedProject ? (
                <ProjectSearchDropdown
                  inputRef={projectSearchInputRef}
                  {...register("project", { required: true })}
                  user={selectedUser}
                  allProjects
                  isRequired={true}
                  setProjectFunction={setSelectedProject}
                  preselectedProjectPk={
                    preselectedProject !== undefined ? preselectedProject : 0
                  }
                  label="Project"
                  placeholder="Search for the project"
                  helperText={"The project you would like to add the user to."}
                />
              ) : (
                <ProjectSearchDropdown
                  inputRef={projectSearchInputRef}
                  {...register("project", { required: true })}
                  user={selectedUser}
                  allProjects
                  isRequired={true}
                  setProjectFunction={setSelectedProject}
                  label="Project"
                  placeholder="Search for the project"
                  helperText={"The project you would like to add the user to."}
                />
              )}

              {preselectedUser !== 0 &&
              preselectedUser !== null &&
              preselectedUser !== undefined ? (
                <UserSearchDropdown
                  {...register("user", { required: true })}
                  onlyInternal={false}
                  isRequired={true}
                  setUserFunction={setSelectedUser}
                  preselectedUserPk={preselectedUser}
                  label="User"
                  placeholder="Search for a user"
                  helperText={"The user you would like to add."}
                />
              ) : (
                <UserSearchDropdown
                  autoFocus
                  {...register("user", { required: true })}
                  onlyInternal={false}
                  isRequired={true}
                  setUserFunction={setSelectedUser}
                  label="User"
                  placeholder="Search for a user"
                  helperText={"The user you would like to add."}
                />
              )}
            </div>
            {selectedUser && selectedProject ? (
              <div className={cn(
                "border rounded-xl p-4 mb-4 flex flex-col mt-2",
                borderColor
              )}>
                <div className="flex">
                  <p className={cn("font-bold text-sm mb-1", sectionTitleColor)}>
                    Project Role ({role ? humanReadableRoleName(role) : "None"})
                  </p>
                </div>
                <div className="py-2">
                  <Select
                    value={role || ""}
                    onValueChange={(value) => setValue("role", value)}
                    defaultValue={userIsStaff ? "technical" : "consulted"}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a Role for the User" />
                    </SelectTrigger>
                    <SelectContent>
                      {userIsStaff ? (
                        <>
                          <SelectItem value="technical">Technical Support</SelectItem>
                          <SelectItem value="research">Science Support</SelectItem>
                        </>
                      ) : (
                        <>
                          <SelectItem value="academicsuper">Academic Supervisor</SelectItem>
                          <SelectItem value="consulted">Consulted Peer</SelectItem>
                          <SelectItem value="externalcol">External Collaborator</SelectItem>
                          <SelectItem value="group">Involved Group</SelectItem>
                          <SelectItem value="student">Supervised Student</SelectItem>
                        </>
                      )}
                    </SelectContent>
                  </Select>
                  <p className={cn(
                    "text-sm mt-1",
                    colorMode === "dark" ? "text-gray-400" : "text-gray-600"
                  )}>
                    The role this team member fills within this project.
                  </p>
                </div>

                <div className="flex mt-4">
                  <p className={cn("font-bold text-sm mb-1", sectionTitleColor)}>
                    Time Allocation ({timeAllocation} FTE)
                  </p>
                </div>
                <div className="mx-2">
                  <FormSlider
                    name="timeAllocation"
                    defaultValue={0}
                    min={0}
                    max={1}
                    step={0.1}
                    validation={{ required: true }}
                    formContext={{
                      register,
                      setValue,
                      watch,
                    }}
                  />
                </div>

                <div className="flex mt-4">
                  <Label className={cn("font-bold text-sm mb-1", sectionTitleColor)}>
                    Short Code
                  </Label>
                </div>
                <Input
                  {...register("shortCode", { required: false })}
                  type="number"
                  autoComplete="off"
                />
              </div>
            ) : null}
          </div>
        </div>

        <DialogFooter>
          <div className="grid grid-cols-2 gap-4 w-full">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>

            <Button
              disabled={selectedProject === 0 || !selectedUser}
              onClick={() => {
                onSubmitMembershipCreation({
                  user: selectedUser,
                  project: selectedProject,
                  role: role,
                  timeAllocation: timeAllocation,
                  shortCode: shortCode,
                  comments: "None",
                  isLeader: false,
                  oldId: 1,
                  position: 100,
                });
              }}
              className={cn(
                "ml-3",
                colorMode === "light" 
                  ? "bg-green-500 hover:bg-green-600 text-white" 
                  : "bg-green-600 hover:bg-green-400 text-white"
              )}
            >
              Add User
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

type FormFieldNames =
  | "user"
  | "project"
  | "role"
  | "timeAllocation"
  | "shortCode"
  | "comments"
  | "position"
  | "isLeader"
  | "oldId";

interface FormSliderProps {
  name: FormFieldNames;
  validation?: RegisterOptions;
  formContext: {
    register: UseFormRegister<INewMember>;
    setValue: UseFormSetValue<INewMember>;
    watch: UseFormWatch<INewMember>;
  };
  defaultValue?: number;
  min?: number;
  max?: number;
  step?: number;
}

const FormSlider = ({ name, formContext, ...rest }: FormSliderProps) => {
  const { setValue, watch } = formContext;
  const currentValue = watch(name) || rest.defaultValue || 0;

  // Adapt the slider's onChange to work with react-hook-form
  const adaptedOnChange = (value: number[]) => {
    setValue(name, value[0]);
  };

  return (
    <Slider 
      {...rest} 
      value={[currentValue]} 
      onValueChange={adaptedOnChange}
    />
  );
};
