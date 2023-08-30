// Maps out the document provided to the rich text editor components for student report documents (based on year selected). 

import { Box, Text } from "@chakra-ui/react"
import { IStudentReport } from "../../../types"
import { DocumentActions } from "./DocumentActions"

interface Props {
    documents: IStudentReport[] | [];
    selectedYear: number;
}

export const StudentReportContents = ({ documents, selectedYear }: Props) => {


    const selectedReport = documents.find(report => report.year === selectedYear);


    return (
        <>
            <DocumentActions />
            <Box>{selectedReport?.year}</Box>
            <Box
                pb={6}
            >
                <Text
                    fontWeight={"bold"}
                    fontSize={"2xl"}
                >
                    Report
                </Text>

                <Box
                    mt={4}
                >
                    {selectedReport?.progress_report}
                </Box>
            </Box>


        </>

    )
}