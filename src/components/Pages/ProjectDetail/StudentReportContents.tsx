// Maps out the document provided to the rich text editor components for student report documents. 

import { Box, Button, Flex, Select, Spinner, Text, useColorMode, useDisclosure } from "@chakra-ui/react"
import { IProjectDocuments, IProjectMember, IUserMe, IStudentReport } from "../../../types";
import { RichTextEditor } from "../../RichTextEditor/Editors/RichTextEditor";
import { useEffect, useState } from "react";
import { StudentReportDocActions } from "./DocActions/StudentReportDocActions";
import { motion } from "framer-motion";
import { useCheckUserInTeam } from "../../../lib/hooks/useCheckUserInTeam";
import { CreateStudentReportModal } from "../../Modals/CreateStudentReportModal";
import { useGetStudentReportAvailableReportYears } from "../../../lib/hooks/useGetStudentReportAvailableReportYears";
import { getStudentReportForYear } from "../../../lib/api";

interface Props {
    documents: IStudentReport[];
    all_documents: IProjectDocuments;
    userData: IUserMe;
    members: IProjectMember[];
    refetch: () => void;
    projectPk: number | string;
    setToLastTab: (tabToGoTo?: number) => void;

}

export const StudentReportContents = ({
    userData, members,
    all_documents,
    documents, refetch, projectPk,
    setToLastTab,
}: Props) => {
    // Handling years
    const { availableStudentYearsLoading, availableStudentYearsData, refetchStudentYears } = useGetStudentReportAvailableReportYears(Number(documents[0].document?.project?.pk));
    const years = Array.from(new Set(documents.map(studentReport => studentReport.year))).sort((a, b) => b - a);
    const [selectedYear, setSelectedYear] = useState(() => {
        const years = documents.map((studentReport) => studentReport.year);
        const highestYear = Math.max(...years);
        return highestYear;
    });

    // Selected Report State
    const [selectedStudentReport, setselectedStudentReport] = useState(() => {
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
    const documentType = "studentreport"
    const [editorKey, setEditorKey] = useState(selectedYear.toString() + colorMode + documentType);

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
                const newPRData = await getStudentReportForYear(selectedYear, Number(projectPk));
                setselectedStudentReport(newPRData);
            } catch (error) {
                // Handle error
                console.error('Error fetching student report data:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();


    }, [selectedYear, forceRefresh, projectPk])

    useEffect(() => console.log(selectedStudentReport), [selectedStudentReport])


    useEffect(() => {
        if (selectedStudentReport)
            setIsLoading(false);
    }, [selectedStudentReport])


    const refetchDataForYearFunction = () => {
        console.log('SELECTED YEAR IS:', selectedYear)
        const dataForYear = documents.find((report) => report.year === selectedYear);
        if (dataForYear) {
            setIsLoading(true);
            setselectedStudentReport(dataForYear);
            setEditorKey(selectedYear.toString() + colorMode + documentType)
        }
        console.log('set year and selected doc')
    }

    // const refetchFunc = () => {
    //     refetch();
    //     setIsLoading(true);
    //     const getHighestAvailable = () => {
    //         const years = documents.map((studentReport) => studentReport.year);
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

    // const refetchData = () => {
    //     setIsLoading(true);
    //     // setSelectedYear(selectedYear);
    //     setIsLoading(false);
    // }





    const { isOpen: isCreateStudentReportModalOpen, onOpen: onOpenCreateStudentReportModal, onClose: onCloseCreateStudentReportModal } = useDisclosure();

    return (
        <>
            {/* <ProgressReportSelector
                projectPk={projectPk}
                documents={documents}
                onYearSelect={onYearSelect}
                selectedStudentReportYear={selectedYear}
                selectedStudentReport={selectedStudentReport}
            /> */}

            {/* <CreateProgressReportModal
                projectPk={selectedStudentReport?.document?.project?.pk}
                documentKind="progressreport"
                onClose={onCloseCreateProgressReportModal}
                isOpen={isCreateProgressReportModalOpen}
                refetchData={refetchFunc}
            /> */}

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
                                // onOpenCreateProgressReportModal
                                onOpenCreateStudentReportModal
                                // () => spawnProgressReport(
                                //     {
                                //         project_pk: projectPlanData?.document?.project?.id ? projectPlanData.document.project.id : projectPlanData.document.project.pk,
                                //         kind: "progressreport"
                                //     }
                                // )
                            }
                            ml={2}
                            isDisabled={availableStudentYearsData?.length < 1}
                        >
                            Create Student Report
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
                        <StudentReportDocActions
                            refetchData={refetch}
                            callSameData={handleSetSameYear}
                            studentReportData={selectedStudentReport}
                            documents={documents}
                            setToLastTab={setToLastTab}
                        />
                        {/* Editors */}

                        <RichTextEditor
                            wordLimit={150}
                            limitCanBePassed={false}

                            canEdit={userInTeam || userData?.is_superuser}
                            writeable_document_kind={'Student Report'}
                            writeable_document_pk={selectedStudentReport?.pk}


                            project_pk={selectedStudentReport?.document?.project?.pk}
                            document_pk={selectedStudentReport?.document?.pk}
                            isUpdate={true}


                            editorType="ProjectDocument"
                            key={`progress${editorKey}`} // Change the key to force a re-render
                            data={selectedStudentReport?.progress_report}
                            section={"progress_report"}
                        />
                    </motion.div>
                )}

        </>
    )
}