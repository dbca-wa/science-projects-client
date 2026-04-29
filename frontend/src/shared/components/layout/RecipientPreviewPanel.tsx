import { useMemo } from "react";
import { Copy } from "lucide-react";
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
}

/**
 * Displays recipient groups in a two-column layout with copy buttons.
 * Shows total unique count and allows copying emails per group or all.
 */
export const RecipientPreviewPanel = ({
	baLeads,
	projectLeads,
	teamMembers = [],
}: RecipientPreviewPanelProps) => {
	const sortByName = (a: RecipientUser, b: RecipientUser) =>
		a.name.localeCompare(b.name);

	const sortedBaLeads = useMemo(() => [...baLeads].sort(sortByName), [baLeads]);
	const sortedProjectLeads = useMemo(
		() => [...projectLeads].sort(sortByName),
		[projectLeads]
	);
	const sortedTeamMembers = useMemo(
		() => [...teamMembers].sort(sortByName),
		[teamMembers]
	);

	const allEmails = useMemo(() => {
		const seen = new Set<string>();
		const emails: string[] = [];
		for (const u of [
			...sortedBaLeads,
			...sortedProjectLeads,
			...sortedTeamMembers,
		]) {
			if (!seen.has(u.email)) {
				seen.add(u.email);
				emails.push(u.email);
			}
		}
		return emails.sort();
	}, [sortedBaLeads, sortedProjectLeads, sortedTeamMembers]);

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
			<div className="flex items-center justify-between">
				<p className="text-sm font-medium">
					{allEmails.length} unique recipient{allEmails.length !== 1 ? "s" : ""}
				</p>
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
				{sortedBaLeads.length > 0 && (
					<div className="rounded-md border p-3">
						<div className="flex items-center justify-between mb-2">
							<span className="text-sm font-medium">
								Business Area Leads ({sortedBaLeads.length})
							</span>
							<Button
								type="button"
								variant="ghost"
								size="sm"
								className="h-6 gap-1 text-xs text-muted-foreground hover:text-foreground"
								onClick={() =>
									copyToClipboard(
										sortedBaLeads.map((u) => u.email),
										"BA Lead"
									)
								}
							>
								<Copy className="size-3" />
								Copy
							</Button>
						</div>
						<ul className="space-y-1 max-h-40 overflow-y-auto text-sm text-muted-foreground">
							{sortedBaLeads.map((u) => (
								<li key={u.pk} className="truncate" title={u.email}>
									{u.name}
								</li>
							))}
						</ul>
					</div>
				)}

				{sortedProjectLeads.length > 0 && (
					<div className="rounded-md border p-3">
						<div className="flex items-center justify-between mb-2">
							<span className="text-sm font-medium">
								Project Leads ({sortedProjectLeads.length})
							</span>
							<Button
								type="button"
								variant="ghost"
								size="sm"
								className="h-6 gap-1 text-xs text-muted-foreground hover:text-foreground"
								onClick={() =>
									copyToClipboard(
										sortedProjectLeads.map((u) => u.email),
										"Project Lead"
									)
								}
							>
								<Copy className="size-3" />
								Copy
							</Button>
						</div>
						<ul className="space-y-1 max-h-40 overflow-y-auto text-sm text-muted-foreground">
							{sortedProjectLeads.map((u) => (
								<li key={u.pk} className="truncate" title={u.email}>
									{u.name}
								</li>
							))}
						</ul>
					</div>
				)}

				{sortedTeamMembers.length > 0 && (
					<div className="rounded-md border p-3">
						<div className="flex items-center justify-between mb-2">
							<span className="text-sm font-medium">
								Team Members ({sortedTeamMembers.length})
							</span>
							<Button
								type="button"
								variant="ghost"
								size="sm"
								className="h-6 gap-1 text-xs text-muted-foreground hover:text-foreground"
								onClick={() =>
									copyToClipboard(
										sortedTeamMembers.map((u) => u.email),
										"Team Member"
									)
								}
							>
								<Copy className="size-3" />
								Copy
							</Button>
						</div>
						<ul className="space-y-1 max-h-40 overflow-y-auto text-sm text-muted-foreground">
							{sortedTeamMembers.map((u) => (
								<li key={u.pk} className="truncate" title={u.email}>
									{u.name}
								</li>
							))}
						</ul>
					</div>
				)}
			</div>
		</div>
	);
};
