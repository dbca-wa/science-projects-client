// Route for displaying the Project Details of a given project.

import { useParams } from "react-router-dom"
import { Tab, TabList, TabPanel, TabPanels, Tabs, useColorMode, Spinner, Select, FormControl, FormHelperText, FormLabel, Box, Text, Flex, Center } from "@chakra-ui/react";
import { ProjectOverviewCard } from "../components/Pages/ProjectDetail/ProjectOverviewCard";
import { ConceptPlanContents } from "../components/Pages/ProjectDetail/ConceptPlanContents";
import { ProjectPlanContents } from "../components/Pages/ProjectDetail/ProjectPlanContents";
import { ProgressReportContents } from "../components/Pages/ProjectDetail/ProgressReportContents";
import { IExtendedProjectDetails, IFullProjectDetails, IProgressReport, IProjectAreas, IProjectData, IProjectDocuments, IProjectMember, IStudentReport } from "../types";
import { ManageTeam } from "../components/Pages/ProjectDetail/ManageTeam";
import { useProject } from "../lib/hooks/useProject";
import { useEffect, useState } from "react";
import { ProjectClosureContents } from "../components/Pages/ProjectDetail/ProjectClosureContents";
import { StudentReportContents } from "../components/Pages/ProjectDetail/StudentReportContents";
import { Head } from "../components/Base/Head";
import { DocumentActions } from "../components/Pages/ProjectDetail/DocumentActions";
import useDistilledProjectTitle from "../lib/hooks/useDistlledProjectTitle";
import { useUser } from "../lib/hooks/useUser";
import { motion } from "framer-motion";
// import { ProgressReportSelector } from "../components/Pages/ProjectDetail/ProgressReportSelector";

export const ProjectDetail = ({ selectedTab }: { selectedTab: string }): React.ReactNode => {

    const { projectPk } = useParams();
    const { isLoading, projectData, refetch } = useProject(projectPk);

    const [location, setLocation] = useState<IProjectAreas | null>();
    const [baseInformation, setBaseInformation] = useState<IProjectData | null>();
    const [details, setDetails] = useState<IExtendedProjectDetails | null>();
    const [documents, setDocuments] = useState<IProjectDocuments | null>();
    const [members, setMembers] = useState<IProjectMember[]>([]);
    const [distilledTitle, setDistilledTitle] = useState<string>();

    useEffect(() => {
        // console.log(projectData)
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
    //     console.log(distilledTitle)

    // }, [distilledTitle])

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

    const setToLastTab = (tabToGoTo?: number) => {
        if (tabToGoTo) {
            if (tabToGoTo === -1) {
                console.log("HEEEEEEEEEEEEEEEEEEEEEEEEEEEE")
                setActiveTabIndex(tabs.length)
            } else if (tabToGoTo === 0) {
                console.log("Theses are the tabs mate", tabs)
                console.log("This is the index of the previous tab, mate", tabs.length - 1)
                setActiveTabIndex(tabs.length - 1)
            }
        }
        else {
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

        }
    };

    useEffect(() => {
        const count = (
            documents?.student_reports?.length >= 1 ? 1 : 0) +
            (documents?.progress_reports?.length >= 1 ? 1 : 0) +
            (documents?.concept_plan ? 1 : 0) +
            (documents?.project_closure ? 1 : 0) +
            (documents?.project_plan ? 1 : 0) + 1 // plus overview
        // console.log('count: ', count)

        const tabData = [
            'overview',
            documents?.concept_plan && 'concept',
            documents?.project_plan && 'project',
            documents?.progress_reports && documents.progress_reports.length > 0 && 'progress',
            documents?.student_reports && documents.student_reports.length > 0 && 'student',
            documents?.project_closure && 'closure'
        ].filter(Boolean)
        const tabDataLength = tabData.length;
        // console.log('len of tabdata: ', tabDataLength)

        if (tabs.length !== count) {
            // console.log("Length different, updating")
            setTabs(tabData)
        }
        else {
            // console.log('Tabs: ', tabs)
        }
    }, [documents?.concept_plan, documents?.progress_reports, documents?.student_reports, documents?.progress_reports?.length, documents?.student_reports?.length, documents?.project_plan, documents?.project_closure, tabs])


    // useEffect(() => {
    //     console.log('Tabs:', tabs);
    // }, [tabs])

    useEffect(() => {
        if (isInitialRender) {
            // if (documents) {
            setIsInitialRender(false);
            // }
        } else {
            if (selectedTab && selectedTab !== "overview") {
                console.log('there is a selected tab: ', selectedTab)
                if (selectedTabSet === false) {
                    console.log('and it hasnt been set')
                    setToSelectedTab();
                    setSelectedTabSet(true);
                }
            } else {
                // const tabData = [
                //     'overview',
                //     documents?.concept_plan && 'concept',
                //     documents?.project_plan && 'project',
                //     documents?.progress_reports && documents.progress_reports.length > 0 && 'progress',
                //     documents?.student_reports && documents.student_reports.length > 0 && 'student',
                //     documents?.project_closure && 'closure'
                // ].filter(Boolean)
                // if (tabData.length !== tabs.length) {
                //     console.log("Len:", tabs.length, tabs)
                //     setTabs(tabData)
                // }
            }
        }
    }, [tabs, isInitialRender, selectedTab, selectedTabSet]);

    // useEffect(() => {

    //     if (isInitialRender) {
    //         if (documents) {
    //             const tabData = [
    //                 'overview',
    //                 documents?.concept_plan && 'concept',
    //                 documents?.project_plan && 'project',
    //                 documents?.progress_reports && documents.progress_reports.length > 0 && 'progress',
    //                 documents?.student_reports && documents.student_reports.length > 0 && 'student',
    //                 documents?.project_closure && 'closure'
    //             ].filter(Boolean)
    //             setTabs(tabData)
    //             setIsInitialRender(false);

    //         }
    //         // if (tabs.length >= 1) {
    //         // }
    //     } else {
    //         if (selectedTab) {
    //             console.log('there is a selected tab')
    //             if (selectedTabSet === false) {
    //                 console.log('and it hasnt been set')
    //                 setToSelectedTab();
    //                 setSelectedTabSet(true);
    //             }
    //         } else {
    //             // if the tab has been set already
    //             const tabData = [
    //                 'overview',
    //                 documents?.concept_plan && 'concept',
    //                 documents?.project_plan && 'project',
    //                 documents?.progress_reports && documents.progress_reports.length > 0 && 'progress',
    //                 documents?.student_reports && documents.student_reports.length > 0 && 'student',
    //                 documents?.project_closure && 'closure'
    //             ].filter(Boolean)
    //             if (tabData.length !== tabs.length) {
    //                 console.log("Len:", tabs.length, tabs)

    //                 setTabs(tabData)
    //             }
    //         }

    //     }
    // }, [documents, tabs, isInitialRender, selectedTab, selectedTabSet])

    return (
        <div key={
            (documents?.progress_reports?.length || 0) +
            (documents?.student_reports?.length || 0) +
            (documents?.concept_plan ? 1 : 0) +
            (documents?.project_plan ? 1 : 0) +
            (documents?.progress_reports?.length || 0)
        }
        >
            {(isLoading || !documents || !distilledTitle) ? <Center>
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
                                                <motion.div
                                                    initial={{ y: -10, opacity: 0 }}
                                                    animate={{ y: 0, opacity: 1 }}
                                                    exit={{ y: 10, opacity: 0 }}
                                                    transition={{
                                                        duration: 0.7, delay: ((
                                                            (1) / 7))
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
                                                        project_id={projectPk !== undefined ? Number(projectPk) : 0}
                                                    />

                                                    {/* <DocumentActions
                                            tabType="overview"
                                            documents={documents}
                                            projectData={projectData}
                                        /> */}
                                                </motion.div>
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
                                            projectAreas={location}

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
                )}
        </div>



    )
}
