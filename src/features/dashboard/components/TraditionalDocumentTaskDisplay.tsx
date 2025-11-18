import { ExtractedHTMLTitle } from "@/shared/components/ExtractedHTMLTitle";
// import { useProjectSearchContext } from "@/shared/hooks/ProjectSearchContext";
import { useBoxShadow } from "@/shared/hooks/useBoxShadow";
import type { IMainDoc } from "@/shared/types/index.d";
import {
  Box,
  Center,
  Divider,
  Flex,
  Grid,
  Text,
  useColorMode,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { HiDocumentCheck } from "react-icons/hi2";
import { useProjectSearchContext } from "@/features/projects/hooks/ProjectSearchContext";

interface IProps {
  inputKind:
    | "team_member"
    | "project_lead"
    | "business_area_lead"
    | "directorate";
  document: IMainDoc;
}

export const TraditionalDocumentTaskDisplay = ({
  inputKind,
  document,
}: IProps) => {
  // useEffect(() => { console.log(document) }, [document])
  const { colorMode } = useColorMode();
  const navigate = useNavigate();
  const { isOnProjectsPage } = useProjectSearchContext();

  const goToProjectDocument = (
    e: React.MouseEvent<HTMLDivElement, MouseEvent>,
    pk: number | undefined,
    document: IMainDoc,
  ) => {
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
    } else {
      if (isOnProjectsPage) {
        if (e.ctrlKey || e.metaKey) {
          window.open(`${pk}/${urlkind}`, "_blank"); // Opens in a new tab
        } else {
          navigate(`${pk}/${urlkind}`);
        }
      } else {
        if (e.ctrlKey || e.metaKey) {
          window.open(`projects/${pk}/${urlkind}`, "_blank"); // Opens in a new tab
        } else {
          navigate(`projects/${pk}/${urlkind}`);
        }
      }
    }
  };
  const formattedDocumentKind = (docKind: string) => {
    // "conceptplan" | "projectplan" | "progressreport" | "studentreport" | "projectclosure"
    if (docKind === "studentreport") {
      return "Student";
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
    actionKind:
      | "team_member"
      | "project_lead"
      | "business_area_lead"
      | "directorate",
  ) => {
    // "conceptplan" | "projectplan" | "progressreport" | "studentreport" | "projectclosure"
    if (actionKind === "directorate") {
      return "Directorate";
    } else if (actionKind === "team_member") {
      return "Team Member";
    } else if (actionKind === "project_lead") {
      return "Project Lead";
    } else if (actionKind === "business_area_lead") {
      return "Business Area Lead";
    } else {
      // catchall

      return actionKind;
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
      onClick={(e) =>
        goToProjectDocument(
          e,
          document?.project?.pk ? document?.project?.pk : document?.project?.id,
          document,
        )
      }
    >
      <Flex minW={"156px"} maxW={"156px"}>
        <Box
          // bg={"yellow"}
          alignItems={"center"}
          display={"flex"}
        >
          <Center
            color={colorMode === "light" ? "red.600" : "red.200"}
            mr={3}
            alignItems={"center"}
            alignContent={"center"}
            boxSize={5}
            w={"20px"}
          >
            <HiDocumentCheck />
          </Center>
        </Box>

        <Flex flexDir={"column"}>
          <Box w={"100%"}>
            <Text>{formattedDocumentKind(document?.kind)}</Text>
          </Box>
        </Flex>
      </Flex>

      <Divider orientation="vertical" mr={5} />
      <Grid flex={1}>
        <Flex>
          <ExtractedHTMLTitle
            htmlContent={`${document?.project?.title}`}
            color={colorMode === "dark" ? "blue.200" : "blue.400"}
            fontWeight={"bold"}
            cursor={"pointer"}
          />
        </Flex>
        <Flex>
          <Text
            color={`${
              inputKind === "directorate"
                ? "red"
                : inputKind === "business_area_lead"
                  ? "orange"
                  : inputKind === "team_member"
                    ? "blue"
                    : "green"
            }.600`}
            fontWeight={"semibold"}
            fontSize={"small"}
            mr={1}
          >
            {`${formattedInputKind(inputKind)}:`}
          </Text>
          <Text color={"gray.500"} fontWeight={"semibold"} fontSize={"small"}>
            {inputKind === "team_member"
              ? "Input required"
              : `Determine if the ${formattedDocumentKind(
                  document?.kind,
                )} for this project is satisfactory`}
          </Text>
        </Flex>
      </Grid>
    </Flex>
  );
};
