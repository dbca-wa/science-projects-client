import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/shared/services/api/client.service";
import { USER_ENDPOINTS } from "../services/user.endpoints";
import { toast } from "sonner";
import type { ExternalUserCreateFormData } from "../schemas/externalUserCreate.schema";
import type { IUserData } from "@/shared/types/user.types";

/**
 * Create external user API call
 * @param data - External user form data
 * @returns Created user data
 */
const createExternalUser = async (
	data: ExternalUserCreateFormData
): Promise<IUserData> => {
	const currentYear = new Date().getFullYear();
	const username = `${data.firstName.toLowerCase()}${data.lastName.toLowerCase()}${currentYear}`;

	// Capitalize names after spaces and hyphens
	const capitalizeAfterSpaceOrHyphen = (name: string) => {
		return name.replace(/(?:^|\s|-)(\w)/g, (match) => match.toUpperCase());
	};

	const firstName = capitalizeAfterSpaceOrHyphen(
		data.firstName.charAt(0).toUpperCase() + data.firstName.slice(1)
	);
	const lastName = capitalizeAfterSpaceOrHyphen(
		data.lastName.charAt(0).toUpperCase() + data.lastName.slice(1)
	);

	return apiClient.post<IUserData>(USER_ENDPOINTS.CREATE, {
		username,
		email: data.email,
		firstName,
		lastName,
		isStaff: false,
		affiliation: data.affiliation || null,
	});
};

/**
 * Hook for creating external users
 * - Sets is_staff to false
 * - Invalidates user list cache on success
 * - Shows success/error toast notifications
 *
 * @returns TanStack Query mutation for external user creation
 */
export const useCreateExternalUser = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (data: ExternalUserCreateFormData) => createExternalUser(data),
		onSuccess: (newUser: IUserData) => {
			// Invalidate user list to show new user
			queryClient.invalidateQueries({ queryKey: ["users"] });

			// Set the new user in cache for detail page
			queryClient.setQueryData(["users", "detail", newUser.id], newUser);

			// Show success toast
			toast.success("External user created successfully");
		},
		onError: (error: Error) => {
			// Show error toast
			toast.error(`Failed to create user: ${error.message}`);
		},
	});
};
