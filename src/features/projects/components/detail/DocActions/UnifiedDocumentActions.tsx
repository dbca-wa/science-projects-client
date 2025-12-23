import { CreateProgressReportModal } from "@/features/reports/components/modals/CreateProgressReportModal";
import { DeleteDocumentModal } from "@/features/documents/components/modals/DeleteDocumentModal";
import { UnifiedDocumentActionModal } from "@/features/documents/components/modals/UnifiedDocumentActionModal";
import { SetAreasModal } from "@/features/business-areas/components/modals/SetAreasModal";
import { type ISetProjectStatusProps, setProjectStatus } from "@/features/projects/services/projects.service";
import { useFormattedDate } from "@/shared/hooks/useFormattedDate";
import { useBusinessArea } from "@/features/business-areas/hooks/useBusinessArea";
import { useDivisionDirectorateMembers } from "@/features/admin/hooks/useDivisionDirectorateMembers";
import { useFullUserByPk } from "@/features/users/hooks/useFullUserByPk";
import { useProjectTeam } from "@/features/projects/hooks/useProjectTeam";
import { useUser } from "@/features/users/hooks/useUser";
import {
  type ICaretakerPermissions,
  type IConceptPlan,
  type IProgressReport,
  type IProjectClosure,
  type IProjectDocuments,
  type IProjectMember,
  type IProjectPlan,
  type IStudentReport,
  type ProjectStatus,
} from "@/shared/types";
import { useColorMode } from "@/shared/utils/theme.utils";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetFooter,
} from "@/shared/components/ui/sheet";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { UserProfile } from "@/features/users/components/UserProfile";
import { ProjectDocumentPDFSection } from "./ProjectDocumentPDFSection";

// Type for document type
export type DocumentType =
  | "concept"
  | "projectplan"
  | "progressreport"
  | "studentreport"
  | "projectclosure";

// Mapping to DeleteDocumentModal documentKind
const documentKindMapping = {
  concept: "conceptplan",
  projectplan: "projectplan",
  progressreport: "progressreport",
  studentreport: "studentreport",
  projectclosure: "projectclosure",
} as const;

// Type for all possible document data
export type DocumentData =
  | IConceptPlan
  | IProjectPlan
  | IProgressReport
  | IStudentReport
  | IProjectClosure;

// Props interface for unified document actions
interface UnifiedDocumentActionsProps extends ICaretakerPermissions {
  documentType: DocumentType;
  documentData: DocumentData;
  refetchData: () => void;
  callSameData?: () => void;
  all_documents?: IProjectDocuments;
  projectAreas?: any;
  documents?: DocumentData[];
  setToLastTab?: (tabToGoTo?: number) => void;
  isBaLead?: boolean;
}

// Type guards for document types
const isConceptPlan = (doc: DocumentData): doc is IConceptPlan => {
  return "tags" in doc;
};

const isProjectPlan = (doc: DocumentData): doc is IProjectPlan => {
  return "background" in doc;
};

const isProgressReport = (doc: DocumentData): doc is IProgressReport => {
  return "activities" in doc;
};

const isStudentReport = (doc: DocumentData): doc is IStudentReport => {
  return "supervisor" in doc;
};

const isProjectClosure = (doc: DocumentData): doc is IProjectClosure => {
  return "intended_outcome" in doc;
};

// Get document name for display
const getDocumentName = (type: DocumentType): string => {
  switch (type) {
    case "concept":
      return "Concept Plan";
    case "projectplan":
      return "Project Plan";
    case "progressreport":
      return "Progress Report";
    case "studentreport":
      return "Student Report";
    case "projectclosure":
      return "Project Closure";
  }
};

export const UnifiedDocumentActions = ({
  documentType,
  documentData,
  refetchData,
  callSameData,
  all_documents,
  projectAreas,
  documents,
  setToLastTab,
  isBaLead,
  userIsCaretakerOfAdmin,
  userIsCaretakerOfBaLeader,
  userIsCaretakerOfMember,
  userIsCaretakerOfProjectLeader,
}: UnifiedDocumentActionsProps) => {
  const { colorMode } = useColorMode();

  // State for all modals (replacing useDisclosure hooks)
  const [s1ApprovalOpen, setS1ApprovalOpen] = useState(false);
  const [s2ApprovalOpen, setS2ApprovalOpen] = useState(false);
  const [s3ApprovalOpen, setS3ApprovalOpen] = useState(false);
  const [s1RecallOpen, setS1RecallOpen] = useState(false);
  const [s2RecallOpen, setS2RecallOpen] = useState(false);
  const [s3RecallOpen, setS3RecallOpen] = useState(false);
  const [s2SendBackOpen, setS2SendBackOpen] = useState(false);
  const [s3SendBackOpen, setS3SendBackOpen] = useState(false);
  const [s1ReopenOpen, setS1ReopenOpen] = useState(false);
  const [s2ReopenOpen, setS2ReopenOpen] = useState(false);
  const [s3ReopenOpen, setS3ReopenOpen] = useState(false);
  const [deleteDocumentOpen, setDeleteDocumentOpen] = useState(false);
  const [modifierOpen, setModifierOpen] = useState(false);
  const [creatorOpen, setCreatorOpen] = useState(false);
  const [createProgressReportOpen, setCreateProgressReportOpen] = useState(false);
  const [setAreasOpen, setSetAreasOpen] = useState(false);

  // Modal control objects (maintaining useDisclosure-like API)
  const modals = {
    s1Approval: {
      isOpen: s1ApprovalOpen,
      onOpen: () => setS1ApprovalOpen(true),
      onClose: () => setS1ApprovalOpen(false),
    },
    s2Approval: {
      isOpen: s2ApprovalOpen,
      onOpen: () => setS2ApprovalOpen(true),
      onClose: () => setS2ApprovalOpen(false),
    },
    s3Approval: {
      isOpen: s3ApprovalOpen,
      onOpen: () => setS3ApprovalOpen(true),
      onClose: () => setS3ApprovalOpen(false),
    },
    s1Recall: {
      isOpen: s1RecallOpen,
      onOpen: () => setS1RecallOpen(true),
      onClose: () => setS1RecallOpen(false),
    },
    s2Recall: {
      isOpen: s2RecallOpen,
      onOpen: () => setS2RecallOpen(true),
      onClose: () => setS2RecallOpen(false),
    },
    s3Recall: {
      isOpen: s3RecallOpen,
      onOpen: () => setS3RecallOpen(true),
      onClose: () => setS3RecallOpen(false),
    },
    s2SendBack: {
      isOpen: s2SendBackOpen,
      onOpen: () => setS2SendBackOpen(true),
      onClose: () => setS2SendBackOpen(false),
    },
    s3SendBack: {
      isOpen: s3SendBackOpen,
      onOpen: () => setS3SendBackOpen(true),
      onClose: () => setS3SendBackOpen(false),
    },
    s1Reopen: {
      isOpen: s1ReopenOpen,
      onOpen: () => setS1ReopenOpen(true),
      onClose: () => setS1ReopenOpen(false),
    },
    s2Reopen: {
      isOpen: s2ReopenOpen,
      onOpen: () => setS2ReopenOpen(true),
      onClose: () => setS2ReopenOpen(false),
    },
    s3Reopen: {
      isOpen: s3ReopenOpen,
      onOpen: () => setS3ReopenOpen(true),
      onClose: () => setS3ReopenOpen(false),
    },
    deleteDocument: {
      isOpen: deleteDocumentOpen,
      onOpen: () => setDeleteDocumentOpen(true),
      onClose: () => setDeleteDocumentOpen(false),
    },
    modifier: {
      isOpen: modifierOpen,
      onOpen: () => setModifierOpen(true),
      onClose: () => setModifierOpen(false),
    },
    creator: {
      isOpen: creatorOpen,
      onOpen: () => setCreatorOpen(true),
      onClose: () => setCreatorOpen(false),
    },
    createProgressReport: {
      isOpen: createProgressReportOpen,
      onOpen: () => setCreateProgressReportOpen(true),
      onClose: () => setCreateProgressReportOpen(false),
    },
    setAreas: {
      isOpen: setAreasOpen,
      onOpen: () => setSetAreasOpen(true),
      onClose: () => setSetAreasOpen(false),
    },
  };

  // Common hooks needed by all document types
  const { userData, userLoading } = useUser();
  const { baData, baLoading } = useBusinessArea(
    documentData?.document?.project?.business_area?.pk,
  );
  const { directorateData, isDirectorateLoading } =
    useDivisionDirectorateMembers(baData?.division);
  const userInDivisionalDirectorate = directorateData?.some(
    (user) => user.pk === userData?.pk,
  );
  const { userData: baLead } = useFullUserByPk(baData?.leader);
  const { userData: modifier, userLoading: modifierLoading } = useFullUserByPk(
    documentData?.document?.modifier,
  );
  const { userData: creator, userLoading: creatorLoading } = useFullUserByPk(
    documentData?.document?.creator,
  );
  const { teamData, isTeamLoading } = useProjectTeam(
    String(documentData?.document?.project?.pk),
  );

  // Formatted dates
  const creationDate = useFormattedDate(documentData?.document?.created_at);
  const modifyDate = useFormattedDate(documentData?.document?.updated_at);

  // State
  const [actionsReady, setActionsReady] = useState(false);
  const [leaderMember, setLeaderMember] = useState<IProjectMember>();

  // Set up for delete document modal
  const keyForDeleteDocumentModal = documentData?.document?.pk
    ? `document-${documentData.document.pk}`
    : `document-${documentData.document.id}`;

  // Color dictionary for project kinds
  const kindDict = {
    core_function: { color: "red", string: "Core Function", tag: "CF" },
    science: { color: "green", string: "Science", tag: "SP" },
    student: { color: "blue", string: "Student", tag: "STP" },
    external: { color: "gray", string: "External", tag: "EXT" },
  };

  // Set up actions ready state
  useEffect(() => {
    if (
      actionsReady === false &&
      !userLoading &&
      !baLoading &&
      !modifierLoading &&
      !creatorLoading &&
      !isTeamLoading &&
      teamData &&
      userData &&
      baData &&
      modifier &&
      creator
    ) {
      if (!isTeamLoading) {
        setLeaderMember(teamData.find((member) => member.is_leader === true));
      }
      setActionsReady(true);
    }
  }, [
    userLoading,
    baLoading,
    modifierLoading,
    creatorLoading,
    userData,
    baData,
    modifier,
    creator,
    actionsReady,
    teamData,
    isTeamLoading,
  ]);

  useEffect(() => {
    if (actionsReady) {
      setLeaderMember(teamData.find((member) => member.is_leader === true));
    }
  }, [actionsReady, teamData, isTeamLoading]);

  // Helper function for status updates
  const setStatusIfRequired = (
    projectPk: number,
    status: ProjectStatus = "pending",
  ) => {
    const data: ISetProjectStatusProps = {
      projectId: projectPk,
      status,
    };
    setProjectStatus(data);
  };

  // Document-specific features
  const getDocumentSpecificButtons = () => {
    // Project Plan specific - Create Progress Report button
    if (
      documentType === "projectplan" &&
      all_documents?.progress_reports?.length < 1 &&
      documentData?.document?.project_lead_approval_granted === true &&
      documentData?.document?.business_area_lead_approval_granted === true &&
      documentData?.document?.directorate_approval_granted === true &&
      (userData?.is_superuser ||
        userIsCaretakerOfAdmin ||
        userData?.pk === leaderMember?.user?.pk ||
        userIsCaretakerOfProjectLeader ||
        isBaLead ||
        userIsCaretakerOfBaLeader)
    ) {
      return (
        <>
          <CreateProgressReportModal
            projectPk={documentData?.document?.project?.pk}
            documentKind="progressreport"
            onClose={modals.createProgressReport.onClose}
            isOpen={modals.createProgressReport.isOpen}
            refetchData={refetchData}
          />
          <Button
            className={`mt-3 text-white ${
              colorMode === "light" ? "bg-orange-500 hover:bg-orange-400" : "bg-orange-600 hover:bg-orange-500"
            } text-sm ml-2`}
            onClick={modals.createProgressReport.onOpen}
          >
            Create Progress Report
          </Button>
        </>
      );
    }

    // Project Plan specific - Set Areas button
    if (
      documentType === "projectplan" &&
      projectAreas &&
      projectAreas.areas.length < 1 &&
      documentData?.document?.project_lead_approval_granted === false
    ) {
      return (
        <>
          <SetAreasModal
            projectPk={documentData?.document?.project?.pk}
            onClose={modals.setAreas.onClose}
            isOpen={modals.setAreas.isOpen}
            refetchData={refetchData}
            setToLastTab={setToLastTab}
          />
          <Button
            className={`text-white ${
              colorMode === "light" ? "bg-green-500 hover:bg-green-400" : "bg-green-600 hover:bg-green-500"
            } text-sm`}
            onClick={modals.setAreas.onOpen}
          >
            Set Areas
          </Button>
        </>
      );
    }

    // Reopen project button for Project Closure
    if (
      documentType === "projectclosure" &&
      (documentData?.document?.project?.status === "completed" ||
        documentData?.document?.project?.status === "terminated" ||
        documentData?.document?.project?.status === "suspended") &&
      (userData?.is_superuser ||
        userIsCaretakerOfAdmin ||
        userData?.pk === leaderMember?.user?.pk ||
        userIsCaretakerOfProjectLeader ||
        isBaLead ||
        userIsCaretakerOfBaLeader)
    ) {
      return (
        <Button
          className={`text-white ${
            colorMode === "light" ? "bg-orange-500 hover:bg-orange-400" : "bg-orange-600 hover:bg-orange-500"
          } text-sm mt-3`}
          onClick={
            documentData?.document?.directorate_approval_granted
              ? modals.s3Reopen.onOpen
              : documentData?.document?.business_area_lead_approval_granted
                ? modals.s2Reopen.onOpen
                : modals.s1Reopen.onOpen
          }
        >
          {userData?.is_superuser || userIsCaretakerOfAdmin
            ? "Delete Closure"
            : "Reopen Project"}
        </Button>
      );
    }

    return null;
  };

  // Delete document button conditional rendering
  const canShowDeleteButton = () => {
    // Only show if document is not approved
    if (documentData?.document?.directorate_approval_granted) {
      return false;
    }

    // Only show for new documents
    if (documentData?.document?.project_lead_approval_granted === false) {
      return true;
    }

    // Special case for project plans
    if (
      documentType === "projectplan" &&
      all_documents?.progress_reports?.length < 1
    ) {
      return true;
    }

    return false;
  };

  // Main render
  return (
    <>
      {actionsReady && leaderMember ? (
        <>
          {/* User Profile Sheets */}
          <Sheet open={modals.creator.isOpen} onOpenChange={(open) => !open && modals.creator.onClose()}>
            <SheetContent side="right" className="w-96">
              <div className="p-4">
                <UserProfile pk={creator?.pk} />
              </div>
              <SheetFooter />
            </SheetContent>
          </Sheet>

          <Sheet open={modals.modifier.isOpen} onOpenChange={(open) => !open && modals.modifier.onClose()}>
            <SheetContent side="right" className="w-96">
              <div className="p-4">
                <UserProfile pk={modifier?.pk} />
              </div>
              <SheetFooter />
            </SheetContent>
          </Sheet>

          {/* Main Grid Layout */}
          <div
            className={`${
              colorMode === "light" ? "bg-gray-50" : "bg-gray-700"
            } rounded-lg p-4 my-6 grid gap-4 grid-cols-1 1200px:grid-cols-2`}
          >
            {/* Details Panel */}
            <div
              className={`${
                colorMode === "light" ? "bg-gray-100" : "bg-gray-700"
              } rounded-lg p-4`}
            >
              <div className="flex-1 items-center block">
                <h3
                  className={`font-bold text-lg ${
                    colorMode === "light" ? "text-gray-800" : "text-gray-100"
                  } select-none`}
                >
                  Details
                </h3>
              </div>
              <div className="pt-2 grid">
                <div className="flex border border-gray-300 rounded-t-2xl border-b-0 p-2">
                  <p className="flex-1 font-semibold">Document Status</p>
                  <Badge
                    className={`${
                      documentData.document.status === "approved"
                        ? colorMode === "light"
                          ? "bg-green-500"
                          : "bg-green-600"
                        : documentData.document.status === "inapproval"
                          ? colorMode === "light"
                            ? "bg-blue-500"
                            : "bg-blue-600"
                          : documentData.document.status === "inreview"
                            ? colorMode === "light"
                              ? "bg-orange-500"
                              : "bg-orange-600"
                            : documentData.document.status === "revising"
                              ? "bg-orange-500"
                              : colorMode === "light"
                                ? "bg-red-500"
                                : "bg-red-600"
                    } text-white`}
                  >
                    {documentData.document.status === "inapproval"
                      ? "Approval Requested"
                      : documentData.document.status === "approved"
                        ? "Approved"
                        : documentData.document.status === "inreview"
                          ? "Review Requested"
                          : documentData.document.status === "revising"
                            ? "Revising"
                            : "New Document"}
                  </Badge>
                </div>
                <div className="flex border border-gray-300 border-b-0 p-2">
                  <p className="flex-1 font-semibold">Project Tag</p>
                  <Badge
                    className={`${
                      colorMode === "light"
                        ? `bg-${kindDict[documentData?.document?.project?.kind].color}-400`
                        : `bg-${kindDict[documentData?.document?.project?.kind].color}-500`
                    } text-white`}
                  >
                    {kindDict[documentData?.document?.project?.kind].tag}-
                    {documentData?.document?.project?.year}-
                    {documentData?.document?.project?.number}
                  </Badge>
                </div>
                <div className="flex border border-gray-300 p-2 border-b-0">
                  <p className="flex-1 font-semibold">Project ID</p>
                  <p>{documentData?.document?.project?.pk}</p>
                </div>
                <div className="flex border border-gray-300 border-b-0 p-2">
                  <p className="flex-1 font-semibold">Document ID</p>
                  <p>
                    {documentData?.document?.pk
                      ? documentData?.document?.pk
                      : documentData?.document?.id}{" "}
                    ({documentType.charAt(0).toUpperCase()}
                    {documentType === "concept"
                      ? "P"
                      : documentType === "projectplan"
                        ? "P"
                        : documentType === "progressreport"
                          ? "R"
                          : documentType === "studentreport"
                            ? "R"
                            : "C"}{" "}
                    {documentData?.pk})
                  </p>
                </div>
                <div className="flex border border-gray-300 border-b-0 items-center p-2 flex-col">
                  <div className="w-full justify-end flex">
                    <p className="flex-1 font-semibold">Created</p>
                    <p>{creationDate}</p>
                  </div>
                  <div className="w-full justify-end flex">
                    <p className="flex-1 font-semibold">By</p>
                    <Button
                      variant="link"
                      className={`${
                        colorMode === "light" ? "text-blue-400" : "text-blue-300"
                      } cursor-pointer text-base font-semibold whitespace-normal text-ellipsis p-0 h-auto`}
                      onClick={modals.creator.onOpen}
                    >
                      {creator?.first_name} {creator?.last_name}
                    </Button>
                  </div>
                </div>
                <div className="flex border border-gray-300 p-2 rounded-b-2xl items-center flex-col">
                  <div className="w-full justify-end flex">
                    <p className="flex-1 font-semibold">Last Modified</p>
                    <p>{modifyDate}</p>
                  </div>
                  <div className="w-full justify-end flex">
                    <p className="flex-1 font-semibold">By</p>
                    <Button
                      variant="link"
                      className={`${
                        colorMode === "light" ? "text-blue-400" : "text-blue-300"
                      } cursor-pointer text-base font-semibold whitespace-normal text-ellipsis p-0 h-auto`}
                      onClick={modals.modifier.onOpen}
                    >
                      {modifier?.first_name} {modifier?.last_name}
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions Panel */}
            <div
              className={`${
                colorMode === "light" ? "bg-gray-100" : "bg-gray-700"
              } rounded-lg p-4 mt-0`}
            >
              <div className="flex-1 items-center block">
                <h3
                  className={`font-bold text-lg ${
                    colorMode === "light" ? "text-gray-800" : "text-gray-100"
                  } select-none`}
                >
                  Actions
                </h3>
              </div>

              <div className="pt-2 grid grid-cols-1">
                {/* Project Lead Section */}
                <div className="border border-gray-300 rounded-t-2xl border-b-0 p-4 grid">
                  <div className="mt-1 justify-end items-center flex">
                    <p className="flex-1 font-semibold">Project Lead</p>
                    <Badge
                      className={`items-center justify-center flex ${
                        documentData?.document
                          ?.project_lead_approval_granted === true
                          ? "bg-green-500"
                          : "bg-red-500"
                      } text-white`}
                    >
                      {documentData?.document?.project_lead_approval_granted ===
                      true
                        ? "Granted"
                        : "Required"}
                    </Badge>
                  </div>

                  <div
                    className={`justify-end w-full ${
                      documentData?.document
                        ?.business_area_lead_approval_granted
                        ? "mt-0"
                        : "mt-3"
                    } grid grid-cols-1`}
                  >
                    {/* Recall Button (Only show when project lead approved but BA lead hasn't) */}
                    {documentData?.document
                      ?.business_area_lead_approval_granted === false &&
                      documentData?.document?.project_lead_approval_granted ===
                        true &&
                      (userData?.is_superuser ||
                        userIsCaretakerOfAdmin ||
                        userData?.pk === leaderMember?.user?.pk ||
                        userIsCaretakerOfProjectLeader ||
                        isBaLead ||
                        userIsCaretakerOfBaLeader) && (
                        <div className="justify-end flex">
                          <UnifiedDocumentActionModal
                            userData={userData}
                            refetchData={refetchData}
                            baData={baData}
                            isOpen={modals.s1Recall.isOpen}
                            onClose={modals.s1Recall.onClose}
                            action={"recall"}
                            documentType={documentType}
                            stage={1}
                            documentPk={
                              documentData?.document?.pk ||
                              documentData?.document?.id
                            }
                            projectData={documentData?.document?.project}
                            directorateData={directorateData}
                            isDirectorateLoading={isDirectorateLoading}
                            callSameData={callSameData}
                          />
                          <Button
                            className={`text-white ${
                              colorMode === "light" ? "bg-blue-500 hover:bg-blue-400" : "bg-blue-600 hover:bg-blue-500"
                            } text-sm`}
                            onClick={modals.s1Recall.onOpen}
                          >
                            Recall Approval
                          </Button>
                        </div>
                      )}

                    {/* Submit/Approve & Delete Buttons */}
                    {documentData?.document
                      ?.business_area_lead_approval_granted === false &&
                      (documentData?.document?.id ||
                        documentData?.document?.pk) &&
                      documentData?.document?.project_lead_approval_granted ===
                        false &&
                      (userData?.is_superuser ||
                        userIsCaretakerOfAdmin ||
                        userData?.pk === leaderMember?.user?.pk ||
                        userIsCaretakerOfProjectLeader ||
                        isBaLead ||
                        userIsCaretakerOfBaLeader) && (
                        <div className="justify-end flex">
                          <UnifiedDocumentActionModal
                            userData={userData}
                            refetchData={refetchData}
                            baData={baData}
                            isOpen={modals.s1Approval.isOpen}
                            onClose={modals.s1Approval.onClose}
                            action={"approve"}
                            documentType={documentType}
                            stage={1}
                            documentPk={
                              documentData?.document?.pk ||
                              documentData?.document?.id
                            }
                            projectData={documentData?.document?.project}
                            directorateData={directorateData}
                            isDirectorateLoading={isDirectorateLoading}
                            callSameData={callSameData}
                          />

                          {/* Delete button */}
                          {canShowDeleteButton() && (
                            <>
                              <DeleteDocumentModal
                                key={keyForDeleteDocumentModal}
                                projectPk={
                                  documentData?.document?.project?.pk ||
                                  documentData?.document?.project?.id
                                }
                                documentPk={
                                  documentData?.document?.pk ||
                                  documentData?.document?.id
                                }
                                documentKind={documentKindMapping[documentType]}
                                onClose={modals.deleteDocument.onClose}
                                isOpen={modals.deleteDocument.isOpen}
                                onDeleteSuccess={() => {
                                  if (documentType === "projectclosure") {
                                    setStatusIfRequired(
                                      documentData?.document?.project?.pk ||
                                        documentData?.document?.project?.id,
                                      "updating",
                                    );
                                  } else if (
                                    documents &&
                                    documents.length <= 1
                                  ) {
                                    setStatusIfRequired(
                                      documentData?.document?.project?.pk ||
                                        documentData?.document?.project?.id,
                                    );
                                  }
                                }}
                                refetchData={refetchData}
                                setToLastTab={setToLastTab}
                              />
                              <Button
                                className={`text-white ${
                                  colorMode === "light" ? "bg-red-500 hover:bg-red-400" : "bg-red-600 hover:bg-red-500"
                                } text-sm mr-2`}
                                onClick={modals.deleteDocument.onOpen}
                              >
                                Delete Document
                              </Button>
                            </>
                          )}

                          {/* Document-specific buttons */}
                          {getDocumentSpecificButtons() || (
                            <Button
                              className={`text-white ${
                                colorMode === "light"
                                  ? "bg-green-500 hover:bg-green-400"
                                  : "bg-green-600 hover:bg-green-500"
                              } text-sm`}
                              onClick={modals.s1Approval.onOpen}
                            >
                              Submit
                            </Button>
                          )}
                        </div>
                      )}

                    {/* Document-specific advanced actions */}
                    {documentData?.document?.project_lead_approval_granted &&
                      documentData?.document
                        ?.business_area_lead_approval_granted &&
                      documentData?.document?.directorate_approval_granted &&
                      getDocumentSpecificButtons()}
                  </div>
                </div>

                {/* Business Area Lead Section */}
                <div className="border border-gray-300 border-b-0 p-4 grid">
                  <div className="mt-1 justify-end items-center flex">
                    <p className="flex-1 font-semibold">Business Area Lead</p>
                    <Badge
                      className={`items-center justify-center flex ${
                        documentData?.document
                          ?.business_area_lead_approval_granted === true
                          ? "bg-green-500"
                          : "bg-red-500"
                      } text-white`}
                    >
                      {documentData?.document
                        ?.business_area_lead_approval_granted === true
                        ? "Granted"
                        : "Required"}
                    </Badge>
                  </div>

                  <div
                    className={`justify-end w-full ${
                      documentData?.document?.project?.status === "completed"
                        ? "mt-3"
                        : documentData?.document
                              ?.project_lead_approval_granted &&
                            documentData?.document
                              ?.directorate_approval_granted === false
                          ? "mt-3"
                          : "mt-0"
                    } flex`}
                  >
                    {/* Send Back Button */}
                    {documentData?.document?.project_lead_approval_granted &&
                      documentData?.document
                        ?.business_area_lead_approval_granted === false &&
                      (userData?.is_superuser ||
                        userIsCaretakerOfAdmin ||
                        userData?.pk === baLead?.pk ||
                        userIsCaretakerOfBaLeader) && (
                        <div className="flex justify-center">
                          <UnifiedDocumentActionModal
                            userData={userData}
                            refetchData={refetchData}
                            baData={baData}
                            isOpen={modals.s2SendBack.isOpen}
                            onClose={modals.s2SendBack.onClose}
                            action={"send_back"}
                            documentType={documentType}
                            stage={2}
                            documentPk={
                              documentData?.document?.pk ||
                              documentData?.document?.id
                            }
                            projectData={documentData?.document?.project}
                            directorateData={directorateData}
                            isDirectorateLoading={isDirectorateLoading}
                            callSameData={callSameData}
                          />
                          <Button
                            className={`text-white ${
                              colorMode === "light"
                                ? "bg-orange-500 hover:bg-orange-400"
                                : "bg-orange-600 hover:bg-orange-500"
                            } text-sm`}
                            onClick={modals.s2SendBack.onOpen}
                          >
                            Send Back
                          </Button>
                        </div>
                      )}

                    {/* Reopen Project Button (for Project Closure) */}
                    {documentType === "projectclosure" &&
                      (documentData?.document?.project?.status ===
                        "completed" ||
                        documentData?.document?.project?.status ===
                          "terminated" ||
                        documentData?.document?.project?.status ===
                          "suspended") &&
                      (isBaLead ||
                        userIsCaretakerOfBaLeader ||
                        userData?.is_superuser ||
                        userIsCaretakerOfAdmin) && (
                        <Button
                          className={`text-white ${
                            colorMode === "light" ? "bg-orange-500 hover:bg-orange-400" : "bg-orange-600 hover:bg-orange-500"
                          } text-sm`}
                          onClick={modals.s2Reopen.onOpen}
                        >
                          Reopen Project
                        </Button>
                      )}

                    {/* Recall Approval Button */}
                    {documentData?.document
                      ?.business_area_lead_approval_granted &&
                      documentData?.document?.directorate_approval_granted ===
                        false &&
                      (userData?.is_superuser ||
                        userIsCaretakerOfAdmin ||
                        userData?.business_area?.leader === baData?.leader ||
                        userIsCaretakerOfBaLeader) && (
                        <div className="flex justify-center ml-3">
                          <UnifiedDocumentActionModal
                            userData={userData}
                            refetchData={refetchData}
                            baData={baData}
                            isOpen={modals.s2Recall.isOpen}
                            onClose={modals.s2Recall.onClose}
                            action={"recall"}
                            documentType={documentType}
                            stage={2}
                            documentPk={
                              documentData?.document?.pk ||
                              documentData?.document?.id
                            }
                            projectData={documentData?.document?.project}
                            directorateData={directorateData}
                            isDirectorateLoading={isDirectorateLoading}
                            callSameData={callSameData}
                          />
                          <Button
                            className={`text-white ${
                              colorMode === "light" ? "bg-blue-500 hover:bg-blue-400" : "bg-blue-600 hover:bg-blue-500"
                            } text-sm`}
                            onClick={modals.s2Recall.onOpen}
                            disabled={
                              directorateData?.length < 1 &&
                              !userData?.is_superuser
                            }
                          >
                            Recall Approval
                          </Button>
                        </div>
                      )}

                    {/* Approve Button */}
                    {documentData?.document?.project_lead_approval_granted &&
                      documentData?.document
                        ?.business_area_lead_approval_granted === false &&
                      (userData?.is_superuser ||
                        userIsCaretakerOfAdmin ||
                        userData?.pk === baData?.leader ||
                        userIsCaretakerOfBaLeader) && (
                        <div className="flex justify-center ml-3">
                          <UnifiedDocumentActionModal
                            userData={userData}
                            refetchData={refetchData}
                            baData={baData}
                            isOpen={modals.s2Approval.isOpen}
                            onClose={modals.s2Approval.onClose}
                            action={"approve"}
                            documentType={documentType}
                            stage={2}
                            documentPk={
                              documentData?.document?.pk ||
                              documentData?.document?.id
                            }
                            projectData={documentData?.document?.project}
                            directorateData={directorateData}
                            isDirectorateLoading={isDirectorateLoading}
                            callSameData={callSameData}
                          />
                          <Button
                            className={`text-white ${
                              colorMode === "light" ? "bg-green-500 hover:bg-green-400" : "bg-green-600 hover:bg-green-500"
                            } text-sm`}
                            onClick={modals.s2Approval.onOpen}
                            disabled={
                              !userData?.is_superuser &&
                              directorateData?.length < 1
                            }
                          >
                            Approve
                          </Button>
                        </div>
                      )}
                  </div>

                  {/* Additional Document-Specific buttons for BA */}
                  {documentType === "projectplan" &&
                    all_documents?.progress_reports?.length < 1 &&
                    (userData?.is_superuser ||
                      userIsCaretakerOfAdmin ||
                      documentData?.document?.project?.business_area?.leader ===
                        userData?.pk ||
                      userIsCaretakerOfBaLeader) &&
                    documentData?.document?.project_lead_approval_granted ===
                      true &&
                    documentData?.document
                      ?.business_area_lead_approval_granted === true &&
                    documentData?.document?.directorate_approval_granted ===
                      true && (
                      <div className="justify-end flex">
                        <Button
                          className={`mt-3 text-white ${
                            colorMode === "light" ? "bg-orange-500 hover:bg-orange-400" : "bg-orange-600 hover:bg-orange-500"
                          } text-sm ml-2`}
                          onClick={modals.createProgressReport.onOpen}
                        >
                          Create Progress Report
                        </Button>
                      </div>
                    )}
                </div>

                {/* Directorate GRID */}
                <div className="border border-gray-300 rounded-b-2xl p-4 grid">
                  <div className="mt-1 justify-end items-center flex">
                    <p className="flex-1 font-semibold">Directorate</p>
                    <Badge
                      className={`items-center justify-center flex ${
                        documentData?.document?.directorate_approval_granted ===
                        true
                          ? "bg-green-500"
                          : "bg-red-500"
                      } text-white`}
                    >
                      {documentData?.document?.directorate_approval_granted ===
                      true
                        ? "Granted"
                        : "Required"}
                    </Badge>
                  </div>

                  <div
                    className={`justify-end w-full ${
                      documentData?.document
                        ?.business_area_lead_approval_granted
                        ? "mt-3"
                        : "mt-0"
                    } flex`}
                  >
                    {/* Reopen Project Button */}
                    {documentType === "projectclosure" &&
                      (documentData?.document?.project?.status ===
                        "completed" ||
                        documentData?.document?.project?.status ===
                          "terminated" ||
                        documentData?.document?.project?.status ===
                          "suspended") &&
                      (userData?.is_superuser ||
                        userIsCaretakerOfAdmin ||
                        userInDivisionalDirectorate) && (
                        <Button
                          className={`text-white ${
                            colorMode === "light" ? "bg-orange-500 hover:bg-orange-400" : "bg-orange-600 hover:bg-orange-500"
                          } text-sm ml-2`}
                          onClick={modals.s3Reopen.onOpen}
                        >
                          Reopen Project
                        </Button>
                      )}

                    {/* Send Back Button */}
                    {documentData?.document
                      ?.business_area_lead_approval_granted &&
                      documentData?.document?.directorate_approval_granted ===
                        false &&
                      (userData?.is_superuser ||
                        userIsCaretakerOfAdmin ||
                        userInDivisionalDirectorate) && (
                        <div className="justify-end flex ml-3">
                          <UnifiedDocumentActionModal
                            userData={userData}
                            refetchData={refetchData}
                            baData={baData}
                            isOpen={modals.s3SendBack.isOpen}
                            onClose={modals.s3SendBack.onClose}
                            action={"send_back"}
                            documentType={documentType}
                            stage={3}
                            documentPk={
                              documentData?.document?.pk ||
                              documentData?.document?.id
                            }
                            projectData={documentData?.document?.project}
                            directorateData={directorateData}
                            isDirectorateLoading={isDirectorateLoading}
                            callSameData={callSameData}
                          />
                          <Button
                            className={`text-white ${
                              colorMode === "light"
                                ? "bg-orange-500 hover:bg-orange-400"
                                : "bg-orange-600 hover:bg-orange-500"
                            } text-sm`}
                            onClick={modals.s3SendBack.onOpen}
                          >
                            Send Back
                          </Button>
                        </div>
                      )}

                    {/* Recall Approval Button */}
                    {documentData?.document?.directorate_approval_granted &&
                      (userData?.is_superuser ||
                        userIsCaretakerOfAdmin ||
                        userInDivisionalDirectorate) && (
                        <div className="justify-start flex ml-3">
                          <UnifiedDocumentActionModal
                            userData={userData}
                            refetchData={refetchData}
                            baData={baData}
                            isOpen={modals.s3Recall.isOpen}
                            onClose={modals.s3Recall.onClose}
                            action={"recall"}
                            documentType={documentType}
                            stage={3}
                            documentPk={
                              documentData?.document?.pk ||
                              documentData?.document?.id
                            }
                            projectData={documentData?.document?.project}
                            directorateData={directorateData}
                            isDirectorateLoading={isDirectorateLoading}
                            callSameData={callSameData}
                          />
                          <Button
                            className={`text-white ${
                              colorMode === "light" ? "bg-blue-500 hover:bg-blue-400" : "bg-blue-600 hover:bg-blue-500"
                            } text-sm`}
                            onClick={modals.s3Recall.onOpen}
                          >
                            Recall Approval
                          </Button>
                        </div>
                      )}

                    {/* Create Progress Report Button (if needed) */}
                    {documentType === "projectplan" &&
                      all_documents?.progress_reports?.length < 1 &&
                      documentData?.document?.project_lead_approval_granted ===
                        true &&
                      documentData?.document
                        ?.business_area_lead_approval_granted === true &&
                      documentData?.document?.directorate_approval_granted ===
                        true &&
                      (userData?.is_superuser ||
                        userIsCaretakerOfAdmin ||
                        userInDivisionalDirectorate) && (
                        <Button
                          className={`text-white ${
                            colorMode === "light" ? "bg-orange-500 hover:bg-orange-400" : "bg-orange-600 hover:bg-orange-500"
                          } text-sm ml-2`}
                          onClick={modals.createProgressReport.onOpen}
                        >
                          Create Progress Report
                        </Button>
                      )}

                    {/* Approve Button */}
                    {documentData?.document
                      ?.business_area_lead_approval_granted &&
                      !documentData?.document?.directorate_approval_granted &&
                      (userData?.is_superuser ||
                        userIsCaretakerOfAdmin ||
                        userInDivisionalDirectorate) && (
                        <div className="ml-3 justify-end flex">
                          <UnifiedDocumentActionModal
                            userData={userData}
                            refetchData={refetchData}
                            baData={baData}
                            isOpen={modals.s3Approval.isOpen}
                            onClose={modals.s3Approval.onClose}
                            action={"approve"}
                            documentType={documentType}
                            stage={3}
                            documentPk={
                              documentData?.document?.pk ||
                              documentData?.document?.id
                            }
                            projectData={documentData?.document?.project}
                            directorateData={directorateData}
                            isDirectorateLoading={isDirectorateLoading}
                            callSameData={callSameData}
                          />
                          <Button
                            className={`text-white ${
                              colorMode === "light" ? "bg-green-500 hover:bg-green-400" : "bg-green-600 hover:bg-green-500"
                            } text-sm`}
                            onClick={modals.s3Approval.onOpen}
                          >
                            Approve
                          </Button>
                        </div>
                      )}
                  </div>
                </div>

                {/* PDF and email buttons */}
                <ProjectDocumentPDFSection
                  data_document={documentData}
                  refetchData={callSameData || refetchData}
                />
              </div>
            </div>
          </div>

          {/* Document Action Modal Instances for projectclosure reopening */}
          {documentType === "projectclosure" && (
            <>
              <UnifiedDocumentActionModal
                userData={userData}
                refetchData={refetchData}
                baData={baData}
                isOpen={modals.s1Reopen.isOpen}
                onClose={modals.s1Reopen.onClose}
                action={"reopen"}
                documentType={documentType}
                stage={1}
                documentPk={
                  documentData?.document?.pk || documentData?.document?.id
                }
                projectData={documentData?.document?.project}
                directorateData={directorateData}
                isDirectorateLoading={isDirectorateLoading}
                callSameData={callSameData}
              />
              <UnifiedDocumentActionModal
                userData={userData}
                refetchData={refetchData}
                baData={baData}
                isOpen={modals.s2Reopen.isOpen}
                onClose={modals.s2Reopen.onClose}
                action={"reopen"}
                documentType={documentType}
                stage={2}
                documentPk={
                  documentData?.document?.pk || documentData?.document?.id
                }
                projectData={documentData?.document?.project}
                directorateData={directorateData}
                isDirectorateLoading={isDirectorateLoading}
                callSameData={callSameData}
              />
              <UnifiedDocumentActionModal
                userData={userData}
                refetchData={refetchData}
                baData={baData}
                isOpen={modals.s3Reopen.isOpen}
                onClose={modals.s3Reopen.onClose}
                action={"reopen"}
                documentType={documentType}
                stage={3}
                documentPk={
                  documentData?.document?.pk || documentData?.document?.id
                }
                projectData={documentData?.document?.project}
                directorateData={directorateData}
                isDirectorateLoading={isDirectorateLoading}
                callSameData={callSameData}
              />
            </>
          )}
        </>
      ) : baLoading === false && baData === undefined ? (
        <div className="my-4 grid grid-cols-1 justify-center">
          <p className="text-center font-semibold">
            Document Actions cannot be displayed as this project has no business
            area.
          </p>
          <p className="text-center font-semibold">
            Please set a business area for this project from the project
            settings.
          </p>
        </div>
      ) : actionsReady && !leaderMember ? (
        <div className="my-4 grid grid-cols-1 justify-center">
          <p className="text-center font-semibold">
            This project has no members/leader so document actions are not shown
            here.
          </p>
          <p className="text-center font-semibold">
            Please add members to adjust document actions.
          </p>
        </div>
      ) : (
        <div className="flex justify-center">
          <Loader2 className="animate-spin" />
        </div>
      )}
    </>
  );
};
