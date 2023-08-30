// Maps out the document provided to the rich text editor components for project closure documents. 


import { Box, Text } from "@chakra-ui/react"
import { IProjectClosure } from "../../../types"
import { DocumentActions } from "./DocumentActions"

interface Props {
    document: IProjectClosure | null;
}

export const ProjectClosureContents = ({ document }: Props) => {
    return (
        <>
            <DocumentActions />
            <Box
                pb={6}
            >
                <Text
                    fontWeight={"bold"}
                    fontSize={"2xl"}
                >
                    Reason
                </Text>

                <Box
                    mt={4}
                >
                    {document?.reason}
                </Box>
            </Box>
            <Box
                pb={6}
            >
                <Text
                    fontWeight={"bold"}
                    fontSize={"2xl"}
                >
                    Intended Outcome
                </Text>

                <Box
                    mt={4}
                >
                    {document?.intended_outcome}
                </Box>
            </Box>


            <Box
                pb={6}
            >
                <Text
                    fontWeight={"bold"}
                    fontSize={"2xl"}
                >
                    Knowledge Transfer
                </Text>
                <Box
                    my={4}
                >
                    {document?.knowledge_transfer}
                </Box>
            </Box>

            <Box
                pb={6}
            >
                <Text
                    fontWeight={"bold"}
                    fontSize={"2xl"}
                >
                    Data Location
                </Text>
                <Box
                    my={4}
                >
                    {document?.data_location}
                </Box>
            </Box>

            <Box
                pb={6}
            >
                <Text
                    fontWeight={"bold"}
                    fontSize={"2xl"}
                >
                    Hardcopy Location
                </Text>
                <Box
                    my={4}
                >
                    {document?.hardcopy_location}
                </Box>
            </Box>

            <Box
                pb={6}
            >
                <Text
                    fontWeight={"bold"}
                    fontSize={"2xl"}
                >
                    Backup Location
                </Text>
                <Box
                    my={4}
                >
                    {document?.backup_location}
                </Box>
            </Box>


            <Box
                pb={6}
            >
                <Text
                    fontWeight={"bold"}
                    fontSize={"2xl"}
                >
                    Scientific Outputs
                </Text>
                <Box
                    my={4}
                >
                    {document?.scientific_outputs}

                </Box>
            </Box>

        </>

    )
}