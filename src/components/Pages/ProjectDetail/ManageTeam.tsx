// Component for Managing the team for a project

import { Box, Button, Flex, Grid, Text, useColorMode, useDisclosure } from "@chakra-ui/react"

import { AddUserToProjectModal } from "../../Modals/AddUserToProjectModal"
import { TeamMember } from "./TeamMember"
import { BsGripVertical, BsPlus } from "react-icons/bs"
import { useEffect, useState } from "react"
import { IProjectMember } from "../../../types"
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { useUser } from "../../../lib/hooks/useUser"
import { TeamMemberDisplay } from "./TeamMemberDisplay"
import { updateTeamMemberPosition } from "../../../lib/api"
import { useProjectTeam } from "../../../lib/hooks/useProjectTeam"

interface Props {
    // team: IProjectMember[];
    project_id: number;
}

export const ManageTeam = ({
    // team, 
    project_id }: Props) => {
    const [rearrangedTeam, setRearrangedTeam] = useState<IProjectMember[]>([]);
    const [currentlyDraggingIndex, setCurrentlyDraggingIndex] = useState<number | null>(null);
    const [rerenderKey, setRerenderKey] = useState<number>(0);
    const [backgroundColors, setBackgroundColors] = useState<{ [key: number]: string | undefined }>({});


    const { teamData, isTeamLoading, refetchTeamData } = useProjectTeam(String(project_id));


    useEffect(() => {
        if (currentlyDraggingIndex !== null)
            console.log(currentlyDraggingIndex)
    }, [currentlyDraggingIndex])


    const [leaderPk, setLeaderPk] = useState();

    useEffect(() => {
        if (!isTeamLoading) {
            // Sort the team array based on the position (lowest number comes first)
            const sortedTeam = [...teamData].sort((a, b) => a.position - b.position);
            // Find the leader member (assuming only one member has is_leader === true)
            const leaderMember = sortedTeam.find((member) => member.is_leader === true);
            if (leaderMember) {
                // Set the leader's pk
                setLeaderPk(leaderMember.pk);
            }
            setRearrangedTeam(sortedTeam);
        }

    }, [teamData, isTeamLoading, rerenderKey]);

    // useEffect(() => {
    //     if (!isTeamLoading && teamData) {
    //         const sortedTeam = [...teamData].sort((a, b) => a.position - b.position);
    //         setRearrangedTeam(sortedTeam);
    //     }
    // }, [rerenderKey, teamData])


    const { isOpen: isAddUserModalOpen, onOpen: onOpenAddUserModal, onClose: onCloseAddUserModal } = useDisclosure()
    const { colorMode } = useColorMode();



    const handleDragDrop = async (results: any) => {
        setCurrentlyDraggingIndex(null);

        const { source, destination, type } = results;
        if (!destination) return;
        if (destination.droppableId === source.droppableId && source.index === destination.index) return;
        if (type === "group") {
            const reorderedTeam = [...rearrangedTeam];
            const sourceIndex = source.index;
            const destinationIndex = destination.index;
            const [removedItem] = reorderedTeam.splice(sourceIndex, 1);

            let newPosition = 100;
            if (removedItem.is_leader) {
                newPosition = 1;
            } else {
                // Calculate the new positions
                const lowerPosition = rearrangedTeam[destinationIndex - 1]?.position || 0;
                const higherPosition = rearrangedTeam[destinationIndex]?.position || 0;

                if (lowerPosition === higherPosition) {
                    // Keep the removedItem's position as it is but increment the positions of all other items
                    // at each index that is above that position by one.
                    newPosition = removedItem.position;
                    reorderedTeam.forEach((item, index) => {
                        if (index >= destinationIndex) {
                            item.position++;
                        }
                    });
                } else if (lowerPosition + 1 === higherPosition) {
                    // Set the new position one higher than the lower position
                    newPosition = lowerPosition + 1;
                    removedItem.position = newPosition
                    reorderedTeam.forEach((item, index) => {
                        if (index >= destinationIndex) {
                            item.position++;
                        }
                    });
                } else {
                    // Set the new position one higher than the lower position
                    newPosition = lowerPosition + 1;
                    removedItem.position = newPosition;
                }
            }

            reorderedTeam.splice(destinationIndex, 0, removedItem);

            // Update the positions of both users and send the updated reorderedTeam
            const updatedTeam = await updateTeamMemberPosition(project_id, reorderedTeam);
            console.log("Before setRearrangedTeam:", rearrangedTeam);
            console.log("Updated team:", updatedTeam);

            // After 1 second, set the backgroundColor to yellow and then reset it to undefined
            setTimeout(() => {
                const newBackgroundColors = { ...backgroundColors };
                newBackgroundColors[removedItem.user.pk] = "green.400";
                setBackgroundColors(newBackgroundColors);

                setTimeout(() => {
                    setBackgroundColors({});
                }, 250);
            }, 150);


            // setRearrangedTeam(updatedTeam);
            await refetchTeamData()
            setRerenderKey((prevKey) => prevKey + 1);


        }
    };

    // useEffect(() => {
    //     setBackgroundColors({});

    //     setTimeout(() => {
    //         // Reset all background colors to undefined
    //         setBackgroundColors({});
    //     }, 1000);
    // }, [backgroundColors]);




    // useEffect(() => {
    //         // After 1 second, set the backgroundColor to yellow and then reset it to undefined
    //         setTimeout(() => {
    //             const newBackgroundColors = { ...backgroundColors };
    //             newBackgroundColors[removedItem.user.pk] = "green.400";
    //             setBackgroundColors(newBackgroundColors);

    //             setTimeout(() => {
    //                 setBackgroundColors({});
    //             }, 250);
    //         }, 150);


    //         // setRearrangedTeam(updatedTeam);
    //         refetchTeamData()
    // }, [rearrangedTeam])


    const { userLoading, userData } = useUser();

    useEffect(() => {
        if (!isTeamLoading)
            // console.log("TEAM:", team);
            console.log("TEAMDATA:", teamData);

    }, [isTeamLoading, teamData])

    useEffect(() => {
        if (!userLoading)
            console.log(userData)
    }, [userLoading, userData])

    return (
        !userLoading && !isTeamLoading && teamData.length > 0 && leaderPk &&
        (
            <Box
                minH={"100px"}
                key={rerenderKey}

                bg={colorMode === "light" ? "gray.100" : "gray.700"}
                rounded={"lg"}
                mb={4}
                p={4}
                mt={6}
            >
                <Grid
                    gridTemplateColumns={"9fr 3fr"}
                    mb={4}
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
                            _hover={
                                {
                                    bg: colorMode === "light" ? "green.400" : "green.500"
                                }
                            }
                            color={"white"}
                            userSelect={"none"}

                        >
                            Invite Member
                        </Button>
                        <AddUserToProjectModal
                            isOpen={isAddUserModalOpen}
                            onClose={onCloseAddUserModal}
                            preselectedProject={project_id}
                            refetchTeamData={refetchTeamData}
                        />
                    </Flex>
                    <Box>
                        <Text fontSize={"sm"} color={colorMode === "light" ? "gray.600" : "gray.400"}
                            userSelect={"none"}
                        >
                            Click and drag a user to re-arrange order (Leader only), or click their name to adjust their details for this project.
                        </Text>
                    </Box>
                </Grid>

                {
                    // Allow project leader or admin to change order
                    userData.is_superuser
                        || userData.pk === rearrangedTeam.find((tm) => tm.is_leader)?.user.pk

                        ?
                        (
                            <DragDropContext
                                onDragStart={(start) => {
                                    setCurrentlyDraggingIndex(start.source.index);
                                    // console.log(start.source.index)
                                }}

                                onDragEnd={handleDragDrop}
                            >
                                <Droppable
                                    droppableId="ROOT" type="group"
                                >
                                    {(provided) => (
                                        <div {...provided.droppableProps} ref={provided.innerRef}>
                                            {rearrangedTeam.map((tm, index) =>
                                            (
                                                <Draggable
                                                    draggableId={`${tm.pk}`} key={tm.pk} index={index}
                                                >
                                                    {(provided) => (
                                                        <Box
                                                            {...provided.dragHandleProps}
                                                            {...provided.draggableProps}
                                                            ref={provided.innerRef}
                                                            pos={"relative"}
                                                        >
                                                            <TeamMember
                                                                key={index}
                                                                leader_pk={leaderPk}
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
                                                                isCurrentlyDragging={currentlyDraggingIndex === index}
                                                                draggableProps={provided.draggableProps}
                                                                dragHandleProps={provided.dragHandleProps}
                                                                draggingUser={userData}
                                                                backgroundColor={backgroundColors[tm.user.pk] || (colorMode === "light" ? "white" : "gray.800")} // Pass the background color as a prop
                                                                refetchTeamData={refetchTeamData}
                                                            />
                                                            {/* Right Section */}
                                                            <Box
                                                                pos={"absolute"}
                                                                userSelect={"none"}
                                                                right={0}
                                                                top={"20%"}
                                                                h={20}
                                                                p={4}
                                                                flex={1}
                                                            >
                                                                {<BsGripVertical />}
                                                            </Box>

                                                        </Box>
                                                    )}

                                                </Draggable>
                                            ))
                                            }
                                            {provided.placeholder}

                                        </div>
                                    )}
                                </Droppable>

                            </DragDropContext>
                        ) :
                        (
                            <Grid
                                rounded={"xl"}
                                mt={4}
                                overflow="hidden"
                            >
                                {
                                    rearrangedTeam.map((tm, index) =>
                                    (
                                        <TeamMemberDisplay
                                            key={index}
                                            leader_pk={leaderPk}
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
                                            refetchTeamData={refetchTeamData}
                                        />
                                    ))
                                }
                            </Grid>

                        )
                }

            </Box>

        )
    )
}