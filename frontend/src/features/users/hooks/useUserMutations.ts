import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
	toggleStaffProfileVisibility,
	updateMembership,
	updatePersonalInformation,
} from "../services/user.service";
import { authKeys } from "@/features/auth/hooks/useAuth";

/**
 * Toggle staff profile visibility (hidden/visible).
 * Resets the auth user query on success.
 */
export function useToggleStaffProfileVisibility(callbacks?: {
	onSuccess?: () => void;
	onError?: () => void;
}) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (staffProfileId: number) =>
			toggleStaffProfileVisibility(staffProfileId),
		onSuccess: async () => {
			await queryClient.resetQueries({
				queryKey: authKeys.user(),
				exact: true,
			});
			toast.success("Staff profile visibility updated");
			callbacks?.onSuccess?.();
		},
		onError: (error: Error) => {
			toast.error(error.message || "Failed to toggle staff profile visibility");
			callbacks?.onError?.();
		},
	});
}

/**
 * Update a user's organisational membership (branch, business area, affiliation).
 * Resets the auth user query on success.
 */
export function useUpdateMembership(
	userId: number,
	callbacks?: {
		onSuccess?: () => void;
		onError?: () => void;
	}
) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (data: {
			branch?: number | null;
			business_area?: number | null;
			affiliation?: number | null;
		}) => updateMembership(userId, data),
		onSuccess: async () => {
			await queryClient.resetQueries({
				queryKey: authKeys.user(),
				exact: true,
			});
			toast.success("Membership updated successfully");
			callbacks?.onSuccess?.();
		},
		onError: (error: Error) => {
			toast.error(error.message || "Failed to update membership");
			callbacks?.onError?.();
		},
	});
}

/**
 * Update a user's personal information (title, phone, fax).
 * Resets the auth user query on success.
 */
export function useUpdatePersonalInformation(
	userId: number,
	callbacks?: {
		onSuccess?: () => void;
		onError?: () => void;
	}
) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (data: {
			display_first_name?: string;
			display_last_name?: string;
			title?: string;
			phone?: string;
			fax?: string;
		}) => updatePersonalInformation(userId, data),
		onSuccess: async () => {
			await queryClient.resetQueries({
				queryKey: authKeys.user(),
				exact: true,
			});
			toast.success("Personal information updated successfully");
			callbacks?.onSuccess?.();
		},
		onError: (error: Error) => {
			toast.error(error.message || "Failed to update personal information");
			callbacks?.onError?.();
		},
	});
}
