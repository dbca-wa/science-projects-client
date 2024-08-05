// Route for displaying the Project Details of a given project.

import {
  Box,
  Button,
  Center,
  Spinner,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
  useColorMode,
} from "@chakra-ui/react";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Head } from "../components/Base/Head";
import { ConceptPlanContents } from "../components/Pages/ProjectDetail/ConceptPlanContents";
import { ManageTeam } from "../components/Pages/ProjectDetail/ManageTeam";
import { ProgressReportContents } from "../components/Pages/ProjectDetail/ProgressReportContents";
import { ProjectClosureContents } from "../components/Pages/ProjectDetail/ProjectClosureContents";
import { ProjectOverviewCard } from "../components/Pages/ProjectDetail/ProjectOverviewCard";
import { ProjectPlanContents } from "../components/Pages/ProjectDetail/ProjectPlanContents";
import { StudentReportContents } from "../components/Pages/ProjectDetail/StudentReportContents";
import { useProject } from "../lib/hooks/tanstack/useProject";
import { useUser } from "../lib/hooks/tanstack/useUser";
import {
  IExtendedProjectDetails,
  IProjectAreas,
  IProjectData,
  IProjectDocuments,
  IProjectMember,
} from "../types";
// import { ProgressReportSelector } from "../components/Pages/ProjectDetail/ProgressReportSelector";
import useApiEndpoint from "@/lib/hooks/helper/useApiEndpoint";

export const ProjectDetail = ({
  selectedTab,
}: {
  selectedTab: string;
}): React.ReactNode => {
  const { projectPk } = useParams();
  const { isLoading, projectData, refetch } = useProject(projectPk);

  const [location, setLocation] = useState<IProjectAreas | null>();
  const [baseInformation, setBaseInformation] = useState<IProjectData | null>();
  const [details, setDetails] = useState<IExtendedProjectDetails | null>();
  const [documents, setDocuments] = useState<IProjectDocuments | null>();
  const [members, setMembers] = useState<IProjectMember[]>([]);
  const [distilledTitle, setDistilledTitle] = useState<string>();
  const [baLead, setBaLead] = useState<number>();

  useEffect(() => {
    if (!isLoading && projectData) {
      // console.log(projectData);
      setLocation(projectData.location);
      setBaseInformation(projectData.project);
      setDetails(projectData.details);
      setDocuments(projectData.documents);
      setMembers(projectData.members);
      setBaLead(projectData?.project?.business_area?.leader);
      const parser = new DOMParser();
      const doc = parser.parseFromString(
        projectData?.project?.title,
        "text/html",
      );
      const pElement = doc.querySelector("p");
      const spanElement = pElement.querySelector("span")
        ? pElement.querySelector("span")
        : pElement;
      const title = spanElement ? spanElement.textContent : "";
      setDistilledTitle(title);
    }
  }, [isLoading, projectData]);

  // useEffect(() => console.log(documents), [documents]);
  const me = useUser();

  // Refetch data on tab change and ensure falsy items are removed from the array
  const [tabs, setTabs] = useState([]);
  const [activeTabIndex, setActiveTabIndex] = useState<number>(0);
  const [isInitialRender, setIsInitialRender] = useState(true);
  const [selectedTabSet, setSelectedTabSet] = useState(false);
  // const [tabCount, setTabCount] = useState<number>(tabs.length);

  const setToSelectedTab = () => {
    if (tabs?.includes(selectedTab)) {
      // console.log(`Tab setting to  ${selectedTab}`);
      setActiveTabIndex(tabs.indexOf(selectedTab));
    } else {
      // console.log(`Tabs do not include ${selectedTab}`);
    }
  };

  const setToLastTab = (tabToGoTo?: number) => {
    if (tabToGoTo) {
      if (tabToGoTo === -1) {
        setActiveTabIndex(tabs.length);
      } else if (tabToGoTo === 0) {
        setActiveTabIndex(tabs.length - 1);
      }
    } else {
      if (tabs.includes("closure")) {
        setActiveTabIndex(tabs.indexOf("closure"));
      } else if (tabs.includes("progress")) {
        setActiveTabIndex(tabs.indexOf("progress"));
      } else if (tabs.includes("student")) {
        setActiveTabIndex(tabs.indexOf("student"));
      } else if (tabs.includes("project")) {
        setActiveTabIndex(tabs.indexOf("project"));
      } else if (tabs.includes("concept")) {
        setActiveTabIndex(tabs.indexOf("concept"));
      } else if (tabs.includes("overview")) {
        setActiveTabIndex(tabs.indexOf("overview"));
      }
    }
  };

  useEffect(() => {
    const count =
      (documents?.student_reports?.length >= 1 ? 1 : 0) +
      (documents?.progress_reports?.length >= 1 ? 1 : 0) +
      (documents?.concept_plan ? 1 : 0) +
      (documents?.project_closure ? 1 : 0) +
      (documents?.project_plan ? 1 : 0) +
      1; // plus overview

    const tabData = [
      "overview",
      documents?.concept_plan && "concept",
      documents?.project_plan && "project",
      documents?.progress_reports &&
        documents.progress_reports.length > 0 &&
        "progress",
      documents?.student_reports &&
        documents.student_reports.length > 0 &&
        "student",
      documents?.project_closure && "closure",
    ].filter(Boolean);

    if (tabs.length !== count) {
      setTabs(tabData);
      if (!isInitialRender) {
        setActiveTabIndex(tabData.length - 1);
      }
    }
  }, [
    isInitialRender,
    documents?.concept_plan,
    documents?.progress_reports,
    documents?.student_reports,
    documents?.progress_reports?.length,
    documents?.student_reports?.length,
    documents?.project_plan,
    documents?.project_closure,
    tabs,
  ]);

  useEffect(() => {
    if (projectData && tabs?.length >= 2) {
      if (isInitialRender) {
        setIsInitialRender(false);
      } else {
        if (tabs.length >= 1 && selectedTabSet === false) {
          if (selectedTab && selectedTab !== "overview") {
            setToSelectedTab();
            setSelectedTabSet(true);
          }
        }
      }
    }
  }, [projectData, tabs, isInitialRender, selectedTab, selectedTabSet]);

  const { colorMode } = useColorMode();
  const navigate = useNavigate();

  // useEffect(() => console.log(documents))
  const baseAPI = useApiEndpoint();

  return me?.userData && !me?.userLoading ? (
    <div
      key={
        (documents?.progress_reports?.length || 0) +
        (documents?.student_reports?.length || 0) +
        (documents?.concept_plan ? 1 : 0) +
        (documents?.project_plan ? 1 : 0) +
        (documents?.progress_reports?.length || 0)
      }
    >
      {isLoading || !documents || !distilledTitle ? (
        isLoading === false && projectData === undefined ? (
          <Box
            w={"100%"}
            h={"100%"}
            justifyContent={"center"}
            alignItems={"center"}
            display={"flex"}
            flexDir={"column"}
            mt={10}
          >
            <Text fontWeight={"semibold"} fontSize={"2xl"}>
              Sorry, a project with id "{projectPk}" does not exist.
            </Text>
            <Text mt={6}>
              This project has either been deleted or never existed.
            </Text>
            <Text mt={3}>
              If you believe this is in error, please submit feedback
            </Text>
            <Box mt={8}>
              <Button
                color={"white"}
                bg={colorMode === "light" ? "blue.500" : "blue.600"}
                _hover={{
                  bg: colorMode === "light" ? "blue.400" : "blue.500",
                }}
                onClick={() => navigate("/projects")}
              >
                Back to Projects
              </Button>
            </Box>
          </Box>
        ) : (
          <Center>
            {/* <Head title={distilledTitle} /> */}
            <Spinner />
          </Center>
        )
      ) : (
        documents &&
        distilledTitle && (
          <>
            <Head title={distilledTitle} />
            <Tabs
              isLazy
              isFitted
              variant={"enclosed"}
              // onChange={(index) => setTabIndex(index)}
              onChange={(index) => {
                refetch();
                setActiveTabIndex(index);
              }}
              defaultIndex={activeTabIndex}
              index={activeTabIndex}
            >
              <TabList mb="1em">
                <Tab
                  fontSize="sm"
                  value="overview"
                  onClick={() => setActiveTabIndex(tabs.indexOf("overview"))}
                >
                  Overview
                </Tab>
                {documents?.concept_plan && (
                  <Tab
                    fontSize="sm"
                    value="concept"
                    onClick={() => setActiveTabIndex(tabs.indexOf("concept"))}
                  >
                    Concept Plan
                  </Tab>
                )}
                {documents?.project_plan && (
                  <Tab
                    fontSize="sm"
                    value="project"
                    onClick={() => setActiveTabIndex(tabs.indexOf("project"))}
                  >
                    Project Plan
                  </Tab>
                )}
                {!isLoading &&
                  documents?.progress_reports &&
                  documents.progress_reports.length !== 0 && (
                    <Tab
                      fontSize="sm"
                      value="progress"
                      onClick={() =>
                        setActiveTabIndex(tabs.indexOf("progress"))
                      }
                    >
                      Progress Reports
                    </Tab>
                  )}
                {!isLoading &&
                  documents?.student_reports &&
                  documents.student_reports.length !== 0 && (
                    <Tab
                      fontSize="sm"
                      value="student"
                      onClick={() => setActiveTabIndex(tabs.indexOf("student"))}
                    >
                      Student Reports
                    </Tab>
                  )}
                {documents?.project_closure && (
                  <Tab
                    fontSize="sm"
                    value="closure"
                    onClick={() => setActiveTabIndex(tabs.indexOf("closure"))}
                  >
                    Project Closure
                  </Tab>
                )}
              </TabList>
              <TabPanels>
                {/* OVERVIEW */}
                <TabPanel>
                  {baseInformation ? (
                    <motion.div
                      initial={{ y: -10, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ y: 10, opacity: 0 }}
                      transition={{
                        duration: 0.7,
                        delay: 1 / 7,
                      }}
                      style={{
                        height: "100%",
                        animation: "oscillate 8s ease-in-out infinite",
                        // backgroundColor: "pink"
                      }}
                    >
                      <ProjectOverviewCard
                        location={location}
                        baseInformation={baseInformation}
                        details={details}
                        members={members}
                        documents={documents}
                        refetchData={refetch}
                        setToLastTab={setToLastTab}
                      />

                      {/* <ManageTeam /> */}
                      <ManageTeam
                        // team={members}
                        project_id={
                          projectPk !== undefined ? Number(projectPk) : 0
                        }
                        ba_leader={baLead}
                      />
                    </motion.div>
                  ) : (
                    <Spinner />
                  )}
                </TabPanel>

                {/* CONCEPT PLAN */}
                {documents?.concept_plan && (
                  <TabPanel>
                    <ConceptPlanContents
                      baseAPI={baseAPI}
                      userData={me?.userData}
                      members={members}
                      document={documents.concept_plan}
                      all_documents={documents}
                      refetch={refetch}
                      baLead={baLead}
                    />
                  </TabPanel>
                )}

                {/* PROJECT PLAN */}
                {documents?.project_plan && (
                  <TabPanel>
                    <ProjectPlanContents
                      baseAPI={baseAPI}
                      refetch={refetch}
                      document={documents.project_plan}
                      all_documents={documents}
                      userData={me?.userData}
                      members={members}
                      setToLastTab={setToLastTab}
                      projectAreas={location}
                      baLead={baLead}
                    />
                  </TabPanel>
                )}

                {/* PROGRESS REPORT */}
                {documents?.progress_reports &&
                  documents.progress_reports.length !== 0 && (
                    <TabPanel>
                      <ProgressReportContents
                        baseAPI={baseAPI}
                        documents={documents.progress_reports}
                        refetch={refetch}
                        all_documents={documents}
                        userData={me?.userData}
                        members={members}
                        setToLastTab={setToLastTab}
                        baLead={baLead}
                      />
                    </TabPanel>
                  )}

                {/* STUDENT REPORT */}
                {documents?.student_reports &&
                  documents.student_reports.length !== 0 &&
                  projectPk && (
                    <TabPanel>
                      <StudentReportContents
                        baseAPI={baseAPI}
                        projectPk={projectPk}
                        documents={documents.student_reports}
                        refetch={refetch}
                        userData={me?.userData}
                        members={members}
                        setToLastTab={setToLastTab}
                        baLead={baLead}
                      />
                    </TabPanel>
                  )}

                {/* PROJECT CLOSURE */}
                {documents?.project_closure && (
                  <TabPanel>
                    <ProjectClosureContents
                      baseAPI={baseAPI}
                      document={documents.project_closure}
                      userData={me?.userData}
                      members={members}
                      all_documents={documents}
                      refetch={refetch}
                      setToLastTab={setToLastTab}
                      baLead={baLead}
                    />
                  </TabPanel>
                )}
              </TabPanels>
            </Tabs>
          </>
        )
      )}
    </div>
  ) : null;
};
