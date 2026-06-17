import { useState, useMemo } from "react";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { Loader2, X, AlertCircle, Merge } from "lucide-react";
import { useDocumentTitle } from "@/shared/hooks/useDocumentTitle";
import { Button } from "@/shared/components/ui/button";
import {
	Tabs,
	TabsList,
	TabsTrigger,
	TabsContent,
} from "@/shared/components/ui/tabs";
import { Badge } from "@/shared/components/ui/badge";
import { UserCombobox } from "@/shared/components/user";
import { useMergeUsers } from "@/features/admin/hooks/useMergeUsers";
import { AutoBreadcrumb } from "@/shared/components/navigation/AutoBreadcrumb";
import { apiClient } from "@/shared/services/api/client.service";
import type { IUserData } from "@/shared/types/user.types";

/**
 * MergeUsersPage — allows superusers to merge duplicate user accounts.
 * Accessible from Manage → Organisation → Merge Users.
 */
const MergeUsersPage = () => {
	useDocumentTitle("Merge Users");

	const [primaryUserId, setPrimaryUserId] = useState<number | null>(null);
	const [secondaryUserIds, setSecondaryUserIds] = useState<number[]>([]);

	const mergeMutation = useMergeUsers();

	const hasDuplicateError = useMemo(() => {
		if (!primaryUserId) return false;
		return secondaryUserIds.includes(primaryUserId);
	}, [primaryUserId, secondaryUserIds]);

	const canSubmit =
		primaryUserId !== null &&
		secondaryUserIds.length > 0 &&
		!hasDuplicateError &&
		!mergeMutation.isPending;

	const handleAddSecondary = (userId: number | null) => {
		if (!userId || secondaryUserIds.includes(userId)) return;
		setSecondaryUserIds((prev) => [...prev, userId]);
	};

	const handleRemoveSecondary = (userId: number) => {
		setSecondaryUserIds((prev) => prev.filter((id) => id !== userId));
	};

	const handleSubmit = () => {
		if (!canSubmit || !primaryUserId) return;
		mergeMutation.mutate(
			{ primaryUser: primaryUserId, secondaryUsers: secondaryUserIds },
			{
				onSuccess: () => {
					toast.success("Users merged successfully");
					setPrimaryUserId(null);
					setSecondaryUserIds([]);
				},
				onError: (error: Error) => {
					toast.error(error.message || "Failed to merge users");
				},
			}
		);
	};

	return (
		<div className="space-y-6">
			<AutoBreadcrumb />
			<h1 className="text-2xl font-bold">Merge Users</h1>
			<p className="text-sm text-muted-foreground">
				Merge duplicate user accounts by transferring all project memberships,
				comments, and documents from secondary accounts into a primary account.
				Secondary accounts are deleted after the merge.
			</p>
			<p className="text-sm text-muted-foreground">
				Users can also request merges themselves from another user's profile
				("Merge with My Account"), which creates a pending admin task for
				approval on the Dashboard.
			</p>

			{/* Primary User */}
			<div className="space-y-2">
				<UserCombobox
					label="Primary User (account to keep)"
					placeholder="Search for the primary user..."
					value={primaryUserId}
					onValueChange={setPrimaryUserId}
					isRequired
					showIcon
					wrapperClassName="max-w-md"
				/>
			</div>

			{/* Secondary Users */}
			<div className="space-y-2">
				<UserCombobox
					label="Secondary User (account to merge)"
					placeholder="Search and add users to merge..."
					value={null}
					onValueChange={handleAddSecondary}
					excludeUserIds={[
						...(primaryUserId ? [primaryUserId] : []),
						...secondaryUserIds,
					]}
					showIcon
					wrapperClassName="max-w-md"
				/>

				{secondaryUserIds.length > 0 && (
					<div className="flex flex-wrap gap-2 mt-2">
						{secondaryUserIds.map((userId) => (
							<SecondaryUserChip
								key={userId}
								userId={userId}
								onRemove={() => handleRemoveSecondary(userId)}
							/>
						))}
					</div>
				)}
			</div>

			{/* Validation Error */}
			{hasDuplicateError && (
				<div className="flex items-center gap-2 text-sm text-destructive">
					<AlertCircle className="size-4 shrink-0" />
					<span>
						The primary user cannot also be a secondary user. Remove the
						duplicate.
					</span>
				</div>
			)}

			{/* Preview */}
			{primaryUserId && secondaryUserIds.length > 0 && !hasDuplicateError && (
				<MergePreview secondaryUserIds={secondaryUserIds} />
			)}

			{/* Submit */}
			<Button
				onClick={handleSubmit}
				disabled={!canSubmit}
				className="bg-red-600 hover:bg-red-500 text-white"
			>
				{mergeMutation.isPending ? (
					<>
						<Loader2 className="mr-2 size-4 animate-spin" />
						Merging...
					</>
				) : (
					<>
						<Merge className="mr-2 size-4" />
						Merge Users
					</>
				)}
			</Button>
		</div>
	);
};

/** Chip displaying a selected secondary user with their name */
const SecondaryUserChip = ({
	userId,
	onRemove,
}: {
	userId: number;
	onRemove: () => void;
}) => {
	const { data: user } = useQuery({
		queryKey: ["users", "detail", userId],
		queryFn: () => apiClient.get<IUserData>(`users/${userId}`),
		staleTime: 5 * 60_000,
	});

	const displayName = user
		? `${user.display_first_name || user.first_name || ""} ${user.display_last_name || user.last_name || ""}`.trim()
		: "Loading...";

	return (
		<div className="inline-flex items-center gap-2 rounded-md border bg-muted px-3 py-1.5 text-sm">
			<span>
				{displayName} ({userId})
			</span>
			<button
				type="button"
				onClick={onRemove}
				className="text-muted-foreground hover:text-destructive"
				aria-label={`Remove ${displayName}`}
			>
				<X className="size-3.5" />
			</button>
		</div>
	);
};

/** Preview section with tabs for Projects / Comments / Documents */
const MergePreview = ({ secondaryUserIds }: { secondaryUserIds: number[] }) => {
	return (
		<div className="rounded-lg border p-4 space-y-4">
			<h3 className="text-sm font-semibold">Merge Preview</h3>
			<p className="text-xs text-muted-foreground">
				All data below will transfer to the primary user. The primary user
				inherits the highest role when both users share a project (supervising
				&gt; research/technical, leadership transfers).
			</p>
			<div className="space-y-4">
				{secondaryUserIds.map((userId) => (
					<UserPreviewTabs key={userId} userId={userId} />
				))}
			</div>
		</div>
	);
};

interface ProjectItem {
	id: number;
	title: string;
	role?: string;
	status?: string;
	kind?: string;
}

interface CommentItem {
	id: number;
	text: string;
	created_at: string | null;
	project_id: number | null;
	document_kind: string | null;
}

interface DocumentItem {
	id: number;
	kind: string;
	status: string;
	project_id: number;
	project_title: string;
	created_at: string | null;
}

interface PreviewStats {
	user_id: number;
	project_count: number;
	comment_count: number;
	document_count: number;
	comments: CommentItem[];
	documents: DocumentItem[];
}

/** Tabbed preview for a single secondary user */
const UserPreviewTabs = ({ userId }: { userId: number }) => {
	const { data: user } = useQuery({
		queryKey: ["users", "detail", userId],
		queryFn: () => apiClient.get<IUserData>(`users/${userId}`),
		staleTime: 5 * 60_000,
	});

	const { data: stats } = useQuery({
		queryKey: ["merge-preview-stats", userId],
		queryFn: () =>
			apiClient.get<PreviewStats>(`adminoptions/mergeusers/preview/${userId}`),
		staleTime: 2 * 60_000,
	});

	const { data: projects, isLoading: projectsLoading } = useQuery({
		queryKey: ["user-projects-preview", userId],
		queryFn: () => apiClient.get<ProjectItem[]>(`users/${userId}/projects`),
		staleTime: 2 * 60_000,
	});

	const displayName = user
		? `${user.display_first_name || user.first_name || ""} ${user.display_last_name || user.last_name || ""}`.trim()
		: `User ${userId}`;

	const stripHtml = (html: string) => {
		const div = document.createElement("div");
		div.innerHTML = html;
		return div.textContent || div.innerText || "";
	};

	const formatRole = (role?: string) => {
		if (!role) return null;
		const roleMap: Record<string, string> = {
			supervising: "Supervising Scientist",
			research: "Research Scientist",
			technical: "Technical Officer",
			externalcol: "External Collaborator",
			externalpeer: "External Peer",
			academicsuper: "Academic Supervisor",
			student: "Supervised Student",
			consulted: "Consulted Peer",
			group: "Involved Group",
		};
		return roleMap[role] || role;
	};

	const formatDocKind = (kind: string) => {
		const kindMap: Record<string, string> = {
			concept: "Concept Plan",
			projectplan: "Project Plan",
			progressreport: "Progress Report",
			studentreport: "Student Report",
			projectclosure: "Project Closure",
		};
		return kindMap[kind] || kind;
	};

	/** Map document kind to the project detail tab slug */
	const getDocTabSlug = (kind: string) => {
		const tabMap: Record<string, string> = {
			concept: "concept",
			projectplan: "project",
			progressreport: "progress",
			studentreport: "progress",
			projectclosure: "closure",
		};
		return tabMap[kind] || "overview";
	};

	return (
		<div className="rounded-md border bg-gray-50 dark:bg-gray-800/50 p-3">
			<p className="text-sm font-medium mb-2">
				{displayName}{" "}
				<span className="text-muted-foreground font-normal">({userId})</span>
			</p>

			<Tabs defaultValue="projects" className="w-full">
				<TabsList className="h-8">
					<TabsTrigger value="projects" className="text-xs px-3 h-7">
						Projects
						{stats && (
							<Badge
								variant="secondary"
								className="ml-1.5 h-4 px-1 text-[10px]"
							>
								{stats.project_count}
							</Badge>
						)}
					</TabsTrigger>
					<TabsTrigger value="comments" className="text-xs px-3 h-7">
						Comments
						{stats && (
							<Badge
								variant="secondary"
								className="ml-1.5 h-4 px-1 text-[10px]"
							>
								{stats.comment_count}
							</Badge>
						)}
					</TabsTrigger>
					<TabsTrigger value="documents" className="text-xs px-3 h-7">
						Documents
						{stats && (
							<Badge
								variant="secondary"
								className="ml-1.5 h-4 px-1 text-[10px]"
							>
								{stats.document_count}
							</Badge>
						)}
					</TabsTrigger>
				</TabsList>

				{/* Projects Tab */}
				<TabsContent value="projects" className="mt-2">
					{projectsLoading ? (
						<p className="text-xs text-muted-foreground">Loading...</p>
					) : projects && projects.length > 0 ? (
						<div className="max-h-[300px] overflow-y-auto space-y-0.5">
							{projects.map((project) => (
								<a
									key={project.id}
									href={`/projects/${project.id}/overview`}
									target="_blank"
									rel="noopener noreferrer"
									className="flex items-center justify-between gap-2 text-xs py-1.5 px-2 rounded hover:bg-white dark:hover:bg-gray-700/50 group"
								>
									<span className="truncate flex-1 text-foreground group-hover:text-blue-600 dark:group-hover:text-blue-400">
										{stripHtml(project.title) || `Project #${project.id}`}
									</span>
									{project.role && (
										<Badge
											variant="outline"
											className="shrink-0 text-[10px] h-5 px-1.5 font-normal"
										>
											{formatRole(project.role)}
										</Badge>
									)}
								</a>
							))}
						</div>
					) : (
						<p className="text-xs text-muted-foreground">No projects</p>
					)}
				</TabsContent>

				{/* Comments Tab */}
				<TabsContent value="comments" className="mt-2">
					{stats?.comments && stats.comments.length > 0 ? (
						<div className="max-h-[300px] overflow-y-auto space-y-1">
							{stats.comments.map((comment) => (
								<div
									key={comment.id}
									className="text-xs py-1.5 px-2 rounded hover:bg-white dark:hover:bg-gray-700/50 border-b border-gray-100 dark:border-gray-700 last:border-0"
								>
									<p className="text-foreground line-clamp-2">
										{stripHtml(comment.text) || "(empty comment)"}
									</p>
									<div className="flex items-center gap-2 mt-0.5">
										{comment.project_id && comment.document_kind && (
											<a
												href={`/projects/${comment.project_id}/${getDocTabSlug(comment.document_kind)}`}
												target="_blank"
												rel="noopener noreferrer"
												className="text-blue-600 dark:text-blue-400 hover:underline"
											>
												{formatDocKind(comment.document_kind)}
											</a>
										)}
										{comment.created_at && (
											<span className="text-muted-foreground">
												{new Date(comment.created_at).toLocaleDateString()}
											</span>
										)}
									</div>
								</div>
							))}
						</div>
					) : (
						<p className="text-xs text-muted-foreground">
							No comments to transfer.
						</p>
					)}
				</TabsContent>

				{/* Documents Tab */}
				<TabsContent value="documents" className="mt-2">
					{stats?.documents && stats.documents.length > 0 ? (
						<div className="max-h-[300px] overflow-y-auto space-y-0.5">
							{stats.documents.map((doc) => (
								<a
									key={doc.id}
									href={`/projects/${doc.project_id}/${getDocTabSlug(doc.kind)}`}
									target="_blank"
									rel="noopener noreferrer"
									className="flex items-center justify-between gap-2 text-xs py-1.5 px-2 rounded hover:bg-white dark:hover:bg-gray-700/50 group"
								>
									<span className="truncate flex-1 text-foreground group-hover:text-blue-600 dark:group-hover:text-blue-400">
										{formatDocKind(doc.kind)} —{" "}
										{stripHtml(doc.project_title) ||
											`Project #${doc.project_id}`}
									</span>
									<Badge
										variant="outline"
										className="shrink-0 text-[10px] h-5 px-1.5 font-normal"
									>
										{doc.status}
									</Badge>
								</a>
							))}
						</div>
					) : (
						<p className="text-xs text-muted-foreground">
							No documents to transfer.
						</p>
					)}
				</TabsContent>
			</Tabs>
		</div>
	);
};

export default MergeUsersPage;
