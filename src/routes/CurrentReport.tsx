// Route for handling information regarding the report for the year.

// import { AnnualReportPrintPreview } from "@/components/Pages/CurrentReport/AnnualReportPrintPreview";
import { LatestReportsNotYetApproved } from "@/components/Pages/CurrentReport/LatestReportsNotYetApproved";
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
import { useEffect, useState } from "react";
import { Head } from "../components/Base/Head";
import { AnnualReportDetails } from "../components/Pages/CurrentReport/AnnualReportDetails";
import { AnnualReportMedia } from "../components/Pages/CurrentReport/AnnualReportMedia";
import { ParticipatingProjectReports } from "../components/Pages/CurrentReport/ParticipatingProjectReports";
import { getLatestReportingYear } from "../lib/api";
import { IReport } from "../types";
import { PDFViewer } from "@/components/HTMLPDFs/PDFViewer";
// import { CeleryTest } from "@/components/HTMLPDFs/CeleryTest";

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
          <Text flex={1} fontSize={"2xl"} fontWeight={"bold"} pb={6}>
            Annual Report ({financialYearString}){" "}
          </Text>
        </Flex>

        {thisReport !== null && thisReport !== undefined && (
          <Tabs isLazy isFitted variant={"enclosed"}>
            <TabList>
              <Tab>Details</Tab>
              <Tab>Media</Tab>
              <Tab>Pending Reports</Tab>
              <Tab>Approved Progress Reports</Tab>
              <Tab>Print Preview</Tab>
              {/* <Tab>Test</Tab> */}
            </TabList>
            <TabPanels>
              <TabPanel>
                <AnnualReportDetails />
              </TabPanel>
              <TabPanel>
                <AnnualReportMedia
                  reportId={thisReport?.pk ? thisReport.pk : thisReport?.id}
                />
              </TabPanel>

              <TabPanel>
                <LatestReportsNotYetApproved />
              </TabPanel>

              <TabPanel>
                <ParticipatingProjectReports />
              </TabPanel>

              <TabPanel>
                <PDFViewer thisReport={thisReport} />
                {/* <AnnualReportPrintPreview thisReport={thisReport} /> */}
              </TabPanel>
              {/* <TabPanel>
                <CeleryTest />
              </TabPanel> */}
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
