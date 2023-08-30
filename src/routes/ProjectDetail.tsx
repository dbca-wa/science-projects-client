// Route for displaying the Project Details of a given project.

import { useParams } from "react-router-dom"
import { Tab, TabList, TabPanel, TabPanels, Tabs, useColorMode, Spinner, Select } from "@chakra-ui/react";
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

export const ProjectDetail = () => {

    const { projectPk } = useParams();
    const { isLoading, projectData } = useProject(projectPk);

    const [baseInformation, setBaseInformation] = useState<IProjectData | null>();
    const [details, setDetails] = useState<IFullProjectDetails | null>();
    const [documents, setDocuments] = useState<IProjectDocuments | null>();
    const [members, setMembers] = useState<IProjectMember[]>([]);


    const [selectedProgressReportYear, setSelectedProgressReportYear] = useState(0);
    const [selectedStudentReportYear, setSelectedStudentReportYear] = useState(0);

    // Update the selected progress report year
    const handleProgressReportYearSelect = (year: number) => {
        setSelectedProgressReportYear(year);
    };

    // Update the selected student report year
    const handleStudentReportYearSelect = (year: number) => {
        setSelectedStudentReportYear(year);
    };



    useEffect(() => {
        if (!isLoading && projectData) {
            setBaseInformation(projectData.project);
            setDetails(projectData.details);
            setDocuments(projectData.documents);
            setMembers(projectData.members);
        }
    }, [isLoading, projectData])

    const { colorMode } = useColorMode();

    console.log(
        documents
    )

    return (
        <>
            <Head title={projectData?.project?.title} />
            <Tabs
                isFitted
                variant={'enclosed'}
            >
                <TabList mb='1em'>
                    <Tab fontSize="sm">Overview</Tab>
                    {documents?.concept_plan && (
                        <Tab fontSize="sm">Concept Plan</Tab>
                    )}
                    {documents?.project_plan && (
                        <Tab fontSize="sm">Project Plan</Tab>

                    )}
                    {documents?.progress_reports && documents.progress_reports.length !== 0 && (
                        <Tab fontSize="sm">
                            Progress Reports
                            <ProgressReportsTab documents={documents.progress_reports} onYearSelect={handleProgressReportYearSelect} />
                        </Tab>

                    )}
                    {documents?.student_reports && documents.student_reports.length !== 0 && (
                        <Tab fontSize="sm">Student Reports
                            <StudentReportsTab documents={documents.student_reports} onYearSelect={handleStudentReportYearSelect} />

                        </Tab>

                    )}
                    {documents?.project_closure && (
                        <Tab fontSize="sm">Progress Closure</Tab>

                    )}
                </TabList>
                <TabPanels>

                    {/* OVERVIEW */}
                    <TabPanel>
                        {
                            baseInformation ?
                                (
                                    <>
                                        <DocumentActions
                                            tabType="overview"
                                            documents={documents}
                                            projectData={projectData}
                                        />


                                        <ProjectOverviewCard
                                            baseInformation={baseInformation}
                                            details={details}
                                            members={members}
                                        />

                                        {/* <ManageTeam /> */}
                                        <ManageTeam team={members} />
                                    </>
                                ) :
                                <Spinner />
                        }
                    </TabPanel>


                    {/* CONCEPT PLAN */}
                    {
                        documents?.concept_plan && (
                            <TabPanel>
                                <DocumentActions tabType="concept" documents={documents}
                                    projectData={projectData}
                                />
                                <ConceptPlanContents document={documents.concept_plan} />
                            </TabPanel>
                        )
                    }


                    {/* PROJECT PLAN */}
                    {documents?.project_plan && (
                        <TabPanel>
                            <DocumentActions tabType="projectplan" documents={documents}
                                projectData={projectData}
                            />
                            <ProjectPlanContents document={documents.project_plan} />
                        </TabPanel>
                    )}


                    {/* PROGRESS REPORT */}
                    {
                        documents?.progress_reports && documents.progress_reports.length !== 0 && (
                            <TabPanel>
                                <DocumentActions tabType="progress" documents={documents}
                                    projectData={projectData}
                                />
                                <ProgressReportContents documents={documents.progress_reports} selectedYear={selectedProgressReportYear} />
                            </TabPanel>
                        )
                    }

                    {/* STUDENT REPORT */}
                    {
                        documents?.student_reports && documents.student_reports.length !== 0 && (
                            <TabPanel>
                                <DocumentActions tabType="student" documents={documents}
                                    projectData={projectData}
                                />
                                <StudentReportContents documents={documents.student_reports} selectedYear={selectedStudentReportYear} />
                            </TabPanel>
                        )
                    }


                    {/* PROJECT CLOSURE */}
                    {
                        documents?.project_closure && (
                            <TabPanel>
                                <DocumentActions tabType="closure" documents={documents}
                                    projectData={projectData}
                                />
                                <ProjectClosureContents document={documents.project_closure} />
                            </TabPanel>
                        )
                    }
                </TabPanels>
            </Tabs>
        </>
    )
}


interface ProgressReportsTabProps {
    documents: IProgressReport[];
    onYearSelect: (year: number) => void;
}


const ProgressReportsTab: React.FC<ProgressReportsTabProps> = ({ documents, onYearSelect }) => {
    const years = Array.from(new Set(documents.map(report => report.year))).sort((a, b) => b - a);

    const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedYear = parseInt(event.target.value, 10);
        onYearSelect(selectedYear);
    };

    // If there are no reports, do not render the dropdown
    if (years.length === 0) {
        return null;
    }

    // Set the default selected year to the latest year
    const defaultSelectedYear = years[0];

    return (
        <>
            <Select value={defaultSelectedYear} onChange={handleChange}>
                <option value="" disabled>
                    Select a year
                </option>
                {years.map(year => (
                    <option key={year} value={year}>
                        {year}
                    </option>
                ))}
            </Select>
        </>
    );
};

// Similar component for Student Reports Tab
interface StudentReportsTabProps {
    documents: IStudentReport[];
    onYearSelect: (year: number) => void;
}

const StudentReportsTab: React.FC<StudentReportsTabProps> = ({ documents, onYearSelect }) => {
    const years = Array.from(new Set(documents.map(report => report.year))).sort((a, b) => b - a);

    const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedYear = parseInt(event.target.value, 10);
        onYearSelect(selectedYear);
    };

    // If there are no reports, do not render the dropdown
    if (years.length === 0) {
        return null;
    }

    // Set the default selected year to the latest year
    const defaultSelectedYear = years[0];

    return (
        <>
            <Select value={defaultSelectedYear} onChange={handleChange}>
                <option value="" disabled>
                    Select a year
                </option>
                {years.map(year => (
                    <option key={year} value={year}>
                        {year}
                    </option>
                ))}
            </Select>
        </>
    );
};
