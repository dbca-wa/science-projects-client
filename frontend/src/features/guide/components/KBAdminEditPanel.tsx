/* eslint-disable react-refresh/only-export-components */
import { useState, useMemo, createElement } from "react";
import { observer } from "mobx-react-lite";
import { useAuthStore } from "@/app/stores/store-context";
import {
	Pencil,
	Plus,
	Trash2,
	ChevronUp,
	ChevronDown,
	Loader2,
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/shared/components/ui/dialog";
import { toast } from "sonner";
import { RichTextEditor } from "@/shared/components/editor/RichTextEditor";
import { RichTextDisplay } from "@/shared/components/editor/RichTextDisplay";
import { getIconComponent } from "../utils/icon.utils";
import {
	useGuideSections,
	useCreateGuideSection,
	useUpdateGuideSection,
	useDeleteGuideSection,
	useReorderGuideSections,
	useCreateContentField,
	useUpdateContentField,
	useDeleteContentField,
	useReorderContentFields,
} from "../hooks/useKnowledgeBase";
import type { IGuideSection, IContentField } from "../types/guide.types";

/** Generate a URL-safe slug from a title */
const slugify = (text: string): string =>
	text
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-|-$/g, "");

// ─── Section Editor ──────────────────────────────────────────────────────────

interface SectionEditorProps {
	section: IGuideSection;
	index: number;
	totalSections: number;
	onMoveUp: () => void;
	onMoveDown: () => void;
}

const SectionEditor = ({
	section,
	index,
	totalSections,
	onMoveUp,
	onMoveDown,
}: SectionEditorProps) => {
	const [editingTitle, setEditingTitle] = useState(false);
	const [title, setTitle] = useState(section.title);
	const [editingDesc, setEditingDesc] = useState(false);
	const [description, setDescription] = useState(section.description);
	const [editingIcon, setEditingIcon] = useState(false);
	const [icon, setIcon] = useState(section.icon);

	const updateSection = useUpdateGuideSection();
	const deleteSection = useDeleteGuideSection();
	const createField = useCreateContentField();
	const updateField = useUpdateContentField();
	const deleteField = useDeleteContentField();
	const reorderFields = useReorderContentFields();

	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const [editingFieldId, setEditingFieldId] = useState<string | null>(null);
	const [fieldContent, setFieldContent] = useState("");

	const iconElement = useMemo(
		() =>
			createElement(getIconComponent(section.icon), { className: "h-5 w-5" }),
		[section.icon]
	);

	const handleSaveTitle = () => {
		if (title.trim() && title !== section.title) {
			updateSection.mutate(
				{ id: section.id, data: { title: title.trim() } },
				{ onSuccess: () => toast.success("Section title updated") }
			);
		}
		setEditingTitle(false);
	};

	const handleSaveDescription = () => {
		if (description !== section.description) {
			updateSection.mutate(
				{ id: section.id, data: { description } },
				{ onSuccess: () => toast.success("Section description updated") }
			);
		}
		setEditingDesc(false);
	};

	const handleSaveIcon = () => {
		if (icon.trim() && icon !== section.icon) {
			updateSection.mutate(
				{ id: section.id, data: { icon: icon.trim() } },
				{ onSuccess: () => toast.success("Section icon updated") }
			);
		}
		setEditingIcon(false);
	};

	const handleDeleteSection = () => {
		deleteSection.mutate(section.id, {
			onSuccess: () => {
				toast.success("Section deleted");
				setDeleteDialogOpen(false);
			},
		});
	};

	const handleAddArticle = () => {
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
	};

	const handleSaveFieldContent = (fieldId: string) => {
		updateField.mutate(
			{ id: fieldId, data: { description: fieldContent } },
			{
				onSuccess: () => {
					toast.success("Article content saved");
					setEditingFieldId(null);
					setFieldContent("");
				},
			}
		);
	};

	const handleMoveField = (fieldIndex: number, direction: "up" | "down") => {
		const fields = [...section.content_fields];
		const swapIndex = direction === "up" ? fieldIndex - 1 : fieldIndex + 1;
		if (swapIndex < 0 || swapIndex >= fields.length) return;

		[fields[fieldIndex], fields[swapIndex]] = [
			fields[swapIndex],
			fields[fieldIndex],
		];
		reorderFields.mutate({
			sectionId: section.id,
			fieldIds: fields.map((f) => f.id),
		});
	};

	return (
		<div className="rounded-lg border bg-white p-4 space-y-4 dark:bg-gray-900">
			{/* Section header */}
			<div className="flex items-center justify-between gap-2">
				<div className="flex items-center gap-3 flex-1 min-w-0">
					{/* Icon */}
					{editingIcon ? (
						<div className="flex items-center gap-1">
							<Input
								value={icon}
								onChange={(e) => setIcon(e.target.value)}
								onBlur={handleSaveIcon}
								onKeyDown={(e) => e.key === "Enter" && handleSaveIcon()}
								className="h-8 w-32 text-sm"
								placeholder="Icon name"
								autoFocus
							/>
						</div>
					) : (
						<button
							type="button"
							onClick={() => setEditingIcon(true)}
							className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-950 dark:text-blue-400"
							title="Click to change icon"
						>
							{iconElement}
						</button>
					)}

					{/* Title */}
					{editingTitle ? (
						<Input
							value={title}
							onChange={(e) => setTitle(e.target.value)}
							onBlur={handleSaveTitle}
							onKeyDown={(e) => e.key === "Enter" && handleSaveTitle()}
							className="h-8 text-base font-semibold"
							autoFocus
						/>
					) : (
						<button
							type="button"
							onClick={() => setEditingTitle(true)}
							className="text-base font-semibold hover:text-blue-600 text-left truncate"
						>
							{section.title}
						</button>
					)}
				</div>

				{/* Controls */}
				<div className="flex items-center gap-1 shrink-0">
					<Button
						variant="ghost"
						size="icon"
						className="h-7 w-7"
						onClick={onMoveUp}
						disabled={index === 0}
						aria-label="Move section up"
					>
						<ChevronUp className="h-4 w-4" />
					</Button>
					<Button
						variant="ghost"
						size="icon"
						className="h-7 w-7"
						onClick={onMoveDown}
						disabled={index === totalSections - 1}
						aria-label="Move section down"
					>
						<ChevronDown className="h-4 w-4" />
					</Button>
					<Button
						variant="ghost"
						size="icon"
						className="h-7 w-7 text-destructive hover:text-destructive"
						onClick={() => setDeleteDialogOpen(true)}
						aria-label="Delete section"
					>
						<Trash2 className="h-4 w-4" />
					</Button>
				</div>
			</div>

			{/* Description */}
			{editingDesc ? (
				<div className="space-y-2">
					<Label className="text-xs text-muted-foreground">Description</Label>
					<Input
						value={description}
						onChange={(e) => setDescription(e.target.value)}
						onBlur={handleSaveDescription}
						onKeyDown={(e) => e.key === "Enter" && handleSaveDescription()}
						placeholder="Brief description for this category"
						className="text-sm"
						autoFocus
					/>
				</div>
			) : (
				<button
					type="button"
					onClick={() => setEditingDesc(true)}
					className="text-sm text-muted-foreground hover:text-foreground text-left w-full"
				>
					{section.description || "Click to add a description..."}
				</button>
			)}

			{/* Articles */}
			<div className="space-y-2">
				<div className="flex items-center justify-between">
					<span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
						Articles ({section.content_fields.length})
					</span>
					<Button
						variant="outline"
						size="sm"
						className="h-7 text-xs gap-1"
						onClick={handleAddArticle}
						disabled={createField.isPending}
					>
						{createField.isPending ? (
							<Loader2 className="h-3 w-3 animate-spin" />
						) : (
							<Plus className="h-3 w-3" />
						)}
						Add Article
					</Button>
				</div>

				{section.content_fields.map((field, fieldIndex) => (
					<ArticleEditor
						key={field.id}
						field={field}
						fieldIndex={fieldIndex}
						totalFields={section.content_fields.length}
						isEditing={editingFieldId === field.id}
						fieldContent={editingFieldId === field.id ? fieldContent : ""}
						onStartEdit={() => {
							setEditingFieldId(field.id);
							setFieldContent(field.description ?? "");
						}}
						onCancelEdit={() => {
							setEditingFieldId(null);
							setFieldContent("");
						}}
						onSaveContent={() => handleSaveFieldContent(field.id)}
						onContentChange={setFieldContent}
						onMoveUp={() => handleMoveField(fieldIndex, "up")}
						onMoveDown={() => handleMoveField(fieldIndex, "down")}
						onDelete={() =>
							deleteField.mutate(field.id, {
								onSuccess: () => toast.success("Article deleted"),
							})
						}
						onUpdateTitle={(newTitle: string) =>
							updateField.mutate(
								{ id: field.id, data: { title: newTitle } },
								{ onSuccess: () => toast.success("Article title updated") }
							)
						}
					/>
				))}
			</div>

			{/* Delete confirmation dialog */}
			<Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Delete Section</DialogTitle>
						<DialogDescription>
							Are you sure you want to delete &ldquo;{section.title}&rdquo;?
							This will also delete all {section.content_fields.length} article
							{section.content_fields.length !== 1 ? "s" : ""} in this section.
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
							Delete
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
};

// ─── Article Editor ──────────────────────────────────────────────────────────

interface ArticleEditorProps {
	field: IContentField;
	fieldIndex: number;
	totalFields: number;
	isEditing: boolean;
	fieldContent: string;
	onStartEdit: () => void;
	onCancelEdit: () => void;
	onSaveContent: () => void;
	onContentChange: (content: string) => void;
	onMoveUp: () => void;
	onMoveDown: () => void;
	onDelete: () => void;
	onUpdateTitle: (title: string) => void;
}

const ArticleEditor = ({
	field,
	fieldIndex,
	totalFields,
	isEditing,
	fieldContent,
	onStartEdit,
	onCancelEdit,
	onSaveContent,
	onContentChange,
	onMoveUp,
	onMoveDown,
	onDelete,
	onUpdateTitle,
}: ArticleEditorProps) => {
	const [editingTitle, setEditingTitle] = useState(false);
	const [title, setTitle] = useState(field.title ?? field.field_key);

	const handleSaveTitle = () => {
		if (title.trim() && title !== field.title) {
			onUpdateTitle(title.trim());
		}
		setEditingTitle(false);
	};

	return (
		<div className="rounded-md border bg-white/80 p-3 space-y-2 dark:bg-gray-800/80">
			<div className="flex items-center justify-between gap-2">
				{/* Article title */}
				{editingTitle ? (
					<Input
						value={title}
						onChange={(e) => setTitle(e.target.value)}
						onBlur={handleSaveTitle}
						onKeyDown={(e) => e.key === "Enter" && handleSaveTitle()}
						className="h-7 text-sm font-medium flex-1"
						autoFocus
					/>
				) : (
					<button
						type="button"
						onClick={() => setEditingTitle(true)}
						className="text-sm font-medium hover:text-blue-600 text-left truncate flex-1"
					>
						{field.title ?? field.field_key}
					</button>
				)}

				{/* Article controls */}
				<div className="flex items-center gap-0.5 shrink-0">
					<Button
						variant="ghost"
						size="icon"
						className="h-6 w-6"
						onClick={onMoveUp}
						disabled={fieldIndex === 0}
						aria-label="Move article up"
					>
						<ChevronUp className="h-3 w-3" />
					</Button>
					<Button
						variant="ghost"
						size="icon"
						className="h-6 w-6"
						onClick={onMoveDown}
						disabled={fieldIndex === totalFields - 1}
						aria-label="Move article down"
					>
						<ChevronDown className="h-3 w-3" />
					</Button>
					<Button
						variant="ghost"
						size="icon"
						className="h-6 w-6"
						onClick={onStartEdit}
						aria-label="Edit article content"
					>
						<Pencil className="h-3 w-3" />
					</Button>
					<Button
						variant="ghost"
						size="icon"
						className="h-6 w-6 text-destructive hover:text-destructive"
						onClick={onDelete}
						aria-label="Delete article"
					>
						<Trash2 className="h-3 w-3" />
					</Button>
				</div>
			</div>

			{/* Content editor or preview */}
			{isEditing ? (
				<div className="space-y-2">
					<RichTextEditor
						value={fieldContent}
						onChange={onContentChange}
						toolbar="full"
						placeholder="Write article content..."
					/>
					<div className="flex justify-end gap-2">
						<Button variant="outline" size="sm" onClick={onCancelEdit}>
							Cancel
						</Button>
						<Button size="sm" onClick={onSaveContent}>
							Save
						</Button>
					</div>
				</div>
			) : field.description ? (
				<div
					className="cursor-pointer rounded p-2 hover:bg-muted/50"
					onClick={onStartEdit}
					role="button"
					tabIndex={0}
					onKeyDown={(e) => {
						if (e.key === "Enter" || e.key === " ") {
							e.preventDefault();
							onStartEdit();
						}
					}}
				>
					<RichTextDisplay
						content={field.description}
						className="text-sm opacity-70"
					/>
				</div>
			) : (
				<button
					type="button"
					onClick={onStartEdit}
					className="text-xs text-muted-foreground hover:text-foreground italic"
				>
					Click to add content...
				</button>
			)}
		</div>
	);
};

// ─── Main Admin Edit Panel ───────────────────────────────────────────────────

export const KBAdminEditPanel = observer(() => {
	const authStore = useAuthStore();
	const [isEditMode, setIsEditMode] = useState(false);
	const { data: sections } = useGuideSections();
	const createSection = useCreateGuideSection();
	const reorderSections = useReorderGuideSections();

	// Only render for admin/superuser
	if (!authStore.isSuperuser) return null;

	const activeSections = sections?.filter((s) => s.is_active) ?? [];

	const handleAddSection = () => {
		const id = slugify(`section-${Date.now()}`);
		createSection.mutate(
			{
				id,
				title: "New Section",
				description: "",
				icon: "book-open",
				order: activeSections.length,
				is_active: true,
				content_fields: [],
			},
			{ onSuccess: () => toast.success("Section created") }
		);
	};

	const handleMoveSection = (index: number, direction: "up" | "down") => {
		const reordered = [...activeSections];
		const swapIndex = direction === "up" ? index - 1 : index + 1;
		if (swapIndex < 0 || swapIndex >= reordered.length) return;

		[reordered[index], reordered[swapIndex]] = [
			reordered[swapIndex],
			reordered[index],
		];
		reorderSections.mutate(reordered.map((s) => s.id));
	};

	return (
		<div className="space-y-4">
			{/* Edit mode toggle */}
			<div className="flex items-center justify-end">
				<Button
					variant={isEditMode ? "default" : "outline"}
					size="sm"
					className="gap-2"
					onClick={() => setIsEditMode(!isEditMode)}
				>
					<Pencil className="h-4 w-4" />
					{isEditMode ? "Done Editing" : "Edit Knowledge Base"}
				</Button>
			</div>

			{/* Edit panel */}
			{isEditMode && (
				<div className="space-y-4 rounded-xl border-2 border-dashed border-blue-300 bg-blue-50/50 p-4 dark:border-blue-800 dark:bg-blue-950/20">
					<div className="flex items-center justify-between">
						<h2 className="text-sm font-semibold text-blue-700 dark:text-blue-400">
							Admin Edit Mode
						</h2>
						<Button
							variant="outline"
							size="sm"
							className="gap-1"
							onClick={handleAddSection}
							disabled={createSection.isPending}
						>
							{createSection.isPending ? (
								<Loader2 className="h-4 w-4 animate-spin" />
							) : (
								<Plus className="h-4 w-4" />
							)}
							Add Section
						</Button>
					</div>

					{activeSections.map((section, index) => (
						<SectionEditor
							key={section.id}
							section={section}
							index={index}
							totalSections={activeSections.length}
							onMoveUp={() => handleMoveSection(index, "up")}
							onMoveDown={() => handleMoveSection(index, "down")}
						/>
					))}

					{activeSections.length === 0 && (
						<p className="text-center text-sm text-muted-foreground py-8">
							No sections yet. Click &ldquo;Add Section&rdquo; to get started.
						</p>
					)}
				</div>
			)}
		</div>
	);
});
