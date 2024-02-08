// Maps out the document provided to the rich text editor components for project plan documents.

import { Box, Grid, Text, useColorMode } from "@chakra-ui/react";
import {
  IProjectAreas,
  IProjectDocuments,
  IProjectMember,
  IProjectPlan,
  IUserMe,
} from "../../../types";
import { RichTextEditor } from "../../RichTextEditor/Editors/RichTextEditor";
import { ProjectPlanDocActions } from "./DocActions/ProjectPlanDocActions";
import { useCheckUserInTeam } from "../../../lib/hooks/useCheckUserInTeam";
import { ProjectPlanEndorsements } from "./ProjectPlanEndorsements";
import { useCheckUserIsTeamLeader } from "../../../lib/hooks/useCheckUserIsTeamLeader";
import { motion } from "framer-motion";
import { CommentSection } from "./CommentSection";

interface Props {
  document: IProjectPlan | null;
  all_documents: IProjectDocuments;
  userData: IUserMe;
  members: IProjectMember[];
  refetch: () => void;
  setToLastTab: (tabToGoTo?: number) => void;
  projectAreas: IProjectAreas;
}

export const ProjectPlanContents = ({
  userData,
  members,
  all_documents,
  document,
  refetch,
  setToLastTab,
  projectAreas,
}: Props) => {
  const { colorMode } = useColorMode();

  const documentType = "projectplan";
  const editorKey = colorMode + documentType;

  const mePk = userData?.pk ? userData?.pk : userData?.id;
  const userInTeam = useCheckUserInTeam(mePk, members);
  const userIsLeader = useCheckUserIsTeamLeader(mePk, members);

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
      <ProjectPlanDocActions
        all_documents={all_documents}
        projectPlanData={document}
        refetchData={refetch}
        setToLastTab={setToLastTab}
        projectAreas={projectAreas}
      />

      <RichTextEditor
        canEdit={userInTeam || userData?.is_superuser}
        document_pk={document?.document?.pk}
        project_pk={document?.document?.project?.pk}
        writeable_document_kind={"Project Plan"}
        writeable_document_pk={document?.pk}
        isUpdate={true}
        editorType="ProjectDocument"
        key={`background${editorKey}`} // Change the key to force a re-render
        data={document?.background}
        section={"background"}
      />

      <RichTextEditor
        canEdit={userInTeam || userData?.is_superuser}
        document_pk={document?.document?.pk}
        project_pk={document?.document?.project?.pk}
        writeable_document_kind={"Project Plan"}
        writeable_document_pk={document?.pk}
        isUpdate={true}
        editorType="ProjectDocument"
        key={`aims${editorKey}`} // Change the key to force a re-render
        data={document?.aims}
        section={"aims"}
      />

      <RichTextEditor
        canEdit={userInTeam || userData?.is_superuser}
        document_pk={document?.document?.pk}
        project_pk={document?.document?.project?.pk}
        writeable_document_kind={"Project Plan"}
        writeable_document_pk={document?.pk}
        isUpdate={true}
        editorType="ProjectDocument"
        key={`outcome${editorKey}`} // Change the key to force a re-render
        data={document?.outcome}
        section={"outcome"}
      />
      <RichTextEditor
        canEdit={userInTeam || userData?.is_superuser}
        document_pk={document?.document?.pk}
        project_pk={document?.document?.project?.pk}
        writeable_document_kind={"Project Plan"}
        writeable_document_pk={document?.pk}
        isUpdate={true}
        editorType="ProjectDocument"
        key={`knowledge_transfer${editorKey}`} // Change the key to force a re-render
        data={document?.knowledge_transfer}
        section={"knowledge_transfer"}
      />
      <RichTextEditor
        canEdit={userInTeam || userData?.is_superuser}
        document_pk={document?.document?.pk}
        project_pk={document?.document?.project?.pk}
        writeable_document_kind={"Project Plan"}
        writeable_document_pk={document?.pk}
        isUpdate={true}
        editorType="ProjectDocument"
        key={`project_tasks${editorKey}`} // Change the key to force a re-render
        data={document?.project_tasks}
        section={"project_tasks"}
      />

      <RichTextEditor
        canEdit={userInTeam || userData?.is_superuser}
        document_pk={document?.document?.pk}
        project_pk={document?.document?.project?.pk}
        writeable_document_kind={"Project Plan"}
        writeable_document_pk={document?.pk}
        isUpdate={true}
        editorType="ProjectDocument"
        key={`listed_references${editorKey}`} // Change the key to force a re-render
        data={document?.listed_references}
        section={"listed_references"}
      />

      <RichTextEditor
        canEdit={userInTeam || userData?.is_superuser}
        document_pk={document?.document?.pk}
        project_pk={document?.document?.project?.pk}
        writeable_document_kind={"Project Plan"}
        writeable_document_pk={document?.pk}
        isUpdate={true}
        editorType="ProjectDocument"
        key={`methodology${editorKey}`} // Change the key to force a re-render
        data={document?.methodology}
        section={"methodology"}
      />
      <RichTextEditor
        canEdit={userInTeam || userData?.is_superuser}
        document_pk={document?.document?.pk}
        project_pk={document?.document?.project?.pk}
        writeable_document_kind={"Project Plan"}
        writeable_document_pk={document?.pk}
        isUpdate={true}
        editorType="ProjectDocument"
        key={`no_specimens${editorKey}`} // Change the key to force a re-render
        data={document?.endorsements?.no_specimens}
        section={"specimens"}
      />

      <RichTextEditor
        canEdit={userInTeam || userData?.is_superuser}
        document_pk={document?.document?.pk}
        project_pk={document?.document?.project?.pk}
        writeable_document_kind={"Project Plan"}
        writeable_document_pk={document?.pk}
        isUpdate={true}
        editorType="ProjectDocument"
        key={`data_management${editorKey}`} // Change the key to force a re-render
        data={document?.endorsements?.data_management}
        section={"data_management"}
      />

      <RichTextEditor
        canEdit={userInTeam || userData?.is_superuser}
        document_pk={document?.document?.pk}
        project_pk={document?.document?.project?.pk}
        writeable_document_kind={"Project Plan"}
        writeable_document_pk={document?.pk}
        isUpdate={true}
        editorType="ProjectDocument"
        key={`related_projects${editorKey}`} // Change the key to force a re-render
        data={document?.related_projects}
        section={"related_projects"}
      />

      <Box pb={6} mt={4}>
        <Text fontWeight={"bold"} fontSize={"2xl"}>
          Funding
        </Text>
        <Grid mt={4} gridTemplateColumns={"repeat(1, 1fr)"}>
          <RichTextEditor
            canEdit={userInTeam || userData?.is_superuser}
            document_pk={document?.document?.pk}
            project_pk={document?.document?.project?.pk}
            writeable_document_kind={"Project Plan"}
            writeable_document_pk={document?.pk}
            isUpdate={true}
            editorType="ProjectDocument"
            key={`budget${editorKey}`} // Change the key to force a re-render
            data={document?.operating_budget}
            section={"operating_budget"}
          />

          <RichTextEditor
            canEdit={userInTeam || userData?.is_superuser}
            document_pk={document?.document?.pk}
            project_pk={document?.document?.project?.pk}
            writeable_document_kind={"Project Plan"}
            writeable_document_pk={document?.pk}
            isUpdate={true}
            editorType="ProjectDocument"
            key={`externalbudget${editorKey}`} // Change the key to force a re-render
            data={document?.operating_budget_external}
            section={"operating_budget_external"}
          />
        </Grid>
      </Box>
      <ProjectPlanEndorsements
        document={document}
        userIsLeader={userIsLeader}
        userData={userData}
        refetchDocument={refetch}
        // isProjectLeader={}
      />

      <Box pb={6} mt={4}>
        <CommentSection
          documentID={document?.document?.id}
          userData={userData}
        />
      </Box>
    </motion.div>
  );
};
