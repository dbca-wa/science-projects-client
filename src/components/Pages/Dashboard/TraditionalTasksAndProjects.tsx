// Used to display the tasks and projects of a user in the traditional layout

import { useBoxShadow } from "@/lib/hooks/useBoxShadow";
import { useGetEndorsementsPendingMyAction } from "@/lib/hooks/useGetEndorsementsPendingMyAction";
import { useUser } from "@/lib/hooks/useUser";
import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Box,
  Center,
  Divider,
  Flex,
  Grid,
  Spinner,
  Text,
  useColorMode,
} from "@chakra-ui/react";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { AiFillProject } from "react-icons/ai";
import { FaUserFriends } from "react-icons/fa";
import { FcHighPriority, FcOk } from "react-icons/fc";
import { GiMaterialsScience } from "react-icons/gi";
import { MdScience } from "react-icons/md";
import { RiBook3Fill } from "react-icons/ri";
import { useNavigate } from "react-router-dom";
import { useProjectSearchContext } from "../../../lib/hooks/ProjectSearchContext";
import { useGetDocumentsPendingMyAction } from "../../../lib/hooks/useGetDocumentsPendingMyAction";
import { useGetMyProjects } from "../../../lib/hooks/useGetMyProjects";
import { useGetMyTasks } from "../../../lib/hooks/useGetMyTasks";
import { IProjectData, IProjectPlan, ITaskDisplayCard } from "../../../types";
import { ExtractedHTMLTitle } from "../../ExtractedHTMLTitle";
import { TraditionalDocumentTaskDisplay } from "./TraditionalDocumentTaskDisplay";
import { TraditionalEndorsementTaskDisplay } from "./TraditionalEndorsementTaskDisplay";
import { TraditionalPersonalTaskDisplay } from "./TraditionalPersonalTaskDisplay";

interface IMiniEndorsement {
  pk: number;
  project_plan: IProjectPlan;
}

export const TraditionalTasksAndProjects = () => {
  const { colorMode } = useColorMode();
  const me = useUser();
  const { projectData, projectsLoading } = useGetMyProjects();

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
              taskData.filter((task) => task.status === "done")
            ),
            todo: sortTasksByStatus(
              taskData.filter((task) => task.status === "todo")
            ),
            inprogress: sortTasksByStatus(
              taskData.filter((task) => task.status === "inprogress")
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

  const { isOnProjectsPage } = useProjectSearchContext();
  const navigate = useNavigate();

  const goToProject = (pk: number | undefined) => {
    if (pk === undefined) {
      console.log("The Pk is undefined. Potentially use 'id' instead.");
    } else if (isOnProjectsPage) {
      navigate(`${pk}`);
    } else {
      navigate(`projects/${pk}`);
    }
  };

  const boxShadow = useBoxShadow();

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
              animate={{ opacity: pendingProjectDocumentDataLoading ? 0 : 1 }}
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
                  {combinedData?.length +
                    pendingProjectDocumentData?.all?.length >=
                  1 ? (
                    <Box
                      display={"inline-flex"}
                      justifyContent={"center"}
                      alignItems={"center"}
                    >
                      <Box mr={2}>
                        {combinedData?.length +
                          pendingProjectDocumentData?.all?.length}
                      </Box>
                      <FcHighPriority />
                    </Box>
                  ) : (
                    <FcOk />
                  )}
                  <AccordionIcon />
                </AccordionButton>

                <AccordionPanel pb={4} userSelect={"none"} px={0} pt={0}>
                  {combinedData?.length +
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
                        }
                      )}

                      {!(
                        pendingProjectDocumentDataLoading &&
                        pendingProjectDocumentData?.team?.length +
                          pendingProjectDocumentData?.lead?.length +
                          pendingProjectDocumentData?.ba?.length +
                          pendingProjectDocumentData?.directorate?.length >=
                          1
                      )
                        ? [
                            ...pendingProjectDocumentData.team.map(
                              (document) => ({
                                document,
                                inputKind: "team_member",
                              })
                            ),
                            ...pendingProjectDocumentData.lead.map(
                              (document) => ({
                                document,
                                inputKind: "project_lead",
                              })
                            ),
                            ...pendingProjectDocumentData.ba.map(
                              (document) => ({
                                document,
                                inputKind: "business_area_lead",
                              })
                            ),
                            ...pendingProjectDocumentData.directorate.map(
                              (document) => ({
                                document,
                                inputKind: "directorate",
                              })
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
                  )}
                </AccordionPanel>
              </AccordionItem>
            </motion.div>
          )}

          {(me?.userData?.is_aec ||
            me?.userData?.is_biometrician ||
            me?.userData?.is_herbarium_curator ||
            me?.userData?.is_superuser) ===
          false ? null : pendingEndorsementsDataLoading ? (
            <Center my={4}>
              <Spinner />
            </Center>
          ) : (
            <motion.div
              initial={{ scale: 1, opacity: 0 }} // Initial scale (no animation)
              animate={{ opacity: pendingEndorsementsDataLoading ? 0 : 1 }}
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
                  {pendingEndorsementsData?.aec?.length +
                    pendingEndorsementsData?.bm?.length +
                    pendingEndorsementsData?.hc?.length >
                  1 ? (
                    <Box
                      display={"inline-flex"}
                      justifyContent={"center"}
                      alignItems={"center"}
                    >
                      <Box mr={2}>
                        {pendingEndorsementsData?.aec?.length +
                          pendingEndorsementsData?.bm?.length +
                          pendingEndorsementsData?.hc?.length}
                      </Box>
                      <FcHighPriority />
                    </Box>
                  ) : (
                    <FcOk />
                  )}
                  <AccordionIcon />
                </AccordionButton>

                <AccordionPanel pb={4} userSelect={"none"} px={0} pt={0}>
                  {pendingEndorsementsData?.aec?.length +
                    pendingEndorsementsData?.bm?.length +
                    pendingEndorsementsData?.hc?.length >=
                  1 ? (
                    <Grid gridTemplateColumns={"repeat(1, 1fr)"}>
                      {!pendingEndorsementsDataLoading &&
                      pendingEndorsementsData?.aec?.length >= 1
                        ? pendingEndorsementsData?.aec?.map(
                            (endorsement: IMiniEndorsement, index: number) => (
                              <TraditionalEndorsementTaskDisplay
                                key={index}
                                document={endorsement?.project_plan?.document}
                                endorsementKind={"animalEthics"}
                              />
                            )
                          )
                        : null}
                      {!pendingEndorsementsDataLoading &&
                      pendingEndorsementsData?.hc?.length >= 1
                        ? pendingEndorsementsData?.hc?.map(
                            (endorsement: IMiniEndorsement, index: number) => (
                              <TraditionalEndorsementTaskDisplay
                                key={index}
                                document={endorsement?.project_plan?.document}
                                endorsementKind={"herbarium"}
                              />
                            )
                          )
                        : null}
                      {!pendingEndorsementsDataLoading &&
                      pendingEndorsementsData?.bm?.length >= 1
                        ? pendingEndorsementsData?.bm?.map(
                            (endorsement: IMiniEndorsement, index: number) => (
                              <TraditionalEndorsementTaskDisplay
                                key={index}
                                document={endorsement?.project_plan?.document}
                                endorsementKind={"biometrician"}
                              />
                            )
                          )
                        : null}
                    </Grid>
                  ) : (
                    <Center>
                      <Flex>
                        <Center pt={10}>
                          <FcOk />
                          &nbsp;
                          <Text>No Endorsements Required From You!</Text>
                        </Center>
                      </Flex>
                    </Center>
                  )}
                </AccordionPanel>
              </AccordionItem>
            </motion.div>
          )}

          {projectsLoading ? null : (
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

              <AccordionPanel
                pb={4}
                userSelect={"none"}
                // w={"100%"}
                // bg={"red"}
                px={0}
                pt={0}
              >
                {projectData?.length >= 1 ? (
                  <Grid
                    // bg={"orange"}
                    justifyItems={"start"}
                    w={"100%"}
                  >
                    {projectData
                      ?.sort((a, b) => {
                        const order = [
                          "science",
                          "student",
                          "core_function",
                          "external",
                        ];

                        const indexA = order.indexOf(a.kind);
                        const indexB = order.indexOf(b.kind);

                        // If both kinds are in the order array, compare their positions
                        if (indexA !== -1 && indexB !== -1) {
                          return indexA - indexB;
                        }

                        // If only one kind is in the order array, prioritize it
                        if (indexA !== -1) {
                          return -1;
                        }

                        if (indexB !== -1) {
                          return 1;
                        }

                        // If neither kind is in the order array, maintain the original order
                        return 0;
                      })
                      .map((project: IProjectData, index: number) => (
                        <Flex
                          key={index}
                          alignItems={"center"}
                          border={"1px solid"}
                          borderColor={
                            colorMode === "light" ? "gray.200" : "gray.600"
                          }
                          w={"100%"}
                          p={2}
                          onClick={() =>
                            goToProject(project?.pk ? project.pk : project.id)
                          }
                          _hover={{
                            color:
                              colorMode === "dark" ? "blue.100" : "blue.300",
                            textDecoration: "underline",
                            cursor: "pointer",
                            boxShadow: boxShadow,
                          }}
                        >
                          <Center
                            // color={colorMode === "light" ? "blue.600" : "gray.200"}
                            color={
                              project?.kind === "core_function"
                                ? "red.600"
                                : project?.kind === "science"
                                ? "green.600"
                                : project?.kind === "student"
                                ? "blue.600"
                                : "gray.600"
                            }
                            mr={3}
                            alignItems={"center"}
                            alignContent={"center"}
                            boxSize={5}
                            w={"20px"}
                          >
                            {project?.kind === "core_function" ? (
                              <GiMaterialsScience />
                            ) : project?.kind === "science" ? (
                              <MdScience />
                            ) : project?.kind === "student" ? (
                              <RiBook3Fill />
                            ) : (
                              <FaUserFriends />
                            )}
                            {/* <GoProjectRoadmap /> */}
                          </Center>

                          <Box mx={0} maxW={"125px"} w={"100%"}>
                            <Text>
                              {project?.kind === "core_function"
                                ? `Core Function`
                                : project?.kind === "science"
                                ? `Science`
                                : project?.kind === "student"
                                ? `Student`
                                : `External`}
                            </Text>
                          </Box>
                          <Divider
                            orientation="vertical"
                            // ml={-1}
                            mr={5}
                          />
                          {/* <SimpleDisplaySRTE

                                                                    data={document?.project.title}
                                                                    displayData={document?.project.title}
                                                                    displayArea="traditionalProjectTitle"
                                                                /> */}

                          <ExtractedHTMLTitle
                            htmlContent={`${project.title}`}
                            color={
                              colorMode === "dark" ? "blue.200" : "blue.400"
                            }
                            fontWeight={"bold"}
                            cursor={"pointer"}
                            _hover={{
                              color:
                                colorMode === "dark" ? "blue.100" : "blue.300",
                              textDecoration: "underline",
                            }}
                          />
                        </Flex>
                      ))}
                  </Grid>
                ) : (
                  <Text mt={4} mx={2}>
                    You are currently not associated with any projects.
                  </Text>
                )}
              </AccordionPanel>
            </AccordionItem>
          )}
        </Accordion>
      </Box>
    </>
  );
};
