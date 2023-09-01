// Component for Managing the team for a project

import { Box, Button, Flex, Grid, Text, useColorMode, useDisclosure } from "@chakra-ui/react"

import { AddUserToProjectModal } from "../../Modals/AddUserToProjectModal"
import { TeamMember } from "./TeamMember"
import { BsPlus } from "react-icons/bs"
import { useEffect, useState } from "react"
import { IProjectMember } from "../../../types"


interface Props {
    team: IProjectMember[];
    project_id: number;
}

export const ManageTeam = ({ team, project_id }: Props) => {
    const [rearrangedTeam, setRearrangedTeam] = useState<IProjectMember[]>([]);

    useEffect(() => {
        // Sort the team array based on the position (lowest number comes first)
        const sortedTeam = [...team].sort((a, b) => a.position - b.position);
        setRearrangedTeam(sortedTeam);
    }, [team]);


    const { isOpen: isAddUserModalOpen, onOpen: onOpenAddUserModal, onClose: onCloseAddUserModal } = useDisclosure()
    const { colorMode } = useColorMode();

    return (
        <Box
            minH={"100px"}
            bg={colorMode === "light" ? "gray.50" : "gray.700"}
            rounded={"lg"}
            mb={4}
            p={4}
            mt={6}
        >
            <Grid
                gridTemplateColumns={"repeat(2, 1fr)"}
            >
                <Text
                    fontWeight={"bold"}
                    fontSize={"lg"}
                    color={colorMode === "light" ? "gray.800" : "gray.100"}
                    userSelect={"none"}

                >
                    Project Team
                </Text>

                <Flex
                    w={"100%"}
                    justifyContent={'flex-end'}
                >
                    <Button
                        size={"sm"}
                        onClick={onOpenAddUserModal}
                        leftIcon={<BsPlus />}
                        bg={colorMode === "light" ? "green.500" : "green.600"}
                        color={"white"}
                        userSelect={"none"}

                    >
                        Invite Member
                    </Button>
                    <AddUserToProjectModal isOpen={isAddUserModalOpen} onClose={onCloseAddUserModal} />
                </Flex>
                <Box>
                    <Text fontSize={"sm"} color={colorMode === "light" ? "gray.600" : "gray.400"}
                        userSelect={"none"}
                    >
                        Click and drag a user to re-arrange order (Leader only), or click their name to adjust their details for this project.
                    </Text>
                </Box>
            </Grid>


            <Grid
                rounded={"xl"}
                mt={4}
                overflow="hidden"
            >
                {
                    rearrangedTeam.map((tm, index) =>
                    (
                        <TeamMember
                            key={index}
                            index={index}
                            user_id={tm.user.pk}
                            name={`${tm.user.first_name} ${tm.user.last_name}`}
                            username={tm.user.username}
                            image={tm.user.image}
                            is_leader={tm.is_leader}
                            role={tm.role}
                            position={tm.position}
                            time_allocation={tm.time_allocation}
                            usersCount={rearrangedTeam.length}
                            project_id={project_id}
                        />
                    ))
                }
            </Grid>
        </Box>
    )
}