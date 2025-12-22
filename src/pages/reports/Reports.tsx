// Route for reviewing all reports.

import { Head } from "@/shared/components/layout/base/Head";
import { AddLegacyReportPDFModal } from "@/features/reports/components/modals/AddLegacyReportPDFModal";
import { AddReportPDFModal } from "@/features/reports/components/modals/AddReportPDFModal";
import { AnnualReportPDFGridItem } from "@/features/reports/components/AnnualReportPDFGridItem";
import { useGetARARsWithPDF } from "@/features/reports/hooks/useGetARARsWithPDF";
import { useGetLegacyARPDFs } from "@/features/reports/hooks/useGetLegacyARPDFs";
import { useUser } from "@/features/users/hooks/useUser";
import { Button } from "@/shared/components/ui/button";
import { Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";

export const Reports = () => {
  const [isAddPDFOpen, setIsAddPDFOpen] = useState(false);
  const [isAddLegacyPDFOpen, setIsAddLegacyPDFOpen] = useState(false);

  const { reportsWithPDFData, reportsWithPDFLoading, refetchReportsWithPDFs } =
    useGetARARsWithPDF();
  const { legacyPDFData, legacyPDFDataLoading, refetchLegacyPDFs } =
    useGetLegacyARPDFs();
  const { userData, userLoading } = useUser();

  return (
    <>
      <div className="mt-5">
        <Head title={"Reports"} />
        {!userLoading && userData?.is_superuser && (
          <>
            <AddReportPDFModal
              isAddPDFOpen={isAddPDFOpen}
              onAddPDFClose={() => setIsAddPDFOpen(false)}
              refetchPDFs={refetchReportsWithPDFs}
            />
            {!legacyPDFDataLoading && legacyPDFData && (
              <AddLegacyReportPDFModal
                isAddLegacyPDFOpen={isAddLegacyPDFOpen}
                onAddLegacyPDFClose={() => setIsAddLegacyPDFOpen(false)}
                refetchLegacyPDFs={refetchReportsWithPDFs}
                legacyPDFData={legacyPDFData}
              />
            )}

            <div className="flex justify-end w-full">
              <div className="space-x-2">
                <Button
                  onClick={() => setIsAddLegacyPDFOpen(true)}
                  className="bg-blue-500 hover:bg-blue-400 text-white dark:bg-blue-500 dark:hover:bg-blue-400"
                >
                  Add Legacy PDF
                </Button>
                <Button
                  onClick={() => setIsAddPDFOpen(true)}
                  className="bg-green-500 hover:bg-green-400 text-white dark:bg-green-500 dark:hover:bg-green-400"
                >
                  Add PDF
                </Button>
              </div>
            </div>
          </>
        )}
        {!reportsWithPDFLoading &&
        !legacyPDFDataLoading &&
        legacyPDFData &&
        reportsWithPDFData ? (
          <>
            {reportsWithPDFData?.length > 0 && (
              <div>
                <h2 className="font-bold text-lg">
                  Annual Report PDFs
                </h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 mt-6 gap-4">
                  {reportsWithPDFData
                    .sort((a, b) => b.year - a.year)
                    .map((report, index) => {
                      if (report.is_published) {
                        return (
                          <motion.div
                            key={index}
                            initial={{ y: -10, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: 10, opacity: 0 }}
                            transition={{
                              duration: 0.7,
                              delay: (index + 1) / 7,
                            }}
                            style={{
                              height: "100%",
                              animation: "oscillate 8s ease-in-out infinite",
                            }}
                          >
                            <AnnualReportPDFGridItem
                              isLegacy={false}
                              report={report}
                              refetchFunction={refetchReportsWithPDFs}
                              userData={userData}
                            />
                          </motion.div>
                        );
                      }
                    })}
                </div>
              </div>
            )}

            {/*  */}
            {legacyPDFData?.length > 0 && (
              <div className="mt-8">
                <h2 className="font-bold text-lg">
                  Legacy AR PDFs
                </h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 mt-6 gap-4">
                  {legacyPDFData
                    .sort((a, b) => b.year - a.year)
                    .map((report, index) => {
                      return (
                        <motion.div
                          key={index}
                          initial={{ y: -10, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          exit={{ y: 10, opacity: 0 }}
                          transition={{ duration: 0.7, delay: (index + 1) / 7 }}
                          style={{
                            height: "100%",
                            animation: "oscillate 8s ease-in-out infinite",
                          }}
                        >
                          <AnnualReportPDFGridItem
                            isLegacy={true}
                            report={report}
                            refetchFunction={refetchLegacyPDFs}
                            userData={userData}
                          />
                        </motion.div>
                      );
                    })}
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="flex justify-center mt-20">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        )}
      </div>
    </>
  );
};
