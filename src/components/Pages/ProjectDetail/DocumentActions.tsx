// Used for all documents. WIP - need to update the content shown based on doc, and parametise the document sent in.

import { Box, Flex, Grid, Tag, Text, useColorMode } from "@chakra-ui/react";
import {
  IConceptPlan,
  IProgressReport,
  IProjectClosure,
  IProjectPlan,
  IStudentReport,
} from "../../../types";

interface IDocumentActions {
  tabType: string;
  document:
    | IConceptPlan
    | IProjectPlan
    | IProgressReport
    | IStudentReport
    | IProjectClosure
    | null
    | undefined;
  projectPk: number;
}

export const DocumentActions = ({
  tabType,
  document,
  projectPk,
}: IDocumentActions) => {
  const { colorMode } = useColorMode();
  return (
    <Box
      bg={colorMode === "light" ? "gray.100" : "gray.700"}
      rounded={"lg"}
      p={4}
      my={6}
    >
      <Flex w={"100%"}>
        <Text
          flex={1}
          fontWeight={"bold"}
          fontSize={"lg"}
          color={colorMode === "light" ? "gray.800" : "gray.100"}
          userSelect={"none"}
          pb={4}
        >
          Document Actions
        </Text>
        <Tag bg={"green.500"} color={"white"}>
          STATUS
        </Tag>
      </Flex>

      {tabType === "overview" ? (
        <Grid mb={4} gridGap={4} gridTemplateColumns={"1fr 1fr"}></Grid>
      ) : tabType === "concept" ? (
        <Box>
          Concept Plan (Project: {projectPk}, Pk: {document?.pk})
        </Box>
      ) : tabType === "project" ? (
        <Box>
          Project Plan (Project: {projectPk}, Pk: {document?.pk})
        </Box>
      ) : tabType === "progress" ? (
        <Box>
          Progress Reports (Project: {projectPk}, Pk: {document?.pk})
        </Box>
      ) : tabType === "student" ? (
        <Box>
          Student Reports (Project: {projectPk}, Pk: {document?.pk})
        </Box>
      ) : tabType === "closure" ? (
        <Box>
          Closure (Project: {projectPk}, Pk: {document.pk})
        </Box>
      ) : (
        <Box>
          Unimplemented: neither concept, progress, student, project, closure
        </Box>
      )}
    </Box>
  );
};
