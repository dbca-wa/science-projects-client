/* eslint-disable react-refresh/only-export-components */
import { useState, useCallback, useRef, useEffect, useMemo } from "react";
import { observer } from "mobx-react-lite";
import { useAuthStore } from "@/app/stores/store-context";
import {
	Pencil,
	Loader2,
	Save,
	X,
	Check,
	ChevronUp,
	ChevronDown,
	Trash2,
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { RichTextEditor } from "@/shared/components/editor/RichTextEditor";
import {
	useUpdateContentField,
	useCreateContentField,
	useReorderContentFields,
	useDeleteContentField,
} from "../hooks/useKnowledgeBase";
import { toast } from "sonner";
import type { IContentField } from "../types/guide.types";

/** DBCA brand colours used for knowledge base accents and headings. */
const DBCA = {
	navy: "#2A6096",
	teal: "#01A7B2",
	darkGreen: "#1E5456",
} as const;

/** Highlight matching text within a plain string, returning JSX with <mark> tags */
const HighlightedText = ({ text, query }: { text: string; query: string }) => {
	if (!query.trim()) return <>{text}</>;
	const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
	const regex = new RegExp(`(${escaped})`, "gi");
	const parts = text.split(regex);
	return (
		<>
			{parts.map((part, i) =>
				regex.test(part) ? (
					<mark
						key={i}
						style={{
							backgroundColor: "#fef08a",
							borderRadius: 2,
							padding: "0 2px",
						}}
					>
						{part}
					</mark>
				) : (
					<span key={i}>{part}</span>
				)
			)}
		</>
	);
};

/**
 * Inject <mark> highlight tags into an HTML string for search matches.
 * Only highlights text content — never modifies HTML tags or attributes.
 */
const highlightHtml = (html: string, query: string): string => {
	if (!query.trim() || !html) return html;
	const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
	const regex = new RegExp(`(${escaped})`, "gi");

	// Split HTML into tags and text segments, only highlight text segments
	return html.replace(
		/(<[^>]*>)|([^<]+)/g,
		(_match, tag: string | undefined, text: string | undefined) => {
			if (tag) return tag; // Leave HTML tags untouched
			if (text) {
				return text.replace(
					regex,
					'<mark style="background-color:#fef08a;border-radius:2px;padding:0 2px">$1</mark>'
				);
			}
			return _match;
		}
	);
};

interface KBArticleSectionsProps {
	articles: IContentField[];
	editAll?: boolean;
	searchQuery?: string;
	sectionId?: string;
}

export const KBArticleSections = observer(function KBArticleSections({
	articles,
	editAll = false,
	searchQuery: externalSearchQuery = "",
	sectionId,
}: KBArticleSectionsProps) {
	const authStore = useAuthStore();
	const isAdmin = authStore.isSuperuser;
	const searchQuery = externalSearchQuery;
	const [activeId, setActiveId] = useState<string | null>(null);
	const sectionRefs = useRef<Map<string, HTMLElement>>(new Map());
	const [showBackToTop, setShowBackToTop] = useState(false);
	const createField = useCreateContentField();
	const reorderFields = useReorderContentFields();

	const handleMoveArticle = (index: number, direction: "up" | "down") => {
		if (!sectionId) return;
		const reordered = [...articles];
		const swapIndex = direction === "up" ? index - 1 : index + 1;
		if (swapIndex < 0 || swapIndex >= reordered.length) return;
		[reordered[index], reordered[swapIndex]] = [
			reordered[swapIndex],
			reordered[index],
		];
		reorderFields.mutate({
			sectionId,
			fieldIds: reordered.map((a) => a.id),
		});
	};

	// Filter articles by search
	const filteredArticles = searchQuery.trim()
		? articles.filter((a) => {
				const q = searchQuery.toLowerCase();
				const titleMatch = (a.title ?? a.field_key).toLowerCase().includes(q);
				const contentMatch = (a.description ?? "")
					.replace(/<[^>]*>/g, "")
					.toLowerCase()
					.includes(q);
				return titleMatch || contentMatch;
			})
		: articles;

	// Intersection observer for active section tracking
	useEffect(() => {
		const scrollRoot = document.querySelector(
			".overflow-y-auto.no-scrollbar"
		) as HTMLElement | null;

		const observer = new IntersectionObserver(
			(entries) => {
				for (const entry of entries) {
					if (entry.isIntersecting) {
						setActiveId(entry.target.id);
					}
				}
			},
			{ root: scrollRoot, rootMargin: "-80px 0px -60% 0px", threshold: 0 }
		);

		sectionRefs.current.forEach((el) => observer.observe(el));
		return () => observer.disconnect();
	}, [filteredArticles]);

	// Show back-to-top after scrolling
	useEffect(() => {
		const scrollContainer =
			document.querySelector(".overflow-y-auto.no-scrollbar") ??
			document.documentElement;
		const handleScroll = () => {
			const scrollTop =
				scrollContainer instanceof HTMLElement
					? scrollContainer.scrollTop
					: window.scrollY;
			setShowBackToTop(scrollTop > 400);
		};
		scrollContainer.addEventListener("scroll", handleScroll, { passive: true });
		return () => scrollContainer.removeEventListener("scroll", handleScroll);
	}, []);

	const scrollToArticle = (id: string) => {
		const el = sectionRefs.current.get(id);
		if (el) {
			el.scrollIntoView({ behavior: "smooth", block: "start" });
		}
	};

	if (articles.length === 0) {
		return (
			<div className="rounded-lg border border-dashed p-8 text-center text-muted-foreground">
				<p>No articles in this category yet.</p>
			</div>
		);
	}

	return (
		<div className="flex gap-8">
			{/* Main content — left side */}
			<div className="flex-1 min-w-0 space-y-4">
				{/* Search results count */}
				{searchQuery.trim() && (
					<p className="text-sm text-muted-foreground" aria-live="polite">
						{filteredArticles.length === 0
							? "No articles match your search."
							: `Showing ${filteredArticles.length} of ${articles.length} articles`}
					</p>
				)}

				{/* Article sections */}
				{filteredArticles.map((article, index) => (
					<section
						key={article.id}
						id={`article-${article.id}`}
						ref={(el) => {
							if (el) sectionRefs.current.set(`article-${article.id}`, el);
						}}
						className="scroll-mt-24"
					>
						{index > 0 && (
							<div className="my-10 flex items-center gap-4">
								<div
									className="h-px flex-1"
									style={{
										background: `linear-gradient(to right, ${DBCA.teal}20, ${DBCA.navy}30, ${DBCA.teal}20)`,
									}}
								/>
							</div>
						)}
						<ArticleSection
							article={article}
							isAdmin={isAdmin}
							startEditing={editAll}
							searchQuery={searchQuery}
							index={index}
							totalArticles={filteredArticles.length}
							onMoveUp={() =>
								handleMoveArticle(articles.indexOf(article), "up")
							}
							onMoveDown={() =>
								handleMoveArticle(articles.indexOf(article), "down")
							}
						/>
					</section>
				))}

				{/* Add Article button — visible to admins in edit mode */}
				{isAdmin && editAll && sectionId && (
					<div className="mt-8 flex justify-center">
						<Button
							variant="outline"
							size="sm"
							className="gap-2 border-dashed border-2 border-blue-300 text-blue-600 hover:bg-blue-50 hover:border-blue-400 dark:border-blue-700 dark:text-blue-400 dark:hover:bg-blue-950/30"
							onClick={() => {
								const fieldKey = `${sectionId}-article-${Date.now()}`;
								createField.mutate(
									{
										field_key: fieldKey,
										title: "New Article",
										description: "",
										section: sectionId,
										order: articles.length,
									},
									{
										onSuccess: () => toast.success("Article added"),
									}
								);
							}}
							disabled={createField.isPending}
						>
							{createField.isPending ? (
								<Loader2 className="h-4 w-4 animate-spin" />
							) : (
								<span className="text-lg leading-none">+</span>
							)}
							Add Article
						</Button>
					</div>
				)}
			</div>

			{/* Sidebar — Table of Contents — RIGHT side (desktop only) */}
			<aside className="hidden lg:block w-56 flex-shrink-0">
				<nav
					className="sticky top-24 space-y-1"
					aria-label="Article navigation"
				>
					<p
						className="text-xs font-semibold uppercase tracking-wider mb-3"
						style={{ color: DBCA.navy }}
					>
						On this page
					</p>
					<div
						className="w-8 h-0.5 mb-3 rounded-full"
						style={{
							background: `linear-gradient(to right, ${DBCA.navy}, ${DBCA.teal})`,
						}}
					/>
					{articles.map((article) => {
						const isActive = activeId === `article-${article.id}`;
						const isFiltered =
							searchQuery.trim() &&
							!filteredArticles.some((a) => a.id === article.id);
						return (
							<button
								key={article.id}
								onClick={() => scrollToArticle(`article-${article.id}`)}
								className={`block w-full text-left text-sm py-1.5 px-3 rounded-md transition-all cursor-pointer truncate ${
									isFiltered
										? "text-muted-foreground/30 cursor-default"
										: isActive
											? "font-medium shadow-sm"
											: "text-muted-foreground hover:text-foreground hover:bg-muted/50"
								}`}
								style={
									isActive && !isFiltered
										? {
												backgroundColor: `${DBCA.navy}10`,
												color: DBCA.navy,
												borderLeft: `2px solid ${DBCA.teal}`,
											}
										: undefined
								}
							>
								{article.title ?? article.field_key}
							</button>
						);
					})}
				</nav>
			</aside>

			{/* Back to top button */}
			{showBackToTop && (
				<button
					onClick={() => {
						const sc =
							document.querySelector(".overflow-y-auto.no-scrollbar") ??
							document.documentElement;
						sc.scrollTo({ top: 0, behavior: "smooth" });
					}}
					className="fixed bottom-6 right-6 z-40 flex h-10 w-10 items-center justify-center rounded-full text-white shadow-lg transition-all hover:shadow-xl hover:scale-105 animate-in fade-in slide-in-from-bottom-2 duration-300 cursor-pointer"
					style={{ backgroundColor: DBCA.navy }}
					aria-label="Back to top"
				>
					<ChevronUp className="h-5 w-5" />
				</button>
			)}
		</div>
	);
});

/** Individual article section with large DBCA-branded title and inline editing */
const ArticleSection = ({
	article,
	isAdmin,
	startEditing = false,
	searchQuery = "",
	index = 0,
	totalArticles = 0,
	onMoveUp,
	onMoveDown,
}: {
	article: IContentField;
	isAdmin: boolean;
	startEditing?: boolean;
	searchQuery?: string;
	index?: number;
	totalArticles?: number;
	onMoveUp?: () => void;
	onMoveDown?: () => void;
}) => {
	const [isEditing, setIsEditing] = useState(startEditing);
	const [editContent, setEditContent] = useState(article.description ?? "");
	const [isEditingTitle, setIsEditingTitle] = useState(false);
	const [editTitle, setEditTitle] = useState(
		article.title ?? article.field_key
	);
	const titleInputRef = useRef<HTMLInputElement>(null);
	const updateField = useUpdateContentField();
	const deleteField = useDeleteContentField();
	const [editorFocused, setEditorFocused] = useState(false);

	const handleDeleteArticle = () => {
		if (
			!window.confirm(
				`Delete article "${article.title ?? article.field_key}"? This cannot be undone.`
			)
		) {
			return;
		}
		deleteField.mutate(article.id, {
			onSuccess: () => toast.success("Article deleted"),
			onError: () => toast.error("Failed to delete article"),
		});
	};

	// Pre-process HTML to inject highlight marks before Lexical renders it
	const highlightedDescription = useMemo(
		() => highlightHtml(article.description ?? "", searchQuery),
		[article.description, searchQuery]
	);

	useEffect(() => {
		if (isEditingTitle && titleInputRef.current) {
			titleInputRef.current.focus();
			titleInputRef.current.select();
		}
	}, [isEditingTitle]);

	const handleSaveContent = useCallback(() => {
		updateField.mutate(
			{ id: article.id, data: { description: editContent } },
			{
				onSuccess: () => {
					toast.success("Article updated");
					setIsEditing(false);
				},
				onError: () => {
					toast.error("Failed to save article");
				},
			}
		);
	}, [article.id, editContent, updateField]);

	const handleCancelContent = useCallback(() => {
		setEditContent(article.description ?? "");
		setIsEditing(false);
	}, [article.description]);

	const handleSaveTitle = useCallback(() => {
		if (!editTitle.trim()) {
			toast.error("Title cannot be empty");
			return;
		}
		updateField.mutate(
			{ id: article.id, data: { title: editTitle.trim() } },
			{
				onSuccess: () => {
					toast.success("Title updated");
					setIsEditingTitle(false);
				},
				onError: () => {
					toast.error("Failed to save title");
				},
			}
		);
	}, [article.id, editTitle, updateField]);

	const handleCancelTitle = useCallback(() => {
		setEditTitle(article.title ?? article.field_key);
		setIsEditingTitle(false);
	}, [article.title, article.field_key]);

	const handleTitleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === "Enter") {
			e.preventDefault();
			handleSaveTitle();
		} else if (e.key === "Escape") {
			handleCancelTitle();
		}
	};

	return (
		<article className="space-y-4">
			{/* Article title — large, DBCA navy blue, with left accent bar */}
			<div className="group flex items-start gap-3">
				{isEditingTitle ? (
					<div className="flex-1 flex items-center gap-2">
						<Input
							ref={titleInputRef}
							value={editTitle}
							onChange={(e) => setEditTitle(e.target.value)}
							onKeyDown={handleTitleKeyDown}
							className="text-2xl font-bold h-auto py-1.5 px-3"
							style={{ color: DBCA.navy }}
						/>
						<Button
							variant="ghost"
							size="icon"
							className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-950/30 flex-shrink-0"
							onClick={handleSaveTitle}
							disabled={updateField.isPending}
							aria-label="Save title"
						>
							{updateField.isPending ? (
								<Loader2 className="h-4 w-4 animate-spin" />
							) : (
								<Check className="h-4 w-4" />
							)}
						</Button>
						<Button
							variant="ghost"
							size="icon"
							className="h-8 w-8 flex-shrink-0"
							onClick={handleCancelTitle}
							aria-label="Cancel title edit"
						>
							<X className="h-4 w-4" />
						</Button>
					</div>
				) : (
					<div className="flex items-center gap-3 flex-1">
						<div
							className="w-1 h-7 rounded-full flex-shrink-0"
							style={{
								background: `linear-gradient(to bottom, ${DBCA.teal}, ${DBCA.navy})`,
							}}
						/>
						<h2
							className="text-2xl font-bold tracking-tight flex-1"
							style={{ color: DBCA.navy }}
						>
							<HighlightedText
								text={article.title ?? article.field_key}
								query={searchQuery}
							/>
						</h2>
						{isAdmin && (
							<div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
								<Button
									variant="ghost"
									size="icon"
									className="h-7 w-7 cursor-pointer"
									onClick={onMoveUp}
									disabled={index === 0}
									aria-label="Move article up"
								>
									<ChevronUp className="h-3.5 w-3.5" />
								</Button>
								<Button
									variant="ghost"
									size="icon"
									className="h-7 w-7 cursor-pointer"
									onClick={onMoveDown}
									disabled={index === totalArticles - 1}
									aria-label="Move article down"
								>
									<ChevronDown className="h-3.5 w-3.5" />
								</Button>
								<Button
									variant="ghost"
									size="icon"
									className="h-7 w-7 cursor-pointer"
									onClick={() => setIsEditingTitle(true)}
									aria-label="Edit title"
								>
									<Pencil className="h-3.5 w-3.5" />
								</Button>
								<Button
									variant="ghost"
									size="icon"
									className="h-7 w-7 cursor-pointer text-destructive hover:text-destructive"
									onClick={handleDeleteArticle}
									disabled={deleteField.isPending}
									aria-label="Delete article"
								>
									{deleteField.isPending ? (
										<Loader2 className="h-3.5 w-3.5 animate-spin" />
									) : (
										<Trash2 className="h-3.5 w-3.5" />
									)}
								</Button>
							</div>
						)}
					</div>
				)}
			</div>

			{/* Article content */}
			{isEditing ? (
				<div className="space-y-3 pl-4">
					<div
						className={`rounded-lg border-2 overflow-hidden shadow-sm transition-colors ${
							editorFocused
								? "border-blue-500 dark:border-blue-400 bg-blue-50/50 dark:bg-blue-950/20"
								: editContent !== (article.description ?? "")
									? "border-amber-500 dark:border-amber-400 bg-amber-50/50 dark:bg-amber-950/30"
									: "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900/50"
						}`}
						onFocus={() => setEditorFocused(true)}
						onBlur={() => setEditorFocused(false)}
					>
						<RichTextEditor
							value={editContent}
							onChange={setEditContent}
							toolbar="guide"
							placeholder="Write article content..."
							minHeight="200px"
						/>
					</div>
					<div className="flex justify-end gap-2">
						<Button
							variant="outline"
							size="sm"
							onClick={handleCancelContent}
							className="gap-1"
						>
							<X className="h-3.5 w-3.5" />
							Cancel
						</Button>
						<Button
							size="sm"
							onClick={handleSaveContent}
							disabled={updateField.isPending}
							className="gap-1"
							style={{ backgroundColor: DBCA.navy }}
						>
							{updateField.isPending ? (
								<Loader2 className="h-3.5 w-3.5 animate-spin" />
							) : (
								<Save className="h-3.5 w-3.5" />
							)}
							Save
						</Button>
					</div>
				</div>
			) : (
				<div className="relative group/content pl-4">
					{isAdmin && (
						<Button
							variant="ghost"
							size="icon"
							className="absolute right-0 top-0 h-7 w-7 opacity-0 group-hover/content:opacity-100 transition-opacity z-10 cursor-pointer"
							onClick={() => setIsEditing(true)}
							aria-label="Edit article content"
						>
							<Pencil className="h-3.5 w-3.5" />
						</Button>
					)}
					{searchQuery.trim() ? (
						/* When searching: render raw HTML with highlights, using Lexical's CSS classes for styling */
						<div className="editor-container editor-readonly border-none shadow-none">
							<div className="editor-content-wrapper editor-content-wrapper-display">
								<div
									className="editor-input editor-input-display"
									dangerouslySetInnerHTML={{ __html: highlightedDescription }}
								/>
							</div>
						</div>
					) : (
						/* Normal mode: use Lexical for rich rendering */
						<div
							className="prose prose-sm dark:prose-invert max-w-none prose-headings:text-base prose-headings:font-semibold prose-headings:mt-6 prose-headings:mb-2 prose-p:text-muted-foreground prose-li:text-muted-foreground prose-blockquote:border-l-[3px] prose-blockquote:bg-blue-50/50 dark:prose-blockquote:bg-blue-950/30 prose-blockquote:rounded-r-lg prose-blockquote:py-2 prose-blockquote:px-4"
							style={
								{
									"--tw-prose-quote-borders": DBCA.teal,
								} as React.CSSProperties
							}
						>
							<RichTextEditor
								value={article.description ?? ""}
								readOnly
								toolbar="none"
								minHeight="auto"
								className="border-none shadow-none"
							/>
						</div>
					)}
				</div>
			)}
		</article>
	);
};
