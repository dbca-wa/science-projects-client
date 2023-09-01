// Modal for editing user details

import { Box, Image, Button, Center, FormControl, FormErrorMessage, FormLabel, Grid, Icon, Input, InputGroup, InputLeftAddon, InputLeftElement, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, Select, Text, Textarea, ToastId, useColorMode, useDisclosure, useQuery, useToast, FormHelperText, TabList, Tabs, Tab, TabPanels, TabPanel, Flex } from "@chakra-ui/react"
import { useEffect, useRef, useState } from "react";
import { IBranch, IBusinessArea, IPersonalInformation, IProfile, IUser, IUserData } from "../../types";
import { useBranches } from "../../lib/hooks/useBranches";
import { GiGraduateCap } from "react-icons/gi";
import { AiFillPhone } from "react-icons/ai";
import { GrMail } from "react-icons/gr";
import { RiNumber1, RiNumber2 } from "react-icons/ri";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { IFullUserUpdateVariables, IProfileUpdateSuccess, MutationError, MutationSuccess, adminUpdateUser, getPersonalInformation } from "../../lib/api";
import { useForm } from "react-hook-form";
import { MdFax } from "react-icons/md";
import { useFullUserByPk } from "../../lib/hooks/useFullUserByPk";
import noImageLink from "/sad-face.png"
import { useUserSearchContext } from "../../lib/hooks/UserSearchContext";

interface IModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: IUserData;
    branches: IBranch[] | undefined;
    businessAreas: IBusinessArea[] | undefined;
}

export const EditUserDetailsModal = ({ isOpen, onClose, user, branches, businessAreas }: IModalProps) => {

    const { colorMode } = useColorMode();
    const { isOpen: isToastOpen, onOpen: openToast, onClose: closeToast } = useDisclosure();

    useEffect(() => {
        if (isToastOpen) {
            onClose(); // Close the modal when the toast is shown
        }
    }, [isToastOpen, onClose]);

    const handleToastClose = () => {
        closeToast();
        onClose(); // Close the modal when the toast is manually closed
    };

    const { userLoading, userData } = useFullUserByPk(user.pk);

    // React Hook Form
    const {
        register,
        // setValue,
        reset,
        handleSubmit,
        formState: { errors },
    } = useForm<IFullUserUpdateVariables>();


    // PI ====================================================
    const [hoveredTitle, setHoveredTitle] = useState(false);
    const titleBorderColor = `${colorMode === "light" ?
        hoveredTitle ? "blackAlpha.300" : "blackAlpha.200" :
        hoveredTitle ? "whiteAlpha.400" : "whiteAlpha.300"}`

    // // Regex for validity of phone variable
    const phoneValidationPattern = /^(\+)?[\d\s]+$/;


    // Profile ====================================================
    const [imageLoadFailed, setImageLoadFailed] = useState(false);
    const [aboutValue, setAboutValue] = useState(userData?.about || "");
    const [expertiseValue, setExpertiseValue] = useState(userData?.expertise || "");
    const [activeOption, setActiveOption] = useState<'url' | 'upload'>(
        userData?.image?.old_file ? 'url' : 'upload'
    );
    const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(
        userData?.image?.file || userData?.image?.old_file || null
    );
    const isValidImageUrl = selectedImageUrl !== null &&
        selectedImageUrl !== undefined &&
        selectedImageUrl.startsWith("https") &&
        selectedImageUrl.trim() !== "" &&
        selectedImageUrl.match(/\.(jpg|jpeg|png)$/i) || selectedImageUrl?.startsWith('https://imagedelivery.net/');
    const handleImageLoadError = () => {
        setImageLoadFailed(true);
    };

    const handleImageLoadSuccess = () => {
        setImageLoadFailed(false);
    };
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    const handleFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        setSelectedFile(file || null);
    };

    const initialData: IProfile = {
        image: userData.image,
        about: userData.about,
        expertise: userData.expertise,
        // Initialize other properties with default values
    };
    const isFieldChanged = (fieldName: keyof IProfile) => {
        return userData ? userData[fieldName] !== initialData[fieldName] : false;
    };


    useEffect(() => {
        if (!userLoading) {
            setAboutValue(userData?.about || "");
            setExpertiseValue(userData?.expertise || "");
        }
    }, [userData, userLoading]);



    // Toast
    const toast = useToast();
    const toastIdRef = useRef<ToastId>();
    const addToast = (data: any) => {
        toastIdRef.current = toast(data)
    }

    const {
        reFetch
    } = useUserSearchContext();


    // Mutation, query client, onsubmit, and api function 
    const queryClient = useQueryClient();

    const fullMutation = useMutation<
        MutationSuccess, MutationError, IFullUserUpdateVariables
    >(
        adminUpdateUser,
        {
            // Start of mutation handling
            onMutate: () => {
                addToast({
                    title: 'Updating membership...',
                    description: "One moment!",
                    status: 'loading',
                    position: "top-right",
                    // duration: 3000
                })
            },
            // Success handling based on API- file - declared interface
            onSuccess: (data) => {
                console.log(data)

                queryClient.refetchQueries([`user`, user.pk])
                queryClient.refetchQueries([`personalInfo`, user.pk])
                queryClient.refetchQueries([`membership`, user.pk])
                queryClient.refetchQueries([`profile`, user.pk])
                reFetch();
                if (toastIdRef.current) {
                    toast.update(toastIdRef.current, {
                        title: 'Success',
                        description: `Information Updated`,
                        status: 'success',
                        position: "top-right",
                        duration: 3000,
                        isClosable: true,
                    })
                }
                //  Close the modal
                if (onClose) {
                    onClose();
                }
            },
            // Error handling based on API - file - declared interface
            onError: (error) => {
                console.log(error)
                let errorMessage = 'An error occurred while updating'; // Default error message

                const collectErrors: any = (data: any, prefix = '') => {
                    if (typeof data === 'string') {
                        return [data];
                    }

                    const errorMessages = [];

                    for (const key in data) {
                        if (Array.isArray(data[key])) {
                            const nestedErrors = collectErrors(data[key], `${prefix}${key}.`);
                            errorMessages.push(...nestedErrors);
                        } else if (typeof data[key] === 'object') {
                            const nestedErrors = collectErrors(data[key], `${prefix}${key}.`);
                            errorMessages.push(...nestedErrors);
                        } else {
                            errorMessages.push(`${prefix}${key}: ${data[key]}`);
                        }
                    }

                    return errorMessages;
                };

                if (error.response && error.response.data) {
                    const errorMessages = collectErrors(error.response.data);
                    if (errorMessages.length > 0) {
                        errorMessage = errorMessages.join('\n'); // Join errors with new lines
                    }
                } else if (error.message) {
                    errorMessage = error.message; // Use the error message from the caught exception
                }

                if (toastIdRef.current) {
                    toast.update(toastIdRef.current, {
                        title: 'Update failed',
                        description: errorMessage,
                        status: 'error',
                        position: "top-right",
                        duration: 3000,
                        isClosable: true,
                    })
                }
            }
        }
    )


    const onSubmit = async ({
        userPk, title, phone, fax, branch, business_area, about, expertise
    }: IFullUserUpdateVariables) => {
        const image = activeOption === 'url' ? selectedImageUrl : selectedFile;
        // if (image !== null || isFieldChanged('about') || isFieldChanged('expertise')) {
        await fullMutation.mutateAsync({ userPk, title, phone, fax, branch, business_area, image, about, expertise });
        // Close the modal
        onClose();
        // } else {
        //     // No changes, show a message or take some other action
        // }
    };



    return (
        <Modal
            isOpen={isOpen}
            onClose={handleToastClose}
            size={"sm"}

        >
            <ModalOverlay />
            <ModalContent bg={colorMode === "light" ? "white" : "gray.800"}>
                <ModalHeader>Edit User?</ModalHeader>
                <ModalCloseButton />
                <Flex
                    as={"form"}
                    onSubmit={handleSubmit(onSubmit)}

                >
                    <ModalBody

                    >
                        {!userLoading && (
                            <Tabs isFitted variant='enclosed'
                            // index={activeTabIndex}
                            >
                                <TabList mb='1em'>
                                    <Tab>
                                        Base Information
                                    </Tab>
                                    <Tab>
                                        Profile
                                    </Tab>
                                    <Tab
                                        isDisabled={!userData.is_staff}
                                    >
                                        Organisation
                                    </Tab>

                                </TabList>
                                <TabPanels>
                                    <TabPanel>
                                        {!userLoading && (
                                            <>
                                                <FormControl my={2} mb={4} userSelect="none">
                                                    <InputGroup>
                                                        <Input type="hidden" {...register("userPk", { required: true, value: user.pk })} readOnly />
                                                    </InputGroup>
                                                </FormControl>
                                                <Grid
                                                    gridColumnGap={8}
                                                    gridTemplateColumns={"repeat(2, 1fr)"}
                                                >

                                                    {/* Title */}
                                                    <FormControl my={2} mb={4}
                                                        userSelect={"none"}
                                                    >
                                                        <FormLabel
                                                            onMouseEnter={() => setHoveredTitle(true)}
                                                            onMouseLeave={() => setHoveredTitle(false)}
                                                        >
                                                            Title
                                                        </FormLabel>

                                                        <InputGroup

                                                        >
                                                            <InputLeftAddon
                                                                left={0}
                                                                bg="transparent"
                                                                pl={2}
                                                                zIndex={1}
                                                                borderColor={titleBorderColor}
                                                                borderTopRightRadius={"none"}
                                                                borderBottomRightRadius={"none"}
                                                                borderRight={"none"}
                                                            >
                                                                <Icon as={GiGraduateCap} />
                                                            </InputLeftAddon>
                                                            <Select placeholder={'Select a title'}
                                                                borderLeft={"none"}
                                                                borderTopLeftRadius={"none"}
                                                                borderBottomLeftRadius={"none"}
                                                                pl={"0.5px"}
                                                                borderLeftColor={"transparent"}
                                                                onMouseEnter={() => setHoveredTitle(true)}
                                                                onMouseLeave={() => setHoveredTitle(false)}
                                                                {...register("title", {
                                                                    value: userData?.title,
                                                                })}
                                                            >
                                                                <option value='dr'>
                                                                    Dr.
                                                                </option>
                                                                <option value='mr'>
                                                                    Mr.
                                                                </option>
                                                                <option value='mrs'>
                                                                    Mrs.
                                                                </option>
                                                                <option value='ms'>
                                                                    Ms.
                                                                </option>
                                                                <option value='master'>
                                                                    Master
                                                                </option>

                                                            </Select>
                                                        </InputGroup>
                                                        {errors.title && (
                                                            <FormErrorMessage>{errors.title.message}</FormErrorMessage>
                                                        )}
                                                    </FormControl>

                                                    {/* Phone */}
                                                    <FormControl my={2} mb={4}
                                                        userSelect={"none"}
                                                    >
                                                        <FormLabel>Phone</FormLabel>
                                                        <InputGroup>
                                                            <InputLeftElement>
                                                                <Icon as={AiFillPhone} />
                                                            </InputLeftElement>
                                                            <Input
                                                                type="text"
                                                                placeholder={
                                                                    "Enter a phone number"
                                                                }
                                                                {...register("phone", {
                                                                    // placeHolder: "Enter a phone number",
                                                                    pattern: {
                                                                        value: phoneValidationPattern,
                                                                        message: 'Invalid phone number',
                                                                    },
                                                                    value: userData?.phone,
                                                                })}
                                                            />
                                                        </InputGroup>
                                                        {errors.phone && (
                                                            <FormErrorMessage>{errors.phone.message}</FormErrorMessage>
                                                        )}
                                                    </FormControl>


                                                    {/* Fax */}
                                                    <FormControl my={2} mb={4}
                                                        userSelect={"none"}
                                                    >
                                                        <FormLabel>Fax</FormLabel>
                                                        <InputGroup>
                                                            <InputLeftElement>
                                                                <Icon as={MdFax} />
                                                            </InputLeftElement>
                                                            <Input
                                                                type="text"
                                                                placeholder={
                                                                    "Enter a fax number"
                                                                }
                                                                {...register("fax", {
                                                                    // placeHolder: "Enter a phone number",
                                                                    pattern: {
                                                                        value: phoneValidationPattern,
                                                                        message: 'Invalid fax number',
                                                                    },
                                                                    value: userData?.fax,
                                                                })}
                                                            />
                                                        </InputGroup>
                                                        {errors.fax && (
                                                            <FormErrorMessage>{errors.fax.message}</FormErrorMessage>
                                                        )}
                                                    </FormControl>



                                                    {/* Email */}
                                                    <FormControl my={2} mb={4}
                                                        userSelect={"none"}
                                                    >
                                                        <FormLabel>Email</FormLabel>
                                                        <InputGroup>
                                                            <InputLeftElement>
                                                                <Icon as={GrMail} />
                                                            </InputLeftElement>
                                                            <Input

                                                                type="email"
                                                                placeholder={userData?.email}
                                                                value={userData?.email}
                                                                isDisabled={true}
                                                            />
                                                        </InputGroup>
                                                    </FormControl>


                                                    {/* First Name */}
                                                    <FormControl my={2} mb={4}
                                                        userSelect={"none"}
                                                    >
                                                        <FormLabel>First Name</FormLabel>
                                                        <InputGroup>
                                                            <InputLeftElement>
                                                                <Icon as={RiNumber1} />
                                                            </InputLeftElement>
                                                            <Input
                                                                type="text"
                                                                placeholder={userData?.first_name}
                                                                value={userData?.first_name}
                                                                isDisabled={true}
                                                            />
                                                        </InputGroup>
                                                    </FormControl>

                                                    {/* Last Name */}
                                                    <FormControl my={2} mb={4}
                                                        userSelect={"none"}
                                                    >
                                                        <FormLabel>Last Name</FormLabel>
                                                        <InputGroup>
                                                            <InputLeftElement>
                                                                <Icon as={RiNumber2} />
                                                            </InputLeftElement>
                                                            <Input
                                                                type="text"
                                                                placeholder={userData?.last_name}
                                                                value={userData?.last_name}
                                                                isDisabled={true}
                                                            />
                                                        </InputGroup>
                                                    </FormControl>
                                                </Grid>
                                            </>
                                        )}
                                    </TabPanel>
                                    <TabPanel>
                                        {!userLoading && (
                                            <Grid>
                                                <Box>
                                                    <FormControl userSelect="none">
                                                        <FormLabel>About</FormLabel>
                                                        <InputGroup>
                                                            <Textarea
                                                                placeholder="Tell us about yourself..."
                                                                {...register("about")}
                                                                value={aboutValue}
                                                                onChange={(e) => setAboutValue(e.target.value)}
                                                            />
                                                        </InputGroup>
                                                        {errors.about && (
                                                            <FormErrorMessage>{errors.about.message}</FormErrorMessage>
                                                        )}
                                                    </FormControl>
                                                </Box>
                                                <Box>
                                                    <FormControl userSelect="none">
                                                        <FormLabel>Expertise</FormLabel>
                                                        <Textarea
                                                            placeholder="Briefly, what do you focus on..."
                                                            {...register("expertise")}
                                                            value={expertiseValue}
                                                            onChange={(e) => setExpertiseValue(e.target.value)}
                                                        />
                                                        {errors.expertise && (
                                                            <FormErrorMessage>{errors.expertise.message}</FormErrorMessage>
                                                        )}
                                                    </FormControl>
                                                </Box>

                                                <Grid gridTemplateColumns={{ base: "3fr 10fr", md: "4fr 8fr" }} pos="relative" w="100%" h="100%">
                                                    <Box>
                                                        <FormLabel>Image</FormLabel>
                                                        <Center
                                                            maxH={{ base: "200px", xl: "225px" }}
                                                            bg="gray.50"
                                                            mt={1}
                                                            rounded="lg"
                                                            overflow="hidden"
                                                        >
                                                            {!imageLoadFailed ? (
                                                                <Image
                                                                    objectFit="cover"
                                                                    src={
                                                                        activeOption === 'url' && selectedImageUrl &&
                                                                            ((selectedImageUrl) || selectedImageUrl.trim() === "")
                                                                            ? isValidImageUrl ? selectedImageUrl : noImageLink
                                                                            : activeOption === 'upload' && selectedFile
                                                                                ? URL.createObjectURL(selectedFile)
                                                                                : userData?.image?.file
                                                                                    ? userData.image.file
                                                                                    : noImageLink
                                                                    }
                                                                    alt="Preview"
                                                                    userSelect="none"
                                                                    bg="gray.800"
                                                                    onLoad={handleImageLoadSuccess}
                                                                    onError={handleImageLoadError}
                                                                />
                                                            ) : (
                                                                <Image
                                                                    objectFit="cover"
                                                                    src={noImageLink}
                                                                    alt="Preview"
                                                                    userSelect="none"
                                                                    bg="gray.800"
                                                                />
                                                            )}
                                                        </Center>
                                                    </Box>
                                                    <FormControl ml={4} mt={10}>
                                                        <InputGroup>
                                                            <Grid gridGap={2} ml={4}>
                                                                <Button
                                                                    onClick={() => setActiveOption('url')}
                                                                    display="inline-flex"
                                                                    justifyContent="center"
                                                                    alignItems="center"
                                                                    bg={activeOption === 'url' ? 'blue.500' : (colorMode === "light" ? "gray.200" : "gray.700")}
                                                                    color={colorMode === "light" ? "black" : "white"}
                                                                >
                                                                    Enter URL
                                                                </Button>
                                                                {activeOption === 'url' && (
                                                                    <Input
                                                                        // value={selectedImageUrl || ''}
                                                                        onChange={(e) => {
                                                                            setImageLoadFailed(false);
                                                                            setSelectedImageUrl(e.target.value);
                                                                        }}
                                                                    />
                                                                )}
                                                                <Center>
                                                                    <Text>or</Text>
                                                                </Center>
                                                                <Button
                                                                    onClick={() => setActiveOption('upload')}
                                                                    display="inline-flex"
                                                                    justifyContent="center"
                                                                    alignItems="center"
                                                                    bg={activeOption === 'upload' ? 'blue.500' : (colorMode === "light" ? "gray.200" : "gray.700")}
                                                                    color={colorMode === "light" ? "black" : "white"}
                                                                >
                                                                    Upload
                                                                </Button>
                                                                {activeOption === 'upload' && (
                                                                    <FormControl>
                                                                        <Input
                                                                            type="file"
                                                                            accept="image/*"
                                                                            onChange={(e) => {
                                                                                const file = e.target.files?.[0];
                                                                                if (file) {
                                                                                    setSelectedFile(file);
                                                                                    setSelectedImageUrl(URL.createObjectURL(file));
                                                                                }
                                                                            }}
                                                                        />
                                                                    </FormControl>
                                                                )}
                                                                <FormHelperText>Upload an image for your display picture.</FormHelperText>
                                                                {errors.image && (
                                                                    <FormErrorMessage>{errors.image.message}</FormErrorMessage>
                                                                )}
                                                            </Grid>
                                                        </InputGroup>
                                                    </FormControl>
                                                </Grid>

                                            </Grid>
                                        )}
                                    </TabPanel>
                                    <TabPanel>
                                        {!userLoading && userData.is_staff && (
                                            <Grid>
                                                {/* Branch */}
                                                <FormControl my={2} mb={4}
                                                    userSelect={"none"}
                                                >
                                                    <FormLabel>Branch</FormLabel>
                                                    <InputGroup>
                                                        {branches &&
                                                            (
                                                                <Select placeholder={'Select a Branch'}
                                                                    // defaultValue={currentBranchData?.pk}
                                                                    defaultValue={userData?.branch?.pk || ""}

                                                                    {...register("branch")}
                                                                >
                                                                    {branches.map((branch: IBranch, index: number) => {
                                                                        return (
                                                                            <option key={index} value={branch.pk}
                                                                            // selected={branch.pk === currentBranchData?.pk || branch.pk === undefined}
                                                                            >
                                                                                {branch.name}
                                                                            </option>
                                                                        )
                                                                    })}
                                                                </Select>
                                                            )}

                                                    </InputGroup>
                                                </FormControl>

                                                {/* Business Area */}
                                                <FormControl my={2} mb={4}
                                                    userSelect={"none"}
                                                >
                                                    <FormLabel>Business Area</FormLabel>
                                                    <InputGroup>
                                                        {businessAreas &&
                                                            (
                                                                <Select
                                                                    placeholder={'Select a Business Area'}
                                                                    defaultValue={userData?.business_area?.pk || ""}

                                                                    {...register("business_area")}

                                                                >
                                                                    {businessAreas.map((ba: IBusinessArea, index: number) => {
                                                                        return (
                                                                            <option key={index} value={ba.pk}
                                                                            // selected={ba.pk === currentBaData?.pk || ba.pk === undefined}
                                                                            >
                                                                                {ba.name}
                                                                            </option>
                                                                        )
                                                                    })}
                                                                </Select>
                                                            )}

                                                    </InputGroup>
                                                </FormControl>
                                            </Grid>
                                        )}

                                        {!userLoading && !userData.is_staff && (
                                            <Text>This user is external</Text>
                                        )}
                                    </TabPanel>
                                </TabPanels>
                            </Tabs>

                        )
                        }

                    </ModalBody>
                    <ModalFooter pos="absolute" bottom={0} right={0}>
                        <Grid
                            gridTemplateColumns={"repeat(2, 1fr)"}
                            gridGap={4}
                        >
                            <Button
                                colorScheme="gray"
                            >
                                Cancel
                            </Button>
                            <Button
                                // isDisabled={!changesMade}
                                isLoading={fullMutation.isLoading}
                                type="submit"
                                bgColor={colorMode === "light" ? `green.500` : `green.600`}
                                color={colorMode === "light" ? `white` : `whiteAlpha.900`}
                                _hover={{
                                    bg: colorMode === "light" ? `green.600` : `green.400`,
                                    color: colorMode === "light" ? `white` : `white`
                                }}
                                ml={3}
                            >
                                Update
                            </Button>
                        </Grid>
                    </ModalFooter>
                </Flex>


            </ModalContent>
        </Modal>
    )
}