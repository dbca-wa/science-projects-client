import { useMemo } from "react";
import { Copy, Undo2, UserX } from "lucide-react";
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
	/** Optional: batch-exclude all users in this section. */
	onExcludeAll?: (userIds: number[]) => void;
	/** Optional: batch-restore all excluded users in this section. */
	onRestoreAll?: (userIds: number[]) => void;
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
	onExcludeAll,
	onRestoreAll,
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

	const handleDeselectAll = () => {
		if (!onExcludeAll || visibleUsers.length === 0) return;
		onExcludeAll(visibleUsers.map((u) => u.pk));
	};

	const handleRestoreAll = () => {
		if (!onRestoreAll || excludedUsers.length === 0) return;
		onRestoreAll(excludedUsers.map((u) => u.pk));
	};

	if (users.length === 0) return null;

	const hasExcluded = excludedUsers.length > 0;
	const hasVisible = visibleUsers.length > 0;

	return (
		<div className="flex flex-col rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-hidden">
			{/* Header: title and recipient count */}
			<div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/40">
				<div className="flex items-baseline justify-between gap-2">
					<span className="text-sm font-semibold truncate">{title}</span>
					<span className="text-xs font-medium text-muted-foreground shrink-0">
						{visibleUsers.length} of {users.length}
					</span>
				</div>
			</div>

			{/* Included recipients */}
			<ul
				className="flex-1 space-y-1 max-h-64 overflow-y-auto px-4 py-3 text-sm"
				role="list"
			>
				{hasVisible ? (
					visibleUsers.map((u) => (
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
								className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 focus-visible:opacity-100 text-muted-foreground hover:text-destructive hover:bg-red-50 dark:hover:bg-red-900/20 shrink-0"
								onClick={() => onExcludeUser(u.pk)}
								aria-label={`Remove ${u.name} from recipients`}
							>
								<UserX className="size-3.5" aria-hidden="true" />
							</Button>
						</li>
					))
				) : (
					<li className="text-xs italic text-muted-foreground py-2 text-center">
						All recipients deselected
					</li>
				)}
			</ul>

			{/* Excluded recipients (shown only when one or more is excluded) */}
			{hasExcluded && (
				<div className="border-t border-gray-200 dark:border-gray-700 px-4 py-3 bg-red-50/40 dark:bg-red-950/10">
					<p className="text-xs font-medium text-red-700 dark:text-red-400 mb-1.5">
						Not Included ({excludedUsers.length})
					</p>
					<ul
						className="space-y-1 max-h-24 overflow-y-auto text-sm"
						role="list"
					>
						{excludedUsers.map((u) => (
							<li
								key={u.pk}
								className="flex items-center justify-between gap-2"
							>
								<span className="block truncate text-foreground/60 line-through min-w-0 flex-1">
									{u.name}
								</span>
								<Button
									type="button"
									variant="ghost"
									size="sm"
									className="h-6 gap-1 px-2 text-xs text-emerald-700 hover:text-emerald-800 hover:bg-emerald-100 dark:text-emerald-400 dark:hover:text-emerald-300 dark:hover:bg-emerald-900/30 shrink-0"
									onClick={() => onRestoreUser(u.pk)}
									aria-label={`Restore ${u.name} to recipients`}
								>
									<Undo2 className="size-3" aria-hidden="true" />
									Undo
								</Button>
							</li>
						))}
					</ul>
				</div>
			)}

			{/* Footer actions: deselect/restore on the left, copy on the right */}
			<div className="flex items-center justify-between gap-2 border-t border-gray-200 dark:border-gray-700 px-3 py-2 bg-gray-50 dark:bg-gray-900/40">
				<div className="flex items-center gap-1">
					{onExcludeAll && hasVisible && (
						<Button
							type="button"
							variant="ghost"
							size="sm"
							className="h-7 gap-1.5 text-xs text-red-700 hover:text-red-800 hover:bg-red-100 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/30"
							onClick={handleDeselectAll}
							aria-label={`Deselect all ${title.toLowerCase()}`}
						>
							<UserX className="size-3" aria-hidden="true" />
							Deselect All
						</Button>
					)}
					{onRestoreAll && hasExcluded && (
						<Button
							type="button"
							variant="ghost"
							size="sm"
							className="h-7 gap-1.5 text-xs text-emerald-700 hover:text-emerald-800 hover:bg-emerald-100 dark:text-emerald-400 dark:hover:text-emerald-300 dark:hover:bg-emerald-900/30"
							onClick={handleRestoreAll}
							aria-label={`Restore all ${title.toLowerCase()}`}
						>
							<Undo2 className="size-3" aria-hidden="true" />
							Restore All
						</Button>
					)}
				</div>
				<Button
					type="button"
					variant="ghost"
					size="sm"
					className="h-7 gap-1.5 text-xs text-blue-700 hover:text-blue-800 hover:bg-blue-100 dark:text-blue-400 dark:hover:text-blue-300 dark:hover:bg-blue-900/30 shrink-0"
					onClick={copyEmails}
					disabled={!hasVisible}
				>
					<Copy className="size-3" aria-hidden="true" />
					Copy Emails
				</Button>
			</div>
		</div>
	);
};
