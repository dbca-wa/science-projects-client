// WIP hook for determining when a user was last online.
// Planned Usage: Displaying a green circle next to profile if user was last
// online < 2 minutes ago.

import { useEffect, useState } from "react";
import { getUserLastOnlineTimestamp } from "../api";

export const useUserLastOnline = (userId: string): Date | null => {
    // const [lastOnline, setLastOnline] = useState<Date | null>(null);

    // useEffect(() => {
    //     const fetchLastOnline = async () => {
    //         try {
    //             const timestamp = await getUserLastOnlineTimestamp(userId); // Implement your API function to fetch the last online timestamp
    //             setLastOnline(timestamp);
    //         } catch (error) {
    //             // Handle error if fetching the last online timestamp fails
    //             console.error("Failed to fetch last online timestamp:", error);
    //         }
    //     };

    //     fetchLastOnline();
    // }, [userId]);

    // return lastOnline;

    // TEST PURPOSES, above requires backend route
    const [lastOnline, setLastOnline] = useState<Date | null>(null);

    useEffect(() => {
        // Simulate the logic to fetch the last online timestamp for the given user ID
        const fetchLastOnline = async () => {
            // Replace this with your actual implementation or use the test data
            // For testing purposes, return a mock value
            // Mock value for testing
            const mockLastOnline = new Date();
            setLastOnline(mockLastOnline);
        };

        if (userId) {
            fetchLastOnline();
        }
    }, [userId]);

    return lastOnline;



}