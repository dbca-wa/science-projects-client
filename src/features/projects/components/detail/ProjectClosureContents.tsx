// Maps out the document provided to the rich text editor components for project closure documents.

import { setClosureOutcome } from "@/features/projects/services/projects.service";
import { toast } from "sonner";
import { useColorMode } from "@/shared/utils/theme.utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { motion } from "framer-motion";
import { useRef, useState } from "react";
import { useCheckUserInTeam } from "@/features/users/hooks/useCheckUserInTeam";
import type {
  ICaretakerPermissions,
  IProjectClosure,
  IProjectDocuments,
  IProjectMember,
  IUserMe,
} from "@/shared/types";
import { RichTextEditor } from "@/shared/components/RichTextEditor/Editors/RichTextEditor";
import { CommentSection } from "./CommentSection";
import { UnifiedDocumentActions } from "./DocActions/UnifiedDocumentActions";

interface Props extends ICaretakerPermissions {
  document: IProjectClosure | null;
  all_documents: IProjectDocuments;
  userData: IUserMe;
  members: IProjectMember[];
  refetch: () => void;
  setToLastTab: (tabToGoTo?: number) => void;
  baseAPI: string;
  baLead: number;
}

export const ProjectClosureContents = ({
  baseAPI,
  userData,
  members,
  all_documents,
  document,
  refetch,
  setToLastTab,
  baLead,
  userIsCaretakerOfAdmin,
  userIsCaretakerOfBaLeader,
  userIsCaretakerOfMember,
  userIsCaretakerOfProjectLeader,
}: Props) => {
  const { colorMode } = useColorMode();
  const documentType = "closure";
  const editorKey = colorMode + documentType;

  const mePk = userData?.pk ? userData?.pk : userData?.id;
  const userInTeam = useCheckUserInTeam(mePk, members);

  const [selectedOutcome, setSelectedOutcome] = useState<string>(
    document?.intended_outcome,
  );
  const potentialOutcomes = [
    "completed",
    "terminated",
    // "suspended",
    // "forcecompleted",
  ];

  const queryClient = useQueryClient();
  const toastIdRef = useRef<string | number | undefined>(undefined);

  const setClosureMutation = useMutation({
    mutationFn: setClosureOutcome,
    onMutate: () => {
      toastIdRef.current = toast.loading("Setting Closure Outcome");
    },
    onSuccess: async () => {
      if (toastIdRef.current) {
        toast.success("Closure Outcome Set", {
          id: toastIdRef.current,
        });
      }
      queryClient.invalidateQueries({
        queryKey: ["projects", document?.document?.project?.id],
      });
      refetch();
    },
    onError: (error: AxiosError) => {
      if (toastIdRef.current) {
        toast.error(
          error?.response?.data
            ? `${error.response.status}: ${
                Object.values(error.response.data)[0]
              }`
            : "Could Not Set Closure Outcome",
          {
            id: toastIdRef.current,
          }
        );
      }
    },
  });

  const handleNewOutcomeSelection = (outcome: string) => {
    const closurePk = document?.pk;
    const formData = {
      outcome: outcome,
      closurePk: closurePk,
    };
    setSelectedOutcome(outcome);
    setClosureMutation.mutate(formData);
  };

  const isBaLead = mePk === baLead;

  const isFullyApproved =
    all_documents?.project_closure?.document.project_lead_approval_granted &&
    all_documents?.project_closure?.document
      .business_area_lead_approval_granted &&
    all_documents?.project_closure?.document.directorate_approval_granted;

  const canEditPermission =
    ((userInTeam ||
      isBaLead ||
      userIsCaretakerOfBaLeader ||
      userIsCaretakerOfMember) &&
      !isFullyApproved) ||
    userData?.is_superuser ||
    userIsCaretakerOfAdmin;

  return (
    <motion.div
      initial={{ y: -10, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 10, opacity: 0 }}
      transition={{
        duration: 0.7,
        delay: 1 / 7,
      }}
      style={{
        height: "100%",
        animation: "oscillate 8s ease-in-out infinite",
        // backgroundColor: "pink"
      }}
    >
      {/* <DocumentActions /> */}

      <UnifiedDocumentActions
        documentType="projectclosure"
        documentData={document}
        refetchData={refetch}
        all_documents={all_documents}
        setToLastTab={setToLastTab}
        isBaLead={isBaLead}
        userIsCaretakerOfAdmin={userIsCaretakerOfAdmin}
        userIsCaretakerOfBaLeader={userIsCaretakerOfBaLeader}
        userIsCaretakerOfMember={userIsCaretakerOfMember}
        userIsCaretakerOfProjectLeader={userIsCaretakerOfProjectLeader}
      />

      {(document.document.project.kind === "science" ||
        userData?.is_superuser) &&
      !document?.document?.directorate_approval_granted ? (
        <div className={`w-full mb-8 p-4 border rounded-2xl ${
          colorMode === "light" ? "border-gray-200" : "border-gray-600"
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex-1 flex justify-start items-center">
              <h3 className="text-lg font-bold">
                Select an Intended Outcome:
              </h3>
            </div>
            <div className="flex justify-end">
              <Select
                value={selectedOutcome}
                onValueChange={handleNewOutcomeSelection}
              >
                <SelectTrigger className="min-w-[200px]">
                  <SelectValue placeholder="Select outcome" />
                </SelectTrigger>
                <SelectContent>
                  {potentialOutcomes.map((outcome) => (
                    <SelectItem key={outcome} value={outcome}>
                      {outcome.charAt(0).toUpperCase() + outcome.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      ) : null}

      {document.document.project.kind === "science" && (
        <>
          <RichTextEditor
            canEdit={canEditPermission}
            document_pk={document?.document?.pk}
            project_pk={document?.document?.project?.pk}
            writeable_document_kind={"Project Closure"}
            writeable_document_pk={document?.pk}
            isUpdate={true}
            editorType="ProjectDocument"
            key={`reason${editorKey}`} // Change the key to force a re-render
            data={document?.reason}
            section={"reason"}
          />

          <RichTextEditor
            canEdit={canEditPermission}
            document_pk={document?.document?.pk}
            project_pk={document?.document?.project?.pk}
            writeable_document_kind={"Project Closure"}
            writeable_document_pk={document?.pk}
            isUpdate={true}
            editorType="ProjectDocument"
            key={`knowledge_transfer${editorKey}`} // Change the key to force a re-render
            data={document?.knowledge_transfer}
            section={"knowledge_transfer"}
          />

          <RichTextEditor
            canEdit={canEditPermission}
            document_pk={document?.document?.pk}
            project_pk={document?.document?.project?.pk}
            writeable_document_kind={"Project Closure"}
            writeable_document_pk={document?.pk}
            isUpdate={true}
            editorType="ProjectDocument"
            key={`data_location${editorKey}`} // Change the key to force a re-render
            data={document?.data_location}
            section={"data_location"}
          />
          <RichTextEditor
            canEdit={canEditPermission}
            document_pk={document?.document?.pk}
            project_pk={document?.document?.project?.pk}
            writeable_document_kind={"Project Closure"}
            writeable_document_pk={document?.pk}
            isUpdate={true}
            editorType="ProjectDocument"
            key={`hardcopy_location${editorKey}`} // Change the key to force a re-render
            data={document?.hardcopy_location}
            section={"hardcopy_location"}
          />
          <RichTextEditor
            canEdit={canEditPermission}
            document_pk={document?.document?.pk}
            project_pk={document?.document?.project?.pk}
            writeable_document_kind={"Project Closure"}
            writeable_document_pk={document?.pk}
            isUpdate={true}
            editorType="ProjectDocument"
            key={`backup_location${editorKey}`} // Change the key to force a re-render
            data={document?.backup_location}
            section={"backup_location"}
          />
          <RichTextEditor
            canEdit={canEditPermission}
            document_pk={document?.document?.pk}
            project_pk={document?.document?.project?.pk}
            writeable_document_kind={"Project Closure"}
            writeable_document_pk={document?.pk}
            isUpdate={true}
            editorType="ProjectDocument"
            key={`scientific_outputs${editorKey}`} // Change the key to force a re-render
            data={document?.scientific_outputs}
            section={"scientific_outputs"}
          />
        </>
      )}

      <CommentSection
        // projectPk={document?.document?.project?.pk}
        documentKind={document?.document?.kind}
        documentID={document?.document?.pk}
        userData={userData}
        baseAPI={baseAPI}
        project={document?.document?.project}
      />
    </motion.div>
  );
};
