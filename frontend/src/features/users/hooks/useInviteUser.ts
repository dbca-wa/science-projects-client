import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { inviteUser } from "../services/user.service";

/** Invite a new DBCA user to SPMS and send them a welcome email */
export const useInviteUser = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: inviteUser,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["users"] });
			toast.success("User invited to SPMS");
		},
		onError: (error: Error) => {
			toast.error(error.message || "Failed to invite user");
		},
	});
};
