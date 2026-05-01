/* eslint-disable react-refresh/only-export-components */
import { useState, useCallback } from "react";
import { observer } from "mobx-react-lite";
import { useAuthStore } from "@/app/stores/store-context";
import { Pencil, Loader2, Save, X } from "lucide-react";
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/shared/components/ui/accordion";
import { Button } from "@/shared/components/ui/button";
import { RichTextEditor } from "@/shared/components/editor/RichTextEditor";
import { useUpdateContentField } from "../hooks/useKnowledgeBase";
import { toast } from "sonner";
import type { IContentField } from "../types/guide.types";

interface KBArticleAccordionProps {
	articles: IContentField[];
	/** When true, all articles start in edit mode */
	editAll?: boolean;
}

export const KBArticleAccordion = observer(function KBArticleAccordion({
	articles,
	editAll = false,
}: KBArticleAccordionProps) {
	const authStore = useAuthStore();
	const isAdmin = authStore.isSuperuser;

	// Controlled accordion state to prevent flicker
	const [openItems, setOpenItems] = useState<string[]>(
		editAll ? articles.map((a) => a.id) : []
	);

	if (articles.length === 0) {
		return (
			<div className="rounded-lg border border-dashed p-8 text-center text-muted-foreground">
				<p>No articles in this category yet.</p>
			</div>
		);
	}

	return (
		<Accordion
			type="multiple"
			value={openItems}
			onValueChange={setOpenItems}
			className="w-full"
		>
			{articles.map((article) => (
				<AccordionItem key={article.id} value={article.id}>
					<AccordionTrigger className="text-base">
						{article.title ?? article.field_key}
					</AccordionTrigger>
					<AccordionContent>
						<ArticleContent
							article={article}
							isAdmin={isAdmin}
							startEditing={editAll}
						/>
					</AccordionContent>
				</AccordionItem>
			))}
		</Accordion>
	);
});

/** Individual article content with optional inline editing for admins */
const ArticleContent = ({
	article,
	isAdmin,
	startEditing = false,
}: {
	article: IContentField;
	isAdmin: boolean;
	startEditing?: boolean;
}) => {
	const [isEditing, setIsEditing] = useState(startEditing);
	const [editContent, setEditContent] = useState(article.description ?? "");
	const updateField = useUpdateContentField();

	const handleSave = useCallback(() => {
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

	const handleCancel = useCallback(() => {
		setEditContent(article.description ?? "");
		setIsEditing(false);
	}, [article.description]);

	if (isEditing) {
		return (
			<div
				className="space-y-3"
				onClick={(e) => e.stopPropagation()}
				onKeyDown={(e) => e.stopPropagation()}
			>
				<RichTextEditor
					value={editContent}
					onChange={setEditContent}
					toolbar="guide"
					placeholder="Write article content..."
					minHeight="200px"
				/>
				<div className="flex justify-end gap-2">
					<Button
						variant="outline"
						size="sm"
						onClick={(e) => {
							e.stopPropagation();
							handleCancel();
						}}
						className="gap-1"
					>
						<X className="h-3.5 w-3.5" />
						Cancel
					</Button>
					<Button
						size="sm"
						onClick={(e) => {
							e.stopPropagation();
							handleSave();
						}}
						disabled={updateField.isPending}
						className="gap-1"
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
		);
	}

	return (
		<div className="relative group">
			{isAdmin && (
				<Button
					variant="ghost"
					size="icon"
					className="absolute right-0 top-0 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity z-10"
					onClick={(e) => {
						e.stopPropagation();
						setIsEditing(true);
					}}
					aria-label="Edit article"
				>
					<Pencil className="h-3.5 w-3.5" />
				</Button>
			)}
			<RichTextEditor
				value={article.description ?? ""}
				readOnly
				toolbar="none"
				minHeight="auto"
				className="border-none shadow-none"
			/>
		</div>
	);
};
