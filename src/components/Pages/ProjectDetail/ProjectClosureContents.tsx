// Maps out the document provided to the rich text editor components for project closure documents.

import {
  Box,
  Flex,
  Grid,
  Select,
  Text,
  ToastId,
  useColorMode,
  useToast,
} from "@chakra-ui/react";
import {
  IProjectClosure,
  IProjectDocuments,
  IProjectMember,
  IUserMe,
} from "../../../types";
import { DocumentActions } from "./DocumentActions";
import { RichTextEditor } from "../../RichTextEditor/Editors/RichTextEditor";
import { useEffect, useRef, useState } from "react";
import { useCheckUserInTeam } from "../../../lib/hooks/useCheckUserInTeam";
import { useCheckUserIsTeamLeader } from "../../../lib/hooks/useCheckUserIsTeamLeader";
import { ProjectClosureDocActions } from "./DocActions/ProjectClosureDocActions";
import { IClosureOutcomeProps, setClosureOutcome } from "../../../lib/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { AxiosError } from "axios";
import { motion } from "framer-motion";
import { CommentSection } from "./CommentSection";

interface Props {
  document: IProjectClosure | null;
  all_documents: IProjectDocuments;
  userData: IUserMe;
  members: IProjectMember[];
  refetch: () => void;
  setToLastTab: (tabToGoTo?: number) => void;
}

export const ProjectClosureContents = ({
  userData,
  members,
  all_documents,
  document,
  refetch,
  setToLastTab,
}: Props) => {
  const { colorMode } = useColorMode();
  const documentType = "closure";
  const editorKey = colorMode + documentType;
  useEffect(() => {
    console.log(document);
  }, [document]);

  const mePk = userData?.pk ? userData?.pk : userData?.id;
  const userInTeam = useCheckUserInTeam(mePk, members);
  const userIsLeader = useCheckUserIsTeamLeader(mePk, members);

  useEffect(() => {
    console.log(userData);
    console.log(userInTeam);
  }, [userData, userInTeam]);

  // const [isLoading, setIsLoading] = useState(false);
  const [selectedOutcome, setSelectedOutcome] = useState<string>(
    document?.intended_outcome
  );
  const potentialOutcomes = [
    "completed",
    "terminated",
    "suspended",
    "forcecompleted",
  ];

  const queryClient = useQueryClient();
  const { register, handleSubmit, reset } = useForm<IClosureOutcomeProps>();
  const toast = useToast();
  const toastIdRef = useRef<ToastId>();
  const addToast = (data: any) => {
    toastIdRef.current = toast(data);
  };

  const setClosureMutation = useMutation(setClosureOutcome, {
    onMutate: () => {
      addToast({
        status: "loading",
        title: "Setting Closure Outcome",
        position: "top-right",
      });
    },
    onSuccess: async (data) => {
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
      queryClient.invalidateQueries([
        "projects",
        document?.document?.project?.id,
      ]);
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
    // setIsLoading(true);
    // setSelectedOutcome(event.target.value)
    const outcome = event.target.value;
    const closurePk = document?.pk;
    const formData = {
      outcome: outcome,
      closurePk: closurePk,
    };
    setSelectedOutcome(outcome);
    setClosureMutation.mutate(formData);
  };

  // useEffect(() => {
  //     console.log(selectedOutcome)
  //     // api call to set the outcome

  // }, [selectedOutcome])

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
        // projectPk={projectPk}
      />

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
                {outcome === "forcecompleted"
                  ? "Force Completed"
                  : outcome.charAt(0).toUpperCase() + outcome.slice(1)}
              </option>
            ))}
          </Select>
        </Flex>
      </Flex>

      {/* <RichTextEditor
                canEdit={userInTeam || userData?.is_superuser}
                document_pk={document?.document?.pk}
                project_pk={document?.document?.project?.pk}
                writeable_document_kind={'Project Closure'}
                writeable_document_pk={document?.pk}
                isUpdate={true}
                editorType="ProjectDocument"
                key={`intended_outcome${editorKey}`} // Change the key to force a re-render
                data={document?.intended_outcome}
                section={"intended_outcome"}
            /> */}

      <RichTextEditor
        canEdit={userInTeam || userData?.is_superuser}
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
        canEdit={userInTeam || userData?.is_superuser}
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
        canEdit={userInTeam || userData?.is_superuser}
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
        canEdit={userInTeam || userData?.is_superuser}
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
        canEdit={userInTeam || userData?.is_superuser}
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
        canEdit={userInTeam || userData?.is_superuser}
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
      <CommentSection documentID={document?.pk} userData={userData} />
    </motion.div>
  );
};
