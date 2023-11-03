// Maps out the document provided to the rich text editor components for progress report documents. 

import { Box, Center, Flex, Select, Spinner, Text, useColorMode } from "@chakra-ui/react"
import { DocumentActions } from "./DocumentActions"
import { IProgressReport } from "../../../types";
import { RichTextEditor } from "../../RichTextEditor/Editors/RichTextEditor";
import { useEffect, useState } from "react";
// import { ProgressReportSelector } from "./ProgressReportSelector";
import { ProgressReportDocActions } from "./DocActions/ProgressReportDocActions";
import { motion } from "framer-motion";

interface Props {
    documents: IProgressReport[];
    refetch: () => void;
}

export const ProgressReportContents = ({
    documents, refetch
}: Props) => {
    // Handling years
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


    useEffect(() => {
        const dataForYear = documents.find((report) => report.year === selectedYear);
        if (dataForYear) {
            setIsLoading(true);
            setSelectedProgressReport(dataForYear);
            setEditorKey(selectedYear.toString() + colorMode + documentType)
        }
        console.log('set year and selected doc')
    }, [selectedYear, colorMode, documentType, documents])

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

    return (
        <>
            {/* <ProgressReportSelector
                projectPk={projectPk}
                documents={documents}
                onYearSelect={onYearSelect}
                selectedProgressReportYear={selectedYear}
                selectedProgressReport={selectedProgressReport}
            /> */}

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
                            Select a Year:
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

            </Box>

            {/* Actions */}
            <ProgressReportDocActions
                refetchData={refetch}
                progressReportData={selectedProgressReport}
            // projectPk={projectPk}
            />
            {/* Editors */}

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

                        <RichTextEditor
                            key={`context${editorKey}`} // Change the key to force a re-render
                            data={selectedProgressReport?.context}
                            section={"context"}
                        />

                        <RichTextEditor
                            key={`aims${editorKey}`} // Change the key to force a re-render
                            data={selectedProgressReport?.aims}
                            section={"aims"}
                        />

                        <RichTextEditor
                            key={`progress${editorKey}`} // Change the key to force a re-render
                            data={selectedProgressReport?.progress}
                            section={"progress"}
                        />

                        <RichTextEditor
                            key={`implications${editorKey}`} // Change the key to force a re-render
                            data={selectedProgressReport?.implications}
                            section={"implications"}
                        />

                        <RichTextEditor
                            key={`future${editorKey}`} // Change the key to force a re-render
                            data={selectedProgressReport?.future}
                            section={"future"}
                        />
                    </motion.div>
                )}

        </>
    )
}