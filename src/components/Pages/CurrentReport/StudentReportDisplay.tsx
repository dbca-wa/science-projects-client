import { StudentProgressReportDisplayEditor } from "@/components/RichTextEditor/Editors/StudentProgressReportDisplayEditor";
import { IProjectData, IReport, IStudentReport } from "@/types";
import { Box } from "@chakra-ui/react";

interface Props {
  document: IStudentReport;
  pk: number;
  progress_report: string;
  project: IProjectData;
  report: IReport;
  year: number;
  shouldAlternatePicture: boolean;
}

export const StudentReportDisplay = ({
  document,
  pk,
  year,
  progress_report,
  project,
  report,
  shouldAlternatePicture,
}: Props) => {
  return (
    <Box>
      <StudentProgressReportDisplayEditor
        canEdit={false}
        data={progress_report}
        section={"progress_report"}
        editorType={"ProjectDocument"}
        isUpdate={true}
        writeable_document_kind="Student Report"
        writeable_document_pk={report?.pk}
        project={project}
        year={year}
        pk={pk}
        document={document}
        progress_report={progress_report}
        report={report}
        reportKind="student"
        shouldAlternatePicture={shouldAlternatePicture}
      />
    </Box>
  );
};
