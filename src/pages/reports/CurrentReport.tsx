// Route for handling information regarding the report for the year.

// import { AnnualReportPrintPreview } from "@/shared/components/Pages/CurrentReport/AnnualReportPrintPreview";
import { Head } from "@/shared/components/Base/Head";
import { PDFViewer } from "@/shared/components/HTMLPDFs/PDFViewer";
import { AnnualReportDetails } from "@/shared/components/Pages/CurrentReport/AnnualReportDetails";
import { AnnualReportMedia } from "@/shared/components/Pages/CurrentReport/AnnualReportMedia";
import { LatestReportsNotYetApproved } from "@/shared/components/Pages/CurrentReport/LatestReportsNotYetApproved";
import { ParticipatingProjectReports } from "@/shared/components/Pages/CurrentReport/ParticipatingProjectReports";
import { useEditorContext } from "@/shared/hooks/helper/EditorBlockerContext";
import { getLatestReportingYear } from "@/shared/lib/api";
import type { IReport } from "@/shared/types/index.d";
import {
  Box,
  Center,
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
// import { CeleryTest } from "@/shared/components/HTMLPDFs/CeleryTest";

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
  const { manuallyCheckAndToggleDialog } = useEditorContext();

  const [activeTabIndex, setActiveTabIndex] = useState<number>(0);
  const tabs = ["details", "media", "pending", "approved", "preview"];

  return isLoading ? (
    <Center mt={4}>
      <Spinner size={"lg"} />
    </Center>
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
          <Tabs
            isLazy
            isFitted
            variant={"enclosed"}
            onChange={(index) => {
              manuallyCheckAndToggleDialog(() => {
                // console.log("changed");
                setActiveTabIndex(index);
              });
            }}
            defaultIndex={activeTabIndex}
            index={activeTabIndex}
          >
            <TabList>
              <Tab
                value="details"
                onClick={() => {
                  setActiveTabIndex(tabs.indexOf("details"));
                }}
              >
                Details
              </Tab>
              <Tab
                value="media"
                onClick={() => {
                  setActiveTabIndex(tabs.indexOf("media"));
                }}
              >
                Media
              </Tab>
              <Tab
                value="pending"
                onClick={() => {
                  setActiveTabIndex(tabs.indexOf("pending"));
                }}
              >
                Pending Reports
              </Tab>
              <Tab
                value="approved"
                onClick={() => {
                  setActiveTabIndex(tabs.indexOf("approved"));
                }}
              >
                Approved Progress Reports
              </Tab>
              <Tab
                value="preview"
                onClick={() => {
                  setActiveTabIndex(tabs.indexOf("preview"));
                }}
              >
                Print Preview
              </Tab>
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
