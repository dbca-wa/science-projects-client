import { AddReportModal } from "@/features/reports/components/modals/AddReportModal";
import { Button } from "@/shared/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { getAllReports } from "@/features/admin/services/admin.service";
import type { IReport } from "@/shared/types";
import { ReportItemDisplay } from "@/features/admin/components/ReportItemDisplay";
import { Head } from "@/shared/components/layout/base/Head";
import { Loader2 } from "lucide-react";

export const ReportsCRUD = () => {
  const [addIsOpen, setAddIsOpen] = useState(false);

  const { isLoading, data: slices } = useQuery<IReport[]>({
    queryFn: getAllReports,
    queryKey: ["reports"],
  });

  const [countOfItems, setCountOfItems] = useState(0);

  useEffect(() => {
    if (slices) {
      setCountOfItems(slices.length);
    }
  }, [slices]);

  return (
    <>
      <Head title="Reports" />
      {isLoading ? (
        <div className="flex items-center justify-center h-48">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : (
        <>
          <div className="max-w-full max-h-full w-full">
            <div className="flex w-full mt-4 justify-between">
              <div className="flex items-center flex-1 ml-1">
                <h2 className="text-lg font-semibold">
                  Reports ({countOfItems})
                </h2>
              </div>
              <div className="flex">
                <Button
                  onClick={() => setAddIsOpen(true)}
                  className="bg-green-500 hover:bg-green-400 dark:bg-green-600 dark:hover:bg-green-500 text-white"
                >
                  Create Report Info
                </Button>
              </div>
            </div>
            <div
              className="grid grid-cols-[2fr_3fr_3fr_1fr] mt-4 w-full p-3 border border-b-0 last:border-b"
              style={{
                borderBottomWidth: slices.length === 0 ? "1px" : "0",
              }}
            >
              <div className="flex justify-start">
                <span className="font-bold">Year</span>
              </div>
              <div className="flex">
                <span className="font-bold">Creator</span>
              </div>
              <div className="flex">
                <span className="font-bold">Modifier</span>
              </div>
              <div className="flex justify-end mr-2">
                <span className="font-bold">Change</span>
              </div>
            </div>
            <div className="grid grid-cols-1">
              {slices &&
                slices
                  .sort((a, b) => b.year - a.year) // Sort in descending order based on the year
                  .map((s) => (
                    <ReportItemDisplay
                      key={s.pk}
                      pk={s.pk}
                      year={s.year}
                      date_open={s.date_open}
                      date_closed={s.date_closed}
                      created_at={s.created_at}
                      updated_at={s.updated_at}
                      creator={s.creator}
                      modifier={s.modifier}
                      dm={s.dm}
                      publications={s.publications}
                      research_intro={s.research_intro}
                      service_delivery_intro={s.service_delivery_intro}
                      student_intro={s.student_intro}
                    />
                  ))}
            </div>
          </div>

          <AddReportModal isOpen={addIsOpen} onClose={() => setAddIsOpen(false)} />
        </>
      )}
    </>
  );
};
