import { ExtractedHTMLTitle } from "@/components/ExtractedHTMLTitle";
import { useProjectSearchContext } from "@/lib/hooks/helper/ProjectSearchContext";
import { IMainDoc } from "@/types";
import { Box, Text, Flex, useColorMode, Center } from "@chakra-ui/react";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { HiDocumentCheck } from "react-icons/hi2";
import { useNavigate } from "@tanstack/react-router";

interface IProps {
  document: IMainDoc;
  kind: "team" | "project_lead" | "ba_lead" | "directorate";
}
export const ModernDocumentTaskDisplayCard = ({ document, kind }: IProps) => {
  const { colorMode } = useColorMode();
  const [isHovered, setIsHovered] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isHovered) {
      setIsAnimating(true);
    } else {
      setIsAnimating(false);
    }
  }, [isHovered]);
  const { isOnProjectsPage } = useProjectSearchContext();

  const navigate = useNavigate();
  const handleProjectTaskCardClick = () => {
    goToProjectDocument(document?.project?.pk, document);
  };

  const goToProjectDocument = (pk: number | undefined, document: IMainDoc) => {
    let urlkind = "";
    if (document?.kind === "progressreport") {
      urlkind = "progress";
    } else if (document?.kind === "projectclosure") {
      urlkind = "closure";
    } else if (document?.kind === "studentreport") {
      urlkind = "student";
    } else if (document?.kind === "concept") {
      urlkind = "concept";
    } else if (document?.kind === "projectplan") {
      urlkind = "project";
    }

    if (pk === undefined) {
      console.log("The Pk is undefined. Potentially use 'id' instead.");
    } else if (isOnProjectsPage) {
      navigate({ to: `${pk}/${urlkind}` });
    } else {
      navigate({ to: `projects/${pk}/${urlkind}` });
    }
  };

  const formattedDocumentKind = (docKind: string) => {
    // "conceptplan" | "projectplan" | "progressreport" | "studentreport" | "projectclosure"
    if (docKind === "studentreport") {
      return "Student Report";
    } else if (docKind === "concept") {
      return "Concept Plan";
    } else if (docKind === "projectclosure") {
      return "Project Closure";
    } else if (docKind === "projectplan") {
      return "Project Plan";
    } else if (docKind === "progressreport") {
      return "Progress Report";
    } else {
      // catchall

      return docKind;
    }
  };

  const formattedInputKind = (
    actionKind: "team" | "project_lead" | "ba_lead" | "directorate"
  ) => {
    // "conceptplan" | "projectplan" | "progressreport" | "studentreport" | "projectclosure"
    if (actionKind === "directorate") {
      return "Directorate";
    } else if (actionKind === "team") {
      return "Team Member";
    } else if (actionKind === "project_lead") {
      return "Project Lead";
    } else if (actionKind === "ba_lead") {
      return "Area Lead";
    } else {
      // catchall

      return actionKind;
    }
  };

  return (
    <motion.div
      initial={{ scale: 1, opacity: 1 }} // Initial scale (no animation)
      animate={{ scale: isAnimating ? 1.05 : 1, opacity: isAnimating ? 1 : 1 }} // Scale to 0 when isAnimating is true
      transition={{ duration: 0.2 }} // Animation duration in seconds
    >
      <Flex
        p={4}
        userSelect={"none"}
        rounded="lg"
        bg={colorMode === "light" ? "gray.50" : "gray.700"}
        minH="230px"
        // minW="300px"
        // p={4}
        boxShadow={
          colorMode === "light"
            ? "0px 7px 12px -3px rgba(0, 0, 0, 0.15), 0px 1.4px 1.75px -0.7px rgba(0, 0, 0, 0.03), -2.1px 0px 7px -1.4px rgba(0, 0, 0, 0.0465), 2.1px 0px 7px -1.4px rgba(0, 0, 0, 0.0465)"
            : "0px 1.4px 2.1px -0.7px rgba(255, 255, 255, 0.0465), 0px 0.7px 1.4px -0.7px rgba(255, 255, 255, 0.028), -1.4px 0px 2.1px -0.7px rgba(255, 255, 255, 0.032)"
        }
        display="flex"
        flexDirection="column"
        // justifyContent="space-between"
        alignItems="stretch"
        pos={"relative"}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        cursor={"pointer"}
        onClick={handleProjectTaskCardClick}
      >
        <Box w={"100%"}>
          <ExtractedHTMLTitle
            htmlContent={document?.project?.title}
            color={colorMode === "light" ? "blue.500" : "blue.300"}
            fontWeight={"semibold"}
          />
        </Box>

        <Box
        // pos={"absolute"}
        // bottom={2}
        // px={1}
        >
          <Text
            as={"span"}
            color={`${
              kind === "directorate"
                ? "red"
                : kind === "ba_lead"
                  ? "orange"
                  : "green"
            }.600`}
            fontWeight={"semibold"}
            fontSize={"small"}
            mr={1}
          >
            {`${formattedInputKind(kind)}:`}
          </Text>
          <Text
            as={"span"}
            color={colorMode === "light" ? "gray.500" : "gray.200"}
            fontWeight={"semibold"}
            fontSize={"small"}
          >
            {kind === "team"
              ? "Input required"
              : `Determine if the ${formattedDocumentKind(
                  document?.kind
                )} for this project is satisfactory`}
          </Text>
        </Box>

        <Box
          pos={"absolute"}
          bottom={2}
          right={1.5}
          px={1}
          // bg={"red"}
          // justifyContent={"center"}
        >
          <Flex>
            <Center
              textAlign={"center"}
              color={colorMode === "light" ? "red.600" : "red.200"}
              mr={2}
              mt={0.5}
              boxSize={5}
              w={"20px"}

              // w={"100%"}
              // bg={"orange"}
            >
              <HiDocumentCheck />
            </Center>
            <Box
              // mx={0}
              w={"100%"}
            >
              <Text
                as={"span"}
                color={`red.600`}
                fontWeight={"semibold"}
                fontSize={"small"}
                mr={1}
              >
                {formattedDocumentKind(document?.kind)}
              </Text>
            </Box>
          </Flex>
        </Box>
      </Flex>
    </motion.div>
  );
};
