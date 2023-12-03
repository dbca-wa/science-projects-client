// Maps out the document provided to the rich text editor components for project plan documents. 

import { Box, Grid, Text, useColorMode } from "@chakra-ui/react"
import { IProjectDocuments, IProjectMember, IProjectPlan, IUserMe } from "../../../types";
import { RichTextEditor } from "../../RichTextEditor/Editors/RichTextEditor";
import { ProjectPlanDocActions } from "./DocActions/ProjectPlanDocActions";
import { useEffect } from "react";
import { useCheckUserInTeam } from "../../../lib/hooks/useCheckUserInTeam";
import { ProjectPlanEndorsements } from "./ProjectPlanEndorsements";
import { useCheckUserIsTeamLeader } from "../../../lib/hooks/useCheckUserIsTeamLeader";

interface Props {
    document: IProjectPlan | null;
    all_documents: IProjectDocuments;
    userData: IUserMe;
    members: IProjectMember[];
    refetch: () => void;
    setToLastTab: () => void;
}

export const ProjectPlanContents = ({
    userData, members,
    all_documents,
    document, refetch,
    setToLastTab,
}: Props) => {


    // Force a rerender when dark mode or year changed to update design and content
    // const editorKey = selectedYear.toString() + colorMode;
    const { colorMode } = useColorMode();

    const documentType = "projectplan"
    const editorKey = colorMode + documentType;
    useEffect(() => { console.log(document) }, [document])

    const mePk = userData?.pk ? userData?.pk : userData?.id;
    const userInTeam = useCheckUserInTeam(mePk, members);
    const userIsLeader = useCheckUserIsTeamLeader(mePk, members);


    // console.log(document?.endorsements)


    return (
        <>
            {/* <DocumentActions /> */}
            <ProjectPlanDocActions
                all_documents={all_documents}
                projectPlanData={document}
                refetchData={refetch}
                setToLastTab={setToLastTab}

            // projectPk={projectPk}
            />

            {/* 

            <Grid
                gridTemplateColumns={"repeat(2, 1fr)"}
                my={4}
                // px={8}
                gridColumnGap={4}
                background={"gray.50"}
                rounded={"lg"}
                p={4}
            >
                <Box
                    background={"gray.100"}
                    rounded={"lg"}
                    p={6}
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

                        <Flex
                            alignItems={"center"}
                        >
                            <Checkbox
                                checked={
                                    involvesPlants
                                }
                                mr={3}
                                onChange={handleTogglePlantsInvolved}
                            />
                            <Box>
                                <Text>Plant Specimen Collection</Text>
                            </Box>

                        </Flex>

                        <Flex
                            alignItems={"center"}
                        >
                            <Checkbox
                                checked={
                                    involvesAnimals
                                }
                                mr={3}
                                onChange={handleToggleAnimalsInvolved}
                            />
                            <Box>
                                <Text>Interaction with Vertebrate Animals</Text>
                            </Box>

                        </Flex>
                    </Grid>

                </Box>


                <Box
                    background={"gray.100"}
                    rounded={"lg"}
                    p={6}


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
                        {
                            document?.endorsements && (

                                <Flex
                                    alignItems={"center"}
                                >

                                    <Switch
                                        defaultChecked={
                                            document.endorsements.hc_endorsement === true
                                        }
                                        mr={3}
                                        isDisabled={!herbCuratorInteractable}
                                    />
                                    <Box>
                                        <Text>Herbarium Curator's Endorsement</Text>
                                    </Box>

                                </Flex>

                            )
                        }


                        {
                            document?.endorsements && (
                                <Flex
                                    alignItems={"center"}

                                >
                                    <Switch
                                        defaultChecked={
                                            document.endorsements.ae_endorsement === true
                                        }
                                        mr={3}
                                        isDisabled={!aecInteractable}
                                    />
                                    <Box>
                                        <Text>Animal Ethics Committee's Endorsement</Text>
                                    </Box>
                                </Flex>
                            )
                        }
                    </Grid>
                </Box>
            </Grid>
 */}


            <ProjectPlanEndorsements
                document={document}
                userIsLeader={userIsLeader}
                userData={userData}
                refetchDocument={refetch}
            // isProjectLeader={}
            />


            <RichTextEditor
                canEdit={userInTeam || userData?.is_superuser}
                document_pk={document?.document?.pk}
                project_pk={document?.document?.project?.pk}
                writeable_document_kind={'Project Plan'}
                writeable_document_pk={document?.pk}
                isUpdate={true}
                editorType="ProjectDocument"
                key={`background${editorKey}`} // Change the key to force a re-render
                data={document?.background}
                section={"background"}
            />

            <RichTextEditor
                canEdit={userInTeam || userData?.is_superuser}
                document_pk={document?.document?.pk}
                project_pk={document?.document?.project?.pk}
                writeable_document_kind={'Project Plan'}
                writeable_document_pk={document?.pk}
                isUpdate={true}

                editorType="ProjectDocument"
                key={`aims${editorKey}`} // Change the key to force a re-render
                data={document?.aims}
                section={"aims"}
            />

            <RichTextEditor
                canEdit={userInTeam || userData?.is_superuser}
                document_pk={document?.document?.pk}
                project_pk={document?.document?.project?.pk}
                writeable_document_kind={'Project Plan'}
                writeable_document_pk={document?.pk}
                isUpdate={true}

                editorType="ProjectDocument"
                key={`outcome${editorKey}`} // Change the key to force a re-render
                data={document?.outcome}
                section={"outcome"}
            />
            <RichTextEditor
                canEdit={userInTeam || userData?.is_superuser}
                document_pk={document?.document?.pk}
                project_pk={document?.document?.project?.pk}
                writeable_document_kind={'Project Plan'}
                writeable_document_pk={document?.pk}
                isUpdate={true}

                editorType="ProjectDocument"
                key={`knowledge_transfer${editorKey}`} // Change the key to force a re-render
                data={document?.knowledge_transfer}
                section={"knowledge_transfer"}
            />
            <RichTextEditor
                canEdit={userInTeam || userData?.is_superuser}
                document_pk={document?.document?.pk}
                project_pk={document?.document?.project?.pk}
                writeable_document_kind={'Project Plan'}
                writeable_document_pk={document?.pk}
                isUpdate={true}

                editorType="ProjectDocument"
                key={`project_tasks${editorKey}`} // Change the key to force a re-render
                data={document?.project_tasks}
                section={"project_tasks"}
            />

            <Box
                pb={6}
                mt={4}
            >
                <Text
                    fontWeight={"bold"}
                    fontSize={"2xl"}
                >
                    Funding
                </Text>
                <Grid
                    mt={4}
                    // gridRowGap={10}
                    gridTemplateColumns={"repeat(1, 1fr)"}
                >
                    <RichTextEditor
                        canEdit={userInTeam || userData?.is_superuser}
                        document_pk={document?.document?.pk}
                        project_pk={document?.document?.project?.pk}
                        writeable_document_kind={'Project Plan'}
                        writeable_document_pk={document?.pk}
                        isUpdate={true}

                        editorType="ProjectDocument"
                        key={`budget${editorKey}`} // Change the key to force a re-render
                        data={document?.operating_budget}
                        section={"operating_budget"}
                    />

                    <RichTextEditor
                        canEdit={userInTeam || userData?.is_superuser}
                        document_pk={document?.document?.pk}
                        project_pk={document?.document?.project?.pk}
                        writeable_document_kind={'Project Plan'}
                        writeable_document_pk={document?.pk}
                        isUpdate={true}

                        editorType="ProjectDocument"
                        key={`externalbudget${editorKey}`} // Change the key to force a re-render
                        data={document?.operating_budget_external}
                        section={"operating_budget_external"}
                    />
                </Grid>
            </Box>



            <Box
                pb={6}
                mt={4}
            >
                <Text
                    fontWeight={"bold"}
                    fontSize={"2xl"}
                >
                    Other
                </Text>
                <Grid
                    mt={4}
                    // gridRowGap={10}
                    gridTemplateColumns={"repeat(1, 1fr)"}
                >

                    <RichTextEditor
                        canEdit={userInTeam || userData?.is_superuser}
                        document_pk={document?.document?.pk}
                        project_pk={document?.document?.project?.pk}
                        writeable_document_kind={'Project Plan'}
                        writeable_document_pk={document?.pk}
                        isUpdate={true}

                        editorType="ProjectDocument"
                        key={`related_projects${editorKey}`} // Change the key to force a re-render
                        data={document?.related_projects}
                        section={"related_projects"}
                    />
                    <RichTextEditor
                        canEdit={userInTeam || userData?.is_superuser}
                        document_pk={document?.document?.pk}
                        project_pk={document?.document?.project?.pk}
                        writeable_document_kind={'Project Plan'}
                        writeable_document_pk={document?.pk}
                        isUpdate={true}

                        editorType="ProjectDocument"
                        key={`listed_references${editorKey}`} // Change the key to force a re-render
                        data={document?.listed_references}
                        section={"listed_references"}
                    />


                    <RichTextEditor
                        canEdit={userInTeam || userData?.is_superuser}
                        document_pk={document?.document?.pk}
                        project_pk={document?.document?.project?.pk}
                        writeable_document_kind={'Project Plan'}
                        writeable_document_pk={document?.pk}
                        isUpdate={true}

                        editorType="ProjectDocument"
                        key={`data_management${editorKey}`} // Change the key to force a re-render
                        data={document?.endorsements?.data_management}
                        section={"data_management"}
                    />

                    <RichTextEditor
                        canEdit={userInTeam || userData?.is_superuser}
                        document_pk={document?.document?.pk}
                        project_pk={document?.document?.project?.pk}
                        writeable_document_kind={'Project Plan'}
                        writeable_document_pk={document?.pk}
                        isUpdate={true}

                        editorType="ProjectDocument"
                        key={`methodology${editorKey}`} // Change the key to force a re-render
                        data={document?.methodology}
                        section={"methodology"}
                    />
                    <RichTextEditor
                        canEdit={userInTeam || userData?.is_superuser}
                        document_pk={document?.document?.pk}
                        project_pk={document?.document?.project?.pk}
                        writeable_document_kind={'Project Plan'}
                        writeable_document_pk={document?.pk}
                        isUpdate={true}

                        editorType="ProjectDocument"
                        key={`no_specimens${editorKey}`} // Change the key to force a re-render
                        data={document?.endorsements?.no_specimens}
                        section={"specimens"}
                    />


                </Grid>
            </Box>


            {/* <SimpleRichTextEditor
                key={`no_specimens${editorKey}`} // Change the key to force a re-render
                data={document?.endorsemeents?.no_specimens}
                section={"specimens"}
            /> */}

        </>
    )
}