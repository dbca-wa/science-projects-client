// Used for all documents. WIP - need to update the content shown based on doc, and parametise the document sent in.

import { Box, Button, Center, Collapse, Flex, Grid, GridItem, Tag, Text } from '@chakra-ui/react'
import { useState } from 'react';
import { IProjectData, IProjectDocuments } from '../../../types';
import { spawnDocument } from '../../../lib/api';


interface IDocumentActions {
    tabType: string;
    documents: IProjectDocuments | null | undefined;
    projectData: IProjectData;
}


export const DocumentActions = ({ tabType, documents, projectData }: IDocumentActions) => {
    const [showActions, setShowActions] = useState(false);
    const handleToggleActionsVisibility = () => {
        setShowActions(!showActions);
    }

    return (
        <>
            {tabType === "overview" ?
                (
                    <Grid mb={4} gridGap={4} gridTemplateColumns={"1fr 1fr"}>
                        <Button

                            colorScheme='blue'
                            onClick={
                                async () => {
                                    await spawnDocument({ project_pk: projectData.pk, kind: "concept" })
                                }
                            }
                            isDisabled={documents?.concept_plan !== null}
                        >
                            Create Concept Plan
                        </Button>
                        <Button
                            onClick={
                                async () => {
                                    await spawnDocument({ project_pk: projectData.pk, kind: "projectplan" })
                                }
                            }
                            colorScheme='blue'

                            isDisabled={!documents?.concept_plan}
                        >
                            Create Project Plan
                        </Button>
                        <Button
                            onClick={
                                async () => {
                                    await spawnDocument({ project_pk: projectData.pk, kind: "progressreport" })
                                }
                            }
                            colorScheme='blue'

                            isDisabled={!documents?.project_plan}
                        >
                            Create Progress Report
                        </Button>
                        <Button
                            onClick={
                                async () => {
                                    await spawnDocument({ project_pk: projectData.pk, kind: "studentreport" })
                                }
                            }
                            colorScheme='blue'

                            isDisabled={!documents?.project_plan}
                        >
                            Create Student Report
                        </Button>

                        <Button gridColumn="span 2" colorScheme='red'
                            onClick={
                                async () => {
                                    await spawnDocument({ project_pk: projectData.pk, kind: "projectclosure" })
                                }
                            }
                            isDisabled={documents?.project_closure !== null}>
                            Create Project Closure
                        </Button>
                    </Grid>
                ) : (<Box>Bye</Box>)}
            {/* <Grid
                mb={4}
                gridTemplateColumns={"repeat(1, 1fr)"}
            >
                <Grid
                    gridTemplateColumns={"repeat(2, 1fr)"}
                >
                    <Center>
                        <Text
                            fontWeight={"bold"}
                        >
                            Progress:
                        </Text>
                    </Center>
                    <Button
                        as={Tag}
                        colorScheme='green'
                        size={"sm"}
                    >
                        Approved
                    </Button>
                </Grid>
                <Box
                    py={3}
                    justifyContent={"right"}
                    width={"100%"}
                    textAlign={"center"}
                >
                    <Text
                        fontSize={"sm"}
                        color={"gray.500"}
                    >
                        Last updated by Jarid Prince on 05/05/2023
                    </Text>
                </Box>
  
                <Flex
                    width={"100%"}
                    justifyContent={"center"}
                >
                    <Button onClick={handleToggleActionsVisibility}
                        colorScheme='blue'
                        my={2}
                        width={"100%"}
                    >
                        {showActions ? 'Hide Actions' : 'Document Actions'}
                    </Button>
                </Flex>

                <Collapse in={showActions} animateOpacity>
                    <Flex my={4} flexDirection={"column"}
                        rounded={"2xl"}
                        border={"1px"}
                        borderColor={"gray.300"}
                        mb={1}
                        p={6}
                    >
                        <Text fontWeight={"bold"}>
                            Actions
                        </Text>
                        <Box>
                            <Grid gridTemplateColumns={"repeat(2, 1fr)"}>
                                <Box>
                                    <Text>Status</Text>
                                </Box>
                                <Center
                                    justifyContent={"right"}
                                    textAlign={"right"}
                                >
                                    <Button
                                        size={"xs"}
                                        colorScheme='green'
                                        as={Tag}
                                    >
                                        Approved
                                    </Button>
                                </Center>
                            </Grid>
                            <Text>Your Actions</Text>
                            <Text>Document History</Text>
                            <Text>Created by ~~ on ~~</Text>
                        </Box>
                        <Flex width={"100%"} justifyContent={"right"} my={4}>
                            <Button colorScheme='blue'
                                size={"xs"}
                            >
                                Show previous versions
                            </Button>
                        </Flex>
                    </Flex>
                </Collapse>
            </Grid> */}
        </>
    )
}