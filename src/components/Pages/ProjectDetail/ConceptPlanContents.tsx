// Maps out the document provided to the rich text editor components for concept plan documents.

import { Box, Text, useColorMode } from "@chakra-ui/react";
import {
  IConceptPlan,
  IProjectDocuments,
  IProjectMember,
  IUserData,
  IUserMe,
} from "../../../types";
import { RichTextEditor } from "../../RichTextEditor/Editors/RichTextEditor";
import { useEffect } from "react";
import { ConceptPlanDocActions } from "./DocActions/ConceptPlanDocActions";
import { useCheckUserInTeam } from "../../../lib/hooks/useCheckUserInTeam";
import { motion } from "framer-motion";
import { CommentSection } from "./CommentSection";

interface Props {
  all_documents: IProjectDocuments;
  userData: IUserMe;
  members: IProjectMember[];
  document: IConceptPlan | null;

  refetch: () => void;
  setToLastTab: (tabToGoTo?: number) => void;
}

export const ConceptPlanContents = ({
  userData,
  members,
  all_documents,
  document,
  refetch,
  setToLastTab,
}: Props) => {
  // console.log("FROM CONCEPT:", userData);

  // Force a rerender when dark mode or year changed to update design and content
  // const editorKey = selectedYear.toString() + colorMode;
  const { colorMode } = useColorMode();

  const documentType = "conceptplan";
  const editorKey = colorMode + documentType;

  // useEffect(() => { console.log(document) }, [document])

  const mePk = userData?.pk ? userData?.pk : userData?.id;
  const userInTeam = useCheckUserInTeam(mePk, members);

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
      <ConceptPlanDocActions
        all_documents={all_documents}
        conceptPlanData={document}
        refetchData={refetch}
        // setToLastTab={setToLastTab}

        // projectPk={projectPk}
      />

      <RichTextEditor
        wordLimit={500}
        canEdit={userInTeam || userData?.is_superuser}
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
        canEdit={userInTeam || userData?.is_superuser}
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
        canEdit={userInTeam || userData?.is_superuser}
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
        canEdit={userInTeam || userData?.is_superuser}
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
        canEdit={userInTeam || userData?.is_superuser}
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
        canEdit={userInTeam || userData?.is_superuser}
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
        canEdit={userInTeam || userData?.is_superuser}
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

      <CommentSection documentID={document?.document?.id} userData={userData} />
    </motion.div>
  );
};
