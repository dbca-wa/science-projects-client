import { UserLink } from "@/shared/components/user";
import { useUserDetail } from "@/features/users/hooks";
import { getUserDisplayName } from "@/shared/utils/user.utils";

interface UserIdCellProps {
	userId: number | null | undefined;
}

/**
 * Renders a clickable user name that opens the user info panel.
 * Fetches user data by ID and displays a UserLink when loaded.
 */
export function UserIdCell({ userId }: UserIdCellProps) {
	const { data: user } = useUserDetail(userId ?? undefined);

	if (userId == null) return <span>—</span>;
	if (!user) return <span className="text-muted-foreground">Loading...</span>;

	return <UserLink userId={userId} displayName={getUserDisplayName(user)} />;
}
