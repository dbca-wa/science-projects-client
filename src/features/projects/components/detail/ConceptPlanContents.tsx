// Maps out the document provided to the rich text editor components for concept plan documents.

import { useColorMode } from "@/shared/utils/theme.utils";
import { motion } from "framer-motion";
import { useCheckUserInTeam } from "@/features/users/hooks/useCheckUserInTeam";
import {
  ICaretakerPermissions,
  IConceptPlan,
  IProjectDocuments,
  IProjectMember,
  IUserMe,
} from "@/shared/types";
import { RichTextEditor } from "@/shared/components/RichTextEditor/Editors/RichTextEditor";
import { CommentSection } from "./CommentSection";
import { UnifiedDocumentActions } from "./DocActions/UnifiedDocumentActions";

interface Props extends ICaretakerPermissions {
  all_documents: IProjectDocuments;
  userData: IUserMe;
  members: IProjectMember[];
  document: IConceptPlan | null;
  baseAPI: string;
  refetch: () => void;
  baLead: number;
}

export const ConceptPlanContents = ({
  userData,
  members,
  all_documents,
  document,
  refetch,
  baseAPI,
  baLead,
  userIsCaretakerOfAdmin,
  userIsCaretakerOfBaLeader,
  userIsCaretakerOfMember,
  userIsCaretakerOfProjectLeader,
}: // setToLastTab,
Props) => {
  const { colorMode } = useColorMode();

  const documentType = "conceptplan";
  const editorKey = colorMode + documentType;

  const mePk = userData?.pk ? userData?.pk : userData?.id;
  const userInTeam = useCheckUserInTeam(mePk, members);
  const isBaLead = mePk === baLead;
  const isFullyApproved =
    all_documents?.concept_plan?.document.project_lead_approval_granted &&
    all_documents?.concept_plan?.document.business_area_lead_approval_granted &&
    all_documents?.concept_plan?.document.directorate_approval_granted;

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
      }}
    >
      <UnifiedDocumentActions
        documentType="concept"
        documentData={document}
        refetchData={refetch}
        all_documents={all_documents}
        isBaLead={isBaLead}
        userIsCaretakerOfAdmin={userIsCaretakerOfAdmin}
        userIsCaretakerOfBaLeader={userIsCaretakerOfBaLeader}
        userIsCaretakerOfMember={userIsCaretakerOfMember}
        userIsCaretakerOfProjectLeader={userIsCaretakerOfProjectLeader}
      />

      <RichTextEditor
        wordLimit={500}
        canEdit={canEditPermission}
        project_pk={document?.document?.project?.pk}
        document_pk={document?.document?.pk}
        isUpdate={true}
        editorType="ProjectDocument"
        key={`background${editorKey}`} // Change the key to force a re-render
        data={document?.background}
        section={"background"}
        writeable_document_kind={"Concept Plan"}
        writeable_document_pk={document?.pk}
      />
      <RichTextEditor
        wordLimit={500}
        canEdit={canEditPermission}
        project_pk={document?.document?.project?.pk}
        document_pk={document?.document?.pk}
        isUpdate={true}
        editorType="ProjectDocument"
        key={`aims${editorKey}`} // Change the key to force a re-render
        data={document?.aims}
        section={"aims"}
        writeable_document_kind={"Concept Plan"}
        writeable_document_pk={document?.pk}
      />

      <RichTextEditor
        wordLimit={500}
        canEdit={canEditPermission}
        project_pk={document?.document?.project?.pk}
        document_pk={document?.document?.pk}
        isUpdate={true}
        editorType="ProjectDocument"
        key={`outcome${editorKey}`} // Change the key to force a re-render
        data={document?.outcome}
        section={"outcome"}
        writeable_document_kind={"Concept Plan"}
        writeable_document_pk={document?.pk}
      />
      <RichTextEditor
        wordLimit={500}
        canEdit={canEditPermission}
        project_pk={document?.document?.project?.pk}
        document_pk={document?.document?.pk}
        isUpdate={true}
        editorType="ProjectDocument"
        key={`collaborations${editorKey}`} // Change the key to force a re-render
        data={document?.collaborations}
        section={"collaborations"}
        writeable_document_kind={"Concept Plan"}
        writeable_document_pk={document?.pk}
      />
      <RichTextEditor
        wordLimit={500}
        canEdit={canEditPermission}
        project_pk={document?.document?.project?.pk}
        document_pk={document?.document?.pk}
        isUpdate={true}
        editorType="ProjectDocument"
        key={`strategic_context${editorKey}`} // Change the key to force a re-render
        data={document?.strategic_context}
        section={"strategic_context"}
        writeable_document_kind={"Concept Plan"}
        writeable_document_pk={document?.pk}
      />

      <RichTextEditor
        wordLimit={500}
        canEdit={canEditPermission}
        project_pk={document?.document?.project?.pk}
        document_pk={document?.document?.pk}
        isUpdate={true}
        editorType="ProjectDocument"
        key={`staff_time_allocation${editorKey}`} // Change the key to force a re-render
        data={document?.staff_time_allocation}
        section={"staff_time_allocation"}
        writeable_document_kind={"Concept Plan"}
        writeable_document_pk={document?.pk}
      />

      <RichTextEditor
        wordLimit={500}
        canEdit={canEditPermission}
        project_pk={document?.document?.project?.pk}
        document_pk={document?.document?.pk}
        isUpdate={true}
        editorType="ProjectDocument"
        key={`budget${editorKey}`} // Change the key to force a re-render
        data={document?.budget}
        section={"budget"}
        writeable_document_kind={"Concept Plan"}
        writeable_document_pk={document?.pk}
      />

      {document?.document && (
        <CommentSection
          // projectPk={document?.document?.project?.pk}
          baseAPI={baseAPI}
          documentID={document?.document?.pk}
          documentKind={document?.document?.kind}
          userData={userData}
          project={document?.document?.project}
        />
      )}
    </motion.div>
  );
};
