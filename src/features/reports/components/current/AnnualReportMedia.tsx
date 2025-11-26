// Section to handle the current report's media files such as images for each section, sds chart etc.

import { useGetLatestReportMedia } from "@/features/reports/hooks/useGetLatestReportMedia";
import { Box, Center, Grid, Spinner } from "@chakra-ui/react";
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
    <Box>
      {!reportMediaData ? (
        <Center>
          <Spinner />
        </Center>
      ) : (
        <Grid
          // h={"100%"}
          gridTemplateColumns={{
            base: "repeat(1, 1fr)",
            lg: "repeat(2, 1fr)",
            xl: "repeat(3, 1fr)",
          }}
          mt={4}
          gap={8}
          mx={6}
        >
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
        </Grid>
      )}
    </Box>
  );
};
