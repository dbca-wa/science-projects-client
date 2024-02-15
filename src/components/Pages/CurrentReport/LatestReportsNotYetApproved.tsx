// WIP tab contents for participating projects. Features some additional info and the projects via AnnualReportProjectDisplay

import { useLatestYearsUnapprovedReports } from "@/lib/hooks/useLatestReportsUnapproved";
import { Box, Center, Spinner, Text } from "@chakra-ui/react";
import { useEffect } from "react";

export const LatestReportsNotYetApproved = () => {
  const { unapprovedData, unapprovedLoading } =
    useLatestYearsUnapprovedReports();

  useEffect(() => {
    if (!unapprovedLoading) {
      console.log(unapprovedData);
    }
  }, [unapprovedLoading, unapprovedData]);

  return (
    <Box>
      {unapprovedLoading ? (
        <Center>
          <Spinner />
        </Center>
      ) : (
        <Box>
          {unapprovedData &&
            unapprovedData["student_reports"]?.map((sr, index) => {
              return (
                <Box key={`student${index}`}>
                  <Text>
                    {index}. {sr?.progress_report}
                  </Text>
                </Box>
              );
            })}
          {unapprovedData &&
            unapprovedData["progress_reports"]?.map((pr, index) => {
              return (
                <Box key={`progress${index}`}>
                  <Text>
                    {index}. {pr?.progress}
                  </Text>
                </Box>
              );
            })}

          {unapprovedData["progress_reports"]?.length === 0 &&
            unapprovedData["student_reports"]?.length === 0 && (
              <Center mt={10}>
                <Text fontWeight={"bold"} fontSize={"xl"}>
                  All reports for this year have been approved
                </Text>
              </Center>
            )}
        </Box>
      )}
    </Box>
  );
};
