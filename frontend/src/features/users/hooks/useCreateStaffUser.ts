import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/shared/services/api/client.service";
import { USER_ENDPOINTS } from "../services/user.endpoints";
import { toast } from "sonner";
import type { StaffUserCreateFormData } from "../schemas/staffUserCreate.schema";
import type { IUserData } from "@/shared/types/user.types";

/**
 * Create staff user API call
 * @param data - Staff user form data
 * @returns Created user data
 */
const createStaffUser = async (
	data: StaffUserCreateFormData
): Promise<IUserData> => {
	// Use email as username for staff users — this matches the DBCA SSO
	// middleware which looks up users by email. Using a generated username
	// like "johndoe2026" would cause a duplicate account when the user
	// logs in via SSO for the first time.
	const username = data.email;

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
		first_name: firstName,
		last_name: lastName,
		is_staff: true,
		branch: data.branch,
		business_area: data.businessArea,
	});
};

/**
 * Hook for creating DBCA staff users (admin only)
 * - Sets is_staff to true
 * - Invalidates user list cache on success
 * - Shows success/error toast notifications
 *
 * @returns TanStack Query mutation for staff user creation
 */
export const useCreateStaffUser = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (data: StaffUserCreateFormData) => createStaffUser(data),
		onSuccess: (newUser: IUserData) => {
			// Invalidate user list to show new user
			queryClient.invalidateQueries({ queryKey: ["users"] });

			// Set the new user in cache for detail page
			queryClient.setQueryData(["users", "detail", newUser.id], newUser);

			// Show success toast
			toast.success("DBCA staff user created successfully");
		},
		onError: (error: Error) => {
			// Show error toast
			toast.error(`Failed to create user: ${error.message}`);
		},
	});
};
