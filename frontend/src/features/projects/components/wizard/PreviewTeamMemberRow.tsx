/**
 * PreviewTeamMemberRow — fetches real user data for avatar + name.
 *
 * Extracted from WizardPreviewPanel to satisfy react-refresh/only-export-components.
 */

import { useQuery } from "@tanstack/react-query";
import { Crown } from "lucide-react";
import type { IWizardTeamMember } from "@/app/stores/derived/project-wizard.store";
import { getFullUser } from "@/features/users/services/user.service";
import { getUserDisplayName } from "@/shared/utils/user.utils";
import { getImageUrl } from "@/shared/utils/image.utils";

const ROLE_LABELS: Record<string, string> = {
	research: "Research Scientist",
	supervising: "Supervising Scientist",
	technical: "Technical Officer",
	academicsuper: "Academic Supervisor",
	externalcol: "External Collaborator",
	consulted: "Consulted Peer",
	group: "Involved Group",
};

export const PreviewTeamMemberRow = ({
	member,
}: {
	member: IWizardTeamMember;
}) => {
	const { data: user } = useQuery({
		queryKey: ["users", "detail", member.userId],
		queryFn: () => getFullUser(member.userId),
		enabled: !!member.userId,
		staleTime: 5 * 60_000,
	});

	const name = user ? getUserDisplayName(user) : member.displayName;
	const avatarUrl = user?.image ? getImageUrl(user.image) : null;
	const initials = name
		.split(" ")
		.map((part) => part[0])
		.filter(Boolean)
		.slice(0, 2)
		.join("")
		.toUpperCase();

	return (
		<div className="flex items-center gap-3">
			{avatarUrl ? (
				<img
					src={avatarUrl}
					alt={name}
					width={40}
					height={40}
					className="size-10 rounded-full object-cover flex-shrink-0"
				/>
			) : (
				<div className="flex-shrink-0 size-10 rounded-full bg-muted flex items-center justify-center text-sm font-medium text-muted-foreground">
					{initials || "?"}
				</div>
			)}
			<div className="min-w-0 flex-1">
				<div className="flex items-center gap-1.5">
					<span className="text-base font-medium truncate">{name}</span>
					{member.isLeader && (
						<Crown className="h-4 w-4 text-amber-500 flex-shrink-0" />
					)}
				</div>
				<span className="text-sm text-muted-foreground">
					{ROLE_LABELS[member.role] || member.role}
				</span>
			</div>
		</div>
	);
};
