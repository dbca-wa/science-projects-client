import { useGetAnnualReportPDF } from "@/lib/hooks/useGetAnnualReportPDF";
import { IReport } from "@/types";
import { Box, Center, Spinner } from "@chakra-ui/react"
import { useEffect } from "react";

interface Props {
    thisReport: IReport;
}

export const PDFViewer = ({ thisReport }: Props) => {

    const { pdfDocumentData, pdfDocumentDataLoading, refetchPDF } = useGetAnnualReportPDF(thisReport?.pk ? thisReport.pk : thisReport?.id);

    useEffect(() => {
        if (!pdfDocumentDataLoading) {
            console.log(pdfDocumentData)
        }
    }, [pdfDocumentDataLoading, pdfDocumentData])

    return (
        <Box>
            {
                pdfDocumentDataLoading ?
                    <Center>
                        <Spinner />
                    </Center>
                    :
                    <Box>
                        PDF VIEW

                    </Box>
            }
        </Box>
    )
}