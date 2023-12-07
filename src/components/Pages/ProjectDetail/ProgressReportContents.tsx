// Maps out the document provided to the rich text editor components for progress report documents. 

import { Box, Button, Flex, Select, Spinner, Text, useColorMode, useDisclosure } from "@chakra-ui/react"
import { IProgressReport, IProjectDocuments, IProjectMember, IUserMe } from "../../../types";
import { RichTextEditor } from "../../RichTextEditor/Editors/RichTextEditor";
import { useEffect, useState } from "react";
import { ProgressReportDocActions } from "./DocActions/ProgressReportDocActions";
import { motion } from "framer-motion";
import { useCheckUserInTeam } from "../../../lib/hooks/useCheckUserInTeam";
import { CreateProgressReportModal } from "../../Modals/CreateProgressReportModal";
import { useGetProgressReportAvailableReportYears } from "../../../lib/hooks/useGetProgressReportAvailableReportYears";
import { getProgressReportForYear } from "../../../lib/api";
import WordToHtmlConverter from "../../RichTextEditor/WordToHTML";

interface Props {
    documents: IProgressReport[];
    all_documents: IProjectDocuments;
    userData: IUserMe;
    members: IProjectMember[];
    refetch: () => void;
    setToLastTab: (tabToGoTo?: number) => void;

}

export const ProgressReportContents = ({
    userData, members,
    all_documents,
    documents, refetch,
    setToLastTab,
}: Props) => {
    // Handling years
    const { availableProgressReportYearsLoading, availableProgressReportYearsData, refetchProgressYears } = useGetProgressReportAvailableReportYears(Number(documents[0].document?.project?.pk));
    const years = Array.from(new Set(documents.map(progressReport => progressReport.year))).sort((a, b) => b - a);
    const [selectedYear, setSelectedYear] = useState(() => {
        const years = documents.map((progressReport) => progressReport.year);
        const highestYear = Math.max(...years);
        return highestYear;
    });

    // Selected Report State
    const [selectedProgressReport, setSelectedProgressReport] = useState(() => {
        const highestYearDocument = documents.reduce((maxDocument, currentDocument) => {
            if (!maxDocument || currentDocument.year > maxDocument.year) {
                return currentDocument;
            }
            return maxDocument;
        }, null)
        return highestYearDocument;
    });

    // Force a rerender when dark mode or year changed to update design and content
    // const editorKey = selectedYear.toString() + colorMode;
    const [isLoading, setIsLoading] = useState(false);
    const { colorMode } = useColorMode();
    const documentType = "progressreport"
    const [editorKey, setEditorKey] = useState(selectedYear.toString() + colorMode + documentType);

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
                const newPRData = await getProgressReportForYear(selectedYear, projectPk);
                setSelectedProgressReport(newPRData);
            } catch (error) {
                // Handle error
                console.error('Error fetching progress report data:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();

    }, [selectedYear, projectPk, forceRefresh])


    useEffect(() => {
        if (selectedProgressReport)
            setIsLoading(false);
    }, [selectedProgressReport])


    const refetchDataForYearFunction = () => {
        console.log('SELECTED YEAR IS:', selectedYear)
        const dataForYear = documents.find((report) => report.year === selectedYear);
        if (dataForYear) {
            setIsLoading(true);
            setSelectedProgressReport(dataForYear);
            setEditorKey(selectedYear.toString() + colorMode + documentType)
        }
        console.log('set year and selected doc')
    }

    // const refetchFunc = () => {
    //     refetch();
    //     setIsLoading(true);
    //     const getHighestAvailable = () => {
    //         const years = documents.map((progressReport) => progressReport.year);
    //         const highestYear = Math.max(...years);
    //         return highestYear;

    //     }
    //     const highestYear = getHighestAvailable();
    //     // setSelectedYear(highestYear)
    // }

    useEffect(() => {
        setIsLoading(false);
    }, [editorKey, documents])

    const handleNewYearSelection = (event) => {
        setIsLoading(true);
        setSelectedYear(Number(event.target.value))

    }

    // const handleSetSameYear = () => {
    //     setIsLoading(true);
    //     setSelectedYear(selectedYear);
    // }

    // const refetchData = () => {
    //     setIsLoading(true);
    //     // setSelectedYear(selectedYear);
    //     setIsLoading(false);
    // }
    const { isOpen: isCreateProgressReportModalOpen, onOpen: onOpenCreateProgressReportModal, onClose: onCloseCreateProgressReportModal } = useDisclosure();




    return (
        <>
            {/* <ProgressReportSelector
                projectPk={projectPk}
                documents={documents}
                onYearSelect={onYearSelect}
                selectedProgressReportYear={selectedYear}
                selectedProgressReport={selectedProgressReport}
            /> */}

            {/* <WordToHtmlConverter /> */}

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
                borderColor={"gray.300"}
                mb={8}
                width={"100%"}
            >
                <Flex
                    width={"100%"}
                >

                    <Flex
                        flex={1}
                        justifyContent={"flex-start"}
                        alignItems={"center"}
                    >
                        <Text
                            fontSize={"lg"}
                            fontWeight={"bold"}
                        >
                            Select a Report:
                        </Text>

                    </Flex>
                    <Flex
                        justifyContent={"flex-end"}
                    >
                        <Select
                            value={selectedYear}
                            onChange={(event) =>
                                handleNewYearSelection(event)
                            }
                            minW={"200px"}
                        >
                            {years.map(year => (
                                <option key={year} value={year}>
                                    {year}
                                </option>
                            ))}
                        </Select>
                    </Flex>
                </Flex>
                <Flex
                    width={"100%"}
                    mt={6}
                >

                    <Flex
                        flex={1}
                        justifyContent={"flex-start"}
                        alignItems={"center"}
                    >
                        <Text
                            fontSize={"lg"}
                            fontWeight={"bold"}
                        >

                        </Text>

                    </Flex>
                    <Flex
                        justifyContent={"flex-end"}
                    >


                        <Button
                            colorScheme="orange"
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
                            ml={2}
                            isDisabled={availableProgressReportYearsData?.length < 1}
                        >
                            Create Progress Report
                        </Button>

                    </Flex>
                </Flex>
            </Box>



            {isLoading ? (
                <Box
                    minH={"100vh"}
                    display="flex"       // Use display: flex to enable flexbox layout
                    justifyContent="center" // Center horizontally
                    // alignItems="center"     // Center vertically
                    // bg="red"
                    pt={"50px"}

                >
                    <Spinner
                        thickness='4px'
                        speed='0.65s'
                        emptyColor='gray.200'
                        color='blue.500'
                        size='xl'
                    />

                </Box>
            ) :
                (
                    <motion.div
                        initial={{ y: -10, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 10, opacity: 0 }}
                        transition={{
                            duration: 0.7, delay: ((
                                (1) / 7))
                        }}
                        style={{
                            height: "100%",
                            animation: "oscillate 8s ease-in-out infinite",
                            // backgroundColor: "pink"
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
                            canEdit={userInTeam || userData?.is_superuser}
                            writeable_document_kind={'Progress Report'}
                            writeable_document_pk={selectedProgressReport?.pk}


                            project_pk={selectedProgressReport?.document?.project?.pk}
                            document_pk={selectedProgressReport?.document?.pk}
                            isUpdate={true}


                            editorType="ProjectDocument"
                            key={`context${editorKey}`} // Change the key to force a re-render
                            data={selectedProgressReport?.context}
                            section={"context"}
                        />

                        <RichTextEditor
                            canEdit={userInTeam || userData?.is_superuser}
                            writeable_document_kind={'Progress Report'}
                            writeable_document_pk={selectedProgressReport?.pk}


                            project_pk={selectedProgressReport.document.project.pk}
                            document_pk={selectedProgressReport?.document?.pk}
                            isUpdate={true}


                            editorType="ProjectDocument"
                            key={`aims${editorKey}`} // Change the key to force a re-render
                            data={selectedProgressReport?.aims}
                            section={"aims"}
                        />

                        <RichTextEditor
                            canEdit={userInTeam || userData?.is_superuser}
                            writeable_document_kind={'Progress Report'}
                            writeable_document_pk={selectedProgressReport?.pk}


                            project_pk={selectedProgressReport.document.project.pk}
                            document_pk={selectedProgressReport?.document?.pk}
                            isUpdate={true}


                            editorType="ProjectDocument"
                            key={`progress${editorKey}`} // Change the key to force a re-render
                            data={selectedProgressReport?.progress}
                            section={"progress"}
                        />

                        <RichTextEditor
                            canEdit={userInTeam || userData?.is_superuser}
                            writeable_document_kind={'Progress Report'}
                            writeable_document_pk={selectedProgressReport?.pk}


                            project_pk={selectedProgressReport.document.project.pk}
                            document_pk={selectedProgressReport?.document?.pk}
                            isUpdate={true}


                            editorType="ProjectDocument"
                            key={`implications${editorKey}`} // Change the key to force a re-render
                            data={selectedProgressReport?.implications}
                            section={"implications"}
                        />

                        <RichTextEditor
                            canEdit={userInTeam || userData?.is_superuser}
                            writeable_document_kind={'Progress Report'}
                            writeable_document_pk={selectedProgressReport?.pk}

                            project_pk={selectedProgressReport.document.project.pk}
                            document_pk={selectedProgressReport?.document?.pk}
                            isUpdate={true}




                            editorType="ProjectDocument"
                            key={`future${editorKey}`} // Change the key to force a re-render
                            data={selectedProgressReport?.future}
                            section={"future"}
                        />
                    </motion.div>
                )}

        </>
    )
}