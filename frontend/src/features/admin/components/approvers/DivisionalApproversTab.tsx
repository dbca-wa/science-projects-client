import { useState, useEffect, useMemo } from "react";
import {
	Loader2,
	AlertCircle,
	Pencil,
	X,
	UserCheck,
	Users,
} from "lucide-react";
import { Alert, AlertDescription } from "@/shared/components/ui/alert";
import { Button } from "@/shared/components/ui/button";
import { BaseUserSearch } from "@/shared/components/user";
import { sortDivisionsAlphabetically } from "@/shared/utils/division-filter.utils";
import {
	useDivisions,
	useUpdateKeyStakeholder,
	useUpdateApprovers,
} from "../../hooks/useDivisions";
import type { IDivision } from "../../types/admin.types";
import type { IEmailListUser } from "@/shared/types/email.types";
import type { IUserData } from "@/shared/types/user.types";

/**
 * Displays divisions with key stakeholder and approvers sections.
 * Divisions are sorted alphabetically and maintain their order after updates.
 * Directorate email list data is logged to the console for migration purposes.
 */
export const DivisionalApproversTab = () => {
	const { data: divisions = [], isLoading, error } = useDivisions();

	const sortedDivisions = useMemo(
		() => sortDivisionsAlphabetically(divisions),
		[divisions]
	);

	if (isLoading) {
		return (
			<div className="flex items-center justify-center py-12">
				<Loader2 className="size-6 animate-spin text-muted-foreground" />
				<span className="ml-2 text-muted-foreground">Loading divisions...</span>
			</div>
		);
	}

	if (error) {
		return (
			<Alert variant="destructive" className="my-4">
				<AlertCircle className="size-4" />
				<AlertDescription>
					Failed to load division data. Please try refreshing the page.
				</AlertDescription>
			</Alert>
		);
	}

	if (divisions.length === 0) {
		return (
			<p className="py-8 text-center text-muted-foreground">
				No divisions found.
			</p>
		);
	}

	return (
		<div className="space-y-6">
			{sortedDivisions.map((division: IDivision) => (
				<DivisionApproverCard key={division.id} division={division} />
			))}
		</div>
	);
};

interface DivisionApproverCardProps {
	division: IDivision;
}

/**
 * Renders a single division with key stakeholder and approvers sections.
 * Directorate email list data is console.logged for migration visibility.
 */
const DivisionApproverCard = ({ division }: DivisionApproverCardProps) => {
	useEffect(() => {
		const emailList = division.directorate_email_list ?? [];
		if (emailList.length > 0) {
			console.log(
				`[${division.name}] Directorate email list (deprecated):`,
				emailList
			);
		}
	}, [division]);

	return (
		<div className="rounded-lg border bg-card p-4">
			<h3 className="mb-4 text-lg font-semibold">{division.name}</h3>

			<div className="space-y-4">
				<KeyStakeholderSection division={division} />
				<ApproversSection division={division} />
			</div>
		</div>
	);
};

/** Builds a display name from an IUserData object */
const getUserDisplayName = (user: IUserData): string => {
	const first = user.display_first_name ?? user.first_name ?? "";
	const last = user.display_last_name ?? user.last_name ?? "";
	const full = `${first} ${last}`.trim();
	return full || user.email;
};

/**
 * Key Stakeholder section — displays the current key stakeholder with edit functionality.
 */
const KeyStakeholderSection = ({ division }: { division: IDivision }) => {
	const [isEditing, setIsEditing] = useState(false);
	const [selectedUser, setSelectedUser] = useState<IUserData | null>(null);
	const updateMutation = useUpdateKeyStakeholder();

	const ks = division.key_stakeholder;

	const handleSave = () => {
		updateMutation.mutate(
			{ divisionId: division.id, userId: selectedUser?.id ?? null },
			{
				onSuccess: () => {
					setIsEditing(false);
					setSelectedUser(null);
				},
			}
		);
	};

	const handleClear = () => {
		updateMutation.mutate(
			{ divisionId: division.id, userId: null },
			{
				onSuccess: () => {
					setIsEditing(false);
					setSelectedUser(null);
				},
			}
		);
	};

	const handleCancel = () => {
		setIsEditing(false);
		setSelectedUser(null);
	};

	return (
		<div className="rounded-md border p-3">
			<div className="mb-2 flex items-center justify-between">
				<div className="flex items-center gap-2">
					<UserCheck className="size-4 text-muted-foreground" />
					<h4 className="text-sm font-medium">Key Stakeholder</h4>
					<span className="text-xs text-muted-foreground">
						{ks ? "Assigned" : "None assigned"}
					</span>
				</div>
				{!isEditing && (
					<Button
						variant="ghost"
						size="sm"
						onClick={() => setIsEditing(true)}
						aria-label={`Edit key stakeholder for ${division.name}`}
					>
						<Pencil className="mr-1 size-3" />
						Edit
					</Button>
				)}
			</div>

			{!isEditing ? (
				ks ? (
					<div className="flex items-center gap-2 text-sm">
						<span>{ks.name}</span>
						<span className="text-muted-foreground">{ks.email}</span>
					</div>
				) : (
					<p className="text-sm text-muted-foreground">None assigned</p>
				)
			) : (
				<div className="space-y-3">
					<BaseUserSearch
						onSelect={setSelectedUser}
						onlyInternal={true}
						preselectedUserPk={ks?.id}
						placeholder="Search for a staff user..."
						label="Key Stakeholder"
					/>
					<div className="flex items-center gap-2">
						<Button
							size="sm"
							onClick={handleSave}
							disabled={updateMutation.isPending}
						>
							{updateMutation.isPending ? (
								<Loader2 className="mr-1 size-3 animate-spin" />
							) : null}
							Save
						</Button>
						{ks && (
							<Button
								variant="destructive"
								size="sm"
								onClick={handleClear}
								disabled={updateMutation.isPending}
							>
								Remove
							</Button>
						)}
						<Button variant="ghost" size="sm" onClick={handleCancel}>
							Cancel
						</Button>
					</div>
				</div>
			)}
		</div>
	);
};

/**
 * Approvers section — displays the current approvers with add/remove functionality.
 */
const ApproversSection = ({ division }: { division: IDivision }) => {
	const [isEditing, setIsEditing] = useState(false);
	const [pendingApprovers, setPendingApprovers] = useState<IEmailListUser[]>(
		[]
	);
	const updateMutation = useUpdateApprovers();

	const approvers = division.approvers ?? [];

	const handleStartEdit = () => {
		setPendingApprovers([...approvers]);
		setIsEditing(true);
	};

	const handleAddUser = (user: IUserData | null) => {
		if (!user) return;
		if (pendingApprovers.some((a) => a.id === user.id)) return;
		setPendingApprovers((prev) => [
			...prev,
			{
				id: user.id,
				name: getUserDisplayName(user),
				email: user.email,
			},
		]);
	};

	const handleRemoveUser = (userId: number) => {
		setPendingApprovers((prev) => prev.filter((a) => a.id !== userId));
	};

	const handleSave = () => {
		updateMutation.mutate(
			{
				divisionId: division.id,
				userIds: pendingApprovers.map((a) => a.id),
			},
			{
				onSuccess: () => {
					setIsEditing(false);
					setPendingApprovers([]);
				},
			}
		);
	};

	const handleCancel = () => {
		setIsEditing(false);
		setPendingApprovers([]);
	};

	const displayList = isEditing ? pendingApprovers : approvers;
	const excludeIds = pendingApprovers.map((a) => a.id);

	return (
		<div className="rounded-md border p-3">
			<div className="mb-2 flex items-center justify-between">
				<div className="flex items-center gap-2">
					<Users className="size-4 text-muted-foreground" />
					<h4 className="text-sm font-medium">Approvers</h4>
					<span className="text-xs text-muted-foreground">
						{approvers.length} approver{approvers.length !== 1 ? "s" : ""}
					</span>
				</div>
				{!isEditing && (
					<Button
						variant="ghost"
						size="sm"
						onClick={handleStartEdit}
						aria-label={`Manage approvers for ${division.name}`}
					>
						<Pencil className="mr-1 size-3" />
						Manage
					</Button>
				)}
			</div>

			{displayList.length === 0 && !isEditing ? (
				<p className="text-sm text-muted-foreground">No approvers assigned.</p>
			) : (
				<ul className="space-y-1">
					{displayList.map((approver) => (
						<li
							key={approver.id}
							className="flex items-center justify-between rounded px-2 py-1 text-sm hover:bg-muted/50"
						>
							<div className="flex items-center gap-2">
								<span>{approver.name}</span>
								<span className="text-muted-foreground">{approver.email}</span>
							</div>
							{isEditing && (
								<Button
									variant="ghost"
									size="sm"
									className="size-6 p-0"
									onClick={() => handleRemoveUser(approver.id)}
									aria-label={`Remove ${approver.name} from approvers`}
								>
									<X className="size-3" />
								</Button>
							)}
						</li>
					))}
				</ul>
			)}

			{isEditing && (
				<div className="mt-3 space-y-3">
					<BaseUserSearch
						onSelect={handleAddUser}
						onlyInternal={true}
						excludeUserIds={excludeIds}
						placeholder="Search for a staff user to add..."
						label="Add Approver"
					/>
					<div className="flex items-center gap-2">
						<Button
							size="sm"
							onClick={handleSave}
							disabled={updateMutation.isPending}
						>
							{updateMutation.isPending ? (
								<Loader2 className="mr-1 size-3 animate-spin" />
							) : null}
							Save
						</Button>
						<Button variant="ghost" size="sm" onClick={handleCancel}>
							Cancel
						</Button>
					</div>
				</div>
			)}
		</div>
	);
};
