// Section to view the participating Student Reports in the upcoming Annual Report

import { useLatestYearsActiveStudentProjects } from "@/lib/hooks/useLatestYearsActiveStudentProjects";
import { Box, Center, Spinner, Text } from "@chakra-ui/react";
import { useEffect } from "react";
import { StudentReportDisplay } from "./StudentReportDisplay";

export const ParticipatingStudentReports = () => {
  const { latestStudentReportsData, latestStudentReportsLoading } =
    useLatestYearsActiveStudentProjects();
  useEffect(() => {
    if (!latestStudentReportsLoading) {
      console.log(latestStudentReportsData);
    }
  }, [latestStudentReportsLoading, latestStudentReportsData]);
  return (
    <Box>
      <Center my={4}>
        <Text fontSize={"2xl"} fontWeight={"bold"}>
          Approved Student Reports
        </Text>
      </Center>
      {latestStudentReportsLoading ? (
        <Center>
          <Spinner />
        </Center>
      ) : (
        <Center flexDir={"column"}>
          {latestStudentReportsData?.map((report, index) => {
            return (
              <Box key={index} mb={8}>
                <StudentReportDisplay
                  document={report?.document}
                  pk={report?.pk}
                  year={report?.year}
                  progress_report={report?.progress_report}
                  project={report?.project}
                  report={report?.report}
                  shouldAlternatePicture={index % 2 === 0}
                />
              </Box>
            );
          })}
        </Center>
      )}
    </Box>
  );
};
