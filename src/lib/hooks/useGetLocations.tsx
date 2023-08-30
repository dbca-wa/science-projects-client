// Simple hook to get the locations and present that data in a divided up way,
// exposing them for easy access on the frontend. Also exposes loading state.

import { useQuery } from "@tanstack/react-query"
import { getAllLocations } from "../api";

export const useGetLocations = () => {
    const { isLoading, data: locationData, isError } = useQuery(["allLocations"], getAllLocations, {
        retry: false,
    });
    return {
        locationsLoading: isLoading,
        dbcaRegions: locationData?.dbcaregion,
        dbcaDistricts: locationData?.dbcadistrict,
        ibra: locationData?.ibra,
        imcra: locationData?.imcra,
        nrm: locationData?.nrm,
    }
}