// WIP tab contents for participating projects. Features some additional info and the projects via AnnualReportProjectDisplay

import { ARProgressReportHandler } from "@/components/RichTextEditor/Editors/ARProgressReportHandler";
import { useLatestYearsActiveProgressReports } from "@/lib/hooks/useLatestYearsActiveProgressReports";
import { useUser } from "@/lib/hooks/useUser";
import { Box, Center, Spinner, Text } from "@chakra-ui/react";
import { useEffect } from "react";

interface IParticipatingProjectProps {
  dateOpen: Date | null;
  dateClosed: Date | null;
}

export const ParticipatingProjectReports = ({
  dateOpen,
  dateClosed,
}: IParticipatingProjectProps) => {
  useEffect(() => {
    // Additional logic can be added here if needed
  }, [dateOpen, dateClosed]);

  const { latestProgressReportsData, latestProgressReportsLoading } =
    useLatestYearsActiveProgressReports();

  useEffect(() => {
    if (!latestProgressReportsLoading) {
      console.log(latestProgressReportsData);
    }
  }, [latestProgressReportsLoading, latestProgressReportsData]);

  const { userData, userLoading } = useUser();

  return (
    <Box>
      <Center my={4}>
        <Text fontSize={"2xl"} fontWeight={"bold"}>
          Approved Progress Reports
        </Text>
      </Center>
      {latestProgressReportsLoading ? (
        <Center>
          <Spinner />
        </Center>
      ) : (
        <Center>
          {!userLoading &&
            latestProgressReportsData?.map((report, index) => {
              return (
                <Box key={index}>
                  <>
                    <ARProgressReportHandler
                      canEdit={
                        userData?.is_superuser ||
                        userData?.business_area?.name === "Directorate"
                      }
                      project={report?.project}
                      document={report?.document}
                      report={report}
                      reportKind={
                        report?.progress_report ? "student" : "ordinary"
                      }
                      shouldAlternatePicture={index % 2 === 0}
                    />
                  </>
                </Box>
              );
            })}
        </Center>
      )}
    </Box>
  );
};
