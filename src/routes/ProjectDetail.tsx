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

    // useEffect(() => {
    //     if (projectData) {
    //         const parser = new DOMParser();
    //         const doc = parser.parseFromString(projectData?.project?.title, 'text/html');
    //         const pElement = doc.querySelector('p');
    //         const spanElement = pElement.querySelector('span') ? pElement.querySelector('span') : pElement;
    //         const title = spanElement ? spanElement.textContent : '';
    //         setDistilledTitle(title);
    //     }
    // }, [projectData])

    useEffect(() => {
        console.log(distilledTitle)

    }, [distilledTitle])



    // const distilledTitle = useDistilledProjectTitle(projectData?.project?.title);

    const me = useUser();



    // Refetch data on tab change and ensures falsey items remvoed from array
    const [tabs, setTabs] = useState([
        'overview',
        documents?.concept_plan && 'concept',
        documents?.project_plan && 'project',
        documents?.progress_reports && documents.progress_reports.length > 0 && 'progress',
        documents?.student_reports && documents.student_reports.length > 0 && 'student',
        documents?.project_closure && 'closure'
    ].filter(Boolean));

    const [tabCount, setTabCount] = useState<number>();
    useEffect(() => {
        setTabCount(tabs.length)
    }, [projectData, tabs])

    useEffect(() => {
        setTabs(
            [
                'overview',
                documents?.concept_plan && 'concept',
                documents?.project_plan && 'project',
                documents?.progress_reports && documents.progress_reports.length > 0 && 'progress',
                documents?.student_reports && documents.student_reports.length > 0 && 'student',
                documents?.project_closure && 'closure'
            ].filter(Boolean)
        )
    }, [documents?.project_closure, documents?.concept_plan, documents?.progress_reports, documents?.project_plan, documents?.student_reports])

    const defaultTab = selectedTab || "overview";
    const initialTabIndex = defaultTab ? tabs.indexOf(defaultTab) : 0;

    useEffect(() => {
        console.log(documents);
        console.log(defaultTab);
        console.log(selectedTab);
        console.log(tabs.indexOf(defaultTab))
    })


    const [activeTabIndex, setActiveTabIndex] = useState<number>(tabs.indexOf(defaultTab));

    const setToLastTab = () => {
        // refetch()
        console.log("Setting index")
        // console.log(lastTabIndex, lastTab, tabs.indexOf(lastTab))
        // setActiveTabIndex(tabs.indexOf(lastTab));

        setActiveTabIndex(
            tabs.includes('closure') ?
                tabs.indexOf('closure') :
                tabs.includes('student') ?
                    tabs.indexOf('student') :
                    tabs.includes('progress') ?
                        tabs.indexOf('progress') :
                        tabs.includes('project') ?
                            tabs.indexOf('project') :
                            tabs.includes('concept') ?
                                tabs.indexOf('concept') :
                                tabs.indexOf('overview')

        )
    };

    useEffect(() => {
        setToLastTab();
    }, [tabCount])

    useEffect(() => console.log('tab:', activeTabIndex), [activeTabIndex])

    // useEffect(() => {
    //     console.log("activeIndex:", activeTabIndex)
    // })



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
                        defaultIndex={initialTabIndex}
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
                                                    setToLastTab={setToLastTab}
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
                                            setToLastTab={setToLastTab}

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
                                        setToLastTab={setToLastTab}

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
                                            setToLastTab={setToLastTab}

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
                                            setToLastTab={setToLastTab}

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
                                            setToLastTab={setToLastTab}

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


