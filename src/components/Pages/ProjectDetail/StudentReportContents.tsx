// Maps out the document provided to the rich text editor components for student report documents.

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
import { getStudentReportForYear } from "../../../lib/api";
import { useCheckUserInTeam } from "../../../lib/hooks/helper/useCheckUserInTeam";
import { useGetStudentReportAvailableReportYears } from "../../../lib/hooks/tanstack/useGetStudentReportAvailableReportYears";
import {
  ICaretakerPermissions,
  IProjectMember,
  IStudentReport,
  IUserMe,
} from "../../../types";
import { CreateStudentReportModal } from "../../Modals/CreateStudentReportModal";
import { RichTextEditor } from "../../RichTextEditor/Editors/RichTextEditor";
import { CommentSection } from "./CommentSection";
import { UnifiedDocumentActions } from "./DocActions/UnifiedDocumentActions";

interface Props extends ICaretakerPermissions {
  documents: IStudentReport[];
  userData: IUserMe;
  members: IProjectMember[];
  refetch: () => void;
  projectPk: number | string;
  setToLastTab: (tabToGoTo?: number) => void;
  baseAPI: string;
  baLead: number;
}

export const StudentReportContents = ({
  userData,
  members,
  documents,
  refetch,
  projectPk,
  setToLastTab,
  baseAPI,
  baLead,
  userIsCaretakerOfAdmin,
  userIsCaretakerOfBaLeader,
  userIsCaretakerOfMember,
  userIsCaretakerOfProjectLeader,
}: Props) => {
  // useEffect(() => console.log(documents))
  // Handling years
  const { availableStudentYearsData } = useGetStudentReportAvailableReportYears(
    Number(documents[0].document?.project?.pk),
  );
  const years = Array.from(
    new Set(documents.map((studentReport) => studentReport.year)),
  ).sort((a, b) => b - a);
  const [selectedYear, setSelectedYear] = useState(() => {
    const years = documents.map((studentReport) => studentReport.year);
    const highestYear = Math.max(...years);
    return highestYear;
  });

  // Selected Report State
  const [selectedStudentReport, setselectedStudentReport] = useState(() => {
    const highestYearDocument = documents.reduce(
      (maxDocument, currentDocument) => {
        if (!maxDocument || currentDocument.year > maxDocument.year) {
          return currentDocument;
        }
        return maxDocument;
      },
      null,
    );
    return highestYearDocument;
  });

  // Force a rerender when dark mode or year changed to update design and content
  const [isLoading, setIsLoading] = useState(false);
  const { colorMode } = useColorMode();
  const documentType = "studentreport";

  const editorKey = colorMode + documentType + selectedStudentReport?.year;

  const mePk = userData?.pk ? userData?.pk : userData?.id;
  const userInTeam = useCheckUserInTeam(mePk, members);

  const [forceRefresh, setForceRefresh] = useState(false);

  const handleSetSameYear = () => {
    setForceRefresh((prevForceRefresh) => !prevForceRefresh);
  };

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);

      try {
        const newPRData = await getStudentReportForYear(
          selectedYear,
          Number(projectPk),
        );
        setselectedStudentReport(newPRData);
      } catch (error) {
        // Handle error
        console.error("Error fetching student report data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [selectedYear, forceRefresh, projectPk]);

  useEffect(() => {
    if (selectedStudentReport) setIsLoading(false);
  }, [selectedStudentReport]);

  useEffect(() => {
    setIsLoading(false);
  }, [editorKey, documents]);

  const handleNewYearSelection = (event) => {
    setIsLoading(true);
    setSelectedYear(Number(event.target.value));
  };

  const {
    isOpen: isCreateStudentReportModalOpen,
    onOpen: onOpenCreateStudentReportModal,
    onClose: onCloseCreateStudentReportModal,
  } = useDisclosure();

  const isBaLead = mePk === baLead;
  const isFullyApproved =
    documents?.filter((r) => r.year === selectedYear)[0]?.document
      .project_lead_approval_granted &&
    documents?.filter((r) => r.year === selectedYear)[0]?.document
      .business_area_lead_approval_granted &&
    documents?.filter((r) => r.year === selectedYear)[0]?.document
      .directorate_approval_granted;

  const canEditPermission =
    ((userInTeam ||
      isBaLead ||
      userIsCaretakerOfBaLeader ||
      userIsCaretakerOfMember) &&
      !isFullyApproved) ||
    userData?.is_superuser ||
    userIsCaretakerOfAdmin;

  return (
    <>
      <CreateStudentReportModal
        projectPk={selectedStudentReport?.document?.project?.pk}
        documentKind="studentreport"
        onClose={onCloseCreateStudentReportModal}
        isOpen={isCreateStudentReportModalOpen}
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
          {(isBaLead || userInTeam || userData?.is_superuser) && (
            <Center>
              <Button
                background={colorMode === "light" ? "orange.500" : "orange.600"}
                color={"white"}
                _hover={{
                  background:
                    colorMode === "light" ? "orange.400" : "orange.500",
                }}
                size={"sm"}
                onClick={
                  onOpenCreateStudentReportModal
                  // () => spawnProgressReport(
                  //     {
                  //         project_pk: projectPlanData?.document?.project?.id ? projectPlanData.document.project.id : projectPlanData.document.project.pk,
                  //         kind: "progressreport"
                  //     }
                  // )
                }
                isDisabled={
                  availableStudentYearsData?.length < 1 ||
                  documents[0].document?.project?.status === "suspended"
                }
                leftIcon={<BsPlus size={"20px"} />}
              >
                New Report
              </Button>
            </Center>
          )}

          <Center flex={1} justifyContent={"flex-end"}>
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

          <UnifiedDocumentActions
            documentType="studentreport"
            documentData={selectedStudentReport}
            refetchData={refetch}
            callSameData={handleSetSameYear}
            documents={documents}
            setToLastTab={setToLastTab}
            isBaLead={isBaLead}
            userIsCaretakerOfAdmin={userIsCaretakerOfAdmin}
            userIsCaretakerOfBaLeader={userIsCaretakerOfBaLeader}
            userIsCaretakerOfMember={userIsCaretakerOfMember}
            userIsCaretakerOfProjectLeader={userIsCaretakerOfProjectLeader}
          />

          {/* Editors */}

          <RichTextEditor
            wordLimit={300}
            limitCanBePassed={false}
            canEdit={canEditPermission}
            writeable_document_kind={"Student Report"}
            writeable_document_pk={selectedStudentReport?.pk}
            project_pk={selectedStudentReport?.document?.project?.pk}
            document_pk={selectedStudentReport?.document?.pk}
            isUpdate={true}
            editorType="ProjectDocument"
            key={`progress${editorKey}`} // Change the key to force a re-render
            data={selectedStudentReport?.progress_report}
            section={"progress_report"}
            documentsCount={documents.length}
          />
          <CommentSection
            // projectPk={selectedStudentReport?.document?.project?.pk}
            baseAPI={baseAPI}
            documentID={selectedStudentReport?.document?.pk}
            documentKind={selectedStudentReport?.document?.kind}
            userData={userData}
            project={selectedStudentReport?.document?.project}
          />
        </motion.div>
      )}
    </>
  );
};
