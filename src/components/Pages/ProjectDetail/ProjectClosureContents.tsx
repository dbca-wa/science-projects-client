// Maps out the document provided to the rich text editor components for project closure documents. 


import { Box, Flex, Grid, Select, Text, useColorMode } from "@chakra-ui/react"
import { IProjectClosure, IProjectDocuments, IProjectMember, IUserMe } from "../../../types"
import { DocumentActions } from "./DocumentActions"
import { RichTextEditor } from "../../RichTextEditor/Editors/RichTextEditor";
import { useEffect, useState } from "react";
import { useCheckUserInTeam } from "../../../lib/hooks/useCheckUserInTeam";
import { useCheckUserIsTeamLeader } from "../../../lib/hooks/useCheckUserIsTeamLeader";
import { ProjectClosureDocActions } from "./DocActions/ProjectClosureDocActions";

interface Props {
    document: IProjectClosure | null;
    all_documents: IProjectDocuments;
    userData: IUserMe;
    members: IProjectMember[];
    refetch: () => void;
}

export const ProjectClosureContents = ({
    userData, members,
    all_documents,
    document, refetch,
}: Props) => {

    const { colorMode } = useColorMode();
    const documentType = "closure"
    const editorKey = colorMode + documentType;
    useEffect(() => {
        console.log(document)
    }, [document])


    const mePk = userData?.pk ? userData?.pk : userData?.id;
    const userInTeam = useCheckUserInTeam(mePk, members);
    const userIsLeader = useCheckUserIsTeamLeader(mePk, members);

    useEffect(() => {
        console.log(userData)
        console.log(userInTeam)
    }, [userData, userInTeam])

    // const [isLoading, setIsLoading] = useState(false);
    const [selectedOutcome, setSelectedOutcome] = useState<string>(document?.intended_outcome);
    const potentialOutcomes = ["completed", "terminated", "suspended", "forcecompleted"]

    const handleNewOutcomeSelection = (event) => {
        // setIsLoading(true);
        setSelectedOutcome(event.target.value)
    }

    useEffect(() => {
        console.log(selectedOutcome)
    }, [selectedOutcome])

    return (
        <>
            {/* <DocumentActions /> */}
            <ProjectClosureDocActions
                all_documents={all_documents}
                projectClosureData={document}
                refetchData={refetch}
            // projectPk={projectPk}
            />

            <Flex
                width={"100%"}
                mb={8}
                p={2}
                px={4}
                border={'1px solid'}
                borderColor={"gray.200"}
                rounded={"2xl"}
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
                        Select an Intended Outcome:
                    </Text>

                </Flex>
                <Flex
                    justifyContent={"flex-end"}
                >
                    <Select
                        value={
                            selectedOutcome}
                        onChange={(event) =>
                            handleNewOutcomeSelection(event)
                        }
                        minW={"200px"}
                    >
                        {potentialOutcomes.map(outcome => (
                            <option key={outcome} value={outcome}>
                                {outcome === "forcecompleted" ? "Force Completed" : (outcome.charAt(0).toUpperCase() + outcome.slice(1))}
                            </option>
                        ))}
                    </Select>
                </Flex>
            </Flex>


            {/* <RichTextEditor
                canEdit={userInTeam || userData?.is_superuser}
                document_pk={document?.document?.pk}
                project_pk={document?.document?.project?.pk}
                writeable_document_kind={'Project Closure'}
                writeable_document_pk={document?.pk}
                isUpdate={true}
                editorType="ProjectDocument"
                key={`intended_outcome${editorKey}`} // Change the key to force a re-render
                data={document?.intended_outcome}
                section={"intended_outcome"}
            /> */}

            <RichTextEditor
                canEdit={userInTeam || userData?.is_superuser}
                document_pk={document?.document?.pk}
                project_pk={document?.document?.project?.pk}
                writeable_document_kind={'Project Closure'}
                writeable_document_pk={document?.pk}
                isUpdate={true}
                editorType="ProjectDocument"
                key={`reason${editorKey}`} // Change the key to force a re-render
                data={document?.reason}
                section={"reason"}
            />



            <RichTextEditor
                canEdit={userInTeam || userData?.is_superuser}
                document_pk={document?.document?.pk}
                project_pk={document?.document?.project?.pk}
                writeable_document_kind={'Project Closure'}
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
                writeable_document_kind={'Project Closure'}
                writeable_document_pk={document?.pk}
                isUpdate={true}
                editorType="ProjectDocument"
                key={`data_location${editorKey}`} // Change the key to force a re-render
                data={document?.data_location}
                section={"data_location"}
            />
            <RichTextEditor
                canEdit={userInTeam || userData?.is_superuser}
                document_pk={document?.document?.pk}
                project_pk={document?.document?.project?.pk}
                writeable_document_kind={'Project Closure'}
                writeable_document_pk={document?.pk}
                isUpdate={true}
                editorType="ProjectDocument"
                key={`hardcopy_location${editorKey}`} // Change the key to force a re-render
                data={document?.hardcopy_location}
                section={"hardcopy_location"}
            />
            <RichTextEditor
                canEdit={userInTeam || userData?.is_superuser}
                document_pk={document?.document?.pk}
                project_pk={document?.document?.project?.pk}
                writeable_document_kind={'Project Closure'}
                writeable_document_pk={document?.pk}
                isUpdate={true}
                editorType="ProjectDocument"
                key={`backup_location${editorKey}`} // Change the key to force a re-render
                data={document?.backup_location}
                section={"backup_location"}
            />
            <RichTextEditor
                canEdit={userInTeam || userData?.is_superuser}
                document_pk={document?.document?.pk}
                project_pk={document?.document?.project?.pk}
                writeable_document_kind={'Project Closure'}
                writeable_document_pk={document?.pk}
                isUpdate={true}
                editorType="ProjectDocument"
                key={`scientific_outputs${editorKey}`} // Change the key to force a re-render
                data={document?.scientific_outputs}
                section={"scientific_outputs"}
            />

        </>
    )
}

