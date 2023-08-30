// Maps out the document provided to the rich text editor components for progress report documents. 

import { Box, Text } from "@chakra-ui/react"
import { DocumentActions } from "./DocumentActions"
import { IProgressReport } from "../../../types";

interface Props {
    documents: IProgressReport[] | [];
    selectedYear: number;
}

export const ProgressReportContents = ({ documents, selectedYear }: Props) => {

    const selectedProgressReport = documents.find(report => report.year === selectedYear);


    return (
        <>
            <DocumentActions />
            <Box>{selectedProgressReport?.year}</Box>

            <Box
                pb={6}
            >
                <Text
                    fontWeight={"bold"}
                    fontSize={"2xl"}
                >
                    Context
                </Text>

                <Box
                    mt={4}
                >
                    {selectedProgressReport?.context}
                </Box>
            </Box>


            <Box
                pb={6}
            >
                <Text
                    fontWeight={"bold"}
                    fontSize={"2xl"}
                >
                    Aims
                </Text>
                <Box

                    my={4}
                >
                    {selectedProgressReport?.aims}

                </Box>
            </Box>

            <Box
                pb={6}
            >
                <Text
                    fontWeight={"bold"}
                    fontSize={"2xl"}
                >
                    Progress
                </Text>
                <Box
                    my={4}
                >
                    {selectedProgressReport?.progress}

                </Box>
            </Box>

            <Box
                pb={6}
            >
                <Text
                    fontWeight={"bold"}
                    fontSize={"2xl"}
                >
                    Management Implications
                </Text>
                <Box
                    my={4}
                >
                    {selectedProgressReport?.implications}
                </Box>
            </Box>

            <Box
                pb={6}
            >
                <Text
                    fontWeight={"bold"}
                    fontSize={"2xl"}
                >
                    Future Directions
                </Text>
                <Box
                    my={4}
                >
                    {selectedProgressReport?.future}

                </Box>
            </Box>

        </>
    )
}