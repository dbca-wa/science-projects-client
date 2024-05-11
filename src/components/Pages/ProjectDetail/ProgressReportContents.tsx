// Maps out the document provided to the rich text editor components for progress report documents.

import {
  Box,
  Button,
  Center,
  Flex,
  Select,
  Spinner,
  Text,
  useColorMode,
  useDisclosure,
} from "@chakra-ui/react";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { BsPlus } from "react-icons/bs";
import { getProgressReportForYear } from "../../../lib/api";
import { useCheckUserInTeam } from "../../../lib/hooks/helper/useCheckUserInTeam";
import { useGetProgressReportAvailableReportYears } from "../../../lib/hooks/tanstack/useGetProgressReportAvailableReportYears";
import {
  IProgressReport,
  IProjectDocuments,
  IProjectMember,
  IUserMe,
} from "../../../types";
import { CreateProgressReportModal } from "../../Modals/CreateProgressReportModal";
import { RichTextEditor } from "../../RichTextEditor/Editors/RichTextEditor";
import { CommentSection } from "./CommentSection";
import { ProgressReportDocActions } from "./DocActions/ProgressReportDocActions";

interface Props {
  baseAPI: string;
  documents: IProgressReport[];
  all_documents: IProjectDocuments;
  userData: IUserMe;
  members: IProjectMember[];
  refetch: () => void;
  setToLastTab: (tabToGoTo?: number) => void;
}

export const ProgressReportContents = ({
  baseAPI,
  userData,
  members,
  all_documents,
  documents,
  refetch,
  setToLastTab,
}: Props) => {
  // useEffect(() => console.log(userData));
  // Handling years
  const { availableProgressReportYearsData } =
    useGetProgressReportAvailableReportYears(
      Number(documents[0].document?.project?.pk)
    );
  const years = Array.from(
    new Set(documents.map((progressReport) => progressReport.year))
  ).sort((a, b) => b - a);
  const [selectedYear, setSelectedYear] = useState(() => {
    const years = documents.map((progressReport) => progressReport.year);
    const highestYear = Math.max(...years);
    return highestYear;
  });

  // Selected Report State
  const [selectedProgressReport, setSelectedProgressReport] = useState(() => {
    const highestYearDocument = documents.reduce(
      (maxDocument, currentDocument) => {
        if (!maxDocument || currentDocument.year > maxDocument.year) {
          return currentDocument;
        }
        return maxDocument;
      },
      null
    );
    return highestYearDocument;
  });

  // Force a rerender when dark mode or year changed to update design and content
  const [isLoading, setIsLoading] = useState(false);
  const { colorMode } = useColorMode();
  const documentType = "progressreport";
  const editorKey = colorMode + documentType + selectedProgressReport?.year;

  const mePk = userData?.pk ? userData?.pk : userData?.id;
  const userInTeam = useCheckUserInTeam(mePk, members);

  const projectPk = all_documents?.concept_plan?.document?.project?.pk;

  const [forceRefresh, setForceRefresh] = useState(false);

  const handleSetSameYear = () => {
    setForceRefresh((prevForceRefresh) => !prevForceRefresh);
  };

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);

      try {
        const newPRData = await getProgressReportForYear(
          selectedYear,
          projectPk
        );
        setSelectedProgressReport(newPRData);
      } catch (error) {
        // Handle error
        console.error("Error fetching progress report data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [selectedYear, projectPk, forceRefresh]);

  useEffect(() => {
    if (selectedProgressReport) setIsLoading(false);
  }, [selectedProgressReport]);

  const handleNewYearSelection = (event) => {
    setIsLoading(true);
    setSelectedYear(Number(event.target.value));
  };

  const {
    isOpen: isCreateProgressReportModalOpen,
    onOpen: onOpenCreateProgressReportModal,
    onClose: onCloseCreateProgressReportModal,
  } = useDisclosure();

  return (
    <>
      <CreateProgressReportModal
        projectPk={selectedProgressReport?.document?.project?.pk}
        documentKind="progressreport"
        onClose={onCloseCreateProgressReportModal}
        isOpen={isCreateProgressReportModalOpen}
        refetchData={refetch}
      />

      {/* Selector */}
      <Box
        padding={4}
        rounded={"xl"}
        border={"1px solid"}
        borderColor={colorMode === "light" ? "gray.300" : "gray.500"}
        mb={8}
        width={"100%"}
      >
        <Flex width={"100%"} justifyContent={"space-between"}>
          <Center>
            <Button
              background={colorMode === "light" ? "orange.500" : "orange.600"}
              color={"white"}
              _hover={{
                background: colorMode === "light" ? "orange.400" : "orange.500",
              }}
              size={"sm"}
              onClick={
                onOpenCreateProgressReportModal
                // () => spawnProgressReport(
                //     {
                //         project_pk: projectPlanData?.document?.project?.id ? projectPlanData.document.project.id : projectPlanData.document.project.pk,
                //         kind: "progressreport"
                //     }
                // )
              }
              isDisabled={availableProgressReportYearsData?.length < 1}
              leftIcon={<BsPlus size={"20px"} />}
            >
              New Report
            </Button>
          </Center>

          <Center>
            <Flex alignItems={"center"}>
              <Text
                mr={3}
                fontWeight={"semibold"}
                fontSize={"md"}
                color={colorMode === "light" ? "gray.600" : "gray.200"}
              >
                Selected
              </Text>
              <Select
                value={selectedYear}
                onChange={(event) => handleNewYearSelection(event)}
                minW={"100px"}
              >
                {years.map((year) => (
                  <option key={year} value={year}>
                    {`FY ${year - 1} - ${String(year).slice(2)}`}
                  </option>
                ))}
              </Select>
            </Flex>
          </Center>
        </Flex>
      </Box>

      {isLoading ? (
        <Box
          minH={"100vh"}
          display="flex" // Use display: flex to enable flexbox layout
          justifyContent="center" // Center horizontally
          pt={"50px"}
        >
          <Spinner
            thickness="4px"
            speed="0.65s"
            emptyColor="gray.200"
            color="blue.500"
            size="xl"
          />
        </Box>
      ) : (
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
          {/* Actions */}
          <ProgressReportDocActions
            refetchData={refetch}
            callSameData={handleSetSameYear}
            progressReportData={selectedProgressReport}
            documents={documents}
            setToLastTab={setToLastTab}
          />
          {/* Editors */}

          <RichTextEditor
            key={`context${editorKey}`} // Change the key to force a re-render
            wordLimit={150}
            limitCanBePassed={true}
            canEdit={userInTeam || userData?.is_superuser}
            writeable_document_kind={"Progress Report"}
            writeable_document_pk={selectedProgressReport?.pk}
            project_pk={selectedProgressReport?.document?.project?.pk}
            document_pk={selectedProgressReport?.document?.pk}
            isUpdate={true}
            editorType="ProjectDocument"
            data={selectedProgressReport?.context}
            section={"context"}
          />

          <RichTextEditor
            key={`aims${editorKey}`} // Change the key to force a re-render
            wordLimit={150}
            limitCanBePassed={true}
            canEdit={userInTeam || userData?.is_superuser}
            writeable_document_kind={"Progress Report"}
            writeable_document_pk={selectedProgressReport?.pk}
            project_pk={selectedProgressReport.document.project.pk}
            document_pk={selectedProgressReport?.document?.pk}
            isUpdate={true}
            editorType="ProjectDocument"
            data={selectedProgressReport?.aims}
            section={"aims"}
          />

          <RichTextEditor
            key={`progress${editorKey}`} // Change the key to force a re-render
            wordLimit={150}
            limitCanBePassed={true}
            canEdit={userInTeam || userData?.is_superuser}
            writeable_document_kind={"Progress Report"}
            writeable_document_pk={selectedProgressReport?.pk}
            project_pk={selectedProgressReport.document.project.pk}
            document_pk={selectedProgressReport?.document?.pk}
            isUpdate={true}
            editorType="ProjectDocument"
            data={selectedProgressReport?.progress}
            section={"progress"}
          />

          <RichTextEditor
            key={`implications${editorKey}`} // Change the key to force a re-render
            wordLimit={150}
            limitCanBePassed={true}
            canEdit={userInTeam || userData?.is_superuser}
            writeable_document_kind={"Progress Report"}
            writeable_document_pk={selectedProgressReport?.pk}
            project_pk={selectedProgressReport.document.project.pk}
            document_pk={selectedProgressReport?.document?.pk}
            isUpdate={true}
            editorType="ProjectDocument"
            data={selectedProgressReport?.implications}
            section={"implications"}
          />

          <RichTextEditor
            key={`future${editorKey}`} // Change the key to force a re-render
            wordLimit={150}
            limitCanBePassed={true}
            canEdit={userInTeam || userData?.is_superuser}
            writeable_document_kind={"Progress Report"}
            writeable_document_pk={selectedProgressReport?.pk}
            project_pk={selectedProgressReport.document.project.pk}
            document_pk={selectedProgressReport?.document?.pk}
            isUpdate={true}
            editorType="ProjectDocument"
            data={selectedProgressReport?.future}
            section={"future"}
          />

          {selectedProgressReport?.document && (
            <CommentSection
              baseAPI={baseAPI}
              documentID={selectedProgressReport?.document?.pk}
              userData={userData}
            />
          )}
        </motion.div>
      )}
    </>
  );
};
