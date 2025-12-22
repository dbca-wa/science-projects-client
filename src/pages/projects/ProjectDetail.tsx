// Route for displaying the Project Details of a given project.

import { Head } from "@/shared/components/layout/base/Head";
import { ConceptPlanContents } from "@/features/projects/components/detail/ConceptPlanContents";
import { ManageTeam } from "@/features/projects/components/detail/ManageTeam";
import { ProgressReportContents } from "@/features/projects/components/detail/ProgressReportContents";
import { ProjectClosureContents } from "@/features/projects/components/detail/ProjectClosureContents";
import { ProjectOverviewCard } from "@/features/projects/components/detail/ProjectOverviewCard";
import { ProjectPlanContents } from "@/features/projects/components/detail/ProjectPlanContents";
import { StudentReportContents } from "@/features/projects/components/detail/StudentReportContents";
import { useProject } from "@/features/projects/hooks/useProject";
import { useUser } from "@/features/users/hooks/useUser";
import type {
  IExtendedProjectDetails,
  IProjectAreas,
  IProjectData,
  IProjectDocuments,
  IProjectMember,
} from "@/shared/types";
import { Button } from "@/shared/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import { useTheme } from "next-themes";
import { ArrowLeft, Mail } from "lucide-react";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
// import { ProgressReportSelector } from "@/features/projects/components/detail/ProgressReportSelector";
import { useEditorContext } from "@/shared/hooks/EditorBlockerContext";
import useApiEndpoint from "@/shared/hooks/useApiEndpoint";
import useCaretakerPermissions from "@/features/users/hooks/useCaretakerPermissions";

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

  const {
    userIsCaretakerOfMember,
    userIsCaretakerOfProjectLeader,
    userIsCaretakerOfBaLeader,
    userIsCaretakerOfAdmin,
  } = useCaretakerPermissions(me?.userData, members, baseInformation);

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

  const { theme } = useTheme();
  const isDark = theme === "dark";
  const navigate = useNavigate();

  // useEffect(() => console.log(documents))
  const baseAPI = useApiEndpoint();

  const { manuallyCheckAndToggleDialog } = useEditorContext();

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
          <div className="w-full h-full flex justify-center items-center flex-col mt-10">
            <h2 className="font-semibold text-2xl">
              Sorry, a project with id "{projectPk}" does not exist.
            </h2>
            <p className="mt-6">
              This project likely has data issues, never existed or has been
              deleted.
            </p>
            <p className="mt-3">
              If you believe this is in error, please submit feedback
            </p>
            <div className="flex mt-8">
              <Button
                className={`text-white ${
                  isDark 
                    ? "bg-blue-600 hover:bg-blue-500" 
                    : "bg-blue-500 hover:bg-blue-400"
                }`}
                onClick={() => navigate("/projects")}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Projects
              </Button>
              <Button
                className={`ml-4 text-white ${
                  isDark 
                    ? "bg-orange-600 hover:bg-orange-500" 
                    : "bg-orange-500 hover:bg-orange-400"
                }`}
                onClick={() => {
                  const email = "ecoinformatics.admin@dbca.wa.gov.au";
                  window.location.href = `mailto:${email}?subject=Feedback on Project ${projectPk}&body=I have feedback on project ${projectPk} and would like to report an issue.`;
                }}
              >
                <Mail className="mr-2 h-4 w-4" />
                Submit Feedback
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-gray-100"></div>
          </div>
        )
      ) : (
        documents &&
        distilledTitle && (
          <>
            <Head title={distilledTitle} />
            <Tabs
              value={tabs[activeTabIndex]}
              onValueChange={(value) => {
                manuallyCheckAndToggleDialog(() => {
                  refetch();
                  const newIndex = tabs.indexOf(value);
                  setActiveTabIndex(newIndex);
                });
              }}
            >
              <TabsList className="mb-4 w-full justify-start">
                <TabsTrigger
                  value="overview"
                  onClick={() => {
                    setActiveTabIndex(tabs.indexOf("overview"));
                    window.history.pushState(
                      null,
                      "",
                      `/projects/${projectPk}/overview`,
                    );
                  }}
                  className="text-sm"
                >
                  Overview
                </TabsTrigger>
                {documents?.concept_plan && (
                  <TabsTrigger
                    value="concept"
                    onClick={() => {
                      setActiveTabIndex(tabs.indexOf("concept"));
                      window.history.pushState(
                        null,
                        "",
                        `/projects/${projectPk}/concept`,
                      );
                    }}
                    className="text-sm"
                  >
                    Concept Plan
                  </TabsTrigger>
                )}
                {documents?.project_plan && (
                  <TabsTrigger
                    value="project"
                    onClick={() => {
                      setActiveTabIndex(tabs.indexOf("project"));
                      window.history.pushState(
                        null,
                        "",
                        `/projects/${projectPk}/project`,
                      );
                    }}
                    className="text-sm"
                  >
                    Project Plan
                  </TabsTrigger>
                )}
                {!isLoading &&
                  documents?.progress_reports &&
                  documents.progress_reports.length !== 0 && (
                    <TabsTrigger
                      value="progress"
                      onClick={() => {
                        setActiveTabIndex(tabs.indexOf("progress"));
                        window.history.pushState(
                          null,
                          "",
                          `/projects/${projectPk}/progress`,
                        );
                      }}
                      className="text-sm"
                    >
                      Progress Reports
                    </TabsTrigger>
                  )}
                {!isLoading &&
                  documents?.student_reports &&
                  documents.student_reports.length !== 0 && (
                    <TabsTrigger
                      value="student"
                      onClick={() => {
                        setActiveTabIndex(tabs.indexOf("student"));
                        // navigate(`/projects/${projectPk}/student`);
                        window.history.pushState(
                          null,
                          "",
                          `/projects/${projectPk}/student`,
                        );
                      }}
                      className="text-sm"
                    >
                      Student Reports
                    </TabsTrigger>
                  )}
                {documents?.project_closure && (
                  <TabsTrigger
                    value="closure"
                    onClick={() => {
                      setActiveTabIndex(tabs.indexOf("closure"));
                      // navigate(`/projects/${projectPk}/closure`);
                      window.history.pushState(
                        null,
                        "",
                        `/projects/${projectPk}/closure`,
                      );
                    }}
                    className="text-sm"
                  >
                    Project Closure
                  </TabsTrigger>
                )}
              </TabsList>
                {/* OVERVIEW */}
                <TabsContent value="overview">
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
                        userIsCaretakerOfMember={userIsCaretakerOfMember}
                        userIsCaretakerOfProjectLeader={
                          userIsCaretakerOfProjectLeader
                        }
                        userIsCaretakerOfBaLeader={userIsCaretakerOfBaLeader}
                        userIsCaretakerOfAdmin={userIsCaretakerOfAdmin}
                      />

                      {/* <ManageTeam /> */}
                      <ManageTeam
                        // team={members}
                        project_id={
                          projectPk !== undefined ? Number(projectPk) : 0
                        }
                        ba_leader={baLead}
                        userIsCaretakerOfMember={userIsCaretakerOfMember}
                        userIsCaretakerOfProjectLeader={
                          userIsCaretakerOfProjectLeader
                        }
                        userIsCaretakerOfBaLeader={userIsCaretakerOfBaLeader}
                        userIsCaretakerOfAdmin={userIsCaretakerOfAdmin}
                      />
                    </motion.div>
                  ) : (
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-gray-100"></div>
                  )}
                </TabsContent>

                {/* CONCEPT PLAN */}
                {documents?.concept_plan && (
                  <TabsContent value="concept">
                    <ConceptPlanContents
                      baseAPI={baseAPI}
                      userData={me?.userData}
                      members={members}
                      document={documents.concept_plan}
                      all_documents={documents}
                      refetch={refetch}
                      baLead={baLead}
                      userIsCaretakerOfMember={userIsCaretakerOfMember}
                      userIsCaretakerOfProjectLeader={
                        userIsCaretakerOfProjectLeader
                      }
                      userIsCaretakerOfBaLeader={userIsCaretakerOfBaLeader}
                      userIsCaretakerOfAdmin={userIsCaretakerOfAdmin}
                    />
                  </TabsContent>
                )}

                {/* PROJECT PLAN */}
                {documents?.project_plan && (
                  <TabsContent value="project">
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
                      userIsCaretakerOfMember={userIsCaretakerOfMember}
                      userIsCaretakerOfProjectLeader={
                        userIsCaretakerOfProjectLeader
                      }
                      userIsCaretakerOfBaLeader={userIsCaretakerOfBaLeader}
                      userIsCaretakerOfAdmin={userIsCaretakerOfAdmin}
                    />
                  </TabsContent>
                )}

                {/* PROGRESS REPORT */}
                {documents?.progress_reports &&
                  documents.progress_reports.length !== 0 && (
                    <TabsContent value="progress">
                      <ProgressReportContents
                        baseAPI={baseAPI}
                        documents={documents.progress_reports}
                        refetch={refetch}
                        all_documents={documents}
                        userData={me?.userData}
                        members={members}
                        setToLastTab={setToLastTab}
                        baLead={baLead}
                        userIsCaretakerOfMember={userIsCaretakerOfMember}
                        userIsCaretakerOfProjectLeader={
                          userIsCaretakerOfProjectLeader
                        }
                        userIsCaretakerOfBaLeader={userIsCaretakerOfBaLeader}
                        userIsCaretakerOfAdmin={userIsCaretakerOfAdmin}
                      />
                    </TabsContent>
                  )}

                {/* STUDENT REPORT */}
                {documents?.student_reports &&
                  documents.student_reports.length !== 0 &&
                  projectPk && (
                    <TabsContent value="student">
                      <StudentReportContents
                        baseAPI={baseAPI}
                        projectPk={projectPk}
                        documents={documents.student_reports}
                        refetch={refetch}
                        userData={me?.userData}
                        members={members}
                        setToLastTab={setToLastTab}
                        baLead={baLead}
                        userIsCaretakerOfMember={userIsCaretakerOfMember}
                        userIsCaretakerOfProjectLeader={
                          userIsCaretakerOfProjectLeader
                        }
                        userIsCaretakerOfBaLeader={userIsCaretakerOfBaLeader}
                        userIsCaretakerOfAdmin={userIsCaretakerOfAdmin}
                      />
                    </TabsContent>
                  )}

                {/* PROJECT CLOSURE */}
                {documents?.project_closure && (
                  <TabsContent value="closure">
                    <ProjectClosureContents
                      baseAPI={baseAPI}
                      document={documents.project_closure}
                      userData={me?.userData}
                      members={members}
                      all_documents={documents}
                      refetch={refetch}
                      setToLastTab={setToLastTab}
                      baLead={baLead}
                      userIsCaretakerOfMember={userIsCaretakerOfMember}
                      userIsCaretakerOfProjectLeader={
                        userIsCaretakerOfProjectLeader
                      }
                      userIsCaretakerOfBaLeader={userIsCaretakerOfBaLeader}
                      userIsCaretakerOfAdmin={userIsCaretakerOfAdmin}
                    />
                  </TabsContent>
                )}
            </Tabs>
          </>
        )
      )}
    </div>
  ) : null;
};
