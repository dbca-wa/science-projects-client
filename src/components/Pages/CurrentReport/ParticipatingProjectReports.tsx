// WIP tab contents for participating projects. Features some additional info and the projects via AnnualReportProjectDisplay

import { useLatestYearsActiveProgressReports } from "@/lib/hooks/useLatestYearsActiveProgressReports";
import { Box, Center, Spinner, Text } from "@chakra-ui/react";
import { useEffect } from "react";
import { ProgressReportDisplay } from "./ProgressReportDisplay";

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
        latestProgressReportsData?.map((report, index) => {
          return (
            <Box key={index}>
              <ProgressReportDisplay
                shouldAlternatePicture={index % 2 === 0}
                document={report?.document}
                pk={report?.pk}
                year={report?.year}
                progress_report={report?.progress}
                project={report?.project}
                report={report?.report}
              />
            </Box>
          );
        })
      )}
    </Box>
  );
};
