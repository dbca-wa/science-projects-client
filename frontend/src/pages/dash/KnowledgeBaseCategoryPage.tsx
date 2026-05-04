import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router";
import { observer } from "mobx-react-lite";
import { useAuthStore } from "@/app/stores/store-context";
import { PageTransition } from "@/shared/components/PageTransition";
import { useDocumentTitle } from "@/shared/hooks/useDocumentTitle";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { Alert, AlertDescription } from "@/shared/components/ui/alert";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/shared/components/ui/dialog";
import {
	AlertCircle,
	ArrowLeft,
	Pencil,
	Search,
	X,
	Plus,
	Loader2,
	Trash2,
} from "lucide-react";
import { KBArticleSections } from "@/features/guide/components/KBArticleSections";
import {
	useGuideSections,
	useCreateContentField,
	useUpdateGuideSection,
	useDeleteGuideSection,
} from "@/features/guide/hooks/useKnowledgeBase";
import { toast } from "sonner";
import { getIconComponent } from "@/features/guide/utils/icon.utils";

const KnowledgeBaseCategoryPage = observer(() => {
	const { categorySlug } = useParams<{ categorySlug: string }>();
	const navigate = useNavigate();
	const location = useLocation();
	const authStore = useAuthStore();
	const { data: sections, isLoading, error } = useGuideSections();
	const [editAll, setEditAll] = useState(false);
	const [searchQuery, setSearchQuery] = useState("");
	const createField = useCreateContentField();
	const updateSection = useUpdateGuideSection();
	const deleteSection = useDeleteGuideSection();

	// Inline editing state for section metadata
	const [editingTitle, setEditingTitle] = useState(false);
	const [editTitle, setEditTitle] = useState("");
	const [editingIcon, setEditingIcon] = useState(false);
	const [editIcon, setEditIcon] = useState("");
	const [editingDescription, setEditingDescription] = useState(false);
	const [editDescription, setEditDescription] = useState("");
	const [editingSlug, setEditingSlug] = useState(false);
	const [editSlug, setEditSlug] = useState("");
	const [slugError, setSlugError] = useState("");
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

	const section = sections?.find((s) => s.id === categorySlug);

	useDocumentTitle(section?.title ?? "Knowledge Base");

	// Scroll to article if URL has a hash fragment (e.g. #article-xxx from search)
	useEffect(() => {
		if (!section || isLoading) return;
		const hash = location.hash;
		if (!hash) return;

		const timer = setTimeout(() => {
			const el = document.getElementById(hash.slice(1));
			if (el) {
				el.scrollIntoView({ behavior: "smooth", block: "start" });
			}
		}, 300); // Wait for articles to render

		return () => clearTimeout(timer);
	}, [section, isLoading, location.hash]);

	if (isLoading) {
		return (
			<PageTransition>
				<div className="w-full space-y-6">
					<Skeleton className="h-8 w-48" />
					<Skeleton className="h-6 w-96" />
					<div className="space-y-3">
						{Array.from({ length: 4 }).map((_, i) => (
							<Skeleton key={i} className="h-14 w-full rounded-lg" />
						))}
					</div>
				</div>
			</PageTransition>
		);
	}

	if (error) {
		return (
			<PageTransition>
				<div className="w-full">
					<Alert variant="destructive">
						<AlertCircle className="h-4 w-4" />
						<AlertDescription>
							Failed to load category. Please try again later.
						</AlertDescription>
					</Alert>
				</div>
			</PageTransition>
		);
	}

	if (!section) {
		return (
			<PageTransition>
				<div className="w-full space-y-4">
					<button
						onClick={() => navigate("/guide")}
						className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted/60 hover:bg-muted transition-colors cursor-pointer"
						aria-label="Back to Knowledge Base"
					>
						<ArrowLeft className="h-4 w-4" />
					</button>
					<div className="py-12 text-center text-muted-foreground">
						<p>Category not found.</p>
					</div>
				</div>
			</PageTransition>
		);
	}

	const Icon = getIconComponent(section.icon);

	/** Validate a slug: lowercase alphanumeric + hyphens, no leading/trailing hyphens */
	const isValidSlug = (slug: string): boolean =>
		/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug);

	const handleSaveTitle = () => {
		const trimmed = editTitle.trim();
		if (!trimmed) {
			toast.error("Title cannot be empty");
			return;
		}
		updateSection.mutate(
			{ id: section.id, data: { title: trimmed } },
			{
				onSuccess: () => {
					toast.success("Section title updated");
					setEditingTitle(false);
				},
			}
		);
	};

	const handleSaveIcon = () => {
		const trimmed = editIcon.trim();
		if (!trimmed) {
			toast.error("Icon name cannot be empty");
			return;
		}
		updateSection.mutate(
			{ id: section.id, data: { icon: trimmed } },
			{
				onSuccess: () => {
					toast.success("Section icon updated");
					setEditingIcon(false);
				},
			}
		);
	};

	const handleSaveDescription = () => {
		updateSection.mutate(
			{ id: section.id, data: { description: editDescription.trim() } },
			{
				onSuccess: () => {
					toast.success("Section description updated");
					setEditingDescription(false);
				},
			}
		);
	};

	const handleSaveSlug = () => {
		const trimmed = editSlug.trim().toLowerCase();
		if (!trimmed) {
			setSlugError("Slug cannot be empty");
			return;
		}
		if (!isValidSlug(trimmed)) {
			setSlugError("Slug must be lowercase alphanumeric with hyphens only");
			return;
		}
		if (trimmed !== section.id && sections?.some((s) => s.id === trimmed)) {
			setSlugError("A section with this slug already exists");
			return;
		}
		if (trimmed === section.id) {
			setEditingSlug(false);
			return;
		}
		updateSection.mutate(
			{ id: section.id, data: { id: trimmed } },
			{
				onSuccess: () => {
					toast.success("Section slug updated");
					setEditingSlug(false);
					navigate(`/guide/${trimmed}`, { replace: true });
				},
			}
		);
	};

	const handleDeleteSection = () => {
		deleteSection.mutate(section.id, {
			onSuccess: () => {
				toast.success("Section deleted");
				setDeleteDialogOpen(false);
				navigate("/guide");
			},
		});
	};

	return (
		<PageTransition>
			<div className="w-full space-y-6">
				{/* Hero header with back button and search integrated */}
				<div
					className="rounded-xl border shadow-sm p-6 sm:p-8"
					style={{
						background: `linear-gradient(135deg, #2A609608 0%, #01A7B208 50%, #1E545608 100%)`,
						borderColor: `#2A609620`,
					}}
				>
					<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
						<div className="flex items-center gap-4">
							{/* Icon — editable in edit mode */}
							{editAll && authStore.isSuperuser && editingIcon ? (
								<div className="flex flex-col gap-1">
									<Input
										value={editIcon}
										onChange={(e) => setEditIcon(e.target.value)}
										onBlur={handleSaveIcon}
										onKeyDown={(e) => {
											if (e.key === "Enter") handleSaveIcon();
											if (e.key === "Escape") setEditingIcon(false);
										}}
										className="h-8 w-32 text-xs"
										placeholder="lucide icon name"
										autoFocus
									/>
								</div>
							) : (
								<div
									className={`flex h-14 w-14 min-h-14 min-w-14 flex-shrink-0 items-center justify-center rounded-xl shadow-sm ${
										editAll && authStore.isSuperuser
											? "cursor-pointer hover:opacity-80 transition-opacity"
											: ""
									}`}
									style={{
										background: `linear-gradient(135deg, #2A6096, #01A7B2)`,
										color: "white",
									}}
									onClick={() => {
										if (editAll && authStore.isSuperuser) {
											setEditIcon(section.icon);
											setEditingIcon(true);
										}
									}}
									title={
										editAll && authStore.isSuperuser
											? `Click to edit icon (current: ${section.icon})`
											: undefined
									}
								>
									<Icon className="h-7 w-7" />
								</div>
							)}
							<div className="flex-1 min-w-0">
								{/* Title — editable in edit mode */}
								{editAll && authStore.isSuperuser && editingTitle ? (
									<Input
										value={editTitle}
										onChange={(e) => setEditTitle(e.target.value)}
										onBlur={handleSaveTitle}
										onKeyDown={(e) => {
											if (e.key === "Enter") handleSaveTitle();
											if (e.key === "Escape") setEditingTitle(false);
										}}
										className="text-2xl font-bold h-auto py-1"
										style={{ color: "#2A6096" }}
										autoFocus
									/>
								) : (
									<h1
										className={`text-3xl font-bold tracking-tight ${
											editAll && authStore.isSuperuser
												? "cursor-pointer hover:opacity-70 transition-opacity"
												: ""
										}`}
										style={{ color: "#2A6096" }}
										onClick={() => {
											if (editAll && authStore.isSuperuser) {
												setEditTitle(section.title);
												setEditingTitle(true);
											}
										}}
										title={
											editAll && authStore.isSuperuser
												? "Click to edit title"
												: undefined
										}
									>
										{section.title}
									</h1>
								)}
								{/* Description — editable in edit mode */}
								{editAll && authStore.isSuperuser && editingDescription ? (
									<Input
										value={editDescription}
										onChange={(e) => setEditDescription(e.target.value)}
										onBlur={handleSaveDescription}
										onKeyDown={(e) => {
											if (e.key === "Enter") handleSaveDescription();
											if (e.key === "Escape") setEditingDescription(false);
										}}
										className="text-sm mt-1"
										placeholder="Section description"
										autoFocus
									/>
								) : section.description ? (
									<p
										className={`text-muted-foreground mt-1 ${
											editAll && authStore.isSuperuser
												? "cursor-pointer hover:opacity-70 transition-opacity"
												: ""
										}`}
										onClick={() => {
											if (editAll && authStore.isSuperuser) {
												setEditDescription(section.description);
												setEditingDescription(true);
											}
										}}
										title={
											editAll && authStore.isSuperuser
												? "Click to edit description"
												: undefined
										}
									>
										{section.description}
									</p>
								) : editAll && authStore.isSuperuser ? (
									<p
										className="text-muted-foreground/50 mt-1 italic cursor-pointer hover:text-muted-foreground transition-colors"
										onClick={() => {
											setEditDescription("");
											setEditingDescription(true);
										}}
									>
										Click to add a description...
									</p>
								) : null}
							</div>
						</div>
						{authStore.isSuperuser && (
							<div className="flex items-center gap-2 flex-shrink-0">
								{editAll && (
									<>
										<Button
											variant="outline"
											size="sm"
											className="gap-1.5"
											onClick={() => {
												const fieldKey = `${section.id}-article-${Date.now()}`;
												createField.mutate(
													{
														field_key: fieldKey,
														title: "New Article",
														description: "",
														section: section.id,
														order: section.content_fields.length,
													},
													{ onSuccess: () => toast.success("Article added") }
												);
											}}
											disabled={createField.isPending}
										>
											{createField.isPending ? (
												<Loader2 className="h-4 w-4 animate-spin" />
											) : (
												<Plus className="h-4 w-4" />
											)}
											Add Article
										</Button>
										<Button
											variant="outline"
											size="sm"
											className="gap-1.5 text-destructive border-destructive/30 hover:bg-destructive/10"
											onClick={() => setDeleteDialogOpen(true)}
										>
											<Trash2 className="h-4 w-4" />
											Delete Section
										</Button>
									</>
								)}
								<Button
									variant={editAll ? "default" : "outline"}
									size="sm"
									className="gap-1.5"
									onClick={() => setEditAll(!editAll)}
									style={editAll ? { backgroundColor: "#2A6096" } : undefined}
								>
									<Pencil className="h-4 w-4" />
									{editAll ? "Done Editing" : "Edit All"}
								</Button>
							</div>
						)}
					</div>

					{/* Slug editor — visible in edit mode */}
					{editAll && authStore.isSuperuser && (
						<div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
							<span className="font-medium">Slug:</span>
							{editingSlug ? (
								<div className="flex items-center gap-2">
									<Input
										value={editSlug}
										onChange={(e) => {
											setEditSlug(e.target.value.toLowerCase());
											setSlugError("");
										}}
										onKeyDown={(e) => {
											if (e.key === "Enter") handleSaveSlug();
											if (e.key === "Escape") setEditingSlug(false);
										}}
										className="h-7 w-48 text-xs font-mono"
										autoFocus
									/>
									<Button
										variant="ghost"
										size="sm"
										className="h-7 text-xs"
										onClick={handleSaveSlug}
									>
										Save
									</Button>
									<Button
										variant="ghost"
										size="sm"
										className="h-7 text-xs"
										onClick={() => setEditingSlug(false)}
									>
										Cancel
									</Button>
									{slugError && (
										<span className="text-destructive text-xs">
											{slugError}
										</span>
									)}
								</div>
							) : (
								<button
									className="font-mono bg-muted px-1.5 py-0.5 rounded hover:bg-muted/80 cursor-pointer transition-colors"
									onClick={() => {
										setEditSlug(section.id);
										setSlugError("");
										setEditingSlug(true);
									}}
									title="Click to edit slug"
								>
									{section.id}
								</button>
							)}
						</div>
					)}

					{/* Back + Search row inside banner */}
					<div
						className="flex items-center gap-3 mt-5 pt-5 border-t"
						style={{ borderColor: "#2A609615" }}
					>
						<button
							onClick={() => navigate("/guide")}
							className="flex h-10 w-10 min-w-10 items-center justify-center rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer shadow-sm"
							aria-label="Back to Knowledge Base"
						>
							<ArrowLeft className="h-4 w-4" />
						</button>
						<div className="relative flex-1">
							<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
							<Input
								type="text"
								placeholder="Search within this section..."
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
								className="pl-10 text-sm h-10"
								variant="search"
							/>
							{searchQuery && (
								<button
									onClick={() => setSearchQuery("")}
									className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
									aria-label="Clear search"
								>
									<X className="h-4 w-4" />
								</button>
							)}
						</div>
					</div>
				</div>

				{/* Articles + TOC */}
				<KBArticleSections
					key={editAll ? "editing" : "viewing"}
					articles={section.content_fields}
					editAll={editAll}
					searchQuery={searchQuery}
					sectionId={section.id}
				/>

				{/* Delete section confirmation dialog */}
				<Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
					<DialogContent>
						<DialogHeader>
							<DialogTitle>Delete Section</DialogTitle>
							<DialogDescription>
								Are you sure you want to delete &ldquo;{section.title}&rdquo;?
								This will also delete all {section.content_fields.length}{" "}
								article
								{section.content_fields.length !== 1 ? "s" : ""} in this
								section. This action cannot be undone.
							</DialogDescription>
						</DialogHeader>
						<DialogFooter>
							<Button
								variant="outline"
								onClick={() => setDeleteDialogOpen(false)}
							>
								Cancel
							</Button>
							<Button
								variant="destructive"
								onClick={handleDeleteSection}
								disabled={deleteSection.isPending}
							>
								{deleteSection.isPending ? (
									<Loader2 className="h-4 w-4 animate-spin mr-2" />
								) : null}
								Delete Section
							</Button>
						</DialogFooter>
					</DialogContent>
				</Dialog>
			</div>
		</PageTransition>
	);
});

export default KnowledgeBaseCategoryPage;
