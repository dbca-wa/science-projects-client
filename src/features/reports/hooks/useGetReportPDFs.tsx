// Simple hook for getting the tasks of the user, for the dashboard

import { getReportPDFs } from "@/shared/lib/api";
import { useQuery } from "@tanstack/react-query";

export const useGetReportPDFs = () => {
  const { isPending, data } = useQuery({
    queryKey: ["reportPdfs"],
    queryFn: getReportPDFs,
    retry: false,
  });
  return {
    reportPdfsLoading: isPending,
    reportPdfsData: data,
  };
};
