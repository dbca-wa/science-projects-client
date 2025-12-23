// Displayed when looking at the Project Details by selecting it on the projects page. Displays more data about the project and allows editing.

import { useColorMode } from "@/shared/utils/theme.utils";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { toast } from "sonner";
import { useEffect, useRef, useState } from "react";
import { AiFillCalendar, AiFillTag } from "react-icons/ai";
import {
  FaEdit,
  FaGraduationCap,
  FaLock,
  FaLockOpen,
  FaTrash,
  FaUserFriends,
} from "react-icons/fa";
import { HiOutlineExternalLink } from "react-icons/hi";
import { useNavigate } from "react-router-dom";
import type {
  ICaretakerPermissions,
  IDivision,
  IExtendedProjectDetails,
  IExternalProjectDetails,
  IProjectAreas,
  IProjectData,
  IProjectDocuments,
  IProjectMember,
  IStudentProjectDetails,
} from "@/shared/types";
import { ProjectDetailEditModal } from "@/features/projects/components/modals/ProjectDetailEditModal";
// import { AiFillDollarCircle } from "react-icons/ai";

import { BsCaretDownFill } from "react-icons/bs";
import { CgOrganisation } from "react-icons/cg";
import { FaSackDollar } from "react-icons/fa6";
import { GiMaterialsScience } from "react-icons/gi";
import { GrStatusInfo, GrStatusWarning } from "react-icons/gr";
import { IoIosStopwatch, IoMdSettings } from "react-icons/io";
import { IoCreate } from "react-icons/io5";
import { MdBusinessCenter, MdScience } from "react-icons/md";
import { RiBook3Fill } from "react-icons/ri";
import { VscOrganization } from "react-icons/vsc";
import { useLayoutSwitcher } from "@/shared/hooks/useLayout";
import { useCheckUserInTeam } from "@/features/users/hooks/useCheckUserInTeam";
import { useCheckUserIsTeamLeader } from "@/features/users/hooks/useCheckUserIsTeamLeader";
import { useNoImage } from "@/shared/hooks/useNoImage";
import useServerImageUrl from "@/shared/hooks/useServerImageUrl";
import { useUser } from "@/features/users/hooks/useUser";
import { ExtractedHTMLTitle } from "@/shared/components/ExtractedHTMLTitle";
import { CreateProgressReportModal } from "@/features/reports/components/modals/CreateProgressReportModal";
import { CreateStudentReportModal } from "@/features/reports/components/modals/CreateStudentReportModal";
import { DeleteProjectModal } from "@/features/projects/components/modals/DeleteProjectModal";
import { EditProjectModal } from "@/features/projects/components/modals/EditProjectModal";
import { ProjectClosureModal } from "@/features/projects/components/modals/ProjectClosureModal";
import { ProjectReopenModal } from "@/features/projects/components/modals/ProjectReopenModal";
import { RichTextEditor } from "@/shared/components/RichTextEditor/Editors/RichTextEditor";
import { ProjectSuspensionModal } from "@/features/projects/components/modals/ProjectSuspensionModal";
import { SetProjectStatusModal } from "@/features/projects/components/modals/SetProjectStatusModal";
import { RequestDeleteProjectModal } from "@/features/projects/components/modals/RequestDeleteProjectModal";
import { ActionAdminRequestModal } from "@/features/admin/components/modals/ActionAdminRequestModal";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { cancelAdminTaskRequestCall } from "@/features/admin/services/admin.service";
import { AxiosError } from "axios";
import useCaretakerPermissions from "@/features/users/hooks/useCaretakerPermissions";
import HideProjectModal from "./HideProjectModal";

interface IProjectOverviewCardProps extends ICaretakerPermissions {
  location: IProjectAreas;
  baseInformation: IProjectData;
  details: IExtendedProjectDetails | null | undefined;
  members: IProjectMember[];
  documents: IProjectDocuments;
  refetchData: () => void;
  setToLastTab: (tabToGoTo?: number) => void;
}

export const ProjectOverviewCard = ({
  location,
  baseInformation,
  details,
  members,
  refetchData,
  documents,
  setToLastTab,
  userIsCaretakerOfAdmin,
  userIsCaretakerOfBaLeader,
  userIsCaretakerOfMember,
  userIsCaretakerOfProjectLeader,
}: IProjectOverviewCardProps) => {
  // State for all modals (replacing useDisclosure hooks)
  const [isEditProjectDetailModalOpen, setIsEditProjectDetailModalOpen] = useState(false);
  const [isSetStatusModalOpen, setIsSetStatusModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isRequestDeleteModalOpen, setIsRequestDeleteModalOpen] = useState(false);
  const [isClosureModalOpen, setIsClosureModalOpen] = useState(false);
  const [isReopenModalOpen, setIsReopenModalOpen] = useState(false);
  const [isCreateStudentReportModalOpen, setIsCreateStudentReportModalOpen] = useState(false);
  const [isCreateProgressReportModalOpen, setIsCreateProgressReportModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSuspendModalOpen, setIsSuspendModalOpen] = useState(false);
  const [isActionDeleteModalOpen, setIsActionDeleteModalOpen] = useState(false);
  const [isHideProjectModalOpen, setIsHideProjectModalOpen] = useState(false);

  // Modal control functions
  const onEditProjectDetailModalClose = () => setIsEditProjectDetailModalOpen(false);
  const onOpenSetStatusModal = () => setIsSetStatusModalOpen(true);
  const onCloseSetStatusModal = () => setIsSetStatusModalOpen(false);
  const onOpenDeleteModal = () => setIsDeleteModalOpen(true);
  const onCloseDeleteModal = () => setIsDeleteModalOpen(false);
  const onOpenRequestDeleteModal = () => setIsRequestDeleteModalOpen(true);
  const onCloseRequestDeleteModal = () => setIsRequestDeleteModalOpen(false);
  const onOpenClosureModal = () => setIsClosureModalOpen(true);
  const onCloseClosureModal = () => setIsClosureModalOpen(false);
  const onOpenReopenModal = () => setIsReopenModalOpen(true);
  const onCloseReopenModal = () => setIsReopenModalOpen(false);
  const onOpenCreateStudentReportModal = () => setIsCreateStudentReportModalOpen(true);
  const onCloseCreateStudentReportModal = () => setIsCreateStudentReportModalOpen(false);
  const onOpenCreateProgressReportModal = () => setIsCreateProgressReportModalOpen(true);
  const onCloseCreateProgressReportModal = () => setIsCreateProgressReportModalOpen(false);
  const onOpenEditModal = () => setIsEditModalOpen(true);
  const onCloseEditModal = () => setIsEditModalOpen(false);
  const onOpenSuspendModal = () => setIsSuspendModalOpen(true);
  const onCloseSuspendModal = () => setIsSuspendModalOpen(false);
  const onOpenActionDeleteModal = () => setIsActionDeleteModalOpen(true);
  const onCloseActionDeleteModal = () => setIsActionDeleteModalOpen(false);
  const onOpenHideProjectModal = () => setIsHideProjectModalOpen(true);
  const onCloseHideProjectModal = () => setIsHideProjectModalOpen(false);

  const { colorMode } = useColorMode();

  const determineAuthors = (members: IProjectMember[]) => {
    // Filters members with non-null first and last names
    const filteredMembers = members?.filter((member) => {
      return (
        member.user.first_name !== null &&
        member.user.last_name !== null &&
        member.user.first_name !== undefined &&
        member.user.last_name !== undefined &&
        member.user.first_name !== "None" &&
        member.user.last_name !== "None"
      );
    });

    // Sorts the filteredMembers array alphabetically based on last_name
    filteredMembers.sort((a, b) => {
      const posA = a.position;
      const posB = b.position;
      if (posA < posB) return -1;
      if (posA > posB) return 1;
      // const lastNameA = a.user.last_name!.toUpperCase();
      // const lastNameB = b.user.last_name!.toUpperCase();
      // if (lastNameA < lastNameB) return -1;
      // if (lastNameA > lastNameB) return 1;
      return 0;
    });

    // Formats the names and create the 'authors' string
    const authorsArray = filteredMembers.map((member) => {
      const initials = `${member.user.first_name?.charAt(0)}.` || ""; // Use empty string as a default if first_name is null
      return `${initials} ${member.user.last_name || ""}`; // Use empty string as a default if last_name is null
    });

    const authorsDisplay = authorsArray.join(", ");

    return authorsDisplay;
  };

  const authorsDisplay = determineAuthors(members);

  const determineKeywords = () => {
    const info = baseInformation.keywords;
    if (info !== "" && info !== null)
      return baseInformation.keywords
        .split(", ")
        .map((keyword) => keyword.charAt(0).toUpperCase() + keyword.slice(1));
    else return ["None"];
  };

  const keywords = determineKeywords();

  const determineProjectLabel = () => {
    const year = baseInformation.year;
    const number = baseInformation.number;
    let stringified_number = "";
    if (number < 10) {
      stringified_number = "00" + String(number);
    } else if (number >= 10 && number < 100) {
      stringified_number = "0" + String(number);
    } else {
      stringified_number = String(number);
    }
    let type = baseInformation.kind;
    if (type === "student") {
      type = "STP";
    } else if (type === "external") {
      type = "EXT";
    } else if (type === "science") {
      type = "SP";
    } else {
      // Core Function
      type = "CF";
    }

    const label = `${type}-${year}-${stringified_number}`;
    return label;
  };

  const projectLabel = determineProjectLabel();

  const determineProjectYears = (baseInformation: IProjectData) => {
    const startDate = baseInformation.start_date || baseInformation.created_at;
    const endDate = baseInformation.end_date || null;

    let startYear, endYear;

    if (startDate instanceof Date) {
      startYear = startDate.getFullYear();
    } else {
      const parsedStartDate = new Date(startDate);
      startYear = parsedStartDate.getFullYear();
    }

    if (endDate instanceof Date) {
      endYear = endDate.getFullYear();
    } else if (endDate !== null) {
      const parsedEndDate = new Date(endDate);
      endYear = parsedEndDate.getFullYear();
    } else {
      endYear = null;
    }

    if (endYear !== null) {
      if (startYear === endYear) {
        return `${startYear}`;
      }
      return `${startYear}-${endYear}`;
    } else {
      return `${startYear}-`;
    }
  };

  const projectYears = determineProjectYears(baseInformation);
  // division

  const noImage = useNoImage();
  const me = useUser();
  // const { leaderData, leaderLoading } = useTeamLead(baseInformation?.pk ? baseInformation.pk : baseInformation.id);

  const { layout } = useLayoutSwitcher();

  // const editorKey = selectedYear.toString() + colorMode;

  const kindDictionary: {
    [key: string]: { label: string; color: string };
  }[] = [
    { external: { label: "External", color: "bg-gray-500" } },
    { science: { label: "Science", color: "bg-green-500" } },
    { student: { label: "Student", color: "bg-blue-500" } },
    { core_function: { label: "Core Function", color: "bg-red-500" } },
  ];

  const getKindValue = (kind: string): { label: string; color: string } => {
    const matchedStatus = kindDictionary.find((item) => kind in item);
    return matchedStatus
      ? matchedStatus[kind]
      : { label: "Unknown Kind", color: "bg-gray-500" };
  };

  const statusDictionary: {
    [key: string]: { label: string; color: string };
  }[] = [
    { new: { label: "New", color: "bg-gray-500" } },
    { pending: { label: "Pending Project Plan", color: "bg-yellow-500" } },
    { active: { label: "Active (Approved)", color: "bg-green-500" } },
    { updating: { label: "Update Requested", color: "bg-red-500" } },
    { closure_requested: { label: "Closure Requested", color: "bg-red-500" } },
    { closing: { label: "Closure Pending Final Update", color: "bg-red-500" } },
    { final_update: { label: "Final Update Requested", color: "bg-red-500" } },
    { completed: { label: "Completed and Closed", color: "bg-blue-500" } },
    { terminated: { label: "Terminated and Closed", color: "bg-gray-800" } },
    { suspended: { label: "Suspended", color: "bg-gray-500" } },
  ];

  const getStatusValue = (status: string): { label: string; color: string } => {
    const matchedStatus = statusDictionary.find((item) => status in item);
    return matchedStatus
      ? matchedStatus[status]
      : { label: "Unknown Status", color: "bg-gray-500" };
  };

  const imageUrl = useServerImageUrl(baseInformation?.image?.file);

  const navigate = useNavigate();

  // const checkIfUserInTeam = (userPk: number | string, team: IProjectMember[]): boolean => {
  //     if (typeof userPk === 'string') {
  //         userPk = parseInt(userPk, 10);
  //     }

  //     // Use the some() method to check if userPk is equal to the pk of any member in the team
  //     return team.some(member => member.pk === userPk);
  // };
  // const [userInTeam, setUserInTeam] = useState(checkIfUserInTeam(me?.userData?.pk ? me?.userData?.pk : me?.userData?.id, members));

  const mePk = me?.userData?.pk
    ? Number(me?.userData?.pk)
    : Number(me?.userData?.id);
  const userInTeam = useCheckUserInTeam(mePk, members);
  const userIsLeader = useCheckUserIsTeamLeader(mePk, members);
  const userIsBaLead = mePk === baseInformation?.business_area?.leader;

  // useCheckUserIsBaLeader(mePk, baseInformation?.business_area?.pk ? baseInformation?.business_area?.pk : baseInformation?.business_area?.id );
  // useEffect(() => { console.log(mePk, userInTeam) })

  const [statusValue, setStatusValue] = useState<string>();
  const [statusColor, setStatusColor] = useState<string>();
  const [kindValue, setKindValue] = useState<string>();
  const [kindColor, setKindColor] = useState<string>();

  useEffect(() => {
    if (baseInformation) {
      const { label, color } = getStatusValue(baseInformation?.status);
      const { label: kindLabel, color: kindColor } = getKindValue(
        baseInformation?.kind,
      );
      setStatusValue(label);
      setStatusColor(color);
      setKindValue(kindLabel);
      setKindColor(kindColor);
    }
  }, [baseInformation]);

  // useEffect(() => console.log(documents), [documents])

  const levelToString = (level: string) => {
    const levelDic = {
      pd: "Post-Doc",
      phd: "PhD",
      msc: "MSc",
      honours: "BSc Honours",
      fourth_year: "Fourth Year",
      third_year: "Third Year",
      undergrad: "Undergradate",
    };

    return levelDic[level];
  };

  // useEffect(() => {
  //   console.log({
  //     userIsBaLead,
  //     userIsLeader,
  //     userInTeam,
  //     mePk,
  //     me,
  //   });
  //   const shouldSee = (me?.userData?.is_superuser ||
  //     userIsLeader ||
  //     userIsBaLead ||
  //     me?.userData?.business_area?.name === "Directorate");

  //   console.log("SHOULD SEE MENU: ", shouldSee)
  // }, [userIsBaLead, userIsLeader, userInTeam, mePk, me])

  // useEffect(() => console.log(baseInformation))

  const [imageLoaded, setImageLoaded] = useState(false);

  const toastIdRef = useRef<string | number | undefined>(undefined);
  const addToast = (data: { status: string; title: string; position?: string; description?: string; duration?: number; isClosable?: boolean }) => {
    if (data.status === "loading") {
      toastIdRef.current = toast.loading(data.title);
    } else if (data.status === "success") {
      if (toastIdRef.current) {
        toast.success(data.title, { description: data.description });
      } else {
        toast.success(data.title, { description: data.description });
      }
    } else if (data.status === "error") {
      if (toastIdRef.current) {
        toast.error(data.title, { description: data.description });
      } else {
        toast.error(data.title, { description: data.description });
      }
    }
  };
  const queryClient = useQueryClient();

  const cancelAdminTaskRequestMutation = useMutation({
    mutationFn: cancelAdminTaskRequestCall,
    onMutate: () => {
      addToast({
        status: "loading",
        title: `Cancelling Request`,
        position: "top-right",
      });
    },
    onSuccess: async () => {
      addToast({
        status: "success",
        title: "Success",
        description: `Request Cancelled`,
        position: "top-right",
        duration: 3000,
        isClosable: true,
      });

      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ["pendingAdminTasks"] });
        queryClient
          .invalidateQueries({ queryKey: ["project", baseInformation?.pk] })
          .then(() => refetchData?.());
      }, 350);
    },
    onError: (error: AxiosError) => {
      addToast({
        status: "error",
        title: `Could not cancel request`,
        description: `${error.response.data}`,
        position: "top-right",
        duration: 3000,
        isClosable: true,
      });
    },
  });

  const cancelDeletionRequest = () => {
    // console.log("Cancel deletion request");
    cancelAdminTaskRequestMutation.mutate({
      taskPk: baseInformation?.deletion_request_id,
    });
  };

  const canEditPermission =
    userInTeam ||
    userIsBaLead ||
    userIsCaretakerOfBaLeader ||
    userIsCaretakerOfMember ||
    me?.userData?.is_superuser ||
    userIsCaretakerOfAdmin;

  return (
    <>
      {(me?.userData?.is_superuser ||
        userIsCaretakerOfAdmin ||
        userIsLeader ||
        userIsCaretakerOfProjectLeader ||
        userIsBaLead ||
        userIsCaretakerOfBaLeader ||
        me?.userData?.business_area?.name === "Directorate") && (
        <>
          <EditProjectModal
            projectPk={
              baseInformation?.pk ? baseInformation.pk : baseInformation.id
            }
            details={details}
            currentImage={baseInformation?.image}
            currentBa={baseInformation?.business_area}
            currentService={details?.base?.service}
            currentDates={[
              baseInformation?.start_date,
              baseInformation?.end_date,
            ]}
            currentKeywords={[baseInformation?.keywords]}
            currentTitle={baseInformation?.title}
            currentAreas={location?.areas ? location.areas : []}
            currentDataCustodian={details?.base?.data_custodian?.id}
            isOpen={isEditModalOpen}
            onClose={onCloseEditModal}
            refetchData={refetchData}
          />
          <ProjectClosureModal
            projectPk={
              baseInformation?.pk ? baseInformation.pk : baseInformation.id
            }
            projectKind={baseInformation?.kind}
            isOpen={isClosureModalOpen}
            onClose={onCloseClosureModal}
            refetchData={refetchData}
            setToLastTab={setToLastTab}
          />
          <ProjectSuspensionModal
            projectPk={
              baseInformation?.pk ? baseInformation.pk : baseInformation.id
            }
            projectStatus={baseInformation?.status}
            isOpen={isSuspendModalOpen}
            onClose={onCloseSuspendModal}
            refetchData={refetchData}
          />
          <ProjectReopenModal
            projectPk={
              baseInformation?.pk ? baseInformation.pk : baseInformation.id
            }
            isOpen={isReopenModalOpen}
            onClose={onCloseReopenModal}
            refetchData={refetchData}
          />
          {baseInformation?.kind !== "external" &&
            baseInformation?.kind !== "student" && (
              <CreateProgressReportModal
                projectPk={
                  baseInformation?.pk ? baseInformation.pk : baseInformation.id
                }
                documentKind={"progressreport"}
                refetchData={refetchData}
                isOpen={isCreateProgressReportModalOpen}
                onClose={onCloseCreateProgressReportModal}
              />
            )}
          {baseInformation?.kind === "student" && (
            <CreateStudentReportModal
              projectPk={
                baseInformation?.pk ? baseInformation.pk : baseInformation.id
              }
              documentKind={"studentreport"}
              refetchData={refetchData}
              isOpen={isCreateStudentReportModalOpen}
              onClose={onCloseCreateStudentReportModal}
            />
          )}
          {me?.userData?.is_superuser && (
            <>
              <DeleteProjectModal
                projectPk={
                  baseInformation?.pk ? baseInformation.pk : baseInformation.id
                }
                isOpen={isDeleteModalOpen}
                onClose={onCloseDeleteModal}
              />

              <SetProjectStatusModal
                projectPk={
                  baseInformation?.pk ? baseInformation.pk : baseInformation.id
                }
                isOpen={isSetStatusModalOpen}
                onClose={onCloseSetStatusModal}
                refetchData={refetchData}
              />
            </>
          )}
          <RequestDeleteProjectModal
            projectPk={
              baseInformation?.pk ? baseInformation.pk : baseInformation.id
            }
            isOpen={isRequestDeleteModalOpen}
            onClose={onCloseRequestDeleteModal}
            refetch={refetchData}
          />
        </>
      )}

      <div
        className={`min-h-[100px] rounded-lg ${
          colorMode === "light" ? "bg-gray-100 text-black" : "bg-gray-700 text-white"
        }`}
      >
        {(me?.userData?.is_superuser ||
          userIsCaretakerOfAdmin ||
          userIsLeader ||
          userIsCaretakerOfProjectLeader ||
          userIsBaLead ||
          userIsCaretakerOfBaLeader ||
          me?.userData?.business_area?.name === "Directorate") && (
          <div
            className="mt-6 w-full pr-14 pl-6 z-10 absolute flex flex-col"
          >
            {/* <Flex
                            // bg={"pink"}
                            justifyContent={"flex-end"}
                            right={0}
                        >
                            <Button
                                colorScheme="blue"
                                onClick={onOpenEditModal}
                                justifySelf={'flex-end'}
                            >
                                Edit
                            </Button>
                        </Flex>
                        <Flex
                            // bg={"pink"}
                            justifyContent={"flex-end"}
                            right={0}
                        >
                            <Button
                                colorScheme="red"
                                onClick={onOpenDeleteModal}
                            >
                                Delete
                            </Button>
                        </Flex> */}
          </div>
        )}
        {baseInformation?.deletion_requested ? (
          me?.userData?.is_superuser || userIsCaretakerOfAdmin ? (
            <>
              <ActionAdminRequestModal
                action="deleteproject"
                isOpen={isActionDeleteModalOpen}
                onClose={onCloseActionDeleteModal}
                refetch={refetchData}
                taskPk={baseInformation?.deletion_request_id}
              />
              <div
                className="p-4 bg-red-100 rounded-lg mt-4 flex justify-between items-center text-red-800"
              >
                <p>Deletion Requested</p>
                <div className="flex justify-between items-center gap-2">
                  <Button
                    onClick={
                      baseInformation?.deletion_requested
                        ? onOpenActionDeleteModal
                        : undefined
                    }
                    className="bg-red-500 text-white hover:bg-red-400"
                  >
                    Action
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div
              className="p-4 bg-red-100 rounded-lg mt-4 flex justify-end items-center text-red-800"
            >
              <p>Deletion Requested</p>
            </div>
          )
        ) : null}
        <div
          className="p-4 pt-6 px-6 grid gap-3 grid-cols-1 lg:grid-cols-[minmax(300px,4fr)_5fr]"
        >
          <div
            className="h-[380px] xl:h-[400px] 2xl:h-[600px] rounded-xl overflow-hidden relative"
          >
            <div className="absolute right-3 top-3 z-20">
              <Badge
                className={`font-bold text-white ml-3 text-center justify-center p-2.5 text-lg ${
                  baseInformation?.kind === "core_function"
                    ? "bg-red-600"
                    : baseInformation?.kind === "science"
                      ? "bg-green-500"
                      : baseInformation?.kind === "student"
                        ? "bg-blue-400"
                        : "bg-gray-400"
                }`}
              >
                {
                  baseInformation?.kind === "core_function"
                    ? "CF"
                    : baseInformation?.kind === "external"
                      ? "EXT"
                      : baseInformation?.kind === "science"
                        ? "SP"
                        : "STP" //Student
                }
                -{baseInformation?.year}-{baseInformation?.number}
              </Badge>
            </div>
            <Skeleton className="w-full h-full" isLoaded={imageLoaded}>
              <img
                loading="lazy"
                className="rounded-2xl object-cover w-full h-full pointer-events-none select-none"
                style={{ imageRendering: "crisp-edges", objectFit: "cover" }}
                src={baseInformation?.image?.file ? imageUrl : noImage}
                onLoad={() => setImageLoaded(true)}
              />
            </Skeleton>
          </div>

          <div className="px-2 relative">
            <div className="pb-3">
              <Button
                variant="link"
                className={`text-xl font-bold whitespace-normal text-left p-0 h-auto ${
                  colorMode === "light" ? "text-blue-500" : "text-blue-300"
                }`}
                onClick={() =>
                  navigate(
                    `/projects/${
                      baseInformation.pk !== undefined
                        ? baseInformation.pk
                        : baseInformation.id
                    }/overview`,
                  )
                }
              >
                <ExtractedHTMLTitle
                  htmlContent={`${baseInformation.title}`}
                  color={"#62a0f2"}
                  fontWeight={"bold"}
                  fontSize={"22px"}
                  className="mb-2 cursor-pointer select-text hover:underline"
                  draggable={false}
                  onDragStart={(e) => e.preventDefault()}
                />
              </Button>

              <p
                className={`mt-2 text-sm ${
                  colorMode === "light" ? "text-gray-600" : "text-gray-400"
                }`}
              >
                {authorsDisplay}
              </p>
            </div>

            {/*  */}
            <div className="flex items-center pb-3">
              <div className="text-2xl mr-3">
                <GrStatusInfo />
              </div>
              <div className="flex">
                <Badge
                  className={`text-sm text-center justify-center p-2.5 text-white ${kindColor}`}
                >
                  {kindValue}
                </Badge>
                <Badge
                  className={`ml-3 text-sm text-center justify-center p-2.5 text-white ${statusColor}`}
                >
                  {statusValue}
                </Badge>
              </div>
            </div>

            {baseInformation?.business_area && (
              <div className="flex items-center pb-3">
                <div className="text-2xl mr-3">
                  <MdBusinessCenter />
                </div>
                <div className="flex">
                  <Badge
                    className={`text-sm text-center justify-center p-2.5 text-white ${
                      colorMode === "light" ? "bg-blue-500" : "bg-blue-700"
                    }`}
                  >
                    {baseInformation?.business_area?.name}{" "}
                    {(baseInformation?.business_area?.division as IDivision)
                      ?.slug
                      ? `(${(baseInformation?.business_area?.division as IDivision)?.slug})`
                      : `(${(baseInformation?.business_area?.division as IDivision)?.name})`}
                  </Badge>
                </div>
              </div>
            )}

            {baseInformation?.kind === "student" ? (
              <div className="w-full grid grid-cols-1 gap-4 pb-4">
                <div className="flex items-center">
                  <div className="text-2xl">
                    <CgOrganisation />
                  </div>
                  <p className="ml-3">
                    {(details?.student as IStudentProjectDetails)?.organisation
                      ? `${(
                          details?.student as IStudentProjectDetails
                        )?.organisation[0]?.toUpperCase()}${(
                          details?.student as IStudentProjectDetails
                        )?.organisation.slice(1)}`
                      : "No organisation listed"}
                  </p>
                </div>
                <div className="flex items-center">
                  <div className="text-2xl">
                    <FaGraduationCap />
                  </div>
                  <p className="ml-3">
                    {(details?.student as IStudentProjectDetails)?.level
                      ? levelToString(
                          (details?.student as IStudentProjectDetails)?.level,
                        )
                      : "No level selected"}
                  </p>
                </div>
              </div>
            ) : null}

            {baseInformation?.kind === "external" ? (
              <div className="w-full grid grid-cols-1 gap-4 pb-3">
                <div className="flex items-center">
                  <div className="text-2xl">
                    <VscOrganization />
                  </div>
                  <p className="ml-3">
                    {(details?.external as IExternalProjectDetails)
                      ?.collaboration_with
                      ? `${
                          (details?.external as IExternalProjectDetails)
                            ?.collaboration_with
                        }`
                      : null}
                  </p>
                </div>

                <div className="flex items-center">
                  <div className="text-2xl">
                    <FaSackDollar />
                  </div>
                  <p className="ml-3">
                    {(details?.external as IExternalProjectDetails)?.budget
                      ? `${
                          (details?.external as IExternalProjectDetails)?.budget
                        }`
                      : null}
                  </p>
                </div>
              </div>
            ) : null}

            <div className="pt-2 pb-5 flex items-center">
              <div className="text-2xl">
                <AiFillCalendar />
              </div>
              <div className="ml-3 grid grid-cols-1 h-7 gap-4">
                <Badge
                  className={`text-sm text-center justify-center p-2.5 ${
                    colorMode === "light" ? "bg-gray-200 text-black" : "bg-gray-800 text-white"
                  }`}
                >
                  {projectYears}
                </Badge>
              </div>
            </div>

            {/* Rest of the project details */}

            <div className="flex">
              <div className="text-2xl pt-4">
                <AiFillTag />
              </div>

              <div
                className={`ml-3 gap-4 ${
                  layout === "traditional"
                    ? "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-2 1200px:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-4"
                    : "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-5"
                }`}
              >
                {keywords?.map((tag, index) => (
                  <Badge
                    key={index}
                    className={`h-full text-sm text-center justify-center min-h-[50px] flex-1 ${
                      colorMode === "light" ? "bg-gray-200 text-black" : "bg-gray-800 text-white"
                    }`}
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="right-0 z-[-1] px-6">
          {me?.userData?.is_superuser ||
          userIsCaretakerOfAdmin ||
          userIsLeader ||
          userIsCaretakerOfProjectLeader ||
          userIsBaLead ||
          userIsCaretakerOfBaLeader ||
          me?.userData?.business_area?.name === "Directorate" ? (
            <div className="flex">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    className="px-2 py-2 rounded border transition-all duration-200 bg-blue-500 text-white text-base hover:bg-blue-400 focus:ring-2 focus:ring-blue-300"
                  >
                    <div className="flex items-center justify-center">
                      <div className="mr-2">
                        <IoMdSettings />
                      </div>
                      <span>Edit Project</span>
                      <div className="ml-2">
                        <BsCaretDownFill />
                      </div>
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={onOpenEditModal}>
                    <div className="flex items-center">
                      <div className="mr-2">
                        <FaEdit />
                      </div>
                      <div>
                        <span>Edit</span>
                      </div>
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={onOpenEditModal}>
                    <div className="flex items-center">
                      <div className="mr-2">
                        <FaEdit />
                      </div>
                      <div>
                        <span>Edit</span>
                      </div>
                    </div>
                  </DropdownMenuItem>
                  {baseInformation?.kind === "student" && (
                    <DropdownMenuItem
                      onClick={onOpenCreateStudentReportModal}
                      disabled={baseInformation?.status === "suspended"}
                    >
                      <div className="flex items-center">
                        <div className="mr-2">
                          <FaLockOpen />
                        </div>
                        <div>
                          <span>Create Student Report</span>
                        </div>
                      </div>
                    </DropdownMenuItem>
                  )}

                  {baseInformation?.kind !== "student" &&
                    baseInformation?.kind !== "external" && (
                      <DropdownMenuItem
                        onClick={onOpenCreateProgressReportModal}
                        disabled={
                          (documents.concept_plan &&
                            !documents?.concept_plan?.document
                              ?.directorate_approval_granted) ||
                          !documents?.project_plan?.document
                            ?.directorate_approval_granted ||
                          baseInformation?.status === "suspended"
                        }
                      >
                        <div className="flex items-center">
                          <div className="mr-2">
                            <IoCreate />
                          </div>
                          <div>
                            <span>Create Progress Report</span>
                          </div>
                        </div>
                      </DropdownMenuItem>
                    )}

                  <DropdownMenuItem
                    onClick={onOpenSuspendModal}
                    disabled={
                      baseInformation?.status === "terminated" ||
                      baseInformation?.status === "completed" ||
                      baseInformation?.status === "closing" ||
                      baseInformation?.status === "closure_requested" ||
                      baseInformation?.status === "closed"
                    }
                  >
                    <div className="flex items-center">
                      <div className="mr-2">
                        <IoIosStopwatch />
                      </div>
                      <div>
                        <span>
                          {baseInformation?.status === "suspended"
                            ? "Unsuspend Project"
                            : "Suspend Project"}
                        </span>
                      </div>
                    </div>
                  </DropdownMenuItem>

                  {documents?.project_closure?.document && (
                    <DropdownMenuItem
                      onClick={onOpenReopenModal}
                      disabled={
                        baseInformation?.status !== "closure_requested" &&
                        baseInformation?.status !== "closing" &&
                        baseInformation?.status !== "closed" &&
                        baseInformation?.status !== "completed" &&
                        baseInformation?.status !== "terminated"
                      }
                    >
                      <div className="flex items-center">
                        <div className="mr-2">
                          {documents?.project_closure?.document ? (
                            <FaLockOpen />
                          ) : (
                            <FaLock />
                          )}
                        </div>
                        <div>
                          <span>
                            {documents?.project_closure?.document
                              ? "Reopen Project"
                              : "Close Project"}
                          </span>
                        </div>
                      </div>
                    </DropdownMenuItem>
                  )}

                  {!documents?.project_closure?.document && (
                    <DropdownMenuItem
                      onClick={
                        documents?.project_closure?.document ||
                        baseInformation?.status === "terminated" ||
                        baseInformation?.status === "completed" ||
                        baseInformation?.status === "closing" ||
                        baseInformation?.status === "closure_requested" ||
                        baseInformation?.status === "closed"
                          ? onOpenReopenModal
                          : onOpenClosureModal
                      }
                    >
                      <div className="flex items-center">
                        <div className="mr-2">
                          {documents?.project_closure?.document ? (
                            <FaLockOpen />
                          ) : (
                            <FaLock />
                          )}
                        </div>
                        <div>
                          <span>
                            {documents?.project_closure?.document ||
                            baseInformation?.status === "terminated" ||
                            baseInformation?.status === "completed" ||
                            baseInformation?.status === "closing" ||
                            baseInformation?.status === "closure_requested" ||
                            baseInformation?.status === "closed"
                              ? "Reopen Project"
                              : "Close Project"}
                          </span>
                        </div>
                      </div>
                    </DropdownMenuItem>
                  )}

                  {me?.userData?.is_superuser ? (
                    <DropdownMenuItem onClick={onOpenSetStatusModal}>
                      <div className="flex items-center">
                        <div className="mr-2">
                          <GrStatusWarning />
                        </div>
                        <div>
                          <span>Set Status</span>
                        </div>
                      </div>
                    </DropdownMenuItem>
                  ) : null}
                  {me?.userData?.is_superuser ? (
                    <DropdownMenuItem onClick={onOpenDeleteModal}>
                      <div className="flex items-center">
                        <div className="mr-2">
                          <FaTrash />
                        </div>
                        <div>
                          <span>Delete</span>
                        </div>
                      </div>
                    </DropdownMenuItem>
                  ) : (
                    <DropdownMenuItem
                      onClick={
                        baseInformation?.deletion_requested
                          ? cancelDeletionRequest
                          : onOpenRequestDeleteModal
                      }
                    >
                      <div className="flex items-center">
                        <div className="mr-2">
                          <FaTrash />
                        </div>
                        <div>
                          <span>
                            {baseInformation?.deletion_requested
                              ? "Cancel Deletion Request"
                              : "Request Deletion"}
                          </span>
                        </div>
                      </div>
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : null}

          <div className="pb-0 flex items-center justify-end flex-1">
            <p
              className={`font-bold cursor-pointer hover:underline ${
                colorMode === "dark" ? "text-blue-200 hover:text-blue-100" : "text-blue-400 hover:text-blue-300"
              }`}
              onClick={() => {
                window.open(
                  `https://data.bio.wa.gov.au/dataset/?tags=${projectLabel}`,
                  "_blank",
                );
              }}
            >
              Review datasets tagged with {projectLabel}
            </p>
            <div
              className={`mt-1 ml-1.5 flex items-center ${
                colorMode === "dark" ? "text-blue-200" : "text-blue-400"
              }`}
            >
              <HiOutlineExternalLink />
            </div>
          </div>
        </div>

        {/* Description and Edit Project Details */}
        <div className="p-6 pt-0">
          <div className="mt-4">
            {/* Check if user is in members array by checking each member.user.id */}
            {members?.some(
              (member) =>
                member.user.pk === me?.userData?.id ||
                member.user.pk === me?.userData?.pk,
            ) && (
              <>
                {/* isHideProjectModalOpen */}
                <HideProjectModal
                  projectIsHiddenFromStaffProfile={baseInformation?.hidden_from_staff_profiles?.includes(
                    me?.userData?.pk,
                  )}
                  projectPk={baseInformation.id}
                  isOpen={isHideProjectModalOpen}
                  onClose={onCloseHideProjectModal}
                  userPk={me?.userData?.pk}
                  refetch={refetchData}
                />
                <div className="my-4">
                  <Button
                    onClick={onOpenHideProjectModal}
                    className="bg-orange-500 text-white hover:bg-orange-400"
                  >
                    {baseInformation?.hidden_from_staff_profiles?.includes(
                      me?.userData?.pk,
                    )
                      ? "Show On Staff Profile"
                      : "Hide From Staff Profile"}
                  </Button>
                </div>
              </>
            )}

            {(details?.external as IExternalProjectDetails)?.project ? (
              <>
                <RichTextEditor
                  // wordLimit={500}
                  limitCanBePassed={false}
                  canEdit={
                    userInTeam ||
                    userIsLeader ||
                    userIsBaLead ||
                    me?.userData?.is_superuser
                  }
                  editorType="ProjectDetail"
                  data={
                    (details?.external as IExternalProjectDetails)?.description
                  }
                  project_pk={baseInformation.id}
                  details_pk={
                    (details?.external as IExternalProjectDetails)?.id
                  }
                  section={"externalDescription"}
                  isUpdate={true}
                  titleTextSize={"20px"}
                  key={`externalDescription${colorMode}${(details?.external as IExternalProjectDetails)?.description}`} // Change the key to force a re-render
                />
                <RichTextEditor
                  // wordLimit={500}
                  limitCanBePassed={false}
                  canEdit={canEditPermission}
                  editorType="ProjectDetail"
                  data={(details?.external as IExternalProjectDetails)?.aims}
                  details_pk={
                    (details?.external as IExternalProjectDetails)?.id
                  }
                  project_pk={baseInformation.id}
                  section={"externalAims"}
                  isUpdate={true}
                  titleTextSize={"20px"}
                  key={`externalAims${colorMode}${(details?.external as IExternalProjectDetails)?.aims}`} // Change the key to force a re-render
                />
              </>
            ) : (
              <RichTextEditor
                // wordLimit={500}
                limitCanBePassed={false}
                canEdit={canEditPermission}
                editorType="ProjectDetail"
                data={baseInformation.description}
                project_pk={baseInformation.id}
                section={"description"}
                isUpdate={true}
                titleTextSize={"20px"}
                key={`description${colorMode}`} // Change the key to force a re-render
              />
            )}
          </div>

          <div className="flex pt-6 justify-right">
            <ProjectDetailEditModal
              projectType={
                baseInformation.kind === "student"
                  ? "Student Project"
                  : baseInformation.kind === "external"
                    ? "External Project"
                    : baseInformation.kind === "science"
                      ? "Science Project"
                      : "Core Function"
              }
              isOpen={isEditProjectDetailModalOpen}
              onClose={onEditProjectDetailModalClose}
              icon={
                baseInformation.kind === "student"
                  ? RiBook3Fill
                  : baseInformation.kind === "external"
                    ? FaUserFriends
                    : baseInformation.kind === "science"
                      ? MdScience
                      : GiMaterialsScience
              }
              baseInformation={baseInformation}
              details={details}
            />
          </div>
        </div>
      </div>
    </>
  );
};
