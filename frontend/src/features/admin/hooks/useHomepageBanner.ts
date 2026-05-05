import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/shared/services/api/client.service";
import { toast } from "sonner";

interface HomepageBannerData {
	show_homepage_message: boolean;
	homepage_message: string | null;
}

/** Fetch the current homepage banner settings */
export const useHomepageBanner = () => {
	return useQuery({
		queryKey: ["admin", "homepage-banner"],
		queryFn: () =>
			apiClient.get<HomepageBannerData>("adminoptions/homepage-banner"),
		staleTime: 60_000,
	});
};

interface UpdateBannerPayload {
	show_homepage_message: boolean;
	homepage_message: string;
}

/** Update the homepage banner settings (superuser only) */
export const useUpdateHomepageBanner = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (data: UpdateBannerPayload) =>
			apiClient.put("adminoptions/homepage-banner", data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["admin", "homepage-banner"] });
			toast.success("Banner settings saved");
		},
		onError: (error: Error) => {
			toast.error(error.message || "Failed to save banner settings");
		},
	});
};
