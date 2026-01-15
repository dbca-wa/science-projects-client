// TEMPORARILY DISABLED - depends on moved user service
// This will be re-enabled when the users feature is integrated back
/*
import { useQuery } from "@tanstack/react-query";
import type { IUserData } from "@/shared/types/user.types";
import { getFullUser } from "@/features/users/services/user.service";

export const useFullUserByPk = (pk: number | undefined | null) => {
	const { isPending, data, refetch, isError, error } = useQuery<
		IUserData,
		Error
	>({
		queryKey: ["user", pk],
		queryFn: () => getFullUser(pk!), // We know pk exists because of enabled
		retry: false,
		enabled: !!pk && pk !== 0, // Only run if pk is truthy and not 0
	});

	return {
		userLoading: isPending,
		userData: data,
		refetchUser: refetch,
		isError,
		error,
	};
};
*/
