// Maps out the document provided to the rich text editor components for project closure documents.

import { setClosureOutcome } from "@/lib/api/api";
import {
  Flex,
  Select,
  Text,
  ToastId,
  useColorMode,
  useToast,
} from "@chakra-ui/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { motion } from "framer-motion";
import { useRef, useState } from "react";
import { useCheckUserInTeam } from "../../../lib/hooks/helper/useCheckUserInTeam";
import {
  IProjectClosure,
  IProjectDocuments,
  IProjectMember,
  IUserMe,
} from "../../../types";
import { RichTextEditor } from "../../RichTextEditor/Editors/RichTextEditor";
import { CommentSection } from "./CommentSection";
import { ProjectClosureDocActions } from "./DocActions/ProjectClosureDocActions";

interface Props {
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
  const toast = useToast();
  const toastIdRef = useRef<ToastId>();
  const addToast = (data) => {
    toastIdRef.current = toast(data);
  };

  const setClosureMutation = useMutation({
    mutationFn: setClosureOutcome,
    onMutate: () => {
      addToast({
        status: "loading",
        title: "Setting Closure Outcome",
        position: "top-right",
      });
    },
    onSuccess: async () => {
      if (toastIdRef.current) {
        toast.update(toastIdRef.current, {
          title: "Success",
          description: `Closure Outcome Set`,
          status: "success",
          position: "top-right",
          duration: 3000,
          isClosable: true,
        });
      }
      queryClient.invalidateQueries({
        queryKey: ["projects", document?.document?.project?.id],
      });
      refetch();
    },
    onError: (error: AxiosError) => {
      if (toastIdRef.current) {
        toast.update(toastIdRef.current, {
          title: "Could Not Set Closure Outcome",
          description: error?.response?.data
            ? `${error.response.status}: ${
                Object.values(error.response.data)[0]
              }`
            : "Error",
          status: "error",
          position: "top-right",
          duration: 3000,
          isClosable: true,
        });
      }
    },
  });

  const handleNewOutcomeSelection = (event) => {
    const outcome = event.target.value;
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
      <ProjectClosureDocActions
        all_documents={all_documents}
        projectClosureData={document}
        refetchData={refetch}
        setToLastTab={setToLastTab}
        isBaLead={isBaLead}
        // projectPk={projectPk}
      />

      {(document.document.project.kind === "science" ||
        userData?.is_superuser) &&
      !document?.document?.directorate_approval_granted ? (
        <Flex
          width={"100%"}
          mb={8}
          p={2}
          px={4}
          border={"1px solid"}
          borderColor={colorMode === "light" ? "gray.200" : "gray.600"}
          rounded={"2xl"}
        >
          <Flex flex={1} justifyContent={"flex-start"} alignItems={"center"}>
            <Text fontSize={"lg"} fontWeight={"bold"}>
              Select an Intended Outcome:
            </Text>
          </Flex>
          <Flex justifyContent={"flex-end"}>
            <Select
              value={selectedOutcome}
              onChange={(event) => handleNewOutcomeSelection(event)}
              minW={"200px"}
            >
              {potentialOutcomes.map((outcome) => (
                <option key={outcome} value={outcome}>
                  {outcome.charAt(0).toUpperCase() + outcome.slice(1)}
                </option>
              ))}
            </Select>
          </Flex>
        </Flex>
      ) : null}

      {document.document.project.kind === "science" && (
        <>
          <RichTextEditor
            canEdit={
              ((userInTeam || isBaLead) && !isFullyApproved) ||
              userData?.is_superuser
            }
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
            canEdit={
              ((userInTeam || isBaLead) && !isFullyApproved) ||
              userData?.is_superuser
            }
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
            canEdit={
              ((userInTeam || isBaLead) && !isFullyApproved) ||
              userData?.is_superuser
            }
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
            canEdit={
              ((userInTeam || isBaLead) && !isFullyApproved) ||
              userData?.is_superuser
            }
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
            canEdit={
              ((userInTeam || isBaLead) && !isFullyApproved) ||
              userData?.is_superuser
            }
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
            canEdit={
              ((userInTeam || isBaLead) && !isFullyApproved) ||
              userData?.is_superuser
            }
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
        documentID={document?.pk}
        userData={userData}
        baseAPI={baseAPI}
      />
    </motion.div>
  );
};
