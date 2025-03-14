// Modern implementation of project cards for display when searching projects and on the projects tab of dashboard

import { AspectRatio } from "@/components/ui/aspect-ratio";
import {
  Box,
  Flex,
  Image,
  Skeleton,
  Tag,
  Text,
  useColorMode,
} from "@chakra-ui/react";
import { motion } from "framer-motion";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useProjectSearchContext } from "../../../lib/hooks/helper/ProjectSearchContext";
import { useNoImage } from "../../../lib/hooks/helper/useNoImage";
import useServerImageUrl from "../../../lib/hooks/helper/useServerImageUrl";
import { IProjectData } from "../../../types";
import { ExtractedHTMLTitle } from "../../ExtractedHTMLTitle";

export const ModernProjectCard = ({
  pk,
  image,
  title,
  kind,
  status,
  year,
  number,
}: IProjectData) => {
  const [imageLoaded, setImageLoaded] = useState(false);

  const { isOnProjectsPage } = useProjectSearchContext();

  const { colorMode } = useColorMode();
  const imageurl = useServerImageUrl(image?.file);
  // useEffect(() => console.log(title), []);

  const cardVariants = {
    rest: { scale: 1, rotateX: 0 },
    hover: {
      scale: 1.08,
      transition: {
        scale: { duration: 0.35 },
      },
    },
  };

  const statusDictionary: {
    [key: string]: { label: string; color: string };
  }[] = [
    { new: { label: "New", color: "gray.500" } },
    { pending: { label: "Pending Project Plan", color: "yellow.500" } },
    { active: { label: "Active (Approved)", color: "green.500" } },
    { updating: { label: "Update Requested", color: "yellow.500" } }, // previously "red.500"
    { closure_requested: { label: "Closure Requested", color: "orange.500" } }, // previously "red.500"
    { closing: { label: "Closure Pending Final Update", color: "red.500" } }, // previously "red.500"
    { final_update: { label: "Final Update Requested", color: "red.500" } }, // previously "red.500"
    { completed: { label: "Completed and Closed", color: "red.500" } }, // preivously blue.500"
    { terminated: { label: "Terminated and Closed", color: "gray.800" } },
    { suspended: { label: "Suspended", color: "gray.500" } },
  ];

  const getStatusValue = (status: string): { label: string; color: string } => {
    const matchedStatus = statusDictionary.find((item) => status in item);
    return matchedStatus
      ? matchedStatus[status]
      : { label: "Unknown Status", color: "gray.500" };
  };

  const [hovered, setHovered] = useState(false);

  const navigate = useNavigate();

  // useEffect(() => console.log(title), [title]);
  const goToProject = (e) => {
    if (e.ctrlKey || e.metaKey) {
      // Handle Ctrl + Click (or Command + Click on Mac)
      window.open(`/projects/${pk}/overview`, "_blank"); // Opens in a new tab
    } else {
      // Normal click handling
      if (isOnProjectsPage || window.location.pathname.endsWith("/projects")) {
        navigate(`${pk}/overview`);
      } else {
        navigate(`projects/${pk}/overview`);
      }
    }
  };

  const noImage = useNoImage();
  return (
    <Box onClick={goToProject} cursor={"pointer"}>
      <Skeleton
        isLoaded={imageLoaded}
        rounded={"2xl"}
        h={"325px"}
        pos={"relative"}
        overflow={"hidden"}
        cursor={"pointer"}
        style={{ transformStyle: "preserve-3d" }}
        boxShadow="0px 15px 30px -10px rgba(0, 0, 0, 0.5), 0px 5px 10px -5px rgba(0, 0, 0, 0.1), -2px 0px 10px -2px rgba(0, 0, 0, 0.2), 2px 0px 10px -2px rgba(0, 0, 0, 0.2)"
        border={colorMode === "dark" ? "1px solid" : undefined}
        borderColor={"gray.700"}
      >
        <Box pos={"absolute"} left={0} top={0} p={2} zIndex={999}>
          <Tag
            fontWeight={"semibold"}
            color={"white"}
            px={2}
            py={1}
            fontSize={"xs"}
            bgColor={
              kind === "core_function"
                ? "red.600"
                : kind === "science"
                  ? "green.500"
                  : kind === "student"
                    ? "blue.400"
                    : "gray.400"
            }
          >
            {
              kind === "core_function"
                ? "CF"
                : kind === "external"
                  ? "EXT"
                  : kind === "science"
                    ? "SP"
                    : "STP" //Student
            }
            -{year}-{number}
          </Tag>
        </Box>
        <Flex
          pos={"absolute"}
          left={0}
          bottom={0}
          p={4}
          zIndex={999}
          // onClick={goToProject}
          onMouseOver={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
        >
          <Box zIndex={3}>
            <ExtractedHTMLTitle
              htmlContent={title}
              color={"white"}
              fontWeight={"semibold"}
              fontSize={"17px"}
              // fontSize={"xs"}
              noOfLines={3}
            />
          </Box>
        </Flex>
        {hovered && (
          <Box
            pos="absolute"
            top={2}
            right={0}
            w="max-content"
            style={{ perspective: 500 }}
            zIndex={999}
          >
            <motion.div
              initial={{ opacity: 0, x: "100%" }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: "100%" }}
              transition={{ duration: 0.4 }}
              style={{ transformStyle: "preserve-3d", perspective: 1000 }}
            >
              <Text
                roundedStart="2xl"
                fontWeight="normal"
                color="white"
                bg={getStatusValue(status).color}
                px={5}
                py={1}
                fontSize="xs"
              >
                {getStatusValue(status).label === "Unknown Status"
                  ? status
                  : getStatusValue(status).label}
              </Text>
            </motion.div>
          </Box>
        )}

        <AspectRatio ratio={16 / 9}>
          <Box
            as={motion.div}
            variants={cardVariants}
            whileHover="hover"
            initial="rest"
            // style={{ perspective: 1000 }}
            onMouseOver={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            rounded={"2xl"}
            h={"325px"}
            pos={"relative"}
            overflow={"hidden"}
            cursor={"pointer"}
            style={{ transformStyle: "preserve-3d", perspective: 1000 }}
            boxShadow="0px 15px 30px -10px rgba(0, 0, 0, 0.5), 0px 5px 10px -5px rgba(0, 0, 0, 0.1), -2px 0px 10px -2px rgba(0, 0, 0, 0.2), 2px 0px 10px -2px rgba(0, 0, 0, 0.2)"
            // onClick={goToProject}
            borderColor={"gray.700"}
            background={colorMode === "dark" ? "black" : undefined}
          >
            <Image
              loading="lazy"
              rounded={"2xl"}
              src={image ? imageurl : noImage}
              objectFit={"cover"}
              onLoad={() => setImageLoaded(true)}
              h={"100%"}
              w={"100%"}
              style={{ imageRendering: "crisp-edges", objectFit: "cover" }}
              className="pointer-events-none select-none"
            />

            <Box
              pos="absolute"
              left={0}
              bottom={0}
              w="100%"
              h="50%" // Increase the height of the gradient
              bgGradient="linear(to-t, rgba(0,0,0,0.75), transparent)" // Strengthened gradient overlay
            />
          </Box>
        </AspectRatio>
      </Skeleton>
    </Box>
  );
};
