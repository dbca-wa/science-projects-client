// A button to download the annual report based on the current data. Will be used to generate actual report.

import { GenerateARPDFModal } from "@/features/reports/components/modals/GenerateARPDFModal";
import type { IReport } from "@/shared/types";
import { Button } from "@/shared/components/ui/button";
import { FaDownload } from "react-icons/fa";
import { useState } from "react";

interface IGenBtnProps {
  report: IReport;
}

export const GeneratePDFButton = ({ report }: IGenBtnProps) => {
  const [isGeneratePDFModalOpen, setIsGeneratePDFModalOpen] = useState(false);

  return (
    <>
      <GenerateARPDFModal
        isOpen={isGeneratePDFModalOpen}
        onClose={() => setIsGeneratePDFModalOpen(false)}
        thisReport={report}
      />
      <Button
        onClick={() => setIsGeneratePDFModalOpen(true)}
        className="bg-green-500 hover:bg-green-600 text-white dark:bg-green-600 dark:hover:bg-green-400"
      >
        <FaDownload className="mr-2 h-4 w-4" />
        Generate PDF
      </Button>
    </>
  );
};
