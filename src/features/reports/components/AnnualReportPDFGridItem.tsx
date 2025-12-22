import { Button } from "@/shared/components/ui/button";
import { FaEdit } from "react-icons/fa";
import type { ISmallReport, IUserMe } from "@/shared/types";
import { ChangeReportPDFModal } from "@/features/reports/components/modals/ChangeReportPDFModal";
import { useState } from "react";

interface Props {
  report: ISmallReport;
  refetchFunction: () => void;
  userData: IUserMe;
  isLegacy: boolean;
}

export const AnnualReportPDFGridItem = ({
  report,
  refetchFunction,
  userData,
  isLegacy,
}: Props) => {
  const [isChangePDFOpen, setIsChangePDFOpen] = useState(false);
  
  const downloadPDF = (report) => {
    console.log(report);
    console.log(report?.pdf?.file ? report.pdf.file : report.file);
    if (report?.pdf?.file || report?.file) {
      console.log("downloading file");
      window.open(report?.pdf?.file ? report.pdf.file : report.file, "_blank");
    }
  };

  return (
    <>
      <ChangeReportPDFModal
        isLegacy={isLegacy}
        isChangePDFOpen={isChangePDFOpen}
        onChangePDFClose={() => setIsChangePDFOpen(false)}
        report={report}
        refetchPDFs={refetchFunction}
      />

      <div className="border border-gray-200 dark:border-gray-700 rounded-lg min-h-[200px] min-w-[150px] px-3 pt-6 pb-6 flex flex-col">
        <div
          className="mb-8 flex justify-center cursor-pointer"
          onClick={() => {
            downloadPDF(report);
          }}
        >
          <img
            src="pdf2.png"
            className="object-contain max-h-[200px] select-none"
            draggable={false}
            alt="PDF Icon"
          />
        </div>
        <div className="relative px-0 select-none">
          <div className="border-t border-gray-200 dark:border-gray-700"></div>
          <div className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-gray-800 px-4">
            {report?.year &&
              (() => {
                const yearStr = String(report.year).slice(2); // Get the last two digits of the year
                const prevYearStr = String(report.year - 1).slice(2); // Get the last two digits of the previous year

                const formattedPrevYear =
                  prevYearStr.length === 1 ? `0${prevYearStr}` : prevYearStr;
                const formattedYear =
                  yearStr.length === 1 ? `0${yearStr}` : yearStr;

                return `FY ${formattedPrevYear}-${formattedYear}`;
              })()}
          </div>
        </div>
        {userData?.is_superuser && (
          <div className="mt-4 w-full gap-8">
            <Button
              variant="link"
              className="select-none p-0 h-auto text-blue-500 hover:text-blue-400"
              onClick={() => setIsChangePDFOpen(true)}
            >
              <div className="text-blue-500 mt-0.5 mr-2">
                <FaEdit size="14px" />
              </div>
              Update
            </Button>
          </div>
        )}
      </div>
    </>
  );
};


