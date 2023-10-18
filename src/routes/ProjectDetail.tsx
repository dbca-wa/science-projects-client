// Route for displaying the Project Details of a given project.

import { useParams } from "react-router-dom"
import { Tab, TabList, TabPanel, TabPanels, Tabs, useColorMode, Spinner, Select, FormControl, FormHelperText, FormLabel, Box, Text, Flex } from "@chakra-ui/react";
import { ProjectOverviewCard } from "../components/Pages/ProjectDetail/ProjectOverviewCard";
import { ConceptPlanContents } from "../components/Pages/ProjectDetail/ConceptPlanContents";
import { ProjectPlanContents } from "../components/Pages/ProjectDetail/ProjectPlanContents";
import { ProgressReportContents } from "../components/Pages/ProjectDetail/ProgressReportContents";
import { IFullProjectDetails, IProgressReport, IProjectData, IProjectDocuments, IProjectMember, IStudentReport } from "../types";
import { ManageTeam } from "../components/Pages/ProjectDetail/ManageTeam";
import { useProject } from "../lib/hooks/useProject";
import { useEffect, useState } from "react";
import { ProjectClosureContents } from "../components/Pages/ProjectDetail/ProjectClosureContents";
import { StudentReportContents } from "../components/Pages/ProjectDetail/StudentReportContents";
import { Head } from "../components/Base/Head";
import { DocumentActions } from "../components/Pages/ProjectDetail/DocumentActions";
// import { ProgressReportSelector } from "../components/Pages/ProjectDetail/ProgressReportSelector";

export const ProjectDetail = () => {

    const { projectPk } = useParams();
    const { isLoading, projectData, refetch } = useProject(projectPk);

    const [baseInformation, setBaseInformation] = useState<IProjectData | null>();
    const [details, setDetails] = useState<IFullProjectDetails | null>();
    const [documents, setDocuments] = useState<IProjectDocuments | null>();
    const [members, setMembers] = useState<IProjectMember[]>([]);

    useEffect(() => {
        if (!isLoading && projectData) {
            setBaseInformation(projectData.project);
            setDetails(projectData.details);
            setDocuments(projectData.documents);
            setMembers(projectData.members);
        }
    }, [isLoading, projectData])


    // Refetch data on tab change
    const [tabIndex, setTabIndex] = useState(0)

    useEffect(() => {
        refetch();
    }, [tabIndex])


    return (
        <>
            <Head title={projectData?.project?.title} />
            <Tabs
                isLazy
                isFitted
                variant={'enclosed'}
                onChange={(index) => setTabIndex(index)}
            >
                <TabList mb='1em'>
                    <Tab
                        fontSize="sm"
                    >Overview</Tab>
                    {documents?.concept_plan && (
                        <Tab fontSize="sm"
                        >Concept Plan</Tab>
                    )}
                    {documents?.project_plan && (
                        <Tab fontSize="sm"
                        >Project Plan</Tab>

                    )}
                    {documents?.progress_reports && documents.progress_reports.length !== 0 && (
                        <Tab fontSize="sm"
                        >
                            Progress Reports
                        </Tab>

                    )}
                    {documents?.student_reports && documents.student_reports.length !== 0 && (
                        <Tab fontSize="sm"
                        >
                            Student Reports
                        </Tab>

                    )}
                    {documents?.project_closure && (
                        <Tab fontSize="sm"
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
                                            baseInformation={baseInformation}
                                            details={details}
                                            members={members}
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
                                    document={documents.concept_plan}
                                    projectPk={Number(projectPk)}
                                />
                            </TabPanel>
                        )
                    }


                    {/* PROJECT PLAN */}
                    {documents?.project_plan && (
                        <TabPanel>
                            <ProjectPlanContents document={documents.project_plan} />
                        </TabPanel>
                    )}


                    {/* PROGRESS REPORT */}
                    {
                        documents?.progress_reports && documents.progress_reports.length !== 0 && (
                            <TabPanel>
                                <ProgressReportContents
                                    documents={documents.progress_reports}
                                    refetch={refetch}
                                />
                            </TabPanel>
                        )
                    }

                    {/* STUDENT REPORT */}
                    {
                        documents?.student_reports && documents.student_reports.length !== 0 && (
                            <TabPanel>
                                <StudentReportContents
                                    documents={documents.student_reports}
                                //  selectedYear={selectedStudentReportYear}
                                />
                            </TabPanel>
                        )
                    }


                    {/* PROJECT CLOSURE */}
                    {
                        documents?.project_closure && (
                            <TabPanel>
                                <ProjectClosureContents document={documents.project_closure} />
                            </TabPanel>
                        )
                    }
                </TabPanels>
            </Tabs>
        </>
    )
}


