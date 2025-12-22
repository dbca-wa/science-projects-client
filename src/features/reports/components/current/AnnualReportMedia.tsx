// Section to handle the current report's media files such as images for each section, sds chart etc.

import { useGetLatestReportMedia } from "@/features/reports/hooks/useGetLatestReportMedia";
import { Loader2 } from "lucide-react";
import { ReportMediaChanger } from "@/features/admin/components/ReportMediaChanger";
// import { useEffect } from "react";

interface Props {
  reportId?: number;
}

export const AnnualReportMedia = ({ reportId }: Props) => {
  const { reportMediaData, refetchMedia } = useGetLatestReportMedia();
  // useEffect(() => {
  //   console.log(reportMediaData);
  //   console.log(reportId);
  // });

  return (
    <div>
      {!reportMediaData ? (
        <div className="flex justify-center">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      ) : (
        <div className="mx-6 mt-4 grid gap-8 grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
          {/* <ReportMediaChanger
                  reportMediaData={reportMediaData}
                  section={"cover"}
                  reportPk={pk}
                  refetchData={refetchMedia}
                /> */}

          <ReportMediaChanger
            reportMediaData={reportMediaData}
            section={"dbca_banner"}
            reportPk={
              reportMediaData[0]?.report?.id
                ? reportMediaData[0]?.report?.id
                : reportId
            }
            refetchData={refetchMedia}
          />

          <ReportMediaChanger
            reportMediaData={reportMediaData}
            section={"dbca_banner_cropped"}
            reportPk={
              reportMediaData[0]?.report?.id
                ? reportMediaData[0]?.report?.id
                : reportId
            }
            refetchData={refetchMedia}
          />

          <ReportMediaChanger
            reportMediaData={reportMediaData}
            section={"sdchart"}
            reportPk={
              reportMediaData[0]?.report?.id
                ? reportMediaData[0]?.report?.id
                : reportId
            }
            refetchData={refetchMedia}
          />

          <ReportMediaChanger
            reportMediaData={reportMediaData}
            section={"service_delivery"}
            reportPk={
              reportMediaData[0]?.report?.id
                ? reportMediaData[0]?.report?.id
                : reportId
            }
            refetchData={refetchMedia}
          />

          <ReportMediaChanger
            reportMediaData={reportMediaData}
            section={"research"}
            reportPk={
              reportMediaData[0]?.report?.id
                ? reportMediaData[0]?.report?.id
                : reportId
            }
            refetchData={refetchMedia}
          />

          <ReportMediaChanger
            reportMediaData={reportMediaData}
            section={"partnerships"}
            reportPk={
              reportMediaData[0]?.report?.id
                ? reportMediaData[0]?.report?.id
                : reportId
            }
            refetchData={refetchMedia}
          />

          <ReportMediaChanger
            reportMediaData={reportMediaData}
            section={"collaborations"}
            reportPk={
              reportMediaData[0]?.report?.id
                ? reportMediaData[0]?.report?.id
                : reportId
            }
            refetchData={refetchMedia}
          />

          <ReportMediaChanger
            reportMediaData={reportMediaData}
            section={"student_projects"}
            reportPk={
              reportMediaData[0]?.report?.id
                ? reportMediaData[0]?.report?.id
                : reportId
            }
            refetchData={refetchMedia}
          />

          <ReportMediaChanger
            reportMediaData={reportMediaData}
            section={"publications"}
            reportPk={
              reportMediaData[0]?.report?.id
                ? reportMediaData[0]?.report?.id
                : reportId
            }
            refetchData={refetchMedia}
          />

          {/* <ReportMediaChanger
                  reportMediaData={reportMediaData}
                  section={"rear_cover"}
                  reportPk={pk}
                  refetchData={refetchMedia}
                /> */}
        </div>
      )}
    </div>
  );
};
