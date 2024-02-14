// WIP display section of the current annual report which maps over which projects will be participating in the report.

import { ProgressReportDisplayEditor } from "@/components/RichTextEditor/Editors/ProgressReportDisplayEditor";
import { IProgressReport, IProjectData, IReport } from "@/types";
import { Center } from "@chakra-ui/react";

interface Props {
  document: IProgressReport;
  pk: number;
  progress_report: string;
  project: IProjectData;
  report: IReport;
  year: number;
  shouldAlternatePicture: boolean;
}

export const ProgressReportDisplay = ({
  document,
  pk,
  year,
  progress_report,
  project,
  report,
  shouldAlternatePicture,
}: Props) => {
  return (
    <Center>
      <ProgressReportDisplayEditor
        shouldAlternatePicture={shouldAlternatePicture}
        canEdit={false}
        progressData={progress_report}
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
      />
    </Center>
  );
};
