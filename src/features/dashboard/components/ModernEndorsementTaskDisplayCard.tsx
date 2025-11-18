import { ExtractedHTMLTitle } from "@/shared/components/ExtractedHTMLTitle";
import { useProjectSearchContext } from "@/features/projects/hooks/ProjectSearchContext";
import type { ITaskEndorsement } from "@/shared/types/index.d";
import { Box, Center, Flex, Text, useColorMode } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { FaBiohazard } from "react-icons/fa";
import { FaShieldDog } from "react-icons/fa6";
import { PiPlantFill } from "react-icons/pi";

interface IProps {
  endorsement: ITaskEndorsement;
  kind: "aec" | "bm" | "hc";
}
export const ModernEndorsementTaskDisplayCard = ({
  endorsement,
  kind,
}: IProps) => {
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
  const navigate = useNavigate();
  const { isOnProjectsPage } = useProjectSearchContext();

  const handleProjectTaskCardClick = () => {
    goToProjectDocument(
      endorsement?.project_plan?.document?.project?.pk,
      endorsement,
    );
  };

  const goToProjectDocument = (
    pk: number | undefined,
    endorsement: ITaskEndorsement,
  ) => {
    let urlkind = "";
    if (
      endorsement?.project_plan?.document?.project?.kind === "progressreport"
    ) {
      urlkind = "progress";
    } else if (
      endorsement?.project_plan?.document?.project?.kind === "projectclosure"
    ) {
      urlkind = "closure";
    } else if (
      endorsement?.project_plan?.document?.project?.kind === "studentreport"
    ) {
      urlkind = "student";
    } else if (
      endorsement?.project_plan?.document?.project?.kind === "concept"
    ) {
      urlkind = "concept";
    } else if (
      endorsement?.project_plan?.document?.project?.kind === "projectplan"
    ) {
      urlkind = "project";
    }

    if (pk === undefined) {
      console.log("The Pk is undefined. Potentially use 'id' instead.");
      console.log(endorsement?.project_plan?.document?.project?.pk);
    } else if (isOnProjectsPage) {
      navigate(`${pk}/${urlkind}`);
    } else {
      navigate(`projects/${pk}/${urlkind}`);
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
            htmlContent={endorsement?.project_plan?.document?.project?.title}
            color={colorMode === "light" ? "blue.500" : "blue.300"}
            fontWeight={"semibold"}
          />
        </Box>

        <Box>
          <Text
            as={"span"}
            color={colorMode === "light" ? "gray.500" : "gray.300"}
            fontWeight={"semibold"}
            fontSize={"small"}
          >
            {kind === "aec"
              ? "Upload the Animal Ethics Committee Approval form (PDF) to provide AEC approval"
              : kind === "bm"
                ? "Provide Biometrician Approval"
                : kind === "hc"
                  ? "Provide Hermarium Curator Approval"
                  : `Provide ${kind} approval`}
          </Text>
        </Box>
        <Box
          pos={"absolute"}
          bottom={2}
          right={1.5}
          px={1}
          // w={"100%"}
        >
          <Box
            justifyContent={"flex-end"}
            display={"flex"}
            pt={4}
            // bg={"red"}
            // justifyContent={"center"}
          >
            <Flex>
              <Center
                color={
                  kind === "aec"
                    ? colorMode === "light"
                      ? "blue.600"
                      : "blue.200"
                    : kind === "bm"
                      ? colorMode === "light"
                        ? "red.600"
                        : "red.200"
                      : colorMode === "light"
                        ? "green.600"
                        : "green.200"
                }
                mt={0.5}
                mr={2}
                boxSize={5}
                w={"20px"}
              >
                {kind === "aec" ? (
                  <FaShieldDog />
                ) : kind === "hc" ? (
                  <PiPlantFill />
                ) : (
                  <FaBiohazard />
                )}
              </Center>
              <Box>
                <Text
                  as={"span"}
                  color={`${
                    kind === "aec" ? "blue" : kind === "bm" ? "red" : "green"
                  }.600`}
                  fontWeight={"semibold"}
                  fontSize={"small"}
                  mr={1}
                >
                  {`${
                    kind === "aec"
                      ? "Animal Ethics Committee"
                      : kind === "bm"
                        ? "Biometrician"
                        : "Herbarium Curator"
                  }`}
                </Text>
              </Box>
            </Flex>
          </Box>
        </Box>
      </Flex>
    </motion.div>
  );
};
