import { useQuery } from "@tanstack/react-query";
import {
	getDocumentTasks,
	getEndorsementTasks,
	getMyProjects,
	getAdminTasks,
} from "../services/dashboard.endpoints";

export const dashboardKeys = {
	documentTasks: ["dashboard", "documentTasks"] as const,
	endorsementTasks: ["dashboard", "endorsementTasks"] as const,
	myProjects: ["dashboard", "myProjects"] as const,
	adminTasks: ["dashboard", "adminTasks"] as const,
};

export const useDocumentTasks = () => {
	return useQuery({
		queryKey: dashboardKeys.documentTasks,
		queryFn: getDocumentTasks,
		staleTime: 2 * 60_000,
		refetchOnWindowFocus: true,
		refetchOnReconnect: true,
	});
};

export const useEndorsementTasks = () => {
	return useQuery({
		queryKey: dashboardKeys.endorsementTasks,
		queryFn: getEndorsementTasks,
		staleTime: 2 * 60_000,
		refetchOnWindowFocus: true,
		refetchOnReconnect: true,
	});
};

export const useMyProjects = () => {
	return useQuery({
		queryKey: dashboardKeys.myProjects,
		queryFn: getMyProjects,
		staleTime: 5 * 60_000,
		refetchOnWindowFocus: true,
		refetchOnReconnect: true,
	});
};

export const useAdminTasks = () => {
	return useQuery({
		queryKey: dashboardKeys.adminTasks,
		queryFn: getAdminTasks,
		staleTime: 2 * 60_000,
		refetchOnWindowFocus: true,
		refetchOnReconnect: true,
	});
};
