import { useBusinessArea } from './useBusinessArea'; // Import your useBusinessArea hook

export const useCheckUserIsBaLeader = (mePk: number | string | undefined, baPk: number) => {
    const { baData, baLoading } = useBusinessArea(baPk);

    if (mePk === undefined) {
        return false;
    }

    // If mePk is a string, try to convert it to a number
    if (typeof mePk === 'string') {
        mePk = parseInt(mePk, 10);
    }


    // Check if the business area data has loaded
    if (baLoading) {
        return false; // You can return false or handle loading state as per your needs
    }

    if (baData) {
        // If business area data is available, compare the leader property with mePk
        return baData.leader === mePk;
    }

    return false; // Handle other cases where data is not available
};