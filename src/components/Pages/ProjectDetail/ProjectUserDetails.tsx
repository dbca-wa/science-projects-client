// Component that shows the details of a project member, including their role, time allocation, whether they are the leader, and their position in 
// the manage team component (drag and droppable by Admins and leader)

import { Avatar, Image, Box, Button, Center, Flex, Grid, Icon, Spacer, Spinner, Text, useColorMode, Slider, SliderTrack, SliderFilledTrack, SliderThumb, FormControl, InputGroup, Select, FormHelperText, useToast, ToastId, Input } from "@chakra-ui/react"
import { FiCopy } from "react-icons/fi";
import { FcApproval } from "react-icons/fc";
import { AiFillCloseCircle } from "react-icons/ai";
import { useEffect, useRef, useState } from "react";
import { useFullUserByPk } from "../../../lib/hooks/useFullUserByPk";
import { useFormattedDate } from "../../../lib/hooks/useFormattedDate";
import { useCopyText } from "../../../lib/hooks/useCopyText";
import { useUser } from "../../../lib/hooks/useUser";
import { RemoveUserMutationType, promoteUserToLeader, removeTeamMemberFromProject, updateProjectMember } from "../../../lib/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

interface Props {
    pk: number;
    is_leader: boolean;
    leader_pk: number;
    role: string;
    position: number;
    time_allocation: number;
    usersCount: number;
    project_id: number;
    shortCode: number | string;
    refetchTeamData: () => void;
    onClose: () => void;
}

export const ProjectUserDetails = ({ onClose, pk, is_leader, leader_pk,
    role, shortCode, position, time_allocation, usersCount, project_id, refetchTeamData }: Props) => {

    const { userLoading: loading, userData: user } = useFullUserByPk(pk);
    const formatted_date = useFormattedDate(user?.date_joined);

    const { colorMode } = useColorMode();
    const borderColor = colorMode === "light" ? "gray.300" : "gray.500";
    const sectionTitleColor = colorMode === "light" ? "gray.600" : "gray.300";
    const subsectionTitleColor = colorMode === "light" ? "gray.500" : "gray.500"

    const copyEmail = useCopyText(user?.email);

    const me = useUser();

    const [fteValue, setFteValue] = useState(time_allocation);
    const [userRole, setUserRole] = useState(role);
    const [shortCodeValue, setShortCodeValue] = useState(shortCode);

    useEffect(() => {
        if (userRole && userRole !== role) {
            // POST TO API HERE
            console.log(project_id)

        }
    }, [userRole])


    useEffect(() => {
        if (fteValue && fteValue !== time_allocation) {
            // POST TO API HERE
            console.log(project_id)
        }
    }, [fteValue])

    const handleUpdateRole = (newRole: string) => {
        setUserRole(newRole);
    }

    const handleUpdateFTE = (newFTE: number) => {
        console.log(`Changed to ${newFTE}`)
        setFteValue(newFTE);
    }

    const humanReadableRoleName = (role: string) => {

        let humanReadable = ""

        switch (role) {
            case "academicsuper":
                humanReadable = "Academic Supervisor"
                break;
            case "consulted":
                humanReadable = "Consulted Peer"
                break;
            case "externalcol":
                humanReadable = "External Collaborator"
                break;
            case "externalpeer":
                humanReadable = "External Peer"
                break;
            case "group":
                humanReadable = "Involved Group"
                break;
            case "research":
                humanReadable = "Research Scientist"
                break;
            case "supervising":
                humanReadable = "Supervising Scientist"
                break;
            case "student":
                humanReadable = "Supervised Student"
                break;
            case "technical":
                humanReadable = "Technical Officer"
                break;

            default:
                humanReadable = "None"
                break;
        }
        return humanReadable
    }

    const removeThisUser = () => {
        if (!is_leader && usersCount > 1) {
            const user_pk = user.pk;
            const formData: RemoveUserMutationType = {
                user: user_pk,
                project: project_id,
            };
            console.log(formData);
            console.log("removing");
            removeUserMutation.mutate(formData);
        }
    };

    const promoteThisUser = () => {
        if (!is_leader) {
            console.log(
                "This user is not the leader, so this section will perform demotion of the previous leader, and promotion of this user to leader. Their positions will swap."
            );
            const user_pk = user.pk;
            const formData: RemoveUserMutationType = {
                user: user_pk,
                project: project_id,
            };
            console.log(formData);
            console.log("promoting");
            promoteUserMutation.mutate(formData);
        }
    }



    // Toast
    const toast = useToast();
    const toastIdRef = useRef<ToastId>();
    const addToast = (data: any) => {
        toastIdRef.current = toast(data)
    }


    // removeUserMutation.mutate()
    // await removeTeamMemberFromProject({ user: user.pk, project: project_id });
    const queryClient = useQueryClient();
    const navigate = useNavigate();


    const updateProjectUser = (formData: any) => {
        console.log(formData);
        updateMemberMutation.mutate(formData);
    }

    const updateMemberMutation = useMutation(updateProjectMember,
        {
            onMutate: () => {
                console.log("Updating Project Membership");

                addToast({
                    status: "loading",
                    title: "Updating Project Membership",
                    position: "top-right"
                })
            },

            onSuccess: (data) => {
                if (toastIdRef.current) {
                    toast.update(toastIdRef.current, {
                        title: 'Success',
                        description: `User Updated`,
                        status: 'success',
                        position: "top-right",
                        duration: 3000,
                        isClosable: true,
                    })
                }
                // reset()

                setTimeout(
                    // async 
                    () => {
                        // await 
                        queryClient.invalidateQueries(
                            [
                                "projects",
                                project_id
                            ]
                        );

                        refetchTeamData && refetchTeamData();
                        // const url = 
                        if (!location.pathname.includes('project')) {
                            navigate(`/projects/${project_id}`);
                        } else {
                            onClose();
                        }
                    }, 350)


            },
            onError: (error) => {
                console.log(error);
                if (toastIdRef.current) {
                    toast.update(toastIdRef.current, {
                        title: 'Could Not Promote User',
                        description: `${error}`,
                        status: 'error',
                        position: "top-right",
                        duration: 3000,
                        isClosable: true,
                    })
                }
            }

        })


    const promoteUserMutation = useMutation(promoteUserToLeader,
        {
            onMutate: () => {
                console.log("Promoting user");

                addToast({
                    status: "loading",
                    title: "Promoting Member",
                    position: "top-right"
                })
            },

            onSuccess: (data) => {
                if (toastIdRef.current) {
                    toast.update(toastIdRef.current, {
                        title: 'Success',
                        description: `User Promoted`,
                        status: 'success',
                        position: "top-right",
                        duration: 3000,
                        isClosable: true,
                    })
                }
                // reset()

                setTimeout(
                    // async 
                    () => {
                        // await 
                        queryClient.invalidateQueries(
                            [
                                "projects",
                                project_id
                            ]
                        );

                        refetchTeamData && refetchTeamData();
                        // const url = 
                        if (!location.pathname.includes('project')) {
                            navigate(`/projects/${project_id}`);
                        } else {
                            onClose();
                        }
                    }, 350)


            },
            onError: (error) => {
                console.log(error);
                if (toastIdRef.current) {
                    toast.update(toastIdRef.current, {
                        title: 'Could Not Promote User',
                        description: `${error}`,
                        status: 'error',
                        position: "top-right",
                        duration: 3000,
                        isClosable: true,
                    })
                }
            }
        })



    const removeUserMutation = useMutation(removeTeamMemberFromProject,
        {
            onMutate: () => {
                console.log("Removing user");

                addToast({
                    status: "loading",
                    title: "Removing Member",
                    position: "top-right"
                })
            },

            onSuccess: (data) => {
                if (toastIdRef.current) {
                    toast.update(toastIdRef.current, {
                        title: 'Success',
                        description: `User Removed`,
                        status: 'success',
                        position: "top-right",
                        duration: 3000,
                        isClosable: true,
                    })
                }
                // reset()

                onClose();

                setTimeout(
                    // async 
                    () => {
                        // await 
                        queryClient.invalidateQueries(
                            [
                                "projects",
                                project_id
                            ]
                        );

                        refetchTeamData && refetchTeamData();
                        // const url = 
                        if (!location.pathname.includes('project')) {
                            navigate(`/projects/${project_id}`);
                        } else {
                            // onClose();
                        }
                    }, 350)


            },
            onError: (error) => {
                console.log(error);
                if (toastIdRef.current) {
                    toast.update(toastIdRef.current, {
                        title: 'Could Not Remove User',
                        description: `${error}`,
                        status: 'error',
                        position: "top-right",
                        duration: 3000,
                        isClosable: true,
                    })
                }
            }
        })


    return (
        (loading || pk === undefined) ?
            <Center
                w={"100%"}
                h={"100%"}
            >
                <Spinner
                    size={"xl"}
                />
            </Center>
            :
            <Flex
                flexDir={"column"}
                h={"100%"}
            >
                <Flex
                    mt={4}
                >
                    <Avatar
                        src={user?.image?.file ? user.image.file : user?.image?.old_file ? user.image.old_file : ""}
                        size={"2xl"}
                    />

                    <Flex
                        flexDir={"column"}
                        flex={1}
                        justifyContent={"center"}
                        ml={4}
                        overflow={"auto"}
                    >
                        <Text userSelect={"none"} fontWeight={"bold"}>{!user?.first_name.startsWith("None") ?
                            `${user.first_name} ${user.last_name}` : `${user.username}`}</Text>
                        <Text userSelect={"none"} >{user?.expertise}</Text>
                        <Text userSelect={"none"} >{user?.phone ? user.phone : "No Phone number"}</Text>
                        <Flex>
                            <Text userSelect={"none"}>{user?.email.startsWith("unset") ? "No Email" : user?.email}</Text>
                            {!user?.email.startsWith("unset") && (

                                <Button
                                    ml={2}
                                    size={"xs"}
                                    variant={"ghost"}
                                    colorScheme="blue"
                                    onClick={copyEmail}
                                >
                                    <Icon
                                        as={FiCopy}
                                    />
                                </Button>
                            )}

                        </Flex>
                    </Flex>

                </Flex>

                <Grid
                    gridTemplateColumns={"repeat(2, 1fr)"}
                    gridGap={4}
                    mt={4} pt={2} pb={4}>

                    {!user?.is_staff && (
                        <Button
                            bg={colorMode === "light" ? "blue.500" : "blue.400"}
                            color={colorMode === "light" ? "whiteAlpha.900" : "whiteAlpha.900"}
                            isDisabled={user.email.startsWith("unset")}
                        >
                            Email
                        </Button>
                    )}
                    {user?.is_staff && (
                        <Button
                            bg={colorMode === "light" ? "blue.500" : "blue.400"}
                            color={colorMode === "light" ? "whiteAlpha.900" : "whiteAlpha.900"}
                            isDisabled={true}
                        >
                            Chat
                        </Button>
                    )}

                    <Button
                        bg={colorMode === "light" ? "red.500" : "red.600"}
                        color={colorMode === "light" ? "whiteAlpha.900" : "whiteAlpha.900"}
                        _hover={
                            {
                                bg: colorMode === "light" ? "red.400" : "red.500"
                            }
                        }
                        onClick={removeThisUser}
                        isDisabled={usersCount === 1}
                    // TODO: Disable also if not superuser and not in project or in project but not leader (superusers can do whatever unless only one user)
                    >
                        Remove from Project
                    </Button>

                </Grid>




                <Flex
                    border={"1px solid"}
                    rounded={"xl"}
                    borderColor={borderColor}
                    padding={4}
                    mb={4}
                    flexDir={"column"}
                    mt={2}
                >
                    <Flex>
                        <Text
                            fontWeight={"bold"}
                            fontSize={"sm"}
                            mb={1}
                            color={sectionTitleColor}

                        >
                            Project Role ({userRole ? humanReadableRoleName(userRole) : 'None'})
                        </Text>
                    </Flex>
                    <FormControl
                        py={2}
                    >
                        <InputGroup>
                            <Select
                                variant='filled' placeholder='Select a Role for the User'
                                onChange={(e) => handleUpdateRole(e.target.value)}
                                value={userRole}
                            >
                                <option value='academicsuper'>Academic Supervisor</option>
                                <option value='consulted'>Consulted Peer</option>
                                <option value='externalcol'>External Collaborator</option>
                                <option value='externalpeer'>External Peer</option>
                                <option value='group'>Involved Group</option>
                                <option value='research'>Research Scientist</option>
                                <option value='supervising'>Supervising Scientist</option>
                                <option value='student'>Supervised Student</option>
                                <option value='technical'>Technical Officer</option>
                            </Select>
                        </InputGroup>
                        <FormHelperText>The role this team member fills within this project.</FormHelperText>
                    </FormControl>

                    <Flex
                        mt={4}
                    >
                        <Text
                            fontWeight={"bold"}
                            fontSize={"sm"}
                            mb={1}
                            color={sectionTitleColor}

                        >
                            Time Allocation ({fteValue} FTE)
                        </Text>
                    </Flex>
                    {/* <Text>-</Text> */}
                    <Slider defaultValue={fteValue} min={0} max={1} step={0.1}
                        onChangeEnd={(sliderValue) => {
                            handleUpdateFTE(sliderValue);
                        }}

                    >
                        <SliderTrack bg='blue.100'>
                            <Box position='relative' right={10} />
                            <SliderFilledTrack bg='blue.500' />
                        </SliderTrack>
                        <SliderThumb boxSize={6}
                            bg="blue.300"
                        />
                    </Slider>


                    <Flex
                        mt={4}
                    >
                        <Text
                            fontWeight={"bold"}
                            fontSize={"sm"}
                            mb={1}
                            color={sectionTitleColor}
                        >
                            Short Code
                        </Text>
                    </Flex>
                    <Input
                        autoComplete="off"
                        defaultValue={shortCode}
                        onChange={(e) => setShortCodeValue(e.target.value)}
                    />
                    {/* <Text>-</Text> */}
                    {(!is_leader && (me?.userData?.is_superuser || me?.userData?.pk === leader_pk)) && (
                        <Button
                            mt={4}
                            // bg={colorMode === "light" ? "green.500" : "green.600"}
                            // color={colorMode === "light" ? "whiteAlpha.900" : "whiteAlpha.900"}
                            bg={colorMode === "dark" ? "green.600" : "green.500"}
                            color={"white"}
                            _hover={
                                {
                                    bg: colorMode === "dark" ? "green.500" : "green.400",
                                }
                            }

                            isDisabled={usersCount === 1 || !user?.is_staff}
                            onClick={promoteThisUser}

                        // TODO: Disable also if not superuser and not in project or in project but not leader (superusers can do whatever unless only one user)
                        >
                            Promote to Leader
                        </Button>

                    )}
                    <Button
                        colorScheme="blue"
                        mt={4}
                        onClick={() => updateProjectUser({
                            "projectPk": project_id,
                            "userPk": pk,
                            "role": userRole,
                            "fte": fteValue,
                            "shortCode": shortCodeValue,
                        })}
                    >
                        Save Changes
                    </Button>
                </Flex>

                <Box
                // mt={2}
                >

                    <Flex
                        border={"1px solid"}
                        rounded={"xl"}
                        borderColor={borderColor}
                        padding={4}
                        mb={4}
                        flexDir={"column"}
                    >

                        <Flex
                            flexDir={"column"}
                        >
                            {user?.is_staff && (
                                <Flex
                                    h={"60px"}
                                >
                                    <Image
                                        rounded={"lg"}
                                        w="60px" h="60px"
                                        src={
                                            "/dbca.jpg"
                                            // user?.agency?.image?.file ? user.agency.image.file : user?.agency?.image?.old_file ? user.agency.image.old_file : ""
                                        }
                                        objectFit="cover"
                                    />
                                    <Center>
                                        <Flex ml={3} flexDir="column">
                                            <Text fontWeight="bold" color={sectionTitleColor}>
                                                {user.agency !== null ? user.agency.name : "agency returning none"}
                                            </Text>
                                            <Text fontSize="sm" color={colorMode === "light" ? "gray.600" : "gray.400"}>
                                                {user.branch !== null ? `${user.branch.name} Branch` : "Branch not set"}
                                            </Text>
                                        </Flex>

                                    </Center>
                                </Flex>
                            )}
                            {!user?.is_staff && (
                                <Text
                                    color={colorMode === "light" ? "gray.600" : "gray.300"}
                                >
                                    <b>External User</b> - This user does not belong to DBCA
                                </Text>
                            )}

                        </Flex>

                    </Flex>

                    <Flex
                        border={"1px solid"}
                        rounded={"xl"}
                        borderColor={borderColor}
                        padding={4}
                        mb={4}
                        flexDir={"column"}
                        mt={2}
                    >
                        <Flex>
                            <Text
                                fontWeight={"bold"}
                                fontSize={"sm"}
                                mb={1}
                                color={sectionTitleColor}

                            >
                                About
                            </Text>
                        </Flex>
                        <Text>{user.about ? user.about : "This user has not filled in their 'About' section."}</Text>
                        <Flex
                            mt={4}
                        >
                            <Text
                                fontWeight={"bold"}
                                fontSize={"sm"}
                                mb={1}
                                color={sectionTitleColor}

                            >
                                Expertise
                            </Text>
                        </Flex>
                        <Text>{user?.expertise ? user.expertise : "This user has not filled in their 'Expertise' section."}</Text>


                    </Flex>


                    <Spacer />


                    <Flex
                        border={"1px solid"}
                        rounded={"xl"}
                        borderColor={borderColor}
                        padding={4}
                        mb={4}
                        flexDir={"column"}
                        mt={2}
                    >
                        <Flex>
                            <Text
                                fontWeight={"bold"}
                                fontSize={"sm"}
                                mb={1}
                                color={sectionTitleColor}

                            >
                                Details
                            </Text>
                        </Flex>
                        <Grid
                            gridTemplateColumns="1fr 3fr"
                        >
                            <Text color={subsectionTitleColor}><b>Role: </b></Text><Text >{user?.role ? user.role : "This user has not filled in their 'role' section."}</Text>
                            <Text color={subsectionTitleColor}><b>Joined: </b></Text><Text>{formatted_date}</Text>
                        </Grid>
                        <Flex
                            mt={4}
                            rounded="xl"
                            p={4}
                            bg={colorMode === 'light' ? 'gray.50' : 'gray.600'}
                        >
                            <Grid
                                gridTemplateColumns="repeat(3, 1fr)"
                                gap={3}
                                w="100%"
                            >
                                <Grid
                                    gridTemplateColumns={"repeat(1, 1fr)"}
                                    display="flex"
                                    flexDirection="column"
                                    justifyContent="center"
                                    alignItems="center"
                                >
                                    <Text mb='8px' fontWeight={"bold"} color={subsectionTitleColor}>Active?</Text>
                                    {user?.is_active ? <FcApproval /> : <Box color={colorMode === "light" ? "red.500" : "red.600"}>
                                        <AiFillCloseCircle />
                                    </Box>}
                                </Grid>

                                <Grid
                                    gridTemplateColumns={"repeat(1, 1fr)"}
                                    display="flex"
                                    flexDirection="column"
                                    justifyContent="center"
                                    alignItems="center"
                                >
                                    <Text mb='8px' fontWeight={"bold"} color={subsectionTitleColor}>Staff?</Text>
                                    {user?.is_staff ? <FcApproval /> :
                                        <Box color={colorMode === "light" ? "red.500" : "red.600"}>
                                            <AiFillCloseCircle />
                                        </Box>
                                    }
                                </Grid>

                                <Grid
                                    gridTemplateColumns={"repeat(1, 1fr)"}
                                    display="flex"
                                    flexDirection="column"
                                    justifyContent="center"
                                    alignItems="center"
                                >
                                    <Text mb='8px' fontWeight={"bold"} color={subsectionTitleColor}>Superuser?</Text>
                                    {user?.is_superuser ? <FcApproval /> : <Box color={colorMode === "light" ? "red.500" : "red.600"}>
                                        <AiFillCloseCircle />
                                    </Box>}
                                </Grid>
                            </Grid>
                        </Flex>
                    </Flex>
                </Box>
            </Flex>
    )
}