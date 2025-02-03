// Simple hook for getting the tasks of the user, for the dashboard

import { useQuery } from "@tanstack/react-query";
import { getReportPDFs } from "../../api";

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
