// Maps out the document provided to the rich text editor components for project plan documents. 

import { Box, Checkbox, Grid, Text } from "@chakra-ui/react"
import { DocumentActions } from "./DocumentActions"
import { IProjectPlan } from "../../../types";

interface Props {
    document: IProjectPlan | null;
}

export const ProjectPlanContents = ({ document }: Props) => {
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
                    Background
                </Text>
                <Box
                    mt={4}
                >
                    {document?.background ? document.background : "This document has no background"}
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
                    // ml={8}
                    my={4}
                >

                    {document?.aims ? document.aims : "This document has no aims"}

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
                    // ml={8}
                    my={4}
                >
                    {document?.outcome ? document.outcome : "This program has no outcomes"}
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
                    mt={4}
                >
                    {document?.knowledge_transfer ? document?.knowledge_transfer : "This document has no knowledge transfer"}

                </Box>
            </Box>

            <Box
                pb={6}
            >
                <Text
                    fontWeight={"bold"}
                    fontSize={"2xl"}
                >
                    Tasks and Milestones
                </Text>
                <Box
                    // ml={8}
                    my={4}
                >
                    {document?.project_tasks ? document.project_tasks : "This document has no project tasks"}

                </Box>

            </Box>

            <Box
                pb={6}
            >
                <Text
                    fontWeight={"bold"}
                    fontSize={"2xl"}
                >
                    Related Science Projects
                </Text>
                <Box
                    mt={4}
                >
                    {document?.related_projects ? document.related_projects : "This document has no related projects"}
                </Box>
            </Box>

            <Box
                pb={6}
            >
                <Text
                    fontWeight={"bold"}
                    fontSize={"2xl"}
                >
                    References
                </Text>
                <Box
                    mt={4}
                >
                    {document?.listed_references ? document.listed_references : "This document has no refrences"}
                </Box>
            </Box>


            <Box
                pb={6}
            >
                <Text
                    fontWeight={"bold"}
                    fontSize={"2xl"}
                >
                    Data Management
                </Text>
                <Box
                    mt={4}
                >
                    {document?.endorsemeents?.data_management ? document?.endorsemeents?.data_management : "This document has no data management information"}
                </Box>
            </Box>

            <Box
                pb={6}
            >
                <Text
                    fontWeight={"bold"}
                    fontSize={"2xl"}
                >
                    Methodology
                </Text>
                <Box
                    mt={4}
                >
                    {document?.methodology ? document.methodology : "This document has no methodology"}
                </Box>
            </Box>

            <Box
                pb={6}
            >
                <Text
                    fontWeight={"bold"}
                    fontSize={"2xl"}
                >
                    No. of Specimens
                </Text>
                <Box
                    mt={4}
                >
                    {document?.endorsemeents?.no_specimens ? document.endorsemeents.no_specimens : "This document has no specimen data"}
                </Box>
            </Box>


            <Box
                pb={6}
            >
                <Text
                    fontWeight={"bold"}
                    fontSize={"2xl"}
                >
                    Endorsements
                </Text>
                <Grid
                    mt={4}
                >
                    <Box>
                        Herbarium Curator's Endorsement
                        {
                            document?.endorsemeents && (
                                <Checkbox
                                    checked={
                                        document.endorsemeents.hc_endorsement
                                    }
                                />

                            )
                        }
                    </Box>
                    <Box>
                        Animal Ethics Committee's Endorsement
                        {
                            document?.endorsemeents && (
                                <Checkbox
                                    checked={
                                        document.endorsemeents.ae_endorsement
                                    }
                                />

                            )
                        }
                    </Box>
                </Grid>

            </Box>


            <Box
                pb={6}
            >
                <Text
                    fontWeight={"bold"}
                    fontSize={"2xl"}
                >
                    Funding
                </Text>
                <Grid
                    mt={4}
                >
                    <Box>
                        External Funds: {document?.operating_budget_external}
                    </Box>
                    <Box>
                        Consolidated Funds: {document?.operating_budget}
                    </Box>
                </Grid>

            </Box>

            <Box
                pb={6}
            >
                <Text
                    fontWeight={"bold"}
                    fontSize={"2xl"}
                >
                    Involves
                </Text>
                <Grid
                    mt={4}
                >
                    <Box>
                        Plant Specimen Collection
                        <Checkbox
                            checked={
                                document?.involves_plants
                            }
                        />
                    </Box>
                    <Box>
                        Interaction with Vertebrate Animals
                        <Checkbox
                            checked={
                                document?.involves_animals
                            }
                        />

                    </Box>
                </Grid>

            </Box>

        </>
    )
}