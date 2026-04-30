import { useMemo } from "react";
import { Copy, X } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { toast } from "sonner";

interface RecipientUser {
	pk: number;
	name: string;
	email: string;
}

interface RecipientPreviewPanelProps {
	baLeads: RecipientUser[];
	projectLeads: RecipientUser[];
	teamMembers?: RecipientUser[];
	/** User IDs excluded from the send list */
	excludedUserIds?: number[];
	/** Callback when a user is excluded (removed) from the list */
	onExcludeUser?: (userId: number) => void;
	/** Callback when a previously excluded user is restored */
	onRestoreUser?: (userId: number) => void;
}

/**
 * Displays recipient groups with summary stats, grouped sections,
 * and optional remove buttons for project leads and team members.
 * BA leads cannot be removed.
 */
export const RecipientPreviewPanel = ({
	baLeads,
	projectLeads,
	teamMembers = [],
	excludedUserIds = [],
	onExcludeUser,
	onRestoreUser,
}: RecipientPreviewPanelProps) => {
	const sortByName = (a: RecipientUser, b: RecipientUser) =>
		a.name.localeCompare(b.name);

	const excludedSet = useMemo(
		() => new Set(excludedUserIds),
		[excludedUserIds]
	);

	const sortedBaLeads = useMemo(() => [...baLeads].sort(sortByName), [baLeads]);
	const sortedProjectLeads = useMemo(
		() => [...projectLeads].sort(sortByName),
		[projectLeads]
	);
	const sortedTeamMembers = useMemo(
		() => [...teamMembers].sort(sortByName),
		[teamMembers]
	);

	// Visible (non-excluded) counts
	const visibleProjectLeads = useMemo(
		() => sortedProjectLeads.filter((u) => !excludedSet.has(u.pk)),
		[sortedProjectLeads, excludedSet]
	);
	const visibleTeamMembers = useMemo(
		() => sortedTeamMembers.filter((u) => !excludedSet.has(u.pk)),
		[sortedTeamMembers, excludedSet]
	);

	const allEmails = useMemo(() => {
		const seen = new Set<string>();
		const emails: string[] = [];
		for (const u of [
			...sortedBaLeads,
			...visibleProjectLeads,
			...visibleTeamMembers,
		]) {
			if (!seen.has(u.email)) {
				seen.add(u.email);
				emails.push(u.email);
			}
		}
		return emails.sort();
	}, [sortedBaLeads, visibleProjectLeads, visibleTeamMembers]);

	const copyToClipboard = (emails: string[], label: string) => {
		const text = emails.join("; ");
		navigator.clipboard.writeText(text).then(() => {
			toast.success(
				`${emails.length} ${label} email${emails.length !== 1 ? "s" : ""} copied`
			);
		});
	};

	if (
		baLeads.length === 0 &&
		projectLeads.length === 0 &&
		teamMembers.length === 0
	)
		return null;

	return (
		<div className="space-y-3">
			{/* Summary stats */}
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-4">
					<p className="text-sm font-medium">
						{allEmails.length} unique recipient
						{allEmails.length !== 1 ? "s" : ""}
					</p>
					<div className="flex items-center gap-3 text-xs text-muted-foreground">
						{sortedBaLeads.length > 0 && (
							<span>{sortedBaLeads.length} BA Leads</span>
						)}
						{sortedProjectLeads.length > 0 && (
							<span>
								{visibleProjectLeads.length}/{sortedProjectLeads.length} Project
								Leads
							</span>
						)}
						{sortedTeamMembers.length > 0 && (
							<span>
								{visibleTeamMembers.length}/{sortedTeamMembers.length} Team
								Members
							</span>
						)}
					</div>
				</div>
				<Button
					type="button"
					variant="outline"
					size="sm"
					className="h-7 gap-1.5 text-xs"
					onClick={() => copyToClipboard(allEmails, "recipient")}
				>
					<Copy className="size-3" />
					Copy all emails
				</Button>
			</div>

			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
				{/* BA Leads — no remove buttons */}
				{sortedBaLeads.length > 0 && (
					<RecipientGroup
						title="Business Area Leads"
						users={sortedBaLeads}
						onCopy={(emails) => copyToClipboard(emails, "BA Lead")}
					/>
				)}

				{/* Project Leads — with remove buttons */}
				{sortedProjectLeads.length > 0 && (
					<RecipientGroup
						title="Project Leads"
						users={sortedProjectLeads}
						excludedSet={excludedSet}
						onExclude={onExcludeUser}
						onRestore={onRestoreUser}
						onCopy={(emails) => copyToClipboard(emails, "Project Lead")}
					/>
				)}

				{/* Team Members — with remove buttons */}
				{sortedTeamMembers.length > 0 && (
					<RecipientGroup
						title="Team Members"
						users={sortedTeamMembers}
						excludedSet={excludedSet}
						onExclude={onExcludeUser}
						onRestore={onRestoreUser}
						onCopy={(emails) => copyToClipboard(emails, "Team Member")}
					/>
				)}
			</div>
		</div>
	);
};

/* ------------------------------------------------------------------ */
/*  RecipientGroup — renders a single group card                       */
/* ------------------------------------------------------------------ */

interface RecipientGroupProps {
	title: string;
	users: Array<{ pk: number; name: string; email: string }>;
	excludedSet?: Set<number>;
	onExclude?: (userId: number) => void;
	onRestore?: (userId: number) => void;
	onCopy: (emails: string[]) => void;
}

const RecipientGroup = ({
	title,
	users,
	excludedSet,
	onExclude,
	onRestore,
	onCopy,
}: RecipientGroupProps) => {
	const visibleUsers = excludedSet
		? users.filter((u) => !excludedSet.has(u.pk))
		: users;
	const excludedUsers = excludedSet
		? users.filter((u) => excludedSet.has(u.pk))
		: [];

	return (
		<div className="rounded-md border p-3">
			<div className="flex items-center justify-between mb-2">
				<span className="text-sm font-medium">
					{title} ({visibleUsers.length})
				</span>
				<Button
					type="button"
					variant="ghost"
					size="sm"
					className="h-6 gap-1 text-xs text-muted-foreground hover:text-foreground"
					onClick={() => onCopy(visibleUsers.map((u) => u.email))}
				>
					<Copy className="size-3" />
					Copy
				</Button>
			</div>
			<ul className="space-y-1 max-h-48 overflow-y-auto text-sm">
				{visibleUsers.map((u) => (
					<li
						key={u.pk}
						className="flex items-center justify-between gap-2 group"
					>
						<div className="min-w-0 flex-1">
							<span className="block truncate text-foreground">{u.name}</span>
							<span className="block truncate text-xs text-muted-foreground">
								{u.email}
							</span>
						</div>
						{onExclude && (
							<Button
								type="button"
								variant="ghost"
								size="sm"
								className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive shrink-0"
								onClick={() => onExclude(u.pk)}
								aria-label={`Remove ${u.name} from recipients`}
							>
								<X className="size-3.5" />
							</Button>
						)}
					</li>
				))}
			</ul>
			{/* Show excluded users with restore option */}
			{excludedUsers.length > 0 && (
				<div className="mt-2 border-t pt-2">
					<p className="text-xs text-muted-foreground mb-1">
						Excluded ({excludedUsers.length})
					</p>
					<ul className="space-y-1 max-h-24 overflow-y-auto text-sm">
						{excludedUsers.map((u) => (
							<li
								key={u.pk}
								className="flex items-center justify-between gap-2 opacity-50"
							>
								<div className="min-w-0 flex-1">
									<span className="block truncate text-foreground line-through">
										{u.name}
									</span>
								</div>
								{onRestore && (
									<Button
										type="button"
										variant="ghost"
										size="sm"
										className="h-6 text-xs text-muted-foreground hover:text-foreground shrink-0"
										onClick={() => onRestore(u.pk)}
										aria-label={`Restore ${u.name} to recipients`}
									>
										Undo
									</Button>
								)}
							</li>
						))}
					</ul>
				</div>
			)}
		</div>
	);
};
