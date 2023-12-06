// Route for displaying the Project Details of a given project.

import { useParams } from "react-router-dom"
import { Tab, TabList, TabPanel, TabPanels, Tabs, useColorMode, Spinner, Select, FormControl, FormHelperText, FormLabel, Box, Text, Flex, Center } from "@chakra-ui/react";
import { ProjectOverviewCard } from "../components/Pages/ProjectDetail/ProjectOverviewCard";
import { ConceptPlanContents } from "../components/Pages/ProjectDetail/ConceptPlanContents";
import { ProjectPlanContents } from "../components/Pages/ProjectDetail/ProjectPlanContents";
import { ProgressReportContents } from "../components/Pages/ProjectDetail/ProgressReportContents";
import { IFullProjectDetails, IProgressReport, IProjectAreas, IProjectData, IProjectDocuments, IProjectMember, IStudentReport } from "../types";
import { ManageTeam } from "../components/Pages/ProjectDetail/ManageTeam";
import { useProject } from "../lib/hooks/useProject";
import { useEffect, useState } from "react";
import { ProjectClosureContents } from "../components/Pages/ProjectDetail/ProjectClosureContents";
import { StudentReportContents } from "../components/Pages/ProjectDetail/StudentReportContents";
import { Head } from "../components/Base/Head";
import { DocumentActions } from "../components/Pages/ProjectDetail/DocumentActions";
import useDistilledProjectTitle from "../lib/hooks/useDistlledProjectTitle";
import { useUser } from "../lib/hooks/useUser";
// import { ProgressReportSelector } from "../components/Pages/ProjectDetail/ProgressReportSelector";

export const ProjectDetail = ({ selectedTab }: { selectedTab: string }): React.ReactNode => {

    const { projectPk } = useParams();
    const { isLoading, projectData, refetch } = useProject(projectPk);

    const [location, setLocation] = useState<IProjectAreas | null>();
    const [baseInformation, setBaseInformation] = useState<IProjectData | null>();
    const [details, setDetails] = useState<IFullProjectDetails | null>();
    const [documents, setDocuments] = useState<IProjectDocuments | null>();
    const [members, setMembers] = useState<IProjectMember[]>([]);
    const [distilledTitle, setDistilledTitle] = useState<string>();

    useEffect(() => {
        console.log(projectData)
        if (!isLoading && projectData) {
            setLocation(projectData.location);
            setBaseInformation(projectData.project);
            setDetails(projectData.details);
            setDocuments(projectData.documents);
            setMembers(projectData.members);
            const parser = new DOMParser();
            const doc = parser.parseFromString(projectData?.project?.title, 'text/html');
            const pElement = doc.querySelector('p');
            const spanElement = pElement.querySelector('span') ? pElement.querySelector('span') : pElement;
            const title = spanElement ? spanElement.textContent : '';
            setDistilledTitle(title);
        }
    }, [isLoading, projectData])

    useEffect(() => {
        console.log(distilledTitle)

    }, [distilledTitle])

    const me = useUser();

    // Refetch data on tab change and ensure falsy items are removed from the array
    const [tabs, setTabs] = useState([]);
    const [activeTabIndex, setActiveTabIndex] = useState<number>(0);
    const [isInitialRender, setIsInitialRender] = useState(true);
    const [selectedTabSet, setSelectedTabSet] = useState(false);
    // const [tabCount, setTabCount] = useState<number>(tabs.length);

    const setToSelectedTab = () => {
        if (tabs.includes(selectedTab)) {
            setActiveTabIndex(tabs.indexOf(selectedTab))
        }
    }

    const setToLastTab = (tabs: string[]) => {
        if (tabs.includes('closure')) {
            setActiveTabIndex(tabs.indexOf('closure'))
        }
        else if (tabs.includes('progress')) {
            setActiveTabIndex(tabs.indexOf('progress'))
        }
        else if (tabs.includes('student')) {
            setActiveTabIndex(tabs.indexOf('student'))
        }
        else if (tabs.includes('project')) {
            setActiveTabIndex(tabs.indexOf('project'))
        }
        else if (tabs.includes('concept')) {
            setActiveTabIndex(tabs.indexOf('concept'))
        }
        else if (tabs.includes('overview')) {
            setActiveTabIndex(tabs.indexOf('overview'))
        }
    };

    useEffect(() => {

        if (isInitialRender) {
            if (documents) {
                const tabData = [
                    'overview',
                    documents?.concept_plan && 'concept',
                    documents?.project_plan && 'project',
                    documents?.progress_reports && documents.progress_reports.length > 0 && 'progress',
                    documents?.student_reports && documents.student_reports.length > 0 && 'student',
                    documents?.project_closure && 'closure'
                ].filter(Boolean)
                setTabs(tabData)
                setIsInitialRender(false);

            }
            // if (tabs.length >= 1) {
            // }
        } else {
            if (selectedTab) {
                console.log('there is a selected tab')
                if (selectedTabSet === false) {
                    console.log('and it hasnt been set')
                    setToSelectedTab();
                    setSelectedTabSet(true);
                }
            } else {
                // if the tab has been set already
                const tabData = [
                    'overview',
                    documents?.concept_plan && 'concept',
                    documents?.project_plan && 'project',
                    documents?.progress_reports && documents.progress_reports.length > 0 && 'progress',
                    documents?.student_reports && documents.student_reports.length > 0 && 'student',
                    documents?.project_closure && 'closure'
                ].filter(Boolean)
                if (tabData.length !== tabs.length) {
                    console.log("Len:", tabs.length, tabs)

                    setTabs(tabData)
                }
            }

        }
    }, [documents, tabs, isInitialRender, selectedTab, selectedTabSet])

    return (

        (isLoading || !documents || !distilledTitle) ? <Center>
            {/* <Head title={distilledTitle} /> */}
            <Spinner />
        </Center> :
            documents && distilledTitle && (
                <>
                    <Head title={distilledTitle} />
                    <Tabs
                        isLazy
                        isFitted
                        variant={'enclosed'}
                        // onChange={(index) => setTabIndex(index)}
                        onChange={(index) => {
                            refetch()
                            setActiveTabIndex(index)
                        }}
                        defaultIndex={activeTabIndex}
                        index={activeTabIndex}

                    >
                        <TabList mb='1em'>
                            <Tab
                                fontSize="sm"
                                value="overview"
                                onClick={() => setActiveTabIndex(tabs.indexOf("overview"))}
                            >
                                Overview
                            </Tab>
                            {documents?.concept_plan && (
                                <Tab fontSize="sm"
                                    value="concept"
                                    onClick={() => setActiveTabIndex(tabs.indexOf("concept"))}
                                >
                                    Concept Plan
                                </Tab>
                            )}
                            {documents?.project_plan && (
                                <Tab fontSize="sm"
                                    value="project"
                                    onClick={() => setActiveTabIndex(tabs.indexOf("project"))}
                                >
                                    Project Plan</Tab>

                            )}
                            {documents?.progress_reports && documents.progress_reports.length !== 0 && (
                                <Tab fontSize="sm"
                                    value="progress"
                                    onClick={() => setActiveTabIndex(tabs.indexOf("progress"))}

                                >
                                    Progress Reports
                                </Tab>

                            )}
                            {documents?.student_reports && documents.student_reports.length !== 0 && (
                                <Tab fontSize="sm"
                                    value="student"
                                    onClick={() => setActiveTabIndex(tabs.indexOf("student"))}

                                >
                                    Student Reports
                                </Tab>

                            )}
                            {documents?.project_closure && (
                                <Tab fontSize="sm"
                                    value="closure"
                                    onClick={() => setActiveTabIndex(tabs.indexOf("closure"))}

                                >Project Closure</Tab>

                            )}
                        </TabList>
                        <TabPanels>

                            {/* OVERVIEW */}
                            <TabPanel>
                                {
                                    baseInformation ?
                                        (
                                            <>



                                                <ProjectOverviewCard
                                                    location={location}
                                                    baseInformation={baseInformation}
                                                    details={details}
                                                    members={members}
                                                    documents={documents}
                                                    refetchData={refetch}
                                                    setToLastTab={() => {
                                                        setToLastTab(tabs)
                                                    }}
                                                />

                                                {/* <ManageTeam /> */}
                                                <ManageTeam
                                                    // team={members}
                                                    project_id={projectPk !== undefined ? Number(projectPk) : 0}
                                                />

                                                {/* <DocumentActions
                                            tabType="overview"
                                            documents={documents}
                                            projectData={projectData}
                                        /> */}
                                            </>
                                        ) :
                                        <Spinner />
                                }
                            </TabPanel>


                            {/* CONCEPT PLAN */}
                            {
                                documents?.concept_plan && (
                                    <TabPanel
                                    >
                                        <ConceptPlanContents
                                            userData={me?.userData}
                                            members={members}
                                            document={documents.concept_plan}
                                            all_documents={documents}
                                            refetch={refetch}
                                            setToLastTab={() => {
                                                setToLastTab(tabs)
                                            }}
                                        // projectPk={Number(projectPk)}
                                        />
                                    </TabPanel>
                                )
                            }


                            {/* PROJECT PLAN */}
                            {documents?.project_plan && (
                                <TabPanel>
                                    <ProjectPlanContents
                                        refetch={refetch}
                                        document={documents.project_plan}

                                        all_documents={documents}

                                        userData={me?.userData}
                                        members={members}
                                        setToLastTab={() => {
                                            setToLastTab(tabs)
                                        }}
                                    />
                                </TabPanel>
                            )}


                            {/* PROGRESS REPORT */}
                            {
                                documents?.progress_reports && documents.progress_reports.length !== 0 && (
                                    <TabPanel>
                                        <ProgressReportContents
                                            documents={documents.progress_reports}
                                            refetch={refetch}

                                            all_documents={documents}

                                            userData={me?.userData}
                                            members={members}
                                            setToLastTab={() => {
                                                setToLastTab(tabs)
                                            }}
                                        />
                                    </TabPanel>
                                )
                            }

                            {/* STUDENT REPORT */}
                            {
                                documents?.student_reports && documents.student_reports.length !== 0 && projectPk && (
                                    <TabPanel>
                                        <StudentReportContents
                                            projectPk={projectPk}
                                            documents={documents.student_reports}
                                            refetch={refetch}

                                            all_documents={documents}

                                            userData={me?.userData}
                                            members={members}
                                            setToLastTab={() => {
                                                setToLastTab(tabs)
                                            }}
                                        //  selectedYear={selectedStudentReportYear}
                                        />
                                    </TabPanel>
                                )
                            }


                            {/* PROJECT CLOSURE */}
                            {
                                documents?.project_closure && (
                                    <TabPanel>
                                        <ProjectClosureContents
                                            document={documents.project_closure}
                                            userData={me?.userData}
                                            members={members}
                                            all_documents={documents}
                                            refetch={refetch}
                                            setToLastTab={() => {
                                                setToLastTab(tabs)
                                            }}
                                        />
                                    </TabPanel>
                                )
                            }
                        </TabPanels>
                    </Tabs>
                </>
            )

    )
}
