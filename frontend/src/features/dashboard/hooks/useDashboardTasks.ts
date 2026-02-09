import { useQuery } from "@tanstack/react-query";
import {
	getDocumentTasks,
	getEndorsementTasks,
	getMyProjects,
	getAdminTasks,
} from "../services/dashboard.endpoints";
import { STALE_TIME } from "@/shared/constants";

export const dashboardKeys = {
	documentTasks: ["dashboard", "documentTasks"] as const,
	endorsementTasks: ["dashboard", "endorsementTasks"] as const,
	myProjects: ["dashboard", "myProjects"] as const,
	adminTasks: ["dashboard", "adminTasks"] as const,
	caretakerTasks: (userId: number) => ["dashboard", "caretakerTasks", userId] as const,
};

export const useDocumentTasks = (enabled = true) => {
	return useQuery({
		queryKey: dashboardKeys.documentTasks,
		queryFn: getDocumentTasks,
		staleTime: STALE_TIME.SHORT,
		refetchOnWindowFocus: true,
		refetchOnReconnect: true,
		enabled,
	});
};

export const useEndorsementTasks = (enabled = true) => {
	return useQuery({
		queryKey: dashboardKeys.endorsementTasks,
		queryFn: getEndorsementTasks,
		staleTime: STALE_TIME.SHORT,
		refetchOnWindowFocus: true,
		refetchOnReconnect: true,
		enabled,
	});
};

export const useMyProjects = () => {
	return useQuery({
		queryKey: dashboardKeys.myProjects,
		queryFn: getMyProjects,
		staleTime: STALE_TIME.MEDIUM,
		refetchOnWindowFocus: true,
		refetchOnReconnect: true,
	});
};

export const useAdminTasks = (enabled = true) => {
	return useQuery({
		queryKey: dashboardKeys.adminTasks,
		queryFn: getAdminTasks,
		staleTime: STALE_TIME.SHORT,
		refetchOnWindowFocus: true,
		refetchOnReconnect: true,
		enabled,
	});
};
