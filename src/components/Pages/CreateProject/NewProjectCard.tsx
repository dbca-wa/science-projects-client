// Handler for displaying card data for creation of new projects; core function etc.

import {
  Center,
  Text,
  Box,
  Heading,
  UnorderedList,
  ListItem,
  useDisclosure,
  useColorMode,
} from "@chakra-ui/react";
import { motion } from "framer-motion";
import { IconType } from "react-icons";
import { CreateProjectModal } from "../../Modals/CreateProjectModal";
import ParallaxTilt from "react-parallax-tilt";

interface INewProjectCard {
  title: string;
  description: string;
  bulletPoints: string[];
  colorScheme: string;
  color?: string;
  buttonIcon: IconType;
}

export const NewProjectCard = ({
  title,
  description,
  bulletPoints,
  color,
  colorScheme,
  buttonIcon,
}: INewProjectCard) => {
  const { colorMode } = useColorMode();
  const ButtonIcon = buttonIcon;

  const {
    isOpen: isModalOpen,
    onOpen: onOpenModal,
    onClose: onCloseModal,
  } = useDisclosure();

  const openCreateProjectModal = () => {
    onOpenModal();
  };

  const cardVariants = {
    rest: { scale: 1, rotateX: 0 },
    hover: {
      scale: 1.035,
      rotateX: 7,
      transition: {
        scale: { duration: 0.3 },
        rotateX: { delay: 0.15, duration: 0.3 },
      },
    },
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
        boxShadow="0px 14px 21px -7px rgba(0, 0, 0, 0.21), 0px 2.8px 3.5px -1.4px rgba(0, 0, 0, 0.042), -2.1px 0px 7px -1.4px rgba(0, 0, 0, 0.07), 2.1px 0px 7px -1.4px rgba(0, 0, 0, 0.07)"
        initial={"rest"}
        whileHover="hover" // Reference to the hover key in cardVariants
        variants={cardVariants} // Variants for the animations
        onClick={() => {
          openCreateProjectModal();
        }}
      >
        <CreateProjectModal
          projectType={title}
          isOpen={isModalOpen}
          onClose={onCloseModal}
          icon={buttonIcon}
        />

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
          // bg={
          //   colorMode === "light" ? `${colorScheme}.500` : `${colorScheme}.600`
          // }
          background={color ? color : undefined}
          color={colorMode === "light" ? "whiteAlpha.900" : "whiteAlpha.800"}
          style={{
            transform: "translateZ(0)",
            transition: "transform 0.3s ease",
          }}
          _hover={{
            transform: "translateZ(50px)",
          }}
        >
          <Center mr={4}>
            <ButtonIcon size={"40px"} />
          </Center>
          <Heading size={"md"} colorScheme={colorScheme}>
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
          <Text fontSize={"md"}>{description}</Text>
        </Box>

        {/* INFO */}
        <Box
          mx={6}
          pb={4}
          color={colorMode === "light" ? "blackAlpha.800" : "whiteAlpha.800"}
          ml={10}
        >
          <UnorderedList>
            {bulletPoints.map((point, index2) => (
              <ListItem key={index2} fontSize={"sm"}>
                {point}
              </ListItem>
            ))}
          </UnorderedList>
        </Box>
      </Box>
    </ParallaxTilt>
  );
};
