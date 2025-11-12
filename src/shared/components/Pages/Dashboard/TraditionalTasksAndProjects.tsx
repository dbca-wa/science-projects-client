// Used to display the tasks and projects of a user in the traditional layout

import { useGetEndorsementsPendingMyAction } from "@/shared/hooks/tanstack/useGetEndorsementsPendingMyAction";
import { useGetPendingAdminTasks } from "@/shared/hooks/tanstack/useGetPendingAdminTasks";
import { useGetPendingCaretakerTasks } from "@/shared/hooks/tanstack/useGetPendingCaretakerTasks";
import { useUser } from "@/shared/hooks/tanstack/useUser";
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
import { AiFillProject } from "react-icons/ai";
import { FcHighPriority, FcOk } from "react-icons/fc";
import { useGetDocumentsPendingMyAction } from "@/shared/hooks/tanstack/useGetDocumentsPendingMyAction";
import { useGetMyProjects } from "@/shared/hooks/tanstack/useGetMyProjects";
import { AdminTasksDataTable } from "./AdminTasksDataTable";
import { DocumentsDataTable } from "./DocumentsDataTable";
import { EndorsementsDataTable } from "./EndorsementsDataTable";
import { UserProjectsDataTable } from "./UserProjectsDataTable";

export const TraditionalTasksAndProjects = () => {
  const { colorMode } = useColorMode();
  const me = useUser();
  // console.log(me);
  // useEffect(() => console.log(me));
  const { projectData, projectsLoading } = useGetMyProjects();
  // useEffect(() => console.log(projectData));

  const { pendingProjectDocumentData, pendingProjectDocumentDataLoading } =
    useGetDocumentsPendingMyAction();

  const { pendingEndorsementsData, pendingEndorsementsDataLoading } =
    useGetEndorsementsPendingMyAction();

  // useEffect(() => {
  //   if (!pendingProjectDocumentDataLoading) {
  //     console.log(pendingProjectDocumentData);
  //   }
  // }, [pendingProjectDocumentData, pendingProjectDocumentDataLoading]);

  // const pendingAdminActionsLoading = true;
  const { pendingAdminTasksLoading, pendingAdminTaskData } =
    useGetPendingAdminTasks();

  const { pendingCaretakerTasksLoading, pendingCaretakerTaskData } =
    useGetPendingCaretakerTasks(me?.userData?.pk);

  // useEffect(() => {
  //   if (!pendingCaretakerTasksLoading) {
  //     console.log("Caretaker Data:");
  //     console.log(pendingCaretakerTaskData);
  //   }
  // }, [pendingCaretakerTasksLoading, pendingCaretakerTaskData]);

  // useEffect(() => {
  //   if (!pendingAdminTasksLoading) {
  //     console.log(pendingAdminTaskData);
  //   }
  // }, [pendingAdminTaskData, pendingAdminTasksLoading]);

  return (
    <>
      <Box mt={6}>
        <Accordion
          // defaultIndex={defaultIndex}
          defaultIndex={[0]}
          allowMultiple
        >
          {/* My Tasks */}

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
                borderTop={
                  "none"
                  // me?.userData?.is_superuser === true ? "1px gray.300" : "none"
                }
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

          {/* Admin Tasks */}
          {me?.userData?.is_superuser === true ? (
            pendingAdminTasksLoading ? (
              <Center my={4}>
                <Spinner />
              </Center>
            ) : (
              <motion.div
                initial={{ scale: 1, opacity: 0 }} // Initial scale (no animation)
                animate={{
                  opacity: 1,
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
                      Admin Tasks
                    </Box>

                    {pendingAdminTaskData?.length >= 1 ? (
                      <Box
                        display={"inline-flex"}
                        justifyContent={"center"}
                        alignItems={"center"}
                      >
                        <Box mr={2}>{pendingAdminTaskData?.length}</Box>
                        <FcHighPriority />
                      </Box>
                    ) : (
                      <FcOk />
                    )}
                    <AccordionIcon />
                  </AccordionButton>

                  <AccordionPanel pb={4} userSelect={"none"} px={0} pt={0}>
                    <AdminTasksDataTable
                      pendingAdminTaskData={pendingAdminTaskData}
                    />
                  </AccordionPanel>
                </AccordionItem>
              </motion.div>
            )
          ) : null}

          {/* Caretaker Tasks */}
          {me?.userData?.caretaking_for?.length > 0 ? (
            pendingCaretakerTasksLoading ? (
              <Center my={4}>
                <Spinner />
              </Center>
            ) : (
              <motion.div
                initial={{ scale: 1, opacity: 0 }} // Initial scale (no animation)
                animate={{
                  opacity: pendingCaretakerTasksLoading ? 0 : 1,
                }}
                transition={{ duration: 0.4 }} // Animation duration in seconds
              >
                <AccordionItem
                  borderColor={
                    colorMode === "light" ? "blackAlpha.500" : "whiteAlpha.600"
                  }
                  borderBottom={"none"}
                  // borderTop={
                  //   me?.userData?.is_superuser === true
                  //     ? "1px gray.300"
                  //     : "none"
                  // }
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
                      Caretaker Tasks
                    </Box>

                    {/* </Box> */}
                    {pendingCaretakerTaskData?.all?.length >= 1 ? (
                      <Box
                        display={"inline-flex"}
                        justifyContent={"center"}
                        alignItems={"center"}
                      >
                        <Box mr={2}>
                          {pendingCaretakerTaskData?.all?.length}
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
                      pendingProjectDocumentData={pendingCaretakerTaskData}
                      isCaretakerTable
                    />
                  </AccordionPanel>
                </AccordionItem>
              </motion.div>
            )
          ) : null}

          {/* Endorsement Tasks */}
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

          {/* My Projects */}
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
