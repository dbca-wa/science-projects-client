// The drawer content that pops out when clicking on a user grid item

import { Avatar, Image, Box, Button, Center, Flex, Grid, Icon, Spacer, Spinner, Text, useColorMode, useDisclosure } from "@chakra-ui/react"
import { FiCopy } from "react-icons/fi";
import { FcApproval } from "react-icons/fc";
import { AiFillCloseCircle } from "react-icons/ai";
import { useState } from "react";
import { useFullUserByPk } from "../../../lib/hooks/useFullUserByPk";
import { useFormattedDate } from "../../../lib/hooks/useFormattedDate";
import { useCopyText } from "../../../lib/hooks/useCopyText";
import { DeleteUserModal } from "../../Modals/DeleteUserModal";
import { PromoteUserModal } from "../../Modals/PromoteUserModal";
import { useUser } from "../../../lib/hooks/useUser";
import { AddUserToProjectModal } from "../../Modals/AddUserToProjectModal";
import { EditUserDetailsModal } from "../../Modals/EditUserDetailsModal";
import { useNavigate } from "react-router-dom";
import { useUpdatePage } from "../../../lib/hooks/useUpdatePage";

interface Props {
    pk: number;
}

export const UserProfile = ({ pk }: Props) => {

    const { userLoading: loading, userData: user } = useFullUserByPk(pk);
    const formatted_date = useFormattedDate(user?.date_joined);

    const { currentPage } = useUpdatePage();

    const { colorMode } = useColorMode();
    const borderColor = colorMode === "light" ? "gray.300" : "gray.500";
    const sectionTitleColor = colorMode === "light" ? "gray.600" : "gray.300";
    const subsectionTitleColor = colorMode === "light" ? "gray.500" : "gray.500"

    const copyEmail = useCopyText(user?.email);
    const openEmailAddressedToUser = () => {
        window.open(`mailto:${user?.email}`);
    }

    const { isOpen: isDeleteModalOpen, onOpen: onDeleteModalOpen, onClose: onDeleteModalClose } = useDisclosure();
    const { isOpen: isPromoteModalOpen, onOpen: onPromoteModalOpen, onClose: onPromoteModalClose } = useDisclosure();
    const { isOpen: isAddToProjectModalOpen, onOpen: onAddToProjectModalOpen, onClose: onAddToProjectModalClose } = useDisclosure();
    const { isOpen: isEditUserDetailsModalOpen, onOpen: onEditUserDetailsModalOpen, onClose: onEditUserDetailsModalClose } = useDisclosure();

    const me = useUser();
    const [userInQuestionIsSuperuser, setUserInQuestionIsSuperuser] = useState(false);
    const [userInQuestionIsMe, setUserInQuestionIsMe] = useState(false);

    const setVariablesForPromoteModalAndOpen = (isUserToChangeSuperUser: boolean) => {
        setUserInQuestionIsSuperuser(isUserToChangeSuperUser);
        onPromoteModalOpen();
    }

    const navigate = useNavigate();

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
            <>
                <DeleteUserModal
                    isOpen={isDeleteModalOpen}
                    onClose={onDeleteModalClose}
                    userIsSuper={userInQuestionIsSuperuser}
                    userIsMe={userInQuestionIsMe}
                />
                <PromoteUserModal
                    isOpen={isPromoteModalOpen}
                    onClose={onPromoteModalClose}
                    userIsSuper={userInQuestionIsSuperuser}
                    userIsMe={userInQuestionIsMe}
                />
                <AddUserToProjectModal isOpen={isAddToProjectModalOpen} onClose={onAddToProjectModalClose} />
                <EditUserDetailsModal isOpen={isEditUserDetailsModalOpen} onClose={onEditUserDetailsModalClose} />
                <Flex
                    flexDir={"column"}
                    h={"100%"}
                >
                    <Flex
                        mt={4}
                    >
                        <Avatar
                            src={user?.image?.old_file}
                            size={"2xl"}
                            userSelect={"none"}
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
                                onClick={openEmailAddressedToUser}

                                bg={colorMode === "light" ? "blue.500" : "blue.400"}
                                color={colorMode === "light" ? "whiteAlpha.900" : "whiteAlpha.900"}
                                isDisabled={user.email.startsWith("unset") || me.userData.email === user.email}
                                _hover={{
                                    bg: colorMode === "light" ? "blue.400" : "blue.300",
                                    color: "white",
                                }}
                            >
                                Email
                            </Button>
                        )}
                        {user?.is_staff && (
                            <Button
                                bg={colorMode === "light" ? "blue.500" : "blue.400"}
                                color={colorMode === "light" ? "whiteAlpha.900" : "whiteAlpha.900"}
                                _hover={{
                                    bg: colorMode === "light" ? "blue.400" : "blue.300",
                                    color: "white",
                                }}
                                isDisabled={true}
                            >
                                Chat
                            </Button>
                        )}

                        <Button
                            bg={colorMode === "light" ? "green.500" : "green.400"}
                            color={colorMode === "light" ? "whiteAlpha.900" : "whiteAlpha.900"}
                            onClick={onAddToProjectModalOpen}
                            _hover={{
                                bg: colorMode === "light" ? "green.400" : "green.300",
                                color: "white",
                            }}
                            isDisabled={user.email === me.userData.email}
                        >
                            Add to Project
                        </Button>

                    </Grid>

                    <Flex
                        border={"1px solid"}
                        rounded={"xl"}
                        borderColor={borderColor}
                        padding={4}
                        // mb={4}
                        flexDir={"column"}
                        mt={2}
                    >

                        <Flex
                            flexDir={"column"}
                            userSelect={"none"}

                        >
                            {user?.is_staff && (
                                <Flex
                                    h={"60px"}
                                >
                                    <Image
                                        rounded={"lg"}
                                        w="60px" h="60px"
                                        src={user?.agency?.image ? user.agency.image.old_file : ""}
                                        objectFit="cover"
                                    />
                                    <Center>
                                        <Flex ml={3} flexDir="column">
                                            <Text fontWeight="bold" color={sectionTitleColor}>
                                                {user.agency !== null ? user.agency.name : "agency returning none"}
                                            </Text>
                                            <Text fontSize="sm" color={colorMode === "light" ? "gray.600" : "gray.400"}>
                                                {user.branch !== null ? `${user.branch} Branch` : "Branch not set"}
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

                    <Box
                        mt={2}
                    >
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
                                    userSelect={"none"}

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
                                    userSelect={"none"}

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
                                    userSelect={"none"}

                                >
                                    Details
                                </Text>
                            </Flex>
                            <Grid
                                gridTemplateColumns="1fr 3fr"
                            >
                                <Text color={subsectionTitleColor}
                                    userSelect={"none"}
                                    fontSize={"sm"}
                                ><b>Role: </b></Text><Text >{user?.role ? user.role : "This user has not filled in their 'role' section."}</Text>
                                <Text color={subsectionTitleColor}
                                    userSelect={"none"}
                                    fontSize={"sm"}
                                ><b>Joined: </b></Text><Text>{formatted_date}</Text>
                            </Grid>
                            <Flex
                                mt={4}
                                rounded="xl"
                                p={4}
                                bg={colorMode === 'light' ? 'gray.50' : 'gray.600'}
                                userSelect={"none"}

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
                                        <Text mb='8px' fontWeight={"bold"} color={subsectionTitleColor}>Admin?</Text>
                                        {user?.is_superuser ? <FcApproval /> : <Box color={colorMode === "light" ? "red.500" : "red.600"}>
                                            <AiFillCloseCircle />
                                        </Box>}
                                    </Grid>
                                </Grid>
                            </Flex>
                        </Flex>
                        {
                            me.userData.is_superuser &&
                            (
                                <Flex
                                    border={"1px solid"}
                                    rounded={"xl"}
                                    borderColor={borderColor}
                                    padding={4}
                                    mb={4}
                                    flexDir={"column"}
                                    mt={2}
                                >
                                    <Flex
                                        pb={1}
                                    >
                                        <Text
                                            fontWeight={"bold"}
                                            fontSize={"sm"}
                                            mb={1}
                                            color={sectionTitleColor}
                                            userSelect={"none"}

                                        >
                                            Admin
                                        </Text>
                                    </Flex>
                                    <Grid
                                        gridTemplateColumns={"repeat(1, 1fr)"}
                                        gridGap={4}
                                    >
                                        <Button
                                            onClick={user.email === me.userData.email ? () => { navigate('/users/me') } : onEditUserDetailsModalOpen}
                                            bg={user?.is_superuser ? "blue.600" : "blue.500"}
                                            color={colorMode === "light" ? "whiteAlpha.900" : "whiteAlpha.900"}
                                            _hover={{
                                                bg: colorMode === "light" ?
                                                    user?.is_superuser ?
                                                        "blue.500" : "blue.400"
                                                    :
                                                    user?.is_superuser ? "blue.500" : "blue.400",
                                                color: "white",
                                            }}
                                            isDisabled={
                                                user.email === me.userData.email && currentPage === '/users/me'
                                            }
                                        >
                                            Edit Details
                                        </Button>
                                        <Button
                                            onClick={() => {
                                                setVariablesForPromoteModalAndOpen(user?.is_superuser);
                                            }}
                                            bg={colorMode === "light" ?
                                                user?.is_superuser ? "red.600" : "green.600"
                                                :
                                                user?.is_superuser ? "red.800" : "green.500"}

                                            color={colorMode === "light" ? "whiteAlpha.900" : "whiteAlpha.900"}

                                            _hover={{
                                                bg: colorMode === "light" ?
                                                    user?.is_superuser ?
                                                        "red.500" : "green.500"
                                                    :
                                                    user?.is_superuser ? "red.700" : "green.400",
                                                color: "white",
                                            }}
                                            isDisabled={!user?.is_staff
                                                || user.email === me.userData.email
                                            }

                                        >
                                            {user?.is_superuser ? "Demote" : "Promote"}
                                        </Button>
                                        <Button
                                            onClick={onDeleteModalOpen}
                                            bg={colorMode === "light" ? "red.600" : "red.700"}
                                            color={colorMode === "light" ? "whiteAlpha.900" : "whiteAlpha.900"}

                                            _hover={{
                                                bg: colorMode === "light" ?
                                                    "red.500"
                                                    :
                                                    "red.600",
                                            }}
                                            isDisabled={user.is_superuser || user.email === me.userData.email}
                                        >
                                            Delete
                                        </Button>

                                    </Grid>

                                </Flex>

                            )
                        }
                    </Box>
                </Flex>
            </>
    )
}