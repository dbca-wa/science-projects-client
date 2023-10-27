// Component for adding users to a project

import {
    Button, Flex, FormControl,
    FormHelperText, Text,
    Grid, Input, InputGroup, Modal, ModalBody, ModalContent, ModalFooter,
    ModalHeader, ModalOverlay, Select, Textarea, useColorMode, Slider, SliderTrack, Box, SliderFilledTrack, SliderThumb, useToast, ToastId, ModalCloseButton, SliderProps
} from "@chakra-ui/react"
import { useEffect, useRef, useState } from "react";
import { UserSearchDropdown } from "../Navigation/UserSearchDropdown";
import { ProjectSearchDropdown } from "../Navigation/ProjectSearchDropdown";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { RegisterOptions, UseFormRegister, UseFormSetValue, UseFormWatch, useFormState, useForm, useFormContext } from "react-hook-form";
import { INewMember, createTeamMember } from "../../lib/api";
import { useLocation, useNavigate } from "react-router-dom";
import { useProjectSearchContext } from "../../lib/hooks/ProjectSearchContext";
import { AxiosError } from "axios";


interface IAddUserToProjectModalProps {
    isOpen: boolean;
    onClose: () => void;
    preselectedUser?: number;
    preselectedProject?: number;
    refetchTeamData?: () => void;
}



export const AddUserToProjectModal = ({ isOpen, onClose, preselectedUser, preselectedProject, refetchTeamData }: IAddUserToProjectModalProps) => {

    // Styling and display
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
    const { colorMode } = useColorMode();
    const borderColor = colorMode === "light" ? "gray.300" : "gray.500";
    const sectionTitleColor = colorMode === "light" ? "gray.600" : "gray.300";

    // Toast
    const toast = useToast();
    const toastIdRef = useRef<ToastId>();
    const addToast = (data: any) => {
        toastIdRef.current = toast(data)
    }

    // const { isOnProjectsPage } = useProjectSearchContext();
    const location = useLocation();

    const navigate = useNavigate();

    // Query client, Mutation & Submission
    const queryClient = useQueryClient();
    const { register, handleSubmit, reset, setValue, watch, formState } = useForm<INewMember>(
        {
            defaultValues: {
                // Set the default value for the "role" field to 'research'
                role: "research",
                timeAllocation: 0,
            },
        }
    );
    const membershipCreationMutation = useMutation(createTeamMember,
        {
            onMutate: () => {
                addToast({
                    status: "loading",
                    title: "Creating Membership",
                    position: "top-right"
                })
            },
            onSuccess: (data) => {
                if (toastIdRef.current) {
                    toast.update(toastIdRef.current, {
                        title: 'Success',
                        description: `Membership Created`,
                        status: 'success',
                        position: "top-right",
                        duration: 3000,
                        isClosable: true,
                    })
                }
                reset()
                onClose()

                setTimeout(
                    // async 
                    () => {
                        // await 
                        queryClient.invalidateQueries(
                            [
                                "projects",
                                preselectedProject !== undefined && preselectedProject !== null && preselectedProject !== 0 ? preselectedProject : selectedProject
                            ]
                        );
                        refetchTeamData && refetchTeamData();
                        // const url = 
                        if (!location.pathname.includes('project')) {
                            navigate(`/projects/${preselectedProject !== undefined && preselectedProject !== null && preselectedProject !== 0 ? preselectedProject : selectedProject}`);
                        }
                    }, 350)

            },
            onError: (error: AxiosError) => {
                console.log(error);
                if (toastIdRef.current) {
                    toast.update(toastIdRef.current, {
                        title: 'Could Not Create Project Membership',
                        description: `${error?.response?.data}`,
                        // .non_field_errors && error.response.data.non_field_errors == "The fields project, user must make a unique set." ? "Cannot add a user to a project they are already in." : error}`,
                        status: 'error',
                        position: "top-right",
                        duration: 3000,
                        isClosable: true,
                    })
                }
            }
        })

    const onSubmitMembershipCreation = async (
        formData: INewMember
    ) => {
        // console.log("Running onSubmitMembershipCreation")
        console.log(formData)
        // console.log(
        //     {
        //         "selectedUser": selectedUser,
        //         "selectedProject": selectedProject,
        //         "role": role,
        //         "timeAllocation": timeAllocation,
        //         "shortCode": shortCode,
        //                     "comments": "None",
        //     "isLeader": false,
        //     "oldId": 1,
        //     "position": 100,
        //     }
        // )
        // const dataObject = {
        //     "user": selectedUser,
        //     "project": preselectedProject ? preselectedProject : selectedProject,
        //     "role": role,
        //     "timeAllocation": timeAllocation,
        //     "shortCode": shortCode,
        //     "comments": "None",
        //     "isLeader": false,
        //     "oldId": 1,
        //     "position": 100,
        // }
        // dataObject

        await membershipCreationMutation.mutateAsync(
            formData
        );
        // onClose();
    }

    // State
    const [selectedUser, setSelectedUser] = useState<number>();
    const [selectedProject, setSelectedProject] = useState<number>(preselectedProject ? preselectedProject : 0);


    // Watched Variables
    const role = watch("role")
    const timeAllocation = watch("timeAllocation")
    const shortCode = watch("shortCode")


    useEffect(() => {
        if (preselectedProject !== undefined && preselectedProject !== null && selectedProject === undefined) {
            setSelectedProject(preselectedProject);
        }
    }, [selectedProject, preselectedProject])



    useEffect(() => {
        console.log(
            {
                "preselectedProject": preselectedProject,
                "selectedProject": selectedProject,
                "selectedUser": selectedUser,
                "role": role,
                "timeAllocation": timeAllocation,
                "shortCode": shortCode
            }
        )

    }, [selectedProject, selectedUser, role, timeAllocation, shortCode, preselectedProject])

    // const handleSubmissionTest = () => {
    //     console.log(
    //         {
    //             "selectedUser": selectedUser,
    //             "selectedProject": selectedProject,
    //             "role": role,
    //             "timeAllocation": timeAllocation,
    //             "shortCode": shortCode
    //         }
    //     )

    // }

    const projectSearchInputRef = useRef<HTMLInputElement | null>(null);


    useEffect(() => {
        console.log(preselectedProject)
        if (!preselectedProject) {
            if (isOpen && projectSearchInputRef.current) {
                projectSearchInputRef.current.focus();
            }
            console.log(projectSearchInputRef.current)
        }
        else {
            setSelectedProject(preselectedProject);
            // console.log(selectedProject)
        }
    }, [isOpen])



    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            size={'2xl'}
            scrollBehavior="inside"
        >
            <ModalOverlay />
            <ModalContent
                bg={colorMode === "light" ? "white" : "gray.800"}
            // overflowY={"auto"}
            // maxH={"80vh"}
            >
                <ModalHeader>Add To Project</ModalHeader>
                <ModalCloseButton />

                <ModalBody>
                    <Box
                    // as="form"
                    // id="add-user-form"
                    // onSubmit={() => {
                    //     onSubmitMembershipCreation(
                    //         {
                    //             "user": selectedUser,
                    //             "project": selectedProject,
                    //             "role": role,
                    //             "timeAllocation": timeAllocation,
                    //             "shortCode": shortCode
                    //         }
                    //     )
                    // }}
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
                            {
                                preselectedProject ?
                                    (
                                        <ProjectSearchDropdown
                                            inputRef={projectSearchInputRef}
                                            {...register("project", { required: true })}
                                            // register={register}
                                            user={selectedUser}
                                            allProjects
                                            isRequired={true}
                                            setProjectFunction={setSelectedProject}
                                            preselectedProjectPk={preselectedProject !== undefined ? preselectedProject : 0}
                                            label="Project"
                                            placeholder="Search for the project"
                                            helperText={
                                                <>
                                                    The project you would like to add the user to.
                                                </>
                                            }
                                        />


                                    ) :
                                    (
                                        <ProjectSearchDropdown
                                            inputRef={projectSearchInputRef}

                                            {...register("project", { required: true })}
                                            user={selectedUser}
                                            allProjects
                                            isRequired={true}
                                            setProjectFunction={setSelectedProject}
                                            label="Project"
                                            placeholder="Search for the project"
                                            helperText={
                                                <>
                                                    The project you would like to add the user to.
                                                </>
                                            }
                                        />


                                    )
                            }

                            {
                                preselectedUser !== 0 && preselectedUser !== null && preselectedUser !== undefined
                                    ?
                                    (<UserSearchDropdown
                                        {...register("user", { required: true })}

                                        onlyInternal={false}
                                        isRequired={true}
                                        setUserFunction={setSelectedUser}
                                        preselectedUserPk={preselectedUser}
                                        label="User"
                                        placeholder="Search for a user"
                                        helperText={
                                            <>
                                                The user you would like to add.
                                            </>
                                        }
                                    />) : (
                                        <UserSearchDropdown
                                            {...register("user", { required: true })}

                                            onlyInternal={false}
                                            isRequired={true}
                                            setUserFunction={setSelectedUser}
                                            // preselectedUserPk={preselectedUser}
                                            label="User"
                                            placeholder="Search for a user"
                                            helperText={
                                                <>
                                                    The user you would like to add.
                                                </>
                                            }
                                        />)
                            }
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
                                    Project Role ({role ? humanReadableRoleName(role) : 'None'})
                                </Text>
                            </Flex>
                            <FormControl
                                py={2}
                            >
                                <InputGroup>
                                    <Select
                                        {...register("role", { required: true })}
                                        variant='filled' placeholder='Select a Role for the User'
                                    // value={role}
                                    // onChange={(e) => handleUpdateRole(e.target.value)}
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
                                    Time Allocation ({timeAllocation} FTE)
                                </Text>
                            </Flex>
                            <Box mx={2}
                            >
                                <FormSlider
                                    name="timeAllocation"
                                    defaultValue={0}
                                    min={0}
                                    max={1}
                                    step={0.1}
                                    validation={{ required: true }}
                                    formContext={{
                                        register, setValue, watch,
                                        // formState 
                                    }}
                                />
                            </Box>


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
                                {...register("shortCode", { required: false })}
                                // onChange={(e) => {
                                //     setValue("shortCode", Number(e.target.value))
                                // }}
                                type="number"
                                autoComplete="off"

                            />
                        </Flex>
                    </Box>
                </ModalBody>

                <ModalFooter
                // pos="absolute" bottom={0} right={0}
                >
                    <Grid
                        gridTemplateColumns={"repeat(2, 1fr)"}
                        gridGap={4}
                    >
                        <Button
                            colorScheme="gray"

                            onClick={onClose}
                        >
                            Cancel
                        </Button>

                        <Button
                            isDisabled={selectedProject === 0}
                            onClick={() => {
                                console.log("clicked")
                                onSubmitMembershipCreation(
                                    {
                                        "user": selectedUser,
                                        "project": selectedProject,
                                        "role": role,
                                        "timeAllocation": timeAllocation,
                                        "shortCode": shortCode,
                                        "comments": "None",
                                        "isLeader": false,
                                        "oldId": 1,
                                        "position": 100,
                                    }
                                )

                            }}

                            bgColor={colorMode === "light" ? `green.500` : `green.600`}
                            color={colorMode === "light" ? `white` : `whiteAlpha.900`}
                            _hover={{
                                bg: colorMode === "light" ? `green.600` : `green.400`,
                                color: colorMode === "light" ? `white` : `white`
                            }}
                            ml={3}


                        // isLoading={membershipCreationMutation.isLoading}
                        // form="add-user-form"
                        // onClick={handleSubmit(onSubmitMembershipCreation)}
                        // type="submit"
                        // onClick={logData}
                        >
                            Add User
                        </Button>
                    </Grid>
                </ModalFooter>
            </ModalContent>
        </Modal>
    )
}

type FormFieldNames = "user" | "project" | "role" | "timeAllocation" | "shortCode" | "comments" | "position" | "isLeader" | "oldId";

interface FormSliderProps extends SliderProps {
    name: FormFieldNames;
    validation?: RegisterOptions;
    formContext: {
        register: UseFormRegister<INewMember>;
        setValue: UseFormSetValue<INewMember>;
        watch: UseFormWatch<INewMember>;
        // formState: UseFormState<INewMember>;
    };

}


const FormSlider = ({ name, validation, formContext, ...rest }: FormSliderProps) => {
    const { onChange: sliderOnChange, ...otherProps } = rest;
    const { register, setValue, watch } = formContext;

    // Register the field with the provided validation rules
    // register(name, validation);

    // Adapt the slider's onChange to work with react-hook-form
    const adaptedOnChange = (value: number) => {
        setValue(name, value);
    };


    return (
        <Slider {...rest}
            onChange={adaptedOnChange}
        >
            <SliderTrack bg='blue.100'>
                <Box position='relative' right={10} />
                <SliderFilledTrack bg='blue.500' />
            </SliderTrack>
            <SliderThumb boxSize={6}
                bg="blue.300"
                zIndex={0}
            />

        </Slider>
    );
};




// defaultValue={fteValue}
// onChangeEnd={(sliderValue) => {
//     // handleUpdateFTE(sliderValue);
//     setValue("timeAllocation", sliderValue);
// }}