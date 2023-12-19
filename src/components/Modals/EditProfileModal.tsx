// Modal for editing profile section of user
// const [selectedFile, setSelectedFile] = useState<File | undefined>(undefined);

import { Image, Text, Button, Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, ModalFooter, useColorMode, Grid, FormControl, FormLabel, InputGroup, Input, useToast, FormErrorMessage, ToastId, Box, FormHelperText, Textarea, Center, Flex } from '@chakra-ui/react';
import { useEffect, useRef, useState } from 'react';
import { useForm, useWatch, SubmitHandler } from 'react-hook-form';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { updateProfile, IProfileUpdateVariables, getProfile, IProfileUpdateError, IProfileUpdateSuccess } from '../../lib/api';
import { IProfile } from '../../types';
// import noImageLink from "/sad-face.png"
import useServerImageUrl from '../../lib/hooks/useServerImageUrl';
import { useNoImage } from '../../lib/hooks/useNoImage';

interface IEditProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
    userId: string;
    currentImage: string;
}


export const EditProfileModal = ({ isOpen, onClose, userId, currentImage }: IEditProfileModalProps) => {
    const imageUrl = useServerImageUrl(currentImage);

    const noImageLink = useNoImage();

    const { isLoading, data } = useQuery<IProfile>(["profile", userId], getProfile);

    const { colorMode } = useColorMode();

    const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(
        currentImage
        // imageUrl
        // data?.image?.file || data?.image?.old_file || null
    );
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [imageLoadFailed, setImageLoadFailed] = useState(false);

    const handleImageLoadError = () => {
        console.log(`There was an error loading images. Selected: ${selectedImageUrl}. Current ${imageUrl}`)
        setImageLoadFailed(true);
    };

    const handleImageLoadSuccess = () => {
        setImageLoadFailed(false);
    };

    // Update this useEffect to set the selectedImageUrl when a new file is selected
    useEffect(() => {
        if (selectedFile) {
            setSelectedImageUrl(URL.createObjectURL(selectedFile));
        }
    }, [selectedFile]);

    const handleFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        setSelectedFile(file || null);
    };


    const initialData: IProfile = data || {
        image: null,
        about: '',
        expertise: '',
        // Initialize other properties with default values
    };

    const isFieldChanged = (fieldName: keyof IProfile, fieldValue: string) => {
        return data ? data[fieldName] !== fieldValue : false;
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
        const image = selectedFile;
        console.log(selectedFile)
        // Check if about and expertise fields have changed
        const aboutChanged = about !== undefined && isFieldChanged('about', about);
        const expertiseChanged = expertise !== undefined && isFieldChanged('expertise', expertise);

        if (selectedFile !== null || aboutChanged || expertiseChanged) {
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


    useEffect(() => {
        console.log(
            {
                "selectedImageUrl": selectedImageUrl,
                "selectedFile": selectedFile,
                "imageUrl": imageUrl,
                "currentImage": currentImage,
            }
        )

    }, [selectedImageUrl, selectedFile, imageUrl, currentImage])

    return (
        <Modal isOpen={isOpen} onClose={onClose}
            size={"3xl"} scrollBehavior='inside'
        >
            <ModalOverlay />
            <ModalContent bg={colorMode === "light" ? "white" : "gray.800"}
                as="form"
                onSubmit={handleSubmit(onSubmit)}
            >

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
                                                    src={selectedFile !== null && selectedImageUrl || imageUrl || noImageLink}
                                                    alt="Preview"
                                                    userSelect="none"
                                                    bg="gray.800"
                                                // onLoad={handleImageLoadSuccess}
                                                // onError={handleImageLoadError}
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
                                                <FormControl>
                                                    <Input
                                                        autoComplete="off"

                                                        alignItems={"center"}
                                                        type="file"
                                                        // accept="image/*"
                                                        accept=".png, .jpeg, .jpg, image/png, image/jpeg"

                                                        onChange={(e) => {
                                                            const file = e.target.files?.[0];
                                                            if (file) {
                                                                setSelectedFile(file);
                                                                setSelectedImageUrl(URL.createObjectURL(file));
                                                            }
                                                        }}
                                                    />
                                                </FormControl>
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
                                    selectedFile === null &&
                                    aboutValue === initialData.about &&
                                    expertiseValue === initialData.expertise
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
