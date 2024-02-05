import { ExtractedHTMLTitle } from "@/components/ExtractedHTMLTitle";
import { useProjectSearchContext } from "@/lib/hooks/ProjectSearchContext";
import { IMainDoc } from "@/types";
import {
  Box,
  Center,
  Flex,
  useColorMode,
  Text,
  Divider,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { FaBiohazard, FaShieldDog } from "react-icons/fa6";
import { PiPlantFill } from "react-icons/pi";
import { useBoxShadow } from "@/lib/hooks/useBoxShadow";

interface IProps {
  endorsementKind: "animalEthics" | "biometrician" | "herbarium";
  document: IMainDoc;
}

export const TraditionalEndorsementTaskDisplay = ({
  endorsementKind,
  document,
}: IProps) => {



  const { colorMode } = useColorMode();
  const navigate = useNavigate();
  const { isOnProjectsPage } = useProjectSearchContext();

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
      navigate(`${pk}/${urlkind}`);
    } else {
      navigate(`projects/${pk}/${urlkind}`);
    }
  };

  const formattedKind = (endorsementKind: string) => {
    // "conceptplan" | "projectplan" | "progressreport" | "studentreport" | "projectclosure"
    if (endorsementKind === "animalEthics") {
      return "Animal Ethics";
    } else if (endorsementKind === "biometrician") {
      return "Biometrician";
    } else if (endorsementKind === "herbarium") {
      return "Herbarium Curator";
    } else {
      // catchall

      return endorsementKind;
    }
  };

  const boxShadow = useBoxShadow();

  return (
    <Flex
      alignItems={"center"}
      border={"1px solid"}
      borderTopWidth={0}
      borderColor={colorMode === "light" ? "gray.200" : "gray.600"}
      w={"100%"}
      p={2}
      _hover={{
        color: colorMode === "dark" ? "blue.100" : "blue.300",
        cursor: "pointer",
        boxShadow: boxShadow,
        zIndex: 999,
      }}
      onClick={() =>
        goToProjectDocument(
          document?.project?.pk ? document?.project?.pk : document?.project?.id,
          document
        )
      }
    >
      <Box
        pos={"relative"}
        minW={"170px"}
        maxW={"170px"}
        h={"100%"}
        alignItems={"center"}
      >
        <Box alignItems={"center"} display={"flex"} h={"100%"}>
          <Center
            color={
              endorsementKind === "animalEthics"
                ? colorMode === "light"
                  ? "blue.600"
                  : "blue.200"
                : endorsementKind === "biometrician"
                  ? colorMode === "light"
                    ? "red.600"
                    : "red.200"
                  : colorMode === "light"
                    ? "green.600"
                    : "green.200"
            }
            mr={3}
            boxSize={5}
            w={"20px"}
          >
            {endorsementKind === "animalEthics" ? (
              <FaShieldDog />
            ) : endorsementKind === "herbarium" ? (
              <PiPlantFill />
            ) : (
              <FaBiohazard />
            )}
          </Center>

          <Box mx={0} w={"100%"}>
            <Text>{formattedKind(endorsementKind)}</Text>
          </Box>
        </Box>
        <Box
          // bg={"orange"}
          w={6}
          right={0}
          top={0}
          pos={"absolute"}
          h={"100%"}
        >
          <Divider
            orientation="vertical"
            // ml={-1}\
            // bg={"red"}

            h={"100%"}
            ml={2}
            mr={3}
          />
        </Box>
      </Box>

      <Flex flexDir={"column"}>
        <ExtractedHTMLTitle
          htmlContent={`${document?.project?.title}`}
          color={colorMode === "dark" ? "blue.200" : "blue.400"}
          fontWeight={"bold"}
          cursor={"pointer"}
        />
        <Flex>
          <Text color={"gray.500"} fontWeight={"semibold"} fontSize={"small"}>
            {endorsementKind === "animalEthics"
              ? "Upload the Animal Ethics Committee Approval form (PDF) to provide AEC approval"
              : endorsementKind === "biometrician"
                ? "Provide Biometrician Approval"
                : endorsementKind === "herbarium"
                  ? "Provide Hermarium Curator Approval"
                  : `Provide ${endorsementKind} approval`}
          </Text>
        </Flex>
      </Flex>
    </Flex>
  );
};
