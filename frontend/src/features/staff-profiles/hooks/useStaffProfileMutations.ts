import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
	updateStaffProfileOverview,
	toggleStaffProfileVisibility,
	createEmploymentEntry,
	updateEmploymentEntry,
	deleteEmploymentEntry,
	createEducationEntry,
	updateEducationEntry,
	deleteEducationEntry,
	emailStaffMember,
} from "../services/staff-profile.service";
import type {
	IOverviewUpdateData,
	IEmploymentEntryFormData,
	IEducationEntryFormData,
} from "../types/staff-profile.types";

export const useUpdateOverview = (pk: number) => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (data: IOverviewUpdateData) =>
			updateStaffProfileOverview(pk, data),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: ["staffProfiles", "overview", pk],
			});
			queryClient.invalidateQueries({
				queryKey: ["staffProfiles", "detail", pk],
			});
		},
	});
};

export const useToggleVisibility = (pk: number) => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: () => toggleStaffProfileVisibility(pk),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: ["staffProfiles", "detail", pk],
			});
			queryClient.invalidateQueries({
				queryKey: ["staffProfiles", "hero", pk],
			});
			queryClient.invalidateQueries({ queryKey: ["staffProfiles"] });
			queryClient.invalidateQueries({ queryKey: ["auth", "user"] });
		},
	});
};

// Employment entry mutations
export const useCreateEmploymentEntry = (profileId: number) => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (data: IEmploymentEntryFormData) =>
			createEmploymentEntry(profileId, data),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: ["staffProfiles", "cv", profileId],
			});
		},
	});
};

export const useUpdateEmploymentEntry = (profileId: number) => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (params: { pk: number; data: IEmploymentEntryFormData }) =>
			updateEmploymentEntry(params.pk, params.data),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: ["staffProfiles", "cv", profileId],
			});
		},
	});
};

export const useDeleteEmploymentEntry = (profileId: number) => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (pk: number) => deleteEmploymentEntry(pk),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: ["staffProfiles", "cv", profileId],
			});
		},
	});
};

// Education entry mutations
export const useCreateEducationEntry = (profileId: number) => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (data: IEducationEntryFormData) =>
			createEducationEntry(profileId, data),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: ["staffProfiles", "cv", profileId],
			});
		},
	});
};

export const useUpdateEducationEntry = (profileId: number) => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (params: { pk: number; data: IEducationEntryFormData }) =>
			updateEducationEntry(params.pk, params.data),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: ["staffProfiles", "cv", profileId],
			});
		},
	});
};

export const useDeleteEducationEntry = (profileId: number) => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (pk: number) => deleteEducationEntry(pk),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: ["staffProfiles", "cv", profileId],
			});
		},
	});
};

// Email staff member
export const useEmailStaffMember = () => {
	return useMutation({
		mutationFn: (params: {
			userPk: number;
			data: { senderEmail: string; message: string };
		}) => emailStaffMember(params.userPk, params.data),
	});
};
