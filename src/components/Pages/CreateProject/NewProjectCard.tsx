// Handler for displaying card data for creation of new projects; core function etc.

import { Center, Text, Box, Heading, UnorderedList, ListItem, useDisclosure, useColorMode } from "@chakra-ui/react"
import { motion } from "framer-motion"
import { IconType } from 'react-icons';
import { CreateProjectModal } from "../../Modals/CreateProjectModal";
import ParallaxTilt from 'react-parallax-tilt';

interface INewProjectCard {
    title: string;
    description: string;
    bulletPoints: string[];
    colorScheme: string;
    buttonIcon: IconType;
}

export const NewProjectCard = ({ title, description, bulletPoints, colorScheme, buttonIcon }: INewProjectCard) => {

    const { colorMode } = useColorMode();
    const ButtonIcon = buttonIcon;

    const { isOpen: isModalOpen, onOpen: onOpenModal, onClose: onCloseModal } = useDisclosure()

    const openCreateProjectModal = () => {
        onOpenModal();
    }

    const cardVariants = {
        rest: { scale: 1, rotateX: 0 },
        hover: {
            scale: 1.05,
            rotateX: 7,
            transition: {
                scale: { duration: 0.3 },
                rotateX: { delay: 0.15, duration: 0.3 },
            }
        }
    };

    return (

        <ParallaxTilt
            tiltMaxAngleY={2}
            tiltMaxAngleX={0}
            style={{ perspective: 1000, height: "100%", minHeight: "320px" }}
        >

            <Box
                as={motion.div}
                h={"full"}
                bgColor={colorMode === "light" ? "blackAlpha.200" : "gray.700"}
                rounded={"xl"}
                flexDir={"column"}
                p={6}
                position={"relative"}
                cursor="pointer"

                style={{ transformStyle: "preserve-3d" }}
                boxShadow="0px 20px 30px -10px rgba(0, 0, 0, 0.3), 0px 4px 5px -2px rgba(0, 0, 0, 0.06), -3px 0px 10px -2px rgba(0, 0, 0, 0.1), 3px 0px 10px -2px rgba(0, 0, 0, 0.1)"

                initial={"rest"}
                whileHover="hover" // Reference to the hover key in cardVariants
                variants={cardVariants} // Variants for the animations

                onClick={() => {
                    openCreateProjectModal();
                }}
            >
                <CreateProjectModal projectType={title} isOpen={isModalOpen} onClose={onCloseModal} icon={buttonIcon} />

                {/* TITLE */}
                <Box
                    display={"inline-flex"}
                    alignItems={"center"}
                    justifyContent={"center"}
                    w={"100%"}
                    h={"80px"}
                    rounded={"xl"}
                    pos={"relative"}
                    p={4}
                    bg={colorMode === "light" ? `${colorScheme}.500` : `${colorScheme}.600`}
                    color={colorMode === "light" ? "whiteAlpha.900" : "whiteAlpha.800"}
                    style={{ transform: 'translateZ(0)', transition: 'transform 0.3s ease' }}
                    _hover={{
                        transform: 'translateZ(50px)'
                    }}

                >
                    <Center
                        mr={4}
                    >
                        <ButtonIcon size={"40px"} />
                    </Center>
                    <Heading
                        size={"md"}
                        colorScheme={colorScheme}
                    >
                        {title}

                    </Heading>

                </Box>

                {/* DESCRIPTION */}
                <Box
                    my={4}
                    py={4}
                    mx={2}
                    color={colorMode === "light" ? "blackAlpha.800" : "whiteAlpha.800"}
                >
                    <Text
                        fontSize={"md"}
                    >
                        {description}
                    </Text>
                </Box>

                {/* INFO */}
                <Center
                    mx={6}
                    pb={4}
                    color={colorMode === "light" ? "blackAlpha.800" : "whiteAlpha.800"}

                >
                    <UnorderedList>
                        {bulletPoints.map((point, index2) => (
                            <ListItem key={index2}
                                fontSize={"sm"}
                            >
                                {point}
                            </ListItem>
                        )
                        )}
                    </UnorderedList>
                </Center>
            </Box>
        </ParallaxTilt>
    )
}