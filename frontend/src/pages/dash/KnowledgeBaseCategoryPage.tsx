import { useState } from "react";
import { useParams, useNavigate } from "react-router";
import { observer } from "mobx-react-lite";
import { useAuthStore } from "@/app/stores/store-context";
import { PageTransition } from "@/shared/components/PageTransition";
import { useDocumentTitle } from "@/shared/hooks/useDocumentTitle";
import { Button } from "@/shared/components/ui/button";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { Alert, AlertDescription } from "@/shared/components/ui/alert";
import { AlertCircle, ArrowLeft, Pencil } from "lucide-react";
import { KBArticleAccordion } from "@/features/guide/components/KBArticleAccordion";
import { KBDownloadButton } from "@/features/guide/components/KBDownloadButton";
import { useGuideSections } from "@/features/guide/hooks/useKnowledgeBase";
import { getIconComponent } from "@/features/guide/utils/icon.utils";

const KnowledgeBaseCategoryPage = observer(() => {
	const { categorySlug } = useParams<{ categorySlug: string }>();
	const navigate = useNavigate();
	const authStore = useAuthStore();
	const { data: sections, isLoading, error } = useGuideSections();
	const [editAll, setEditAll] = useState(false);

	const section = sections?.find((s) => s.id === categorySlug);

	useDocumentTitle(section?.title ?? "Knowledge Base");

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
					<Button
						variant="ghost"
						size="sm"
						onClick={() => navigate("/guide")}
						className="gap-1"
					>
						<ArrowLeft className="h-4 w-4" />
						Back to Knowledge Base
					</Button>
					<div className="py-12 text-center text-muted-foreground">
						<p>Category not found.</p>
					</div>
				</div>
			</PageTransition>
		);
	}

	const Icon = getIconComponent(section.icon);

	return (
		<PageTransition>
			<div className="w-full space-y-6">
				<Button
					variant="ghost"
					size="sm"
					onClick={() => navigate("/guide")}
					className="gap-1"
				>
					<ArrowLeft className="h-4 w-4" />
					Back to Knowledge Base
				</Button>

				<div className="flex items-center justify-between">
					<div className="flex items-center gap-4">
						<div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400">
							<Icon className="h-6 w-6" />
						</div>
						<div>
							<h1 className="text-2xl font-bold">{section.title}</h1>
							{section.description && (
								<p className="text-muted-foreground">{section.description}</p>
							)}
						</div>
					</div>
					<div className="flex items-center gap-2">
						{authStore.isSuperuser && (
							<Button
								variant={editAll ? "default" : "outline"}
								size="sm"
								className="gap-1.5"
								onClick={() => setEditAll(!editAll)}
							>
								<Pencil className="h-4 w-4" />
								{editAll ? "Done Editing" : "Edit All"}
							</Button>
						)}
						<KBDownloadButton section={section} />
					</div>
				</div>

				<KBArticleAccordion
					key={editAll ? "editing" : "viewing"}
					articles={section.content_fields}
					editAll={editAll}
				/>
			</div>
		</PageTransition>
	);
});

export default KnowledgeBaseCategoryPage;
