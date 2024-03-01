import { useQuery } from "@tanstack/react-query";
import { getDataForConceptPlanGeneration } from "../api";
import { ProjectImage } from "@/types";
import { useEffect, useState } from "react";

export interface IConceptPlanGenerationData {
    project_pk: number;
    document_pk: number;
    concept_plan_data_pk: number;
    document_tag: string;
    project_title: string;
    project_status: string;
    business_area_name: string;
    project_team: string[],
    project_image: ProjectImage;
    now: Date;
    project_lead_approval_granted: boolean,
    business_area_lead_approval_granted: boolean,
    directorate_approval_granted: boolean,
    background: string;
    aims: string;
    expected_outcomes: string;
    collaborations: string;
    strategic_context: string;
    staff_time_allocation: string;
    indicative_operating_budget: string;
}

// export const useGetConceptPlanData = (concept_plan_pk: number) => {
//     const { isLoading, data, refetch } = useQuery(
//         ["conceptPlanData", concept_plan_pk],
//         getDataForConceptPlanGeneration,
//         {
//             retry: false,
//         }
//     );

//     return {
//         conceptPlanDataLoading: isLoading,
//         conceptPlanData: data as IConceptPlanGenerationData,
//         refetchCPData: refetch,
//     };
// };

export const useGetConceptPlanData = (concept_plan_pk: number) => {
    const [conceptPlanData, setConceptPlanData] = useState<IConceptPlanGenerationData | null>(null);
    const [conceptPlanDataLoading, setConceptPlanDataLoading] = useState<boolean>(false);

    const refetchCPData = async () => {
        try {
            setConceptPlanDataLoading((prevLoading) => true);

            // Call the modified API function with the concept_plan_pk parameter
            const data = await getDataForConceptPlanGeneration(concept_plan_pk);

            // Update state with the fetched data
            setConceptPlanData(data);
        } catch (error) {
            console.error('Error fetching concept plan data:', error);
        } finally {
            setConceptPlanDataLoading((prevLoading) => false);
        }
    };

    useEffect(() => { refetchCPData() }, [])

    return {
        conceptPlanDataLoading,
        conceptPlanData,
        refetchCPData,
    };
};