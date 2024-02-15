// Route for handling information regarding the report for the year.

import {
  Box,
  Flex,
  Grid,
  Spinner,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
} from "@chakra-ui/react";
import { DownloadReportPDFButton } from "../components/Pages/Reports/DownloadReportPDFButton";
import { IReport } from "../types";
import { Head } from "../components/Base/Head";
import { getLatestReportingYear } from "../lib/api";
import { useEffect, useState } from "react";
import { ParticipatingProjectReports } from "../components/Pages/CurrentReport/ParticipatingProjectReports";
import { ParticipatingStudentReports } from "../components/Pages/CurrentReport/ParticipatingStudentReports";
import { AnnualReportDetails } from "../components/Pages/CurrentReport/AnnualReportDetails";
import { AnnualReportMedia } from "../components/Pages/CurrentReport/AnnualReportMedia";
import { LatestReportsNotYetApproved } from "@/components/Pages/CurrentReport/LatestReportsNotYetApproved";

export const CurrentReport = () => {
  const [latestYear, setLatestYear] = useState<number | null>(null);
  const [yearBefore, setYearBefore] = useState<number | null>(null);
  const [thisReport, setThisReport] = useState<IReport | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const getAPIData = async () => {
      const lastReportData = await getLatestReportingYear();
      setThisReport(lastReportData);
      return lastReportData.year;
    };

    const fetchData = async () => {
      const year = await getAPIData();
      setLatestYear(year);
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (latestYear !== null) {
      setYearBefore(latestYear - 1);
    }
  }, [latestYear]);

  useEffect(() => {
    if (yearBefore !== null || latestYear !== null) {
      setIsLoading(false);
    }
  }, [yearBefore, latestYear]);

  const formattedLatestYear = latestYear?.toString().substring(2);
  const formattedYearBefore = yearBefore?.toString().substring(2);
  const financialYearString = `FY ${formattedYearBefore}-${formattedLatestYear}`;

  return isLoading ? (
    <Spinner />
  ) : (
    <>
      <Box>
        <Head title={financialYearString} />
        <Flex>
          <Text flex={1} fontSize={"2xl"} fontWeight={"bold"}>
            Annual Report ({financialYearString}){" "}
          </Text>

          <Flex justifyContent={"flex-end"} pb={6}>
            <DownloadReportPDFButton />
          </Flex>
        </Flex>

        {thisReport !== null && thisReport !== undefined && (
          <Tabs>
            <TabList>
              <Tab>Details</Tab>
              <Tab>Media</Tab>
              <Tab>Print Preview</Tab>
              <Tab>Approved Progress Reports</Tab>
              <Tab>Approved Student Reports</Tab>
              <Tab>Unapproved Reports</Tab>
            </TabList>
            <TabPanels>
              <TabPanel>
                <AnnualReportDetails />
              </TabPanel>
              <TabPanel>
                <AnnualReportMedia />
              </TabPanel>
              <TabPanel>
                <Box>Print Preview</Box>
              </TabPanel>
              <TabPanel>
                <ParticipatingProjectReports
                  dateOpen={thisReport?.date_open}
                  dateClosed={thisReport?.date_closed}
                />
              </TabPanel>
              <TabPanel>
                <ParticipatingStudentReports />
              </TabPanel>
              <TabPanel>
                <LatestReportsNotYetApproved />
              </TabPanel>
            </TabPanels>
          </Tabs>
        )}
      </Box>
    </>
  );
};

<Grid gridGap={8} textAlign={"center"}>
  <Text fontWeight={"bold"} fontSize={"2xl"}>
    Participating Business Areas
  </Text>
  <Text fontWeight={"bold"} fontSize={"xl"}>
    Presents a preview of report for current year based on projects in year
  </Text>

  <Text fontWeight={"bold"} fontSize={"2xl"}>
    Participating Business Areas
  </Text>
</Grid>;
