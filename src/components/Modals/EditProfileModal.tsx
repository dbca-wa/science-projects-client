// Modal for editing profile section of user
// const [selectedFile, setSelectedFile] = useState<File | undefined>(undefined);

import { Image, Text, Button, Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, ModalFooter, useColorMode, Grid, FormControl, FormLabel, InputGroup, Input, useToast, FormErrorMessage, ToastId, Box, FormHelperText, Textarea, Center, Flex } from '@chakra-ui/react';
import { useEffect, useRef, useState } from 'react';
import { useForm, useWatch, SubmitHandler } from 'react-hook-form';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { updateProfile, IProfileUpdateVariables, getProfile, IProfileUpdateError, IProfileUpdateSuccess } from '../../lib/api';
import { IProfile } from '../../types';
import noImageLink from "/sad-face.png"

interface IEditProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
    userId: string;
    currentImage: string;
}


export const EditProfileModal = ({ isOpen, onClose, userId, currentImage }: IEditProfileModalProps) => {
    const { isLoading, data } = useQuery<IProfile>(["profile", userId], getProfile);

    const { colorMode } = useColorMode();

    const [activeOption, setActiveOption] = useState<'url' | 'upload'>(
        data?.image?.old_file ? 'url' : 'upload'
    );
    const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(
        data?.image?.file || data?.image?.old_file || null
    );
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [imageLoadFailed, setImageLoadFailed] = useState(false);

    // Check if the selected image URL is valid
    const isValidImageUrl = selectedImageUrl !== null &&
        selectedImageUrl !== undefined &&
        selectedImageUrl.trim() !== "" &&
        (selectedImageUrl.startsWith("https://") ||
            selectedImageUrl.startsWith("http://") || selectedImageUrl.startsWith("blob")) &&
        selectedImageUrl.match(/\.(jpg|jpeg|png)$/i) ||
        selectedImageUrl?.startsWith('https://imagedelivery.net/');

    const handleImageLoadError = () => {
        setImageLoadFailed(true);
    };

    const handleImageLoadSuccess = () => {
        setImageLoadFailed(false);
    };

    const initialData: IProfile = data || {
        image: null,
        about: '',
        expertise: '',
        // Initialize other properties with default values
    };

    // const isFieldChanged = (fieldName: keyof IProfile) => {
    //     return data ? data[fieldName] !== initialData[fieldName] : false;
    // };
    const isFieldChanged = (fieldName: keyof IProfile, fieldValue: string) => {
        return data ? data[fieldName] !== fieldValue : false;
    };

    const handleFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        setSelectedFile(file || null);
    };

    //  React Hook Form

    const {
        register,
        handleSubmit,
        formState: { errors },
        watch,

    } = useForm<IProfileUpdateVariables>();

    // Toast
    const toast = useToast();
    const toastIdRef = useRef<ToastId>();
    const addToast = (data: any) => {
        toastIdRef.current = toast(data)
    }

    // Mutation, query client, onsubmit, and api function 
    const queryClient = useQueryClient();

    const mutation = useMutation<
        IProfileUpdateSuccess, IProfileUpdateError, IProfileUpdateVariables
    >(
        updateProfile,
        {
            // Start of mutation handling
            onMutate: () => {
                addToast({
                    title: 'Updating profile...',
                    description: "One moment!",
                    status: 'loading',
                    position: "top-right",
                    // duration: 3000
                })
            },
            // Success handling based on API- file - declared interface
            onSuccess: (data) => {
                console.log(data)
                queryClient.refetchQueries([`profile`, userId])
                queryClient.refetchQueries([`me`])

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
                if (toastIdRef.current) {
                    toast.update(toastIdRef.current, {
                        title: 'Update failed',
                        description: `${error?.response?.data ? error.response.data : error}`,
                        status: 'error',
                        position: "top-right",
                        duration: 3000,
                        isClosable: true,
                    })
                }
            }
        }
    )

    //  When submitting form - starts the mutation
    const onSubmit = async ({
        userPk,
        about,
        expertise,
    }: IProfileUpdateVariables) => {
        const image = activeOption === 'url' ? selectedImageUrl : selectedFile;
        console.log(selectedFile)
        console.log(selectedImageUrl)
        // Check if about and expertise fields have changed
        const aboutChanged = about !== undefined && isFieldChanged('about', about);
        const expertiseChanged = expertise !== undefined && isFieldChanged('expertise', expertise);

        if (selectedFile !== null || selectedImageUrl !== null || aboutChanged || expertiseChanged) {
            if (aboutChanged && expertiseChanged) {
                console.log('image + about and expertise changed');
                await mutation.mutateAsync({ userPk, image, about, expertise });
            } else if (aboutChanged) {
                console.log('image + about changed');
                await mutation.mutateAsync({ userPk, image, about });
            } else if (expertiseChanged) {
                console.log('image + expertise changed');
                await mutation.mutateAsync({ userPk, image, expertise });
            } else if (!expertiseChanged && !aboutChanged) {
                console.log('only image changed');
                await mutation.mutateAsync({ userPk, image });
            }
            // onClose();
        } else {
            if (aboutChanged && expertiseChanged) {
                console.log('about + expertise changed');
                await mutation.mutateAsync({ userPk, about, expertise });
            } else if (aboutChanged) {
                console.log('about changed');

                await mutation.mutateAsync({ userPk, about });
            } else if (expertiseChanged) {
                console.log('expertise changed');

                await mutation.mutateAsync({ userPk, expertise });
            }
            else {
                console.log("Nothing changed")
            }
            // onClose();
        }
    };

    const [aboutValue, setAboutValue] = useState(data?.about || "");
    const [expertiseValue, setExpertiseValue] = useState(data?.expertise || "");

    useEffect(() => {
        if (!isLoading) {
            setAboutValue(data?.about || "");
            setExpertiseValue(data?.expertise || "");
        }
    }, [data, isLoading]);


    // useEffect(() => {
    //     console.log(currentImage);
    //     console.log(selectedFile);
    //     console.log(selectedImageUrl);
    // }, [selectedFile, currentImage, selectedImageUrl])

    return (
        <Modal isOpen={isOpen} onClose={onClose}
            size={"3xl"} scrollBehavior='inside'
        >
            <ModalOverlay />
            <ModalContent bg={colorMode === "light" ? "white" : "gray.800"}
                as="form"
                onSubmit={handleSubmit(onSubmit)}
            // display="flex" flexDirection="column" as={"form"} onSubmit={handleSubmit(onSubmit)}
            >
                {/* <Flex
                    direction="column"
                    height="100%"
                    as="form"
                    onSubmit={handleSubmit(onSubmit)}
                > */}

                <ModalHeader>Edit Profile</ModalHeader>
                <ModalCloseButton />
                {!isLoading && (
                    <>
                        <ModalBody pos="relative" flex={1}>
                            <FormControl my={2} mb={4} userSelect="none">
                                <InputGroup>
                                    <Input type="hidden" {...register("userPk", { required: true, value: userId })} readOnly />
                                </InputGroup>
                            </FormControl>
                            <Grid gridTemplateColumns={"repeat(1, 1fr)"} gridGap={4}>
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
                                                                : currentImage
                                                                    ? currentImage
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
                        </ModalBody>
                        <ModalFooter
                        // pos="absolute" bottom={0} right={0}
                        >
                            <Button
                                isLoading={mutation.isLoading}
                                type="submit"
                                bgColor={colorMode === "light" ? `green.500` : `green.600`}
                                color={colorMode === "light" ? `white` : `whiteAlpha.900`}
                                _hover={{
                                    bg: colorMode === "light" ? `green.600` : `green.400`,
                                    color: colorMode === "light" ? `white` : `white`
                                }}
                                ml={3}
                                isDisabled={
                                    (selectedFile === null && selectedImageUrl === null) && aboutValue === initialData.about && expertiseValue === initialData.expertise
                                }

                            >
                                Update
                            </Button>
                        </ModalFooter>
                    </>
                )}
                {/* </Flex> */}

            </ModalContent>
        </Modal>);

}




// maxH={
//     {
//         base: "200px",
//         xl: "300px"
//     }
// }



{/* {!imageLoadFailed ? (
                                                    <Image
                                                        objectFit="cover"
                                                        src={
                                                            currentImage ?
                                                                currentImage :
                                                                selectedImageUrl !== undefined && selectedImageUrl !== null && isValidImageUrl && selectedImageUrl?.trim() !== ""
                                                                    ? selectedImageUrl
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
                                                        src={noImageLink
                                                        }
                                                        alt="Preview"
                                                        userSelect="none"
                                                        bg="gray.800"
                                                    />

                                                )} */}