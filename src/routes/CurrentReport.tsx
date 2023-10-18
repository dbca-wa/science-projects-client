// Route for handling information regarding the report for the year.

import { Box, Flex, Grid, Spinner, Tab, TabList, TabPanel, TabPanels, Tabs, Text } from "@chakra-ui/react"
import { DownloadReportPDFButton } from "../components/Pages/Reports/DownloadReportPDFButton"
import { IReport } from "../types"
import { Head } from "../components/Base/Head"
import { getLatestReportingYear } from "../lib/api"
import { useEffect, useState } from "react"
import { ParticipatingProjects } from "../components/Pages/CurrentReport/ParticipatingProjects"
import { ParticipatingStudentReports } from "../components/Pages/CurrentReport/ParticipatingStudentReports"
import { AnnualReportDetails } from "../components/Pages/CurrentReport/AnnualReportDetails"
import { AnnualReportMedia } from "../components/Pages/CurrentReport/AnnualReportMedia"
import { SDSChartCreator } from "../components/Pages/CurrentReport/SDSChartCreator"


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
    }, [yearBefore, latestYear])

    const formattedLatestYear = latestYear?.toString().substring(2);
    const formattedYearBefore = yearBefore?.toString().substring(2);
    const financialYearString = `FY ${formattedYearBefore}-${formattedLatestYear}`;

    return (
        isLoading ? (<Spinner />) :
            (
                <>
                    <Box>
                        <Head title={financialYearString} />

                        <Flex >
                            <Text flex={1} fontSize={"2xl"} fontWeight={"bold"}>Annual Report ({financialYearString}) </Text>

                            <Flex justifyContent={"flex-end"} pb={6}>
                                <DownloadReportPDFButton />
                            </Flex>
                        </Flex>

                        {thisReport !== null && thisReport !== undefined &&
                            (
                                <Tabs>

                                    <TabList>
                                        <Tab>
                                            SDS Chart
                                        </Tab>
                                        <Tab>
                                            Participating Projects
                                        </Tab>
                                        <Tab>
                                            Student Reports
                                        </Tab>
                                        <Tab>
                                            Details
                                        </Tab>
                                        <Tab>
                                            Media
                                        </Tab>


                                    </TabList>
                                    <TabPanels>
                                        <TabPanel>
                                            <SDSChartCreator />
                                        </TabPanel>
                                        <TabPanel>
                                            <ParticipatingProjects
                                                dateOpen={thisReport?.date_open}
                                                dateClosed={thisReport?.date_closed}

                                            />
                                        </TabPanel>
                                        <TabPanel>
                                            <ParticipatingStudentReports />
                                            3
                                        </TabPanel>
                                        <TabPanel>
                                            <AnnualReportDetails />
                                            4
                                        </TabPanel>
                                        <TabPanel>
                                            <AnnualReportMedia />
                                            5
                                        </TabPanel>

                                    </TabPanels>
                                </Tabs>

                            )}


                    </Box>
                </>
            )
    )
}

<Grid
    gridGap={8}
    textAlign={"center"}
>
    <Text fontWeight={"bold"} fontSize={"2xl"}>Participating Business Areas</Text>
    <Text fontWeight={"bold"} fontSize={"xl"}>Presents a preview of report for current year based on projects in year</Text>

    <Text fontWeight={"bold"} fontSize={"2xl"}>Participating Business Areas</Text>

</Grid>