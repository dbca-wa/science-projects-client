// Simple hook for getting the tasks of the user, for the dashboard

import { useQuery } from "@tanstack/react-query";
import { getUserFeedback } from "../../api";
import { IUserData } from "@/types";

export interface IFeedback {
  created_at: Date;
  updated_at: Date;
  id: number;
  kind: string;
  status: string;
  text: string;
  user: IUserData;
}

export const useGetUserFeedback = () => {
  const { isPending, data } = useQuery({
    queryKey: ["userfeedback"],
    queryFn: getUserFeedback,
    retry: false,
  });
  return {
    feedbackLoading: isPending,
    feedbackData: data as IFeedback[],
  };
};