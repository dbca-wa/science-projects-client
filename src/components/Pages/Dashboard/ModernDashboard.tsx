// Handles displaying the tabs for the modern dashboard

import {
  Box,
  Button,
  Center,
  Flex,
  Spinner,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  useColorMode,
  useDisclosure,
} from "@chakra-ui/react";
import { Quote } from "../../Quote";
import { useEffect, useState } from "react";
import { MyTasksSection } from "./MyTasksSection";
import { useUser } from "../../../lib/hooks/tanstack/useUser";

import { useGetMyTasks } from "../../../lib/hooks/tanstack/useGetMyTasks";
import { useGetMyProjects } from "../../../lib/hooks/tanstack/useGetMyProjects";
import { MyProjectsSection } from "./MyProjectsSection";
import { Admin } from "./Admin";
import { IDashProps } from "../../../types";
import { useLocation, useNavigate } from "react-router-dom";
import { AddIcon } from "@chakra-ui/icons";
import { AddPersonalTaskModal } from "../../Modals/AddPersonalTaskModal";
import { useGetDocumentsPendingMyAction } from "@/lib/hooks/tanstack/useGetDocumentsPendingMyAction";
import { useGetEndorsementsPendingMyAction } from "@/lib/hooks/tanstack/useGetEndorsementsPendingMyAction";
import { PatchNotes } from "./PatchNotes";

export const ModernDashboard = ({ activeTab }: IDashProps) => {
  const handleAddTaskClick = () => {
    console.log("Clicked add button");
    onAddTaskOpen();
  };

  const location = useLocation();
  const navigate = useNavigate();

  const queryParams = new URLSearchParams(location.search);
  const activeTabFromQueryParam = parseInt(
    queryParams.get("activeTab") || `${activeTab || 0}`,
    10
  );

  const [activeTabPanel, setActiveTabPanel] = useState<number>(
    activeTabFromQueryParam
  );

  useEffect(() => {
    // Set the activeTabPanel state based on the location state
    if (location.state && typeof location.state.activeTab === "number") {
      setActiveTabPanel(location.state.activeTab);
    }
  }, [location.state]);

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

      // Set the state with the correct type
      setCombinedData(sortedTaskData);
    }
  }, [tasksLoading, taskData]);

  interface ICombinedData {
    todo: [];
    inprogress: [];
    done: [];
  }
  const [combinedData, setCombinedData] = useState<ICombinedData | null>(null);

  const { pendingProjectDocumentData, pendingProjectDocumentDataLoading } =
    useGetDocumentsPendingMyAction();
  const { pendingEndorsementsData, pendingEndorsementsDataLoading } =
    useGetEndorsementsPendingMyAction();

  const { projectData, projectsLoading } = useGetMyProjects();

  const { colorMode } = useColorMode();

  const tabBaseStyling = {
    fontSize: "lg",
    fontWeight: "semibold",
    color: colorMode === "light" ? "gray.400" : "gray.500",
  };

  const tabActiveStyling = {
    fontSize: "lg",
    fontWeight: "bold",
    color: colorMode === "light" ? "gray.600" : "gray.300",
    bg: "transparent", // Remove background color for active tab
  };

  const countCircleStyling = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "24px",
    height: "24px",
    rounded: "full",
    backgroundColor: colorMode === "light" ? "blue.500" : "blue.600",
    color: "white",
    fontSize: "sm",
  };

  const { userLoading, userData, isLoggedIn } = useUser();
  const {
    isOpen: isAddTaskOpen,
    onOpen: onAddTaskOpen,
    onClose: onAddTaskClose,
  } = useDisclosure();

  const [isAnimating, setIsAnimating] = useState(false);
  return (
    <>
      <AddPersonalTaskModal
        userData={userData}
        isLoggedIn={isLoggedIn}
        userLoading={userLoading}
        isAnimating={isAnimating}
        setIsAnimating={setIsAnimating}
        isAddTaskOpen={isAddTaskOpen}
        onAddTaskClose={onAddTaskClose}
      />
      <Tabs
        variant="soft-rounded"
        bg="transparent"
        isLazy
        index={activeTabPanel}
      >
        <TabList>
          <Tab
            sx={tabBaseStyling}
            _selected={tabActiveStyling}
            onClick={() => {
              setActiveTabPanel(0);
              navigate("/", { replace: true, state: { activeTab: 0 } });
            }}
          >
            Dash
            {
              <Center ml={2}>
                <Box sx={countCircleStyling}>
                  {tasksLoading === false && combinedData !== null
                    ? (pendingEndorsementsDataLoading === false
                      ? pendingEndorsementsData.aec.length
                      : // +
                      //   pendingEndorsementsData.bm.length +
                      //   pendingEndorsementsData.hc.length
                      0) +
                    (pendingProjectDocumentDataLoading === false
                      ? pendingProjectDocumentData.all.length
                      : 0) +
                    (combinedData.inprogress.length +
                      combinedData.todo.length)
                    : 0}
                </Box>
              </Center>
            }
          </Tab>

          <Tab
            sx={tabBaseStyling}
            _selected={tabActiveStyling}
            onClick={() => {
              setActiveTabPanel(1);
              navigate("/", { replace: true, state: { activeTab: 1 } });
            }}
          >
            My Projects
            {projectData && (
              <Center ml={2}>
                <Box sx={countCircleStyling}>{projectData.length}</Box>
              </Center>
            )}
          </Tab>
          {userData.is_superuser && (
            <Tab
              sx={tabBaseStyling}
              _selected={tabActiveStyling}
              onClick={() => {
                setActiveTabPanel(2);
                navigate("/crud", { replace: true, state: { activeTab: 2 } });
              }}
            >
              Admin Panel
            </Tab>
          )}
          <Box ml="auto" display="flex" alignItems="center" mr={4}>
            <Button
              bg={colorMode === "dark" ? "green.500" : "green.400"}
              _hover={{
                bg: colorMode === "dark" ? "green.400" : "green.300",
              }}
              variant="solid"
              px={3}
              display="flex"
              alignItems="center"
              onClick={handleAddTaskClick}
            >
              <AddIcon color="white" />
            </Button>
          </Box>
        </TabList>
        <TabPanels>
          <TabPanel>
            <Box mb={2}>
              <Quote />
            </Box>
            <PatchNotes userData={userData} isLoggedIn={isLoggedIn} userLoading={userLoading} />

            <Box mt={1}>
              {tasksLoading === false &&
                combinedData !== null &&
                pendingEndorsementsDataLoading === false &&
                pendingProjectDocumentDataLoading === false ? (
                <MyTasksSection
                  personalTaskData={combinedData}
                  personalTaskDataLoading={tasksLoading}
                  endorsementTaskData={pendingEndorsementsData}
                  endorsementTaskDataLoading={pendingEndorsementsDataLoading}
                  documentTaskData={pendingProjectDocumentData}
                  documentTaskDataLoading={pendingProjectDocumentDataLoading}
                />
              ) : (
                <>
                  <Flex w={"100%"} h={"100%"}>
                    <Center w={"100%"} h={"100%"} py={20}>
                      <Spinner size={"xl"} />
                    </Center>
                  </Flex>
                </>
              )}
            </Box>
          </TabPanel>
          <TabPanel>
            <MyProjectsSection data={projectData} loading={projectsLoading} />
          </TabPanel>

          {userData.is_superuser && (
            <TabPanel>
              <Admin />
            </TabPanel>
          )}
        </TabPanels>
      </Tabs>
    </>
  );
};
