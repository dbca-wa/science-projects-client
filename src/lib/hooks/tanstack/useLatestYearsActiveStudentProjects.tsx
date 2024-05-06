// A simple hook which talks to the api to get the latest reports active and approved student progress reports.
// Exposes that data as well as the state of the query (loading or not)

import { useQuery } from "@tanstack/react-query";
import { getLatestActiveStudentReports } from "../../api";

export const useLatestYearsActiveStudentProjects = () => {
  const { isPending, data, refetch } = useQuery({
    queryKey: ["latestStudentReports"],
    queryFn: getLatestActiveStudentReports,
    retry: false,
  });

  return {
    latestStudentReportsLoading: isPending,
    latestStudentReportsData: data,
    refetchLatestStudentReports: refetch,
  };
};
