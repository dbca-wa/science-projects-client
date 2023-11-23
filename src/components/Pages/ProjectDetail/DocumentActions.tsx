// Used for all documents. WIP - need to update the content shown based on doc, and parametise the document sent in.

import { Box, Button, Center, Collapse, Flex, Grid, GridItem, Tag, Text, useColorMode } from '@chakra-ui/react'
import { useEffect, useState } from 'react';
import { IConceptPlan, IProgressReport, IProjectClosure, IProjectData, IProjectDocuments, IProjectPlan, IStudentReport } from '../../../types';


interface IDocumentActions {
    tabType: string;
    document: IConceptPlan | IProjectPlan | IProgressReport | IStudentReport | IProjectClosure | null | undefined;
    projectPk: number;
}


export const DocumentActions = ({ tabType, document, projectPk }: IDocumentActions) => {
    const [showActions, setShowActions] = useState(false);
    const handleToggleActionsVisibility = () => {
        setShowActions(!showActions);
    }
    const { colorMode } = useColorMode();

    useEffect(() => {
        console.log(document)

    }, [])
    return (
        <Box
            bg={colorMode === "light" ? "gray.100" : "gray.700"}
            rounded={"lg"}
            p={4}
            my={6}

        >
            <Flex
                w={"100%"}
            >
                <Text
                    flex={1}
                    fontWeight={"bold"}
                    fontSize={"lg"}
                    color={colorMode === "light" ? "gray.800" : "gray.100"}
                    userSelect={"none"}
                    pb={4}
                >
                    Document Actions
                </Text>
                <Tag
                    bg={"green.500"}
                    color={"white"}
                >
                    STATUS
                </Tag>
            </Flex>

            {tabType === "overview" ?
                (
                    <Grid mb={4} gridGap={4} gridTemplateColumns={"1fr 1fr"}>
                        {/* <Button

                            bgColor={colorMode === "light" ? `blue.500` : `blue.600`}
                            color={colorMode === "light" ? `white` : `whiteAlpha.900`}
                            _hover={{
                                bg: colorMode === "light" ? `blue.600` : `blue.400`,
                                color: colorMode === "light" ? `white` : `white`
                            }} onClick={
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
                            bgColor={colorMode === "light" ? `blue.500` : `blue.600`}
                            color={colorMode === "light" ? `white` : `whiteAlpha.900`}
                            _hover={{
                                bg: colorMode === "light" ? `blue.600` : `blue.400`,
                                color: colorMode === "light" ? `white` : `white`
                            }}
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
                            bgColor={colorMode === "light" ? `blue.500` : `blue.600`}
                            color={colorMode === "light" ? `white` : `whiteAlpha.900`}
                            _hover={{
                                bg: colorMode === "light" ? `blue.600` : `blue.400`,
                                color: colorMode === "light" ? `white` : `white`
                            }}
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
                            bgColor={colorMode === "light" ? `blue.500` : `blue.600`}
                            color={colorMode === "light" ? `white` : `whiteAlpha.900`}
                            _hover={{
                                bg: colorMode === "light" ? `blue.600` : `blue.400`,
                                color: colorMode === "light" ? `white` : `white`
                            }}
                            isDisabled={!documents?.project_plan}
                        >
                            Create Student Report
                        </Button>

                        <Button
                            gridColumn="span 2"
                            bgColor={colorMode === "light" ? `red.500` : `red.600`}
                            color={colorMode === "light" ? `white` : `whiteAlpha.900`}
                            _hover={{
                                bg: colorMode === "light" ? `red.600` : `red.400`,
                                color: colorMode === "light" ? `white` : `white`
                            }}
                            onClick={
                                async () => {
                                    await spawnDocument({ project_pk: projectData.pk, kind: "projectclosure" })
                                }
                            }
                            isDisabled={documents?.project_closure !== null}>
                            Create Project Closure
                        </Button> */}
                    </Grid>
                ) :
                tabType === "concept" ? (
                    <Box>
                        Concept Plan (Project: {projectPk}, Pk: {document?.pk})
                    </Box>
                )
                    :
                    tabType === "project" ? (
                        <Box>
                            Project Plan  (Project: {projectPk}, Pk: {document?.pk})
                        </Box>
                    )
                        :
                        tabType === "progress" ? (
                            <Box>
                                Progress Reports  (Project: {projectPk}, Pk: {document?.pk})
                            </Box>
                        )
                            :
                            tabType === "student" ? (
                                <Box>
                                    Student Reports  (Project: {projectPk}, Pk: {document?.pk})
                                </Box>
                            )
                                :
                                tabType === "closure" ? (
                                    <Box>
                                        Closure  (Project: {projectPk}, Pk: {document.pk})
                                    </Box>
                                )
                                    :
                                    (<Box>
                                        Unimplemented: neither concept, progress, student, project, closure
                                    </Box>)
            }
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
        </Box>
    )
}