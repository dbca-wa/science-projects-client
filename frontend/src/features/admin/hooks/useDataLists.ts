import { useQuery } from "@tanstack/react-query";
import {
	getUnapprovedDocs,
	getProblematicProjects,
	getStaffUsers,
	getStaffEmailList,
} from "../services/admin.service";

/** Fetch unapproved documents for the current financial year */
export const useUnapprovedDocs = () => {
	return useQuery({
		queryKey: ["admin", "unapproved-docs"],
		queryFn: getUnapprovedDocs,
		staleTime: 2 * 60_000,
	});
};

/** Fetch problematic projects (categorised by issue type) */
export const useProblematicProjects = () => {
	return useQuery({
		queryKey: ["admin", "problematic-projects"],
		queryFn: getProblematicProjects,
		staleTime: 2 * 60_000,
	});
};

/** Fetch all staff users with details */
export const useStaffUsers = () => {
	return useQuery({
		queryKey: ["admin", "staff-users"],
		queryFn: getStaffUsers,
		staleTime: 2 * 60_000,
	});
};

/** Fetch active staff email list */
export const useStaffEmailList = () => {
	return useQuery({
		queryKey: ["admin", "staff-email-list"],
		queryFn: getStaffEmailList,
		staleTime: 2 * 60_000,
	});
};

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
	remedyOpenClosed,
	remedyMemberless,
	remedyLeaderless,
	remedyMultipleLeaders,
	remedyExternalLeaders,
	remedyRoleMismatch,
} from "../services/admin.service";

/** Remedy open/closed projects */
export const useRemedyOpenClosed = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: remedyOpenClosed,
		onSuccess: (data) => {
			queryClient.invalidateQueries({
				queryKey: ["admin", "problematic-projects"],
			});
			toast.success(`Remedied ${data.successful} project(s)`);
		},
		onError: (error: Error) => {
			toast.error(error.message || "Failed to remedy projects");
		},
	});
};

/** Remedy memberless projects */
export const useRemedyMemberless = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: remedyMemberless,
		onSuccess: (data) => {
			queryClient.invalidateQueries({
				queryKey: ["admin", "problematic-projects"],
			});
			toast.success(
				`Remedied ${data.successful} project(s), skipped ${data.skipped ?? 0}`
			);
		},
		onError: (error: Error) => {
			toast.error(error.message || "Failed to remedy projects");
		},
	});
};

/** Remedy leaderless projects */
export const useRemedyLeaderless = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: remedyLeaderless,
		onSuccess: (data) => {
			queryClient.invalidateQueries({
				queryKey: ["admin", "problematic-projects"],
			});
			toast.success(`Remedied ${data.successful} project(s)`);
		},
		onError: (error: Error) => {
			toast.error(error.message || "Failed to remedy projects");
		},
	});
};

/** Remedy multiple-leader projects */
export const useRemedyMultipleLeaders = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: remedyMultipleLeaders,
		onSuccess: (data) => {
			queryClient.invalidateQueries({
				queryKey: ["admin", "problematic-projects"],
			});
			toast.success(`Remedied ${data.successful} project(s)`);
		},
		onError: (error: Error) => {
			toast.error(error.message || "Failed to remedy projects");
		},
	});
};

/** Remedy externally-led projects */
export const useRemedyExternalLeaders = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: remedyExternalLeaders,
		onSuccess: (data) => {
			queryClient.invalidateQueries({
				queryKey: ["admin", "problematic-projects"],
			});
			toast.success(
				`Remedied ${data.successful} project(s), skipped ${data.skipped ?? 0}`
			);
		},
		onError: (error: Error) => {
			toast.error(error.message || "Failed to remedy projects");
		},
	});
};

/** Remedy role mismatch projects (supervising role without is_leader flag) */
export const useRemedyRoleMismatch = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: remedyRoleMismatch,
		onSuccess: (data) => {
			queryClient.invalidateQueries({
				queryKey: ["admin", "problematic-projects"],
			});
			toast.success(
				`Remedied ${data.successful} project(s), skipped ${data.skipped ?? 0}`
			);
		},
		onError: (error: Error) => {
			toast.error(error.message || "Failed to remedy projects");
		},
	});
};
