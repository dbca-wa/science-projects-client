// A simple hook which talks to the api to get the latest reports active and approved student progress reports.
// Exposes that data as well as the state of the query (loading or not)

import { useQuery } from "@tanstack/react-query";
import { getLatestActiveStudentReports } from "../api";

export const useLatestYearsActiveStudentProjects = () => {
  const { isLoading, data, refetch } = useQuery(
    ["latestStudentReports"],
    getLatestActiveStudentReports,
    {
      retry: false,
    }
  );

  return {
    latestStudentReportsLoading: isLoading,
    latestStudentReportsData: data,
    refetchLatestStudentReports: refetch,
  };
};
