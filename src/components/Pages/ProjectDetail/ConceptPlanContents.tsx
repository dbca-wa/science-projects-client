// Maps out the document provided to the rich text editor components for concept plan documents. 

import { Box, Text } from "@chakra-ui/react"
import { DocumentActions } from "./DocumentActions"
import { IConceptPlan } from "../../../types";

interface Props {
    document: IConceptPlan | null;
}

export const ConceptPlanContents = ({ document }: Props) => {
    return (
        <>

            <DocumentActions
            // type={} data={}
            />

            <Box
                pb={6}
            >
                <Text
                    fontWeight={"bold"}
                    fontSize={"2xl"}
                >
                    Background
                </Text>
                <Box
                    mt={4}
                >
                    {document?.background}
                </Box>
            </Box >

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
                    mt={4}
                >
                    {document?.aims}

                </Box>
            </Box>

            <Box
                pb={6}
            >
                <Text
                    fontWeight={"bold"}
                    fontSize={"2xl"}
                >
                    Expected Outcome
                </Text>
                <Box
                    mt={4}
                >
                    {document?.outcome}
                </Box>
            </Box>

            <Box
                pb={6}
            >
                <Text
                    fontWeight={"bold"}
                    fontSize={"2xl"}
                >
                    Expected Collaborations
                </Text>
                <Box
                    mt={4}
                >
                    {document?.collaborations}
                </Box>
            </Box>

            <Box
                pb={6}
            >
                <Text
                    fontWeight={"bold"}
                    fontSize={"2xl"}
                >
                    Strategic Context
                </Text>
                <Box
                    mt={4}
                >
                    {document?.strategic_context}
                </Box>
            </Box>

            <Box
                pb={6}
            >
                <Text
                    fontWeight={"bold"}
                    fontSize={"2xl"}
                >
                    Staff Time Allocation
                </Text>
                <Box
                    mt={4}

                >
                    {document?.staff_time_allocation}
                    {/* [["Role", "Year 1", "Year 2", "Year 3"], ["Scientist", "", "", ""], ["Technical", "", "", ""], ["Volunteer", "", "", ""], ["Collaborator", "", "", ""]] */}
                </Box>
            </Box>

            <Box
                pb={6}
            >
                <Text
                    fontWeight={"bold"}
                    fontSize={"2xl"}
                >
                    Indicative Operating Budget
                </Text>
                <Box
                    mt={4}
                >
                    {document?.budget}
                    {/* [["Source", "Year 1", "Year 2", "Year 3"], ["Consolidated Funds (DBCA)", "", "", ""], ["External Funding", "", "", ""]] */}
                </Box>
            </Box>
        </>

    )
}