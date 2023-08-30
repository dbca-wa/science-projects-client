// An accordion for business areas emulating the original site's style to display projects in the area 

import { Accordion, AccordionButton, AccordionIcon, AccordionItem, AccordionPanel, Box, Button, Grid, Text, Image, Flex, useDisclosure, useColorMode } from "@chakra-ui/react"
import { IProjectCardProps, TraditionalProjectCard } from "./TraditionalProjectCard"
import { AiFillEdit, AiFillTag } from "react-icons/ai"
import { GiQueenCrown } from "react-icons/gi";
import { BsChatSquareFill } from "react-icons/bs";
import { useTimeSince } from "../../../lib/hooks/useTimeSince";

import { UpdateBusinessAreaModal } from "../../Modals/UpdateBusinessAreaModal";

export interface IProjectAccordion {
    businessArea: string;
    businessAreaImage: string;
    businessAreaLeader: string;
    lastUpdateUserName: string;
    lastUpdateDate: Date;
    tags: string[];
    description: string;
    projects: IProjectCardProps[];
}

export const BusinessAreaAccordion = (
    {
        businessArea,
        businessAreaImage,
        businessAreaLeader,
        lastUpdateDate,
        lastUpdateUserName,
        tags,
        description,
        projects
    }: IProjectAccordion
) => {
    const renderUpdateTag = useTimeSince(lastUpdateDate)

    const { isOpen: isUpdateBusinessAreaModalOpen, onOpen: onOpenUpdateBusinessAreaModal, onClose: onCloseUpdateBusinessAreaModal } = useDisclosure()

    const { colorMode } = useColorMode();

    return (
        <Accordion
            allowMultiple
            // bg={"gray.100"}
            rounded={"2xl"}
            overflow={"hidden"}
            my={3}
            userSelect={"none"}

        >
            <UpdateBusinessAreaModal isOpen={isUpdateBusinessAreaModalOpen} onClose={onCloseUpdateBusinessAreaModal} businessAreaTitle={businessArea} />
            <AccordionItem rounded={"2xl"}
                bg={colorMode === "dark" ? "gray.700" : "gray.200"}
            >
                <AccordionButton
                    as={Button}
                    rounded={"2xl"}
                    variant={"link"} flex={1}
                    justifyContent={"start"}
                    color={colorMode === "dark" ? "gray.200" : "gray.600"}
                    w={"100%"}
                >
                    {businessArea}
                    <Flex justifyContent={"right"} ml={"auto"}>
                        <AccordionIcon />
                    </Flex>

                </AccordionButton>
                <AccordionPanel pb={4}
                    bg={colorMode === "dark" ? "blackAlpha.500" : "whiteAlpha.500"}
                    style={{ overflow: 'visible' }} // Added this line

                >
                    <Box
                        rounded="5px"
                        overflow="hidden"
                        my={4}
                        pos="relative"
                    >
                        <Box
                            position="absolute"
                            top={0}
                            left={0}
                            width="100%"
                            height="100%"
                            rounded="5px"
                            _before={{
                                content: '""',
                                display: 'block',
                                position: 'absolute',
                                top: 0,
                                bottom: 0,
                                left: 0,
                                right: 0,
                                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                            }}
                        >
                            <Image
                                src={businessAreaImage}
                                alt="background image"
                                objectFit="cover"
                                top={0}
                                left={0}
                                width="100%"
                                height="100%"
                                rounded="5px"
                                opacity={colorMode === "dark" ? "40%" : "100%"}
                                userSelect="none"
                                draggable={false}
                            />
                        </Box>

                        <Box
                            top={0}
                            left={0}
                            p={10}
                            width="100%"
                            height="100%"
                            overflow="hidden"
                            rounded="5px"
                            pos="relative" // Changed to "relative"
                            color={colorMode === "light" ? "whiteAlpha.900" : "whiteAlpha.900"}
                            style={{ minHeight: 0 }}
                        >

                            <Grid
                                templateColumns="auto 1fr"
                                gap={4}
                                alignItems="flex-start"
                                justifyItems="flex-start"
                                pb={4}

                            >
                                <Box
                                >
                                    <Text
                                        fontSize="2xl" fontWeight="bold"

                                    >
                                        {/* Biodiversity Information Office */}
                                        {businessArea}
                                    </Text>
                                    <Text color="white.600" fontSize="sm">
                                        {/* Updated 6 months, 3 weeks ago by Ronald McDonald */}
                                        {`Updated ${renderUpdateTag} by ${lastUpdateUserName}`}
                                    </Text>

                                </Box>
                                <Box

                                    justifyItems={"end"}
                                    justifySelf={"end"}
                                >
                                    <Button
                                        colorScheme="blue"
                                        leftIcon={<AiFillEdit />}
                                        onClick={onOpenUpdateBusinessAreaModal}
                                    >
                                        Update
                                    </Button>
                                </Box>
                            </Grid>
                            <Grid
                                templateColumns="auto 1fr"
                                gap={4}
                                alignItems="flex-start"
                                justifyItems="flex-start"
                            >
                                <Box as={GiQueenCrown} size="18px"
                                    mt={2}
                                    justifySelf={"center"}
                                />
                                <Text
                                >
                                    {businessAreaLeader}
                                </Text>
                                <Box as={AiFillTag} size="18px"
                                    mt={2}
                                />
                                <Text
                                >
                                    {tags.join('; ')}
                                </Text>
                                <Box as={BsChatSquareFill} size="18px"
                                    mt={2}
                                />
                                <Text
                                >
                                    {description}
                                </Text>
                            </Grid>
                        </Box>
                    </Box>
                    {projects.map((data, index) => {
                        return (
                            <TraditionalProjectCard
                                key={index}
                                pk={data.pk}
                                projectTitle={data.projectTitle}
                                authors={data.authors}
                                years={data.years}
                                tags={data.tags}
                                projectTypeTag={data.projectTypeTag}
                                statusTag={data.statusTag}
                                imageUrl={data.imageUrl}
                            />
                        )
                    })}
                </AccordionPanel>
            </AccordionItem>
        </Accordion >
    )
}