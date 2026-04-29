import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { inviteUser } from "../services/user.service";

/** Invite a new DBCA user to SPMS and send them a welcome email */
export const useInviteUser = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: inviteUser,
		onSuccess: () => {
			// Invalidate user list so the new user appears
			queryClient.invalidateQueries({ queryKey: ["users"] });
			// Invalidate IT Assets search cache so the user shows as
			// "Already invited" or "Already in SPMS" on the next search
			queryClient.invalidateQueries({ queryKey: ["it-assets-search"] });
		},
		onError: (error: Error) => {
			toast.error(error.message || "Failed to invite user");
		},
	});
};
