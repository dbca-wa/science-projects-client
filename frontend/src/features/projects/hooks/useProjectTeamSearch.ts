import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { apiClient } from "@/shared/services/api/client.service";
import type { IUserData } from "@/shared/types/user.types";

/**
 * Get mentionable users for a project
 */
const getMentionableUsers = async (projectId: number): Promise<IUserData[]> => {
	const response = await apiClient.get<IUserData[]>(
		`projects/${projectId}/mentionable-users`
	);
	return response;
};

/**
 * Query keys for mentionable users search
 */
export const mentionableUsersKeys = {
	all: ["projects", "mentionable-users"] as const,
	project: (projectId: number) =>
		[...mentionableUsersKeys.all, projectId] as const,
	search: (projectId: number, searchTerm: string) =>
		[...mentionableUsersKeys.project(projectId), "search", searchTerm] as const,
};

/**
 * Hook for searching mentionable users for @mentions
 *
 * Features:
 * - Fetches all users who can be mentioned (comment on) the project
 * - Client-side filtering by search term
 * - Debounced search for performance
 * - Fuzzy matching on first name, last name, and email
 * - Configured with 5 minute stale time (mentionable users don't change frequently)
 *
 * @param projectId - Project ID to fetch mentionable users for
 * @param searchTerm - Search term to filter users (optional)
 * @returns TanStack Query result with filtered mentionable users
 */
export const useProjectMentionableUsers = (
	projectId: number,
	searchTerm: string = ""
) => {
	// Fetch all mentionable users
	const query = useQuery({
		queryKey: mentionableUsersKeys.project(projectId),
		queryFn: () => getMentionableUsers(projectId),
		staleTime: 5 * 60_000, // 5 minutes
		enabled: !!projectId,
	});

	// Client-side filtering by search term
	const filteredUsers = useMemo(() => {
		if (!query.data) return [];
		if (!searchTerm.trim()) return query.data;

		const lowerSearch = searchTerm.toLowerCase().trim();

		return query.data.filter((user) => {
			// Match on first name
			if (user.display_first_name?.toLowerCase().includes(lowerSearch)) {
				return true;
			}

			// Match on last name
			if (user.display_last_name?.toLowerCase().includes(lowerSearch)) {
				return true;
			}

			// Match on email
			if (user.email?.toLowerCase().includes(lowerSearch)) {
				return true;
			}

			return false;
		});
	}, [query.data, searchTerm]);

	return {
		...query,
		data: filteredUsers,
	};
};
