// Used to display the tasks and projects of a user in the traditional layout

import { useGetEndorsementsPendingMyAction } from "@/lib/hooks/tanstack/useGetEndorsementsPendingMyAction";
import { useUser } from "@/lib/hooks/tanstack/useUser";
import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Box,
  Center,
  Spinner,
  useColorMode,
} from "@chakra-ui/react";
import { motion } from "framer-motion";
import { useEffect } from "react";
import { AiFillProject } from "react-icons/ai";
import { FcHighPriority, FcOk } from "react-icons/fc";
import { useGetDocumentsPendingMyAction } from "../../../lib/hooks/tanstack/useGetDocumentsPendingMyAction";
import { useGetMyProjects } from "../../../lib/hooks/tanstack/useGetMyProjects";
import { DocumentsDataTable } from "./DocumentsDataTable";
import { EndorsementsDataTable } from "./EndorsementsDataTable";
import { UserProjectsDataTable } from "./UserProjectsDataTable";

export const TraditionalTasksAndProjects = () => {
  const { colorMode } = useColorMode();
  const me = useUser();
  const { projectData, projectsLoading } = useGetMyProjects();
  useEffect(() => console.log(projectData));

  const { pendingProjectDocumentData, pendingProjectDocumentDataLoading } =
    useGetDocumentsPendingMyAction();

  const { pendingEndorsementsData, pendingEndorsementsDataLoading } =
    useGetEndorsementsPendingMyAction();

  useEffect(() => {
    if (!pendingProjectDocumentDataLoading) {
      console.log(pendingProjectDocumentData);
    }
  }, [pendingProjectDocumentData, pendingProjectDocumentDataLoading]);

  return (
    <>
      <Box mt={6}>
        <Accordion
          // defaultIndex={defaultIndex}
          defaultIndex={[0]}
          allowMultiple
        >
          {pendingProjectDocumentDataLoading ? (
            // null
            <Center my={4}>
              <Spinner />
            </Center>
          ) : (
            <motion.div
              initial={{ scale: 1, opacity: 0 }} // Initial scale (no animation)
              animate={{
                opacity: pendingProjectDocumentDataLoading ? 0 : 1,
              }}
              transition={{ duration: 0.4 }} // Animation duration in seconds
            >
              <AccordionItem
                borderColor={
                  colorMode === "light" ? "blackAlpha.500" : "whiteAlpha.600"
                }
                borderBottom={"none"}
                borderTop={"none"}
              >
                <AccordionButton
                  bg={colorMode === "light" ? "gray.200" : "gray.700"}
                  color={colorMode === "light" ? "black" : "white"}
                  _hover={
                    colorMode === "light"
                      ? { bg: "gray.300", color: "black" }
                      : { bg: "gray.500", color: "white" }
                  }
                  userSelect={"none"}
                >
                  <Box as="span" flex="1" textAlign="left">
                    My Tasks
                  </Box>

                  {/* </Box> */}
                  {pendingProjectDocumentData?.all?.length >= 1 ? (
                    <Box
                      display={"inline-flex"}
                      justifyContent={"center"}
                      alignItems={"center"}
                    >
                      <Box mr={2}>
                        {pendingProjectDocumentData?.all?.length}
                      </Box>
                      <FcHighPriority />
                    </Box>
                  ) : (
                    <FcOk />
                  )}
                  <AccordionIcon />
                </AccordionButton>

                <AccordionPanel pb={4} userSelect={"none"} px={0} pt={0}>
                  <DocumentsDataTable
                    pendingProjectDocumentData={pendingProjectDocumentData}
                  />
                </AccordionPanel>
              </AccordionItem>
            </motion.div>
          )}

          {(me?.userData?.is_aec || me?.userData?.is_superuser) ===
          false ? null : pendingEndorsementsDataLoading ? (
            <Center my={4}>
              <Spinner />
            </Center>
          ) : (
            <motion.div
              initial={{ scale: 1, opacity: 0 }} // Initial scale (no animation)
              animate={{
                opacity: pendingEndorsementsDataLoading ? 0 : 1,
              }}
              transition={{ duration: 0.4 }} // Animation duration in seconds
            >
              <AccordionItem
                borderColor={
                  colorMode === "light" ? "blackAlpha.500" : "whiteAlpha.600"
                }
                borderBottom={"none"}
                // borderTop={"none"}
              >
                <AccordionButton
                  bg={colorMode === "light" ? "gray.200" : "gray.700"}
                  color={colorMode === "light" ? "black" : "white"}
                  _hover={
                    colorMode === "light"
                      ? { bg: "gray.300", color: "black" }
                      : { bg: "gray.500", color: "white" }
                  }
                  userSelect={"none"}
                >
                  <Box as="span" flex="1" textAlign="left">
                    Endorsement Tasks
                  </Box>
                  {pendingEndorsementsData?.aec?.length >=
                  // +
                  //   pendingEndorsementsData?.bm?.length +
                  //   pendingEndorsementsData?.hc?.length
                  1 ? (
                    <Box
                      display={"inline-flex"}
                      justifyContent={"center"}
                      alignItems={"center"}
                    >
                      <Box mr={2}>
                        {
                          pendingEndorsementsData?.aec?.length
                          // +
                          //   pendingEndorsementsData?.bm?.length +
                          //   pendingEndorsementsData?.hc?.length
                        }
                      </Box>
                      <FcHighPriority />
                    </Box>
                  ) : (
                    <FcOk />
                  )}
                  <AccordionIcon />
                </AccordionButton>

                <AccordionPanel pb={4} userSelect={"none"} px={0} pt={0}>
                  <EndorsementsDataTable
                    pendingEndorsementsData={pendingEndorsementsData}
                  />
                </AccordionPanel>
              </AccordionItem>
            </motion.div>
          )}

          {projectsLoading ? (
            <Center my={4}>
              <Spinner />
            </Center>
          ) : (
            <motion.div
              initial={{ scale: 1, opacity: 0 }} // Initial scale (no animation)
              animate={{
                opacity: projectsLoading ? 0 : 1,
              }}
              transition={{ duration: 0.4 }} // Animation duration in seconds
            >
              <AccordionItem
                borderColor={
                  colorMode === "light" ? "blackAlpha.500" : "whiteAlpha.600"
                }
                borderBottom={"none"}
              >
                <AccordionButton
                  bg={colorMode === "light" ? "gray.200" : "gray.700"}
                  color={colorMode === "light" ? "black" : "white"}
                  _hover={
                    colorMode === "light"
                      ? { bg: "gray.300", color: "black" }
                      : { bg: "gray.500", color: "white" }
                  }
                  userSelect={"none"}
                >
                  <Box as="span" flex="1" textAlign="left">
                    My Projects
                  </Box>
                  {projectData?.length >= 1 ? (
                    <Box
                      display={"inline-flex"}
                      justifyContent={"center"}
                      alignItems={"center"}
                    >
                      <Box mr={2}>{projectData?.length}</Box>
                      <AiFillProject />
                    </Box>
                  ) : null}
                  <AccordionIcon />
                </AccordionButton>

                <AccordionPanel pb={4} userSelect={"none"} px={0} pt={0}>
                  {!projectsLoading && (
                    <UserProjectsDataTable
                      projectData={projectData}
                      disabledColumns={{
                        business_area: true,
                        created_at: true,
                        title: false,
                        role: false,
                        kind: false,
                      }}
                      defaultSorting={"status"}
                      noDataString={"You aren't associated with any projects"}
                      filters
                    />
                  )}
                </AccordionPanel>
              </AccordionItem>
            </motion.div>
          )}
        </Accordion>
      </Box>
    </>
  );
};
