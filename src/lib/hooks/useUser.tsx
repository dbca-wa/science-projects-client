// Hook used to determine the user. Used on login and getting full profile from pk in data.

import { useQuery } from "@tanstack/react-query"
import { getMe } from "../api";
import { IUserMe } from "../../types";

export const useUser = () => {
    const { isLoading, data, isError } = useQuery(["me"], getMe, {
        retry: false,   //immediate fail if not logged in
    });
    return {
        userLoading: isLoading,
        userData: data as IUserMe,
        isLoggedIn: !isError,
    }
}