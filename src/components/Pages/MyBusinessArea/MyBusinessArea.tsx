import { UnboundStatefulEditor } from "@/components/RichTextEditor/Editors/UnboundStatefulEditor";
import { IMyBAUpdateSubmissionData, updateMyBa } from "@/lib/api";
import useApiEndpoint from "@/lib/hooks/helper/useApiEndpoint";
import useDistilledHtml from "@/lib/hooks/helper/useDistilledHtml";
import { useNoImage } from "@/lib/hooks/helper/useNoImage";
import { useMyBusinessAreas } from "@/lib/hooks/tanstack/useMyBusinessAreas";
import { useUser } from "@/lib/hooks/tanstack/useUser";
import { BusinessAreaImage, IUserMe } from "@/types";
import { Box, Button, Center, FormControl, FormLabel, Icon, Image, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, Text, useColorMode, useDisclosure, useToast } from "@chakra-ui/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { FaEdit } from "react-icons/fa";
import { StatefulMediaChanger } from "../Admin/StatefulMediaChanger";
// Show BAs how their BA will display on AR


export const MyBusinessArea = () => {

    const { userData, userLoading } = useUser();
    const { basLoading, baData: myBusinessAreas } = useMyBusinessAreas();

    // useEffect(() => { console.log(userData) }, [userData])
    // const [businessAreas, setBusinessAreas] = useState<IDummyData[]>();
    // useEffect(() => {
    //     // if (userData && !basLoading) {
    //     console.log(myBusinessAreas)
    //     // }
    // }, [userData, basLoading, myBusinessAreas])

    // useEffect(() => {
    //     if (userLoading === false && userData) {
    //         setBusinessAreas([
    //             {
    //                 "leader": userData,
    //                 "pk": 2,
    //                 "name": "Animal Science",
    //                 "introduction": "Applied research undertaken by the Animal Science Program seeks to understand the factors and processes critical for conserving Western Australia's rich and unique native fauna. The major objectives of the program are to ensure the persistence of threatened species through local and landscape-scale management actions, including reducing key threats such as predation by foxes and feral cats, inappropriate fire regimes, competition and predation by introduced rodents on islands, as well as assessing cane toad impacts and reconstructing the fauna of rangeland and arid areas.",
    //                 "image": "http://127.0.0.1:8000/files/business_areas/AnimalScience.jpg",
    //             },
    //             // {
    //             //     "leader": userData,
    //             //     "pk": 3,
    //             //     "name": "Animal Science",
    //             //     "introduction": "Applied research undertaken by the Animal Science Program seeks to understand the factors and processes critical for conserving Western Australia's rich and unique native fauna. The major objectives of the program are to ensure the persistence of threatened species through local and landscape-scale management actions, including reducing key threats such as predation by foxes and feral cats, inappropriate fire regimes, competition and predation by introduced rodents on islands, as well as assessing cane toad impacts and reconstructing the fauna of rangeland and arid areas.",
    //             //     "image": "http://127.0.0.1:8000/files/business_areas/AnimalScience.jpg",
    //             // },
    //         ])

    //     }
    // }, [userData, userLoading])

    const { colorMode } = useColorMode();

    return (
        <>
            {!userLoading && (
                <Box maxW={"100%"} maxH={"100%"}>
                    {/* Count of BAs Led and title */}
                    <Box mb={4}>
                        <Text fontWeight={"semibold"} fontSize={"lg"}>
                            My Business Area{myBusinessAreas?.length > 1 && `s (${myBusinessAreas.length})`}
                        </Text>
                    </Box>

                    <Box mb={4}>
                        <Text
                            color={colorMode === "light" ? "gray.500" : "gray.300"}
                        >
                            {myBusinessAreas.length < 1 ? "You are not leading any business areas." : "This section provides an idea of how your business area intro will look on the Annual Report"}

                        </Text>
                    </Box>

                    <Center
                        w="100%"
                    // bg={"red.800"}
                    >
                        <Box
                            // display={"flex"}
                            // flexDir={"column"}
                            w={"240mm"}
                            h={"100%"}
                            // bg={"orange"}
                            my={3}

                        >
                            {myBusinessAreas?.map((ba) => <BusinessAreaEditableDisplay
                                key={ba.pk}
                                pk={ba.pk}
                                leader={userData}
                                name={ba.name}
                                introduction={ba.introduction}
                                image={ba.image}
                            />)}

                        </Box>

                    </Center>


                </Box>

            )}
        </>
    )
}

interface IEditBA {
    pk: number;
    introduction: string;
    image: string | File | BusinessAreaImage;
    isOpen: boolean;
    onClose: () => void;
}


const EditMyBusinessAreaModal = ({ pk, introduction, image, isOpen, onClose }: IEditBA) => {
    const [introductionValue, setIntroductionValue] = useState<string>(introduction)
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(
        (image as BusinessAreaImage)?.file
            ? `${(image as BusinessAreaImage).file}`
            : null
    );
    const [canUpdate, setCanUpdate] = useState<boolean>(false);

    const { colorMode } = useColorMode();
    const introTextHtml = useDistilledHtml(introductionValue);
    const originalTextHtml = useDistilledHtml(introduction)

    useEffect(() => {

        // console.log({
        //     selectedFile, selectedImageUrl, introductionValue, introTextHtml, originalTextHtml
        // })
        if (
            // nope if no intro
            (
                !introductionValue ||
                introTextHtml.length < 1
            ) ||
            // nope if no image
            (selectedFile === null && !selectedImageUrl) ||
            // nope if intro is the same and no new picture
            (
                introTextHtml === originalTextHtml && selectedImageUrl === image
            )
        ) {
            setCanUpdate(false);
        } else {
            setCanUpdate(true);
        }
    }, [selectedFile, selectedImageUrl, introductionValue, introTextHtml, originalTextHtml, image])


    const toast = useToast();

    const queryClient = useQueryClient();
    const mutation = useMutation({
        mutationFn: updateMyBa,
        onSuccess: () => {
            toast({
                status: "success",
                title: "Created",
                position: "top-right",
            });
            queryClient.invalidateQueries({ queryKey: ["myBusinessAreas"] });
            onClose();
        },
        onError: () => {
            toast({
                status: "error",
                title: "Failed",
                position: "top-right",
            });
        },
    });


    const onSubmitBusinessAreaUpdate = (formData: IMyBAUpdateSubmissionData) => {
        mutation.mutate(formData);
    };





    return (
        <Modal isOpen={isOpen} onClose={onClose} size={"2xl"}>
            <ModalOverlay />
            <ModalContent>
                <ModalCloseButton onClick={onClose} />
                <ModalHeader>Edit Business Area</ModalHeader>
                <ModalBody>
                    <FormControl isRequired mb={4}>
                        <FormLabel>Introduction</FormLabel>
                        <UnboundStatefulEditor
                            title={"Introduction"}
                            showTitle={false}
                            isRequired={false}
                            showToolbar={true}
                            setValueAsPlainText={false}
                            value={introductionValue}
                            setValueFunction={setIntroductionValue}
                        />
                    </FormControl>

                    <FormControl isRequired>
                        <FormLabel>Image</FormLabel>

                        <StatefulMediaChanger
                            helperText={
                                "Upload an image that represents the Business Area."
                            }
                            selectedImageUrl={selectedImageUrl}
                            setSelectedImageUrl={setSelectedImageUrl}
                            selectedFile={selectedFile}
                            setSelectedFile={setSelectedFile}
                        />
                    </FormControl>
                </ModalBody>

                <ModalFooter>
                    <Button
                        isDisabled={!canUpdate}
                        isLoading={mutation.isPending}
                        color={"white"}
                        background={colorMode === "light" ? "blue.500" : "blue.600"}
                        _hover={{
                            background: colorMode === "light" ? "blue.400" : "blue.500",
                        }}
                        size="lg"
                        width={"100%"}
                        onClick={() => {
                            onSubmitBusinessAreaUpdate({
                                pk: pk,
                                introduction: introductionValue,
                                image: selectedFile,
                            });
                        }}
                    >
                        Update
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    )
}

interface IMyBaUpdateData {
    leader: IUserMe;
    pk: number;
    name: string;
    introduction: string;
    image: BusinessAreaImage | File | null;
}



const BusinessAreaEditableDisplay = ({
    pk, name, introduction, image, leader
}: IMyBaUpdateData) => {

    const { colorMode } = useColorMode();
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [isHovered, setIsHovered] = useState(false);
    const onMouseOver = () => {
        if (!isHovered) {
            setIsHovered(true);
        }
    };

    const onMouseOut = () => {
        if (isHovered) {
            setIsHovered(false);
        }
    };


    const NoImageFile = useNoImage();
    const apiEndpoint = useApiEndpoint();
    const distilledIntro = useDistilledHtml(introduction);

    return (<>
        <EditMyBusinessAreaModal
            pk={pk}
            isOpen={isOpen}
            onClose={onClose}
            introduction={introduction}
            image={image instanceof File ? image : (typeof image === "object" && image?.file ? image.file : image)}

        />
        <Box
            overflow={"hidden"}
            bg={colorMode === "light" ? "gray.50" : "gray.700"}
            rounded={10}
            pb={8}
            mb={20}
            onMouseOver={onMouseOver}
            onMouseLeave={onMouseOut}

        >
            {/* BA image and title */}
            <Box
                rounded={4}

                // boxSize={"100px"}
                w={"100%"}
                h={"23vh"}
                minH={"285px"}
                pos={"relative"}

                userSelect={"none"}
                draggable={false}
            >
                <Box
                    pos={"absolute"}
                    right={0}
                    bottom={"30px"}
                    zIndex={0}
                    width={"76%"}
                    height={"70px"}
                    display={"flex"}
                    alignItems={"center"}

                    bg={"rgba(255, 255, 255, 0.6)"}
                    border={"3px solid #396494"}
                    roundedLeft={30}
                    borderRight={"none"}

                >
                    <Text
                        pl={4}
                        fontWeight={"bold"}
                        fontSize={"28px"}
                        color={"black"}
                        userSelect={"none"}

                    >
                        {name}
                    </Text>
                </Box>
                <Image
                    // pos={"absolute"}
                    zIndex={0}
                    src={
                        image instanceof File
                            ? `${apiEndpoint}${image.name}` // Use the image directly for File
                            : image?.file
                                ? `${apiEndpoint}${image.file}`
                                // : image instanceof string ? 
                                : NoImageFile}
                    top={0}
                    left={0}
                    objectFit={"cover"}
                    width={"100%"}
                    height={"100%"}

                    userSelect={"none"}
                    draggable={false}

                />
            </Box>

            {/* Program Lead name and Text */}
            <Box
                mt={8}
                px={12}
                pos={"relative"}

            >
                {isHovered && (
                    <Center
                        bg={"green.500"}
                        rounded={"full"}
                        boxSize={"50px"}
                        pos={"absolute"}
                        right={12}
                        mt={-4}
                        _hover={{ cursor: "pointer" }}
                        onClick={onOpen}
                        color={"whitesmoke"}
                    >
                        <Icon as={FaEdit} boxSize={"25px"} ml={"5px"} mt={-1} />
                    </Center>
                )}


                <Text
                    fontWeight={"semibold"}
                    textAlign={"justify"}
                >
                    Program Leader: {leader?.first_name} {leader?.last_name}
                </Text>


                <Text
                    mt={4}
                    textAlign={"justify"}
                >
                    {distilledIntro}
                </Text>
            </Box>
        </Box>
    </>
    )
}