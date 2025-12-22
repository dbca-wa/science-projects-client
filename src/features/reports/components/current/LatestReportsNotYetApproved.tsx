// WIP tab contents for participating projects. Features some additional info and the projects via AnnualReportProjectDisplay

import { ARProgressReportHandler } from "@/shared/components/RichTextEditor/Editors/ARProgressReportHandler";
import { ARStudentReportHandler } from "@/shared/components/RichTextEditor/Editors/ARStudentReportHandler";
// import whitePaperBackground from "@/images/white-texture.jpg";
import { useLatestYearsUnapprovedReports } from "@/features/reports/hooks/useLatestReportsUnapproved";
import { useUser } from "@/features/users/hooks/useUser";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/shared/components/ui/accordion";
import { Loader2 } from "lucide-react";
import { MdScience } from "react-icons/md";
import { RiBook3Fill } from "react-icons/ri";

export const LatestReportsNotYetApproved = () => {
  const { unapprovedData, unapprovedLoading } =
    useLatestYearsUnapprovedReports();

  const { userData, userLoading } = useUser();

  const A4Width = 210; // in millimeters
  const A4Height = A4Width * 1.414; // 1.414 is the aspect ratio of A4 paper (297 / 210)

  return (
    <div className="w-full">
      {unapprovedLoading || unapprovedData === undefined ? (
        <div className="flex justify-center">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      ) : (
        <div
          className="flex flex-col mx-auto py-4 relative"
          style={{
            minHeight: `${A4Height}mm`,
            maxWidth: `${A4Width}mm`,
          }}
        >
          <div
            className="absolute top-0 left-0 right-0 bottom-0 bg-white bg-cover bg-center bg-no-repeat opacity-25 z-0"
            style={{
              minHeight: `${A4Height}mm`,
            }}
          />
          {unapprovedData["student_reports"].length +
            unapprovedData["progress_reports"].length <
          1 ? (
            <div className="flex justify-center">
              <p className="absolute top-10">
                There are no unapproved reports for this year
              </p>
            </div>
          ) : (
            <Accordion
              type="multiple"
              defaultValue={["student-reports", "progress-reports"]}
              className="z-10 w-full"
            >
              <AccordionItem value="student-reports" className="border-none">
                <AccordionTrigger className="bg-blue-500 hover:bg-blue-400 dark:bg-blue-600 dark:hover:bg-blue-500 text-white rounded-b-full px-6 py-4 select-none opacity-90 hover:no-underline">
                  <div className="flex items-center justify-center mb-4 mt-4 ml-6">
                    <div className="flex items-center justify-center w-8 h-8 mr-4">
                      <RiBook3Fill size="lg" />
                    </div>
                    <span className="font-bold text-xl">
                      Student Reports (
                      {unapprovedData["student_reports"].length})
                    </span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="py-4 mt-4">
                  {unapprovedData &&
                    unapprovedData["student_reports"]?.map((sr, index) => {
                      return (
                        <ARStudentReportHandler
                          key={`student${index}`}
                          canEdit={
                            userData?.is_superuser ||
                            userData?.business_area?.name === "Directorate"
                          }
                          report={sr}
                          shouldAlternatePicture={index % 2 !== 0}
                        />
                      );
                    })}
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="progress-reports" className="border-none mt-4">
                <AccordionTrigger className="bg-green-500 hover:bg-green-400 dark:bg-green-600 dark:hover:bg-green-500 text-white rounded-b-full px-6 py-4 select-none opacity-90 hover:no-underline">
                  <div className="flex items-center mb-4 mt-4 ml-6">
                    <div className="flex items-center justify-center w-8 h-8 mr-4">
                      <MdScience size="lg" />
                    </div>
                    <span className="font-bold text-xl">
                      Progress Reports (
                      {unapprovedData["progress_reports"].length})
                    </span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="py-4 mt-4">
                  {unapprovedData &&
                    unapprovedData["progress_reports"]?.map((pr, index) => {
                      return (
                        <ARProgressReportHandler
                          key={`ordinary${index}`}
                          canEdit={
                            userData?.is_superuser ||
                            userData?.business_area?.name === "Directorate"
                          }
                          report={pr}
                          shouldAlternatePicture={index % 2 !== 0}
                        />
                      );
                    })}
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          )}
        </div>
      )}
    </div>
  );
};

