import { Box, Text, Center, Flex, Spinner, useColorMode } from "@chakra-ui/react"
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useProject } from "../../../lib/hooks/useProject";
import { IProjectMember } from "../../../types";
import { Head } from "../../Base/Head";
import { ManageTeam } from "../ProjectDetail/ManageTeam";

export const ProjectMembershipsCRUDDetail = () => {
    const { projectPk } = useParams();
    const { isLoading, projectData } = useProject(projectPk);

    const [members, setMembers] = useState<IProjectMember[]>([]);


    useEffect(() => {
        if (!isLoading && projectData) {
            setMembers(projectData.members);
        }
    }, [isLoading, projectData])

    const { colorMode } = useColorMode();

    return (
        isLoading ? (
            <>
                <Flex
                    w={"100%"}
                    h={"100%"}
                >
                    <Center
                        w={"100%"}
                        h={"100%"}
                        py={20}
                    >
                        <Spinner
                            size={"xl"}
                            color="gray.500"
                        />
                    </Center>
                </Flex>
            </>
        )
            :
            (
                <>
                    <Head title={projectData?.project?.title} />
                    <Text
                        fontWeight={"semibold"}
                        fontSize={"xl"}
                    >
                        {projectData.project.title}

                    </Text >
                    {/* <ManageTeam /> */}
                    < ManageTeam
                        // team={members}
                        project_id={projectPk !== undefined ? Number(projectPk) : 0
                        }
                    />

                </>
            )
    )
}