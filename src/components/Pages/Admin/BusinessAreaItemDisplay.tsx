import { Box, Button, Center, Drawer, DrawerBody, DrawerContent, DrawerFooter, DrawerOverlay, Flex, FormControl, FormErrorMessage, FormHelperText, FormLabel, Grid, HStack, Image, Input, InputGroup, InputLeftAddon, Menu, MenuButton, MenuItem, MenuList, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, Select, Skeleton, Text, Textarea, VStack, useDisclosure, useToast } from "@chakra-ui/react"
import { IBusinessArea } from "../../../types"
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { MdMoreVert } from "react-icons/md";
import { useForm } from "react-hook-form";
import { FaSign } from "react-icons/fa";
import { deleteBusinessArea, updateBusinessArea } from "../../../lib/api";
import { useFullUserByPk } from "../../../lib/hooks/useFullUserByPk";
import { UserProfile } from "../Users/UserProfile";
import { useNoImage } from "../../../lib/hooks/useNoImage";
import useServerImageUrl from "../../../lib/hooks/useServerImageUrl";
import useApiEndpoint from "../../../lib/hooks/useApiEndpoint";
import { UserSearchDropdown } from "../../Navigation/UserSearchDropdown";
import { useState } from "react";
import { TextButtonFlex } from "../../TextButtonFlex";
// import { useEffect } from "react";
// import NoImageFile from '/sad-face.gif'

export const BusinessAreaItemDisplay = ({ pk, slug, name, leader, finance_admin, data_custodian, focus, introduction, image }: IBusinessArea) => {

    const { register, handleSubmit, watch, formState: { errors } } = useForm<IBusinessArea>();

    const toast = useToast();
    const { isOpen: isDeleteModalOpen, onOpen: onDeleteModalOpen, onClose: onDeleteModalClose } = useDisclosure();
    const { isOpen: isUpdateaModalOpen, onOpen: onUpdateModalOpen, onClose: onUpdateModalClose } = useDisclosure();
    const queryClient = useQueryClient();


    const { userLoading: leaderLoading, userData: leaderData } = useFullUserByPk(leader);
    const { userLoading: financeAdminLoading, userData: financeAdminData } = useFullUserByPk(finance_admin);
    const { userLoading: dataCustodianLoading, userData: dataCustodianData } = useFullUserByPk(data_custodian);

    const NoImageFile = useNoImage();
    const apiEndpoint = useApiEndpoint();
    // console.log(`${apiEndpoint}/files/${image.file}`)

    const [imageLoadFailed, setImageLoadFailed] = useState(false);
    const noImageLink = useNoImage();
    // const imageUrl = useServerImageUrl(noImageLink);

    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>();



    // console.log(image.file)
    const updateMutation = useMutation(updateBusinessArea,
        {
            onSuccess: () => {
                // console.log("success")
                toast({
                    status: "success",
                    title: "Updated",
                    position: "top-right"
                })
                onUpdateModalClose();
                queryClient.invalidateQueries(["businessAreas"]);

            },
            onError: () => {
                // console.log("error")
                toast({
                    status: "error",
                    title: "Failed",
                    position: "top-right"
                })
            },
            onMutate: () => {
                // console.log("attempting update private")
            }
        })


    const deleteMutation = useMutation(deleteBusinessArea,
        {
            onSuccess: () => {
                // console.log("success")
                toast({
                    status: "success",
                    title: "Deleted",
                    position: "top-right"
                })
                onDeleteModalClose();
                queryClient.invalidateQueries(["businessAreas"]);

            },
            onError: () => {
                // console.log("error")

            },
            onMutate: () => {
                // console.log("mutation")

            }
        }
    );

    const deleteBtnClicked = () => {
        deleteMutation.mutate(pk);
    }


    const onUpdateSubmit = (formData: IBusinessArea) => {
        console.log(formData)

        const {
            pk,
            agency,
            old_id,
            name,
            slug,
            leader,
            data_custodian,
            finance_admin,
            focus,
            introduction,
        } = formData;
        const image = selectedFile;

        // Create an object to pass as a single argument to mutation.mutate
        const payload = {
            pk,
            agency,
            old_id,
            name,
            slug,
            leader,
            data_custodian,
            finance_admin,
            focus,
            introduction,
            image,
        };
        console.log(payload)


        updateMutation.mutate(payload);
        // updateMutation.mutate(formData);
    }


    const { isOpen: isLeaderOpen, onOpen: onLeaderOpen, onClose: onLeaderClose } = useDisclosure();
    const { isOpen: isDataCustodianOpen, onOpen: onDataCustodianOpen, onClose: onDataCustodianClose } = useDisclosure();
    const { isOpen: isFinanceAdminOpen, onOpen: onFinanceAdminOpen, onClose: onFinanceAdminClose } = useDisclosure();
    const leaderDrawerFunction = () => {
        console.log(`${leaderData?.first_name} clicked`);
        onLeaderOpen();
    }
    const financeAdminDrawerFunction = () => {
        console.log(`${financeAdminData?.first_name} clicked`);
        onFinanceAdminOpen();
    }
    const dataCustodianDrawerFunction = () => {
        console.log(`${dataCustodianData?.first_name} clicked`);
        onDataCustodianOpen();
    }


    const [selectedLeader, setSelectedLeader] = useState<number>();
    const [selectedFinanceAdmin, setSelectedFinanceAdmin] = useState<number>();
    const [selectedDataCustodian, setSelectedDataCustodian] = useState<number>();
    const nameData = watch('name');
    // const slugData = watch('slug');
    const focusData = watch('focus');
    const introductionData = watch('introduction');
    const imageData = watch('image');

    return (
        !leaderLoading && leaderData ? (
            <>

                <Drawer
                    isOpen={isLeaderOpen}
                    placement='right'
                    onClose={onLeaderClose}
                    size={"sm"} //by default is xs
                >
                    <DrawerOverlay />
                    <DrawerContent>
                        <DrawerBody>
                            <UserProfile
                                pk={leader}
                            />
                        </DrawerBody>

                        <DrawerFooter>
                        </DrawerFooter>
                    </DrawerContent>
                </Drawer>
                {!dataCustodianLoading && dataCustodianData !== null && dataCustodianData !== undefined

                    && (
                        <Drawer
                            isOpen={isDataCustodianOpen}
                            placement='right'
                            onClose={onDataCustodianClose}
                            size={"sm"} //by default is xs
                        >
                            <DrawerOverlay />
                            <DrawerContent>
                                <DrawerBody>
                                    <UserProfile
                                        pk={data_custodian}
                                    />
                                </DrawerBody>

                                <DrawerFooter>
                                </DrawerFooter>
                            </DrawerContent>
                        </Drawer>

                    )
                }

                {!financeAdminLoading && financeAdminData !== null && financeAdminData !== undefined

                    && (
                        <Drawer
                            isOpen={isFinanceAdminOpen}
                            placement='right'
                            onClose={onFinanceAdminClose}
                            size={"sm"} //by default is xs
                        >
                            <DrawerOverlay />
                            <DrawerContent>
                                <DrawerBody>
                                    <UserProfile
                                        pk={finance_admin}
                                    />
                                </DrawerBody>

                                <DrawerFooter>
                                </DrawerFooter>
                            </DrawerContent>
                        </Drawer>


                    )
                }



                <Grid
                    gridTemplateColumns="2fr 4fr 3fr 3fr 3fr 1fr"
                    width="100%"
                    p={3}
                    borderWidth={1}
                // bg={"red"}
                >
                    <Flex justifyContent="flex-start"
                        alignItems={"center"}

                    >
                        {name ?
                            <Box rounded="lg" overflow="hidden" w="80px" h="69px">
                                <Image
                                    src={
                                        image instanceof File
                                            ? `${apiEndpoint}${image.name}` // Use the image directly for File
                                            : image?.file
                                                ? `${apiEndpoint}${image.file}`
                                                : NoImageFile
                                    }
                                    width={"100%"}
                                    height={"100%"}
                                    objectFit={"cover"}

                                />
                            </Box>

                            : <Skeleton
                                rounded="lg" overflow="hidden" w="80px" h="69px"
                            />}
                    </Flex>
                    <TextButtonFlex
                        name={name}
                        onClick={onUpdateModalOpen}
                    />
                    <TextButtonFlex
                        name={`${leaderData.first_name} ${leaderData.last_name}`}
                        onClick={leaderDrawerFunction}
                    />

                    {
                        (!financeAdminLoading && financeAdminData) ?
                            <TextButtonFlex
                                name={`${financeAdminData.first_name} ${financeAdminData.last_name}`}
                                onClick={financeAdminDrawerFunction}
                            /> :
                            <TextButtonFlex />
                    }

                    {/* 
                    <Flex
                        alignItems={"center"}

                    >
                        {
                            !financeAdminLoading && (
                                financeAdminData ?
                                    <Button
                                        variant={"link"}
                                        colorScheme="blue"
                                        onClick={financeAdminDrawerFunction}
                                    >
                                        {`${financeAdminData.first_name} ${financeAdminData.last_name}`}
                                    </Button> :
                                    <Text>Unset</Text>

                            )
                        }

                    </Flex> */}
                    {
                        (!dataCustodianLoading && dataCustodianData) ?
                            <TextButtonFlex
                                name={`${dataCustodianData.first_name} ${dataCustodianData.last_name}`}
                                onClick={dataCustodianDrawerFunction}
                            /> :
                            <TextButtonFlex />
                    }
                    {/* <Flex
                        alignItems={"center"}
                    >
                        {
                            !dataCustodianLoading && (
                                dataCustodianData ?
                                    <Button
                                        variant={"link"}
                                        colorScheme="blue"
                                        onClick={dataCustodianDrawerFunction}
                                    >
                                        {`${dataCustodianData.first_name} ${dataCustodianData.last_name}`}
                                    </Button> :
                                    <Text>Unset</Text>

                            )
                        }

                    </Flex> */}


                    <Flex
                        justifyContent="flex-end"
                        mr={2}
                        alignItems={"center"}
                    >

                        <Menu
                        >
                            <MenuButton
                                px={2}
                                py={2}
                                transition='all 0.2s'
                                rounded={4}
                                borderRadius='md'
                                borderWidth='1px'
                                _hover={{ bg: 'gray.400' }}
                                _expanded={{ bg: 'blue.400' }}
                                _focus={{ boxShadow: 'outline' }}

                            >
                                <Flex alignItems={"center"} justifyContent={"center"}>

                                    <MdMoreVert />
                                </Flex>

                            </MenuButton>
                            <MenuList>
                                <MenuItem onClick={onUpdateModalOpen}>
                                    Edit
                                </MenuItem>
                                <MenuItem onClick={onDeleteModalOpen}>
                                    Delete
                                </MenuItem>
                            </MenuList>
                        </Menu>
                        {/* </Button> */}
                    </Flex>


                </Grid>
                <Modal isOpen={isDeleteModalOpen} onClose={onDeleteModalClose}>
                    <ModalOverlay />
                    <ModalContent bg="white">
                        <ModalHeader>Delete Business Area</ModalHeader>
                        <ModalBody>
                            <Box>
                                <Text fontSize="lg" fontWeight="semibold">
                                    Are you sure you want to delete this business area?
                                </Text>

                                <Text
                                    fontSize="lg"
                                    fontWeight="semibold"
                                    color={"blue.500"}
                                    mt={4}
                                >
                                    "{name}"
                                </Text>

                            </Box>
                        </ModalBody>
                        <ModalFooter justifyContent="flex-end">
                            <Flex>
                                <Button onClick={onDeleteModalClose} colorScheme="red">
                                    No
                                </Button>
                                <Button onClick={deleteBtnClicked} colorScheme="green" ml={3}>
                                    Yes
                                </Button>
                            </Flex>

                        </ModalFooter>
                    </ModalContent>
                </Modal>
                <Modal isOpen={isUpdateaModalOpen} onClose={onUpdateModalClose}
                    size={"4xl"}
                    scrollBehavior="outside"
                >
                    <ModalOverlay />
                    <ModalHeader>Update Business Area</ModalHeader>
                    <ModalBody>
                        <ModalContent bg="white" p={4} px={6}>
                            <FormControl>
                                {/* Hidden input to capture the pk */}
                                <input
                                    type="hidden"
                                    {...register("pk")}
                                    defaultValue={pk} // Prefill with the 'pk' prop
                                />
                            </FormControl>
                            <FormControl>
                                {/* Hidden input to capture the slug */}
                                <input
                                    type="hidden"
                                    {...register("slug")}
                                    defaultValue={slug} // Prefill with the 'pk' prop
                                />
                            </FormControl>
                            <VStack spacing={3} as="form" id="update-form" onSubmit={handleSubmit(onUpdateSubmit)}>
                                <FormControl>
                                    <FormLabel>Name</FormLabel>
                                    <InputGroup>
                                        {/* <InputLeftAddon children={<FaSign />} /> */}
                                        <Input
                                            autoComplete="off"
                                            autoFocus
                                            {...register("name", { required: true })}
                                            required
                                            type="text"
                                            defaultValue={name} // Prefill with the 'name' prop
                                        />
                                    </InputGroup>
                                </FormControl>
                                <FormControl isRequired>
                                    <FormLabel>Focus</FormLabel>
                                    <InputGroup>
                                        <Textarea
                                            {...register("focus", { required: true })}
                                            required
                                            defaultValue={focus}
                                        />

                                    </InputGroup>
                                    <FormHelperText>Primary concerns of the Business Area</FormHelperText>
                                </FormControl>

                                <FormControl isRequired>
                                    <FormLabel>Introduction</FormLabel>
                                    <InputGroup>
                                        <Textarea
                                            {...register("introduction", { required: true })}
                                            required
                                            defaultValue={introduction}

                                        />

                                    </InputGroup>
                                    <FormHelperText>A description of the Business Area</FormHelperText>
                                </FormControl>

                                <FormControl isRequired>
                                    {/* <FormLabel>Image</FormLabel>
                                        <InputGroup>
                                            <Input
                                                {...register("image", { required: true })}
                                                required
                                                type="text"
                                            />

                                        </InputGroup> */}

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
                                                        src={selectedFile !== null ? selectedImageUrl : image ?
                                                            image instanceof File ?

                                                                `${apiEndpoint}${image.name}` // Use the image directly for File
                                                                : image?.file
                                                                    ? `${apiEndpoint}${image.file}`
                                                                    : NoImageFile
                                                            : NoImageFile
                                                        }
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
                                                            {...register("image", { required: true })}
                                                            alignItems={"center"}
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
                                                    <FormHelperText>Select an image for the Business Area.</FormHelperText>
                                                    {errors.image && (
                                                        <FormErrorMessage>{errors.image.message}</FormErrorMessage>
                                                    )}
                                                </Grid>
                                            </InputGroup>
                                        </FormControl>
                                    </Grid>

                                    {/* <FormHelperText>Select an image for the Business Area</FormHelperText> */}
                                </FormControl>

                                <FormControl
                                    mt={3}
                                >
                                    {/* <FormLabel>Leader</FormLabel>
                                    <Input
                                        {...register("leader", { required: true })}
                                        defaultValue={leader} // Prefill 
                                    /> */}
                                    <UserSearchDropdown
                                        {...register("leader", { required: true })}

                                        onlyInternal={false}
                                        isRequired={true}
                                        setUserFunction={setSelectedLeader}
                                        preselectedUserPk={leader}
                                        isEditable
                                        label="Leader"
                                        placeholder="Search for a user"
                                        helperText={
                                            <>
                                                The leader of the business area.
                                            </>
                                        }
                                    />

                                </FormControl>

                                <FormControl>
                                    <UserSearchDropdown
                                        {...register("finance_admin", { required: true })}

                                        onlyInternal={false}
                                        isRequired={true}
                                        setUserFunction={setSelectedFinanceAdmin}
                                        preselectedUserPk={finance_admin}
                                        isEditable
                                        label="Finance Admin"
                                        placeholder="Search for a user"
                                        helperText={
                                            <>
                                                The FA of the business area.
                                            </>
                                        }
                                    />
                                </FormControl>
                                <FormControl>
                                    <UserSearchDropdown
                                        {...register("data_custodian", { required: true })}

                                        onlyInternal={false}
                                        isRequired={true}
                                        setUserFunction={setSelectedDataCustodian}
                                        preselectedUserPk={data_custodian}
                                        isEditable
                                        label="Data Custodian"
                                        placeholder="Search for a user"
                                        helperText={
                                            <>
                                                The DC of the business area.
                                            </>
                                        }
                                    />
                                </FormControl>
                                {updateMutation.isError ? (
                                    <Text color={"red.500"}>Something went wrong</Text>
                                ) : null}
                            </VStack>
                            <Grid
                                mt={10}
                                w={"100%"}
                                justifyContent={"end"}
                                gridTemplateColumns={"repeat(2, 1fr)"}
                                gridGap={4}
                            >
                                <Button onClick={onUpdateModalClose}
                                    size="lg"

                                >
                                    Cancel
                                </Button>
                                <Button
                                    // form="update-form"
                                    // type="submit"
                                    isLoading={updateMutation.isLoading}
                                    colorScheme="blue"
                                    size="lg"
                                    onClick={() => {
                                        console.log("clicked")
                                        onUpdateSubmit(
                                            {
                                                "pk": pk,
                                                "agency": 1,
                                                "old_id": 1,
                                                "name": nameData,
                                                "slug": slug,
                                                "leader": selectedLeader,
                                                "data_custodian": selectedDataCustodian,
                                                "finance_admin": selectedFinanceAdmin,
                                                "focus": focusData,
                                                "introduction": introductionData,
                                                "image": imageData,
                                            }
                                        )

                                    }}

                                >
                                    Update
                                </Button>
                            </Grid>

                        </ModalContent>
                    </ModalBody>
                </Modal>

            </>

        ) : null
    )
}