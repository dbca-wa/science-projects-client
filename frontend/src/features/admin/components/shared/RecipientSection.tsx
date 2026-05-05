import { useMemo } from "react";
import { Copy, X } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { toast } from "sonner";

export interface RecipientUser {
	pk: number;
	name: string;
	email: string;
}

interface RecipientSectionProps {
	title: string;
	users: RecipientUser[];
	excludedUserIds: number[];
	onExcludeUser: (userId: number) => void;
	onRestoreUser: (userId: number) => void;
}

/**
 * Displays a single recipient group with user list, copy button,
 * and exclude/restore functionality.
 */
export const RecipientSection = ({
	title,
	users,
	excludedUserIds,
	onExcludeUser,
	onRestoreUser,
}: RecipientSectionProps) => {
	const excludedSet = useMemo(
		() => new Set(excludedUserIds),
		[excludedUserIds]
	);

	const sortedUsers = useMemo(
		() => [...users].sort((a, b) => a.name.localeCompare(b.name)),
		[users]
	);

	const visibleUsers = useMemo(
		() => sortedUsers.filter((u) => !excludedSet.has(u.pk)),
		[sortedUsers, excludedSet]
	);

	const excludedUsers = useMemo(
		() => sortedUsers.filter((u) => excludedSet.has(u.pk)),
		[sortedUsers, excludedSet]
	);

	const copyEmails = () => {
		const emails = visibleUsers.map((u) => u.email).join("; ");
		navigator.clipboard.writeText(emails).then(() => {
			toast.success(
				`${visibleUsers.length} ${title.toLowerCase()} email${visibleUsers.length !== 1 ? "s" : ""} copied`
			);
		});
	};

	if (users.length === 0) return null;

	return (
		<div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4">
			<div className="flex items-center justify-between mb-3">
				<span className="text-sm font-medium">
					{title} ({visibleUsers.length})
				</span>
				<Button
					type="button"
					variant="ghost"
					size="sm"
					className="h-7 gap-1.5 text-xs text-muted-foreground hover:text-foreground"
					onClick={copyEmails}
				>
					<Copy className="size-3" aria-hidden="true" />
					Copy Emails
				</Button>
			</div>

			<ul className="space-y-1 max-h-64 overflow-y-auto text-sm" role="list">
				{visibleUsers.map((u) => (
					<li
						key={u.pk}
						className="flex items-center justify-between gap-2 group py-0.5"
					>
						<div className="min-w-0 flex-1">
							<span className="block truncate text-foreground">{u.name}</span>
							<span className="block truncate text-xs text-muted-foreground">
								{u.email}
							</span>
						</div>
						<Button
							type="button"
							variant="ghost"
							size="sm"
							className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive shrink-0"
							onClick={() => onExcludeUser(u.pk)}
							aria-label={`Remove ${u.name} from recipients`}
						>
							<X className="size-3.5" />
						</Button>
					</li>
				))}
			</ul>

			{/* Excluded users with restore option */}
			{excludedUsers.length > 0 && (
				<div className="mt-3 border-t pt-3">
					<p className="text-xs text-muted-foreground mb-1">
						Not Included ({excludedUsers.length})
					</p>
					<ul
						className="space-y-1 max-h-24 overflow-y-auto text-sm"
						role="list"
					>
						{excludedUsers.map((u) => (
							<li
								key={u.pk}
								className="flex items-center justify-between gap-2 opacity-50"
							>
								<span className="block truncate text-foreground line-through min-w-0 flex-1">
									{u.name}
								</span>
								<Button
									type="button"
									variant="ghost"
									size="sm"
									className="h-6 text-xs text-muted-foreground hover:text-foreground shrink-0"
									onClick={() => onRestoreUser(u.pk)}
									aria-label={`Restore ${u.name} to recipients`}
								>
									Undo
								</Button>
							</li>
						))}
					</ul>
				</div>
			)}
		</div>
	);
};
