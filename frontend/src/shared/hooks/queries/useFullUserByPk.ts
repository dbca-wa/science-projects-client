import { useQuery } from "@tanstack/react-query";
import type { IUserData } from "@/shared/types/user.types";
import { getFullUser } from "@/features/users/services/user.service";

export const useFullUserByPk = (pk: number) => {
	const { isPending, data, refetch, isError, error } = useQuery<IUserData>({
		queryKey: ["user", pk],
		queryFn: () => getFullUser(pk), // pk is in closure
		retry: false,
		enabled: !!pk, // Don't run query if pk is undefined/null/0
	});

	return {
		userLoading: isPending,
		userData: data,
		refetchUser: refetch,
		isError,
		error,
	};
};
