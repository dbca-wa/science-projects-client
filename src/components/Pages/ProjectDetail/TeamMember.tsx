// Component for showing details regarding a team member. Dragging adjusts the position of the team member.

import { Avatar, Box, Button, Drawer, DrawerBody, DrawerContent, DrawerFooter, DrawerOverlay, Flex, Grid, HStack, Tag, useColorMode, useDisclosure } from "@chakra-ui/react"
import { BsGripVertical } from "react-icons/bs";
import { ProjectUserDetails } from "./ProjectUserDetails";
import { useEffect, useState } from "react";
import { IImageData, IUserData } from "../../../types";
import { FaCrown } from "react-icons/fa";
import { DraggableProvided } from "react-beautiful-dnd"; // Import DraggableProvided


interface ITeamMember {
    user_id: number;
    username: string | null;
    is_leader: boolean;
    leader_pk: number;
    name: string;
    role: string;
    image: IImageData;
    time_allocation: number;
    position: number;
    usersCount: number;
    project_id: number;
    draggableProps: DraggableProvided['draggableProps'];
    dragHandleProps: DraggableProvided['dragHandleProps'];
    isCurrentlyDragging: boolean;
    draggingUser: IUserData;
    backgroundColor: string | undefined; // Add backgroundColor prop
    refetchTeamData: () => void;
}

export const TeamMember = ({ refetchTeamData, user_id, is_leader, leader_pk, name, role, image, time_allocation, position, username, usersCount, project_id,
    isCurrentlyDragging,
    draggableProps,
    dragHandleProps,
    backgroundColor, // Accept backgroundColor prop
    draggingUser,
    // isDragging, // Receive isDragging prop


}: ITeamMember) => {

    // Define your styles for the dragged state
    const { colorMode } = useColorMode();

    useEffect(() => {
        if (isCurrentlyDragging === true)
            console.log(`${name} dragging: ${isCurrentlyDragging}`);
    }, [isCurrentlyDragging])

    const roleColors: { [key: string]: { bg: string; color: string } } = {
        "Research Scientist": { bg: "green.700", color: "white" },
        "Supervising Scientist": { bg: "orange.700", color: "white" },
        "Academic Supervisor": { bg: "blue.500", color: "white" },
        "Supervised Student": { bg: "blue.400", color: "whiteAlpha.900" },
        "Technical Officer": { bg: "orange.900", color: "white" },
        "Consulted Peer": { bg: "green.200", color: "black" },
        "External Collaborator": { bg: "gray.200", color: "black" },
        "External Peer": { bg: "gray.300", color: "black" },
        "Involved Group": { bg: "gray.500", color: "white" },
    };

    type Role = "research" | "supervising" | "academicsuper" | "student" | "technical" | "consulted" | "externalcol" | "externalpeer" | "group";

    const roleDefinitions: [Role, string][] = [
        ["research", "Research Scientist"],
        ["supervising", "Supervising Scientist"],
        ["academicsuper", "Academic Supervisor"],
        ["student", "Supervised Student"],
        ["technical", "Technical Officer"],
        ["consulted", "Consulted Peer"],
        ["externalcol", "External Collaborator"],
        ["externalpeer", "External Peer"],
        ["group", "Involved Group"],
    ];

    const roleArray = roleDefinitions.map(([roleKey, displayName]) => {
        const { bg, color } = roleColors[displayName];
        return {
            role: roleKey,
            displayName: displayName,
            bg: bg,
            color: color,
        };
    });

    const { isOpen: isUserOpen, onOpen: onUserOpen, onClose: onUserClose } = useDisclosure();


    // useEffect(() => {
    //     if (isCurrentlyDragging) {
    //         setBackgroundColor("blue.500")
    //     } else {
    //         // When dragging stops (transition from true to false), flash green and reset to default
    //         setBackgroundColor("green.500");

    //         // After 1 second, reset the background color to default
    //         const timer = setTimeout(() => {
    //             setBackgroundColor(undefined);
    //         }, 1000);

    //         // Clear the timer when component unmounts
    //         return () => clearTimeout(timer);
    //     }


    // }, [isCurrentlyDragging])

    const draggedStyles = {
        background: "blue.500",
        //  colorMode === "light" ? "blue.500" : "blue.500",
        scale: 1.1,
        borderRadius: '10px',
        cursor: 'grabbing',
        zIndex: 999,
    };



    return (
        <>
            <Drawer
                isOpen={isUserOpen}
                placement='right'
                onClose={onUserClose}
                size={"sm"} //by default is xs
            >
                <DrawerOverlay />
                <DrawerContent>

                    <DrawerBody>
                        <ProjectUserDetails
                            project_id={project_id}
                            pk={user_id}
                            is_leader={is_leader}
                            leader_pk={leader_pk}
                            role={role}
                            position={position}
                            time_allocation={time_allocation}
                            usersCount={usersCount}
                            refetchTeamData={refetchTeamData}
                            onClose={onUserClose}
                        />
                    </DrawerBody>

                    <DrawerFooter>
                    </DrawerFooter>
                </DrawerContent>
            </Drawer>

            <HStack
                {...draggableProps}
                {...dragHandleProps}
                style={isCurrentlyDragging ? draggedStyles : {}}

                scale={isCurrentlyDragging ? 1.1 : 1}
                borderRadius={isCurrentlyDragging ? "10px" : "0px"}
                bg={
                    isCurrentlyDragging ? "blue.500" : backgroundColor
                    // isCurrentlyDragging ? "blue.500" : colorMode === "light" ? "white" : "gray.800"
                }
                justifyContent={"space-between"}
                _hover={
                    {
                        boxShadow: colorMode === "light" ?
                            "0px 20px 30px -10px rgba(0, 0, 0, 0.3), 0px 4px 5px -2px rgba(0, 0, 0, 0.06), -3px 0px 10px -2px rgba(0, 0, 0, 0.1), 3px 0px 10px -2px rgba(0, 0, 0, 0.1)"
                            :
                            "0px 4px 6px -1px rgba(255, 255, 255, 0.1), 0px 2px 4px -1px rgba(255, 255, 255, 0.06)",
                        zIndex: 999,

                    }
                }
                border={"1px solid"}
                borderColor={colorMode === "light" ? "gray.200" : "gray.600"}

            >
                {/* Left Section */}
                <Flex
                    p={4}
                >
                    <Box pos={"relative"}>
                        <Avatar
                            src={image?.file ? image.file : image?.old_file ? image.old_file : undefined}
                            userSelect={"none"}
                            onClick={onUserOpen}
                            cursor="pointer"
                        />
                        {is_leader && (
                            <Box
                                pos={"absolute"}
                                color={"yellow.300"}
                                top={-1}
                                right={"33%"}
                            >
                                <FaCrown />
                            </Box>
                        )}

                    </Box>

                    <Grid
                        ml={4}
                        gridTemplateColumns={"repeat(1, 1fr)"}
                        userSelect={"none"}
                    >
                        <Button
                            ml={"2px"}
                            variant={"link"}
                            justifyContent={"start"}
                            colorScheme="blue"
                            onClick={onUserOpen}
                            cursor="pointer"
                            color={isCurrentlyDragging ? "white" : "blue.400"}
                        >
                            {name !== "undefined undefined" && name !== "None None" ? name : username}
                        </Button>
                        <Tag
                            bg={roleArray.find((item) => item.role === role)?.bg ?? ""}
                            color={roleArray.find((item) => item.role === role)?.color ?? ""}
                            size={"sm"}
                            justifyContent={"center"}
                        >
                            {roleArray.find((item) => item.role === role)?.displayName ?? ""}
                        </Tag>
                    </Grid>

                </Flex>


            </HStack>
        </>
    )
}



{/* Right Section
                <Box
                    userSelect={"none"}
                    right={0}
                    h={20}
                    // cursor={isGrabbed ? "grabbing" : "grab"}
                    p={4}
                    flex={1}
                    display="flex"
                    alignItems="center"
                    justifyContent="flex-end"
                >
                    {<BsGripVertical />}
                </Box> */}