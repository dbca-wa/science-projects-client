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
import { useEffect, useState } from "react";
import { AiFillProject } from "react-icons/ai";
import { FcHighPriority, FcOk } from "react-icons/fc";
import { useGetDocumentsPendingMyAction } from "../../../lib/hooks/tanstack/useGetDocumentsPendingMyAction";
import { useGetMyProjects } from "../../../lib/hooks/tanstack/useGetMyProjects";
import { useGetMyTasks } from "../../../lib/hooks/tanstack/useGetMyTasks";
import { ITaskDisplayCard } from "../../../types";
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

  const { taskData, tasksLoading } = useGetMyTasks();

  useEffect(() => {
    if (!tasksLoading && taskData) {
      // Function to sort tasks based on status
      const sortTasksByStatus = (tasks) => {
        return tasks.sort((a, b) => {
          if (a.status === "done") return 1;
          if (a.status === "inprogress" && b.status !== "done") return -1;
          return 0;
        });
      };
      // Check if data is available and then sort tasks
      const sortedTaskData = taskData
        ? {
            done: sortTasksByStatus(
              taskData?.filter((task) => task.status === "done"),
            ),
            todo: sortTasksByStatus(
              taskData?.filter((task) => task.status === "todo"),
            ),
            inprogress: sortTasksByStatus(
              taskData?.filter((task) => task.status === "inprogress"),
            ),
          }
        : null;

      setCombinedData([
        ...sortedTaskData.inprogress,
        ...sortedTaskData.todo,
        ...sortedTaskData.done,
      ]);
    }
  }, [tasksLoading, taskData]);
  const [combinedData, setCombinedData] = useState<ITaskDisplayCard[]>([]);

  //   useEffect(() => console.log(projectData), [projectData]);

  //   const boxShadow = useBoxShadow();

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
                  {combinedData?.filter((d) => d.status !== "done")?.length +
                    pendingProjectDocumentData?.all?.length >=
                  1 ? (
                    <Box
                      display={"inline-flex"}
                      justifyContent={"center"}
                      alignItems={"center"}
                    >
                      <Box mr={2}>
                        {combinedData?.filter((d) => d.status !== "done")
                          ?.length + pendingProjectDocumentData?.all?.length}
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
                    combinedData={combinedData}
                    pendingProjectDocumentData={pendingProjectDocumentData}
                  />
                  {/* {combinedData?.length +
                    pendingProjectDocumentData?.all?.length >=
                  1 ? (
                    <Grid gridTemplateColumns={"repeat(1, 1fr)"}>
                      {combinedData.map(
                        (task: ITaskDisplayCard, index: number) => {
                          return (
                            <TraditionalPersonalTaskDisplay
                              key={index}
                              task={task}
                            />
                          );
                        },
                      )}

                      {!pendingProjectDocumentDataLoading &&
                      pendingProjectDocumentData?.team?.length +
                        pendingProjectDocumentData?.lead?.length +
                        pendingProjectDocumentData?.ba?.length +
                        pendingProjectDocumentData?.directorate?.length >=
                        1
                        ? [
                            ...pendingProjectDocumentData.team.map(
                              (document) => ({
                                document,
                                inputKind: "team_member",
                              }),
                            ),
                            ...pendingProjectDocumentData.lead.map(
                              (document) => ({
                                document,
                                inputKind: "project_lead",
                              }),
                            ),
                            ...pendingProjectDocumentData.ba.map(
                              (document) => ({
                                document,
                                inputKind: "business_area_lead",
                              }),
                            ),
                            ...pendingProjectDocumentData.directorate.map(
                              (document) => ({
                                document,
                                inputKind: "directorate",
                              }),
                            ),
                          ]?.map(({ document, inputKind }, index: number) => (
                            <TraditionalDocumentTaskDisplay
                              key={index}
                              document={document}
                              inputKind={inputKind}
                            />
                          ))
                        : null}
                    </Grid>
                  ) : (
                    <Center>
                      <Flex>
                        <Center pt={10}>
                          <FcOk />
                          &nbsp;
                          <Text>All done!</Text>
                        </Center>
                      </Flex>
                    </Center>
                  )} */}
                </AccordionPanel>
              </AccordionItem>
            </motion.div>
          )}

          {(me?.userData?.is_aec ||
            // me?.userData?.is_biometrician ||
            // me?.userData?.is_herbarium_curator ||
            me?.userData?.is_superuser) ===
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
                        title: false,
                        role: false,
                        kind: false,
                      }}
                      defaultSorting={"status"}
                      noDataString={"You aren't associated with any projects"}
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
