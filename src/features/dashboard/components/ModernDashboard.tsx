// Handles displaying the tabs for the modern dashboard

import {
  Box,
  Center,
  Flex,
  Spinner,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  useColorMode,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { useUser } from "@/features/users/hooks/useUser";
import { Quote } from "@/shared/components/Quote";
import { MyTasksSection } from "./MyTasksSection";

import { useGetDocumentsPendingMyAction } from "@/features/documents/hooks/useGetDocumentsPendingMyAction";
import { useGetEndorsementsPendingMyAction } from "@/features/documents/hooks/useGetEndorsementsPendingMyAction";
import { useLocation, useNavigate } from "react-router-dom";
import { useGetMyProjects } from "@/features/projects/hooks/useGetMyProjects";
import type { IDashProps } from "@/shared/types";
import { Admin } from "./Admin";
import { MyProjectsSection } from "./MyProjectsSection";

export const ModernDashboard = ({ activeTab }: IDashProps) => {
  const location = useLocation();
  const navigate = useNavigate();

  const queryParams = new URLSearchParams(location.search);
  const activeTabFromQueryParam = parseInt(
    queryParams.get("activeTab") || `${activeTab || 0}`,
    10,
  );

  const [activeTabPanel, setActiveTabPanel] = useState<number>(
    activeTabFromQueryParam,
  );

  useEffect(() => {
    // Set the activeTabPanel state based on the location state
    if (location.state && typeof location.state.activeTab === "number") {
      setActiveTabPanel(location.state.activeTab);
    }
  }, [location.state]);

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

  const { userData } = useUser();

  return (
    <>
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
                  {(pendingEndorsementsDataLoading === false
                    ? pendingEndorsementsData.aec.length
                    : 0) +
                    (pendingProjectDocumentDataLoading === false
                      ? pendingProjectDocumentData.all.length
                      : 0)}
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
        </TabList>
        <TabPanels>
          <TabPanel>
            <Box mb={2}>
              <Quote />
            </Box>

            <Box mt={1}>
              {pendingEndorsementsDataLoading === false &&
              pendingProjectDocumentDataLoading === false ? (
                <MyTasksSection
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
