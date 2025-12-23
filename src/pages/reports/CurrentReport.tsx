// Route for handling information regarding the report for the year.

// import { AnnualReportPrintPreview } from "@/features/reports/components/current/AnnualReportPrintPreview";
import { Head } from "@/shared/components/layout/base/Head";
import { PDFViewer } from "@/features/reports/components/pdfs/PDFViewer";
import { AnnualReportDetails } from "@/features/reports/components/current/AnnualReportDetails";
import { AnnualReportMedia } from "@/features/reports/components/current/AnnualReportMedia";
import { LatestReportsNotYetApproved } from "@/features/reports/components/current/LatestReportsNotYetApproved";
import { ParticipatingProjectReports } from "@/features/reports/components/current/ParticipatingProjectReports";
import { useEditorContext } from "@/shared/hooks/useEditor";
import { getLatestReportingYear } from "@/features/admin/services/admin.service";
import type { IReport } from "@/shared/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import { Loader2 } from "lucide-react";
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

  const [activeTab, setActiveTab] = useState<string>("details");

  return isLoading ? (
    <div className="flex justify-center mt-4">
      <Loader2 className="h-6 w-6 animate-spin" />
    </div>
  ) : (
    <>
      <div>
        <Head title={financialYearString} />
        <div className="flex">
          <h1 className="flex-1 text-2xl font-bold pb-6">
            Annual Report ({financialYearString}){" "}
          </h1>
        </div>

        {thisReport !== null && thisReport !== undefined && (
          <Tabs
            value={activeTab}
            onValueChange={(value) => {
              manuallyCheckAndToggleDialog(() => {
                setActiveTab(value);
              });
            }}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="media">Media</TabsTrigger>
              <TabsTrigger value="pending">Pending Reports</TabsTrigger>
              <TabsTrigger value="approved">Approved Progress Reports</TabsTrigger>
              <TabsTrigger value="preview">Print Preview</TabsTrigger>
            </TabsList>
            
            <TabsContent value="details" className="mt-6">
              <AnnualReportDetails />
            </TabsContent>
            
            <TabsContent value="media" className="mt-6">
              <AnnualReportMedia
                reportId={thisReport?.pk ? thisReport.pk : thisReport?.id}
              />
            </TabsContent>

            <TabsContent value="pending" className="mt-6">
              <LatestReportsNotYetApproved />
            </TabsContent>

            <TabsContent value="approved" className="mt-6">
              <ParticipatingProjectReports />
            </TabsContent>

            <TabsContent value="preview" className="mt-6">
              <PDFViewer thisReport={thisReport} />
              {/* <AnnualReportPrintPreview thisReport={thisReport} /> */}
            </TabsContent>
            {/* <TabsContent value="test">
              <CeleryTest />
            </TabsContent> */}
          </Tabs>
        )}
      </div>
    </>
  );
};


