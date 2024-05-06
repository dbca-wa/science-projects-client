import { getDataForConceptPlanGeneration } from "../../api";
import { IConceptPlanGenerationData } from "@/types";
import { useEffect, useState } from "react";

export const useGetConceptPlanData = (concept_plan_pk: number) => {
  const [conceptPlanData, setConceptPlanData] =
    useState<IConceptPlanGenerationData | null>(null);
  const [conceptPlanDataLoading, setConceptPlanDataLoading] =
    useState<boolean>(false);

  const refetchCPData = async () => {
    try {
      setConceptPlanDataLoading(true);

      // Call the modified API function with the concept_plan_pk parameter
      const data = await getDataForConceptPlanGeneration(concept_plan_pk);

      // Update state with the fetched data
      setConceptPlanData(data);
    } catch (error) {
      console.error("Error fetching concept plan data:", error);
    } finally {
      setConceptPlanDataLoading(false);
    }
  };

  useEffect(() => {
    refetchCPData();
  }, []);

  return {
    conceptPlanDataLoading,
    conceptPlanData,
    refetchCPData,
  };
};
