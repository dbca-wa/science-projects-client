import { PageTransition } from "@/shared/components/PageTransition";
import { useDocumentTitle } from "@/shared/hooks/useDocumentTitle";
import { AutoBreadcrumb } from "@/shared/components/navigation/AutoBreadcrumb";
import { Alert, AlertDescription } from "@/shared/components/ui/alert";
import { AlertCircle, Loader2, Pencil } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { observer } from "mobx-react-lite";
import { useAuthStore } from "@/app/stores/store-context";
import { useState } from "react";
import { KBHeroSearch } from "@/features/guide/components/KBHeroSearch";
import { KBCategoryGrid } from "@/features/guide/components/KBCategoryGrid";
import { KBSearchResults } from "@/features/guide/components/KBSearchResults";
import { KBAdminEditPanel } from "@/features/guide/components/KBAdminEditPanel";
import { useGuideSections } from "@/features/guide/hooks/useKnowledgeBase";
import { useKBSearch } from "@/features/guide/hooks/useKBSearch";

const KnowledgeBasePage = observer(() => {
	useDocumentTitle("Knowledge Base");
	const authStore = useAuthStore();
	const [isEditMode, setIsEditMode] = useState(false);

	const { data: sections, isLoading, error } = useGuideSections();
	const {
		searchQuery,
		setSearchQuery,
		debouncedQuery,
		results,
		isSearching,
		isDebouncing,
	} = useKBSearch(sections);

	// Filter to only active sections for display
	const activeSections = sections?.filter((s) => s.is_active) ?? [];

	return (
		<PageTransition>
			<div className="w-full">
				<AutoBreadcrumb />

				<div className="space-y-8">
					<KBHeroSearch
						searchQuery={searchQuery}
						onSearchChange={setSearchQuery}
					>
						{/* Admin edit button — centered at bottom of banner */}
						{authStore.isSuperuser && (
							<div className="mt-6 flex justify-center">
								<Button
									variant={isEditMode ? "default" : "secondary"}
									size="sm"
									className="gap-2 bg-white/15 hover:bg-white/25 text-white border-white/20 backdrop-blur-sm"
									onClick={() => {
										const willEnable = !isEditMode;
										setIsEditMode(willEnable);
										if (willEnable) {
											// Scroll to the edit panel after it renders
											setTimeout(() => {
												document
													.getElementById("kb-admin-edit-panel")
													?.scrollIntoView({
														behavior: "smooth",
														block: "start",
													});
											}, 100);
										}
									}}
								>
									<Pencil className="h-3.5 w-3.5" />
									{isEditMode ? "Done Editing" : "Edit Knowledge Base"}
								</Button>
							</div>
						)}
					</KBHeroSearch>

					{error && (
						<Alert variant="destructive">
							<AlertCircle className="h-4 w-4" />
							<AlertDescription>
								Failed to load knowledge base content. Please try again later.
							</AlertDescription>
						</Alert>
					)}

					{isSearching ? (
						isDebouncing ? (
							<div className="flex items-center justify-center py-12">
								<Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
								<span className="ml-2 text-sm text-muted-foreground">
									Searching...
								</span>
							</div>
						) : (
							<KBSearchResults results={results} query={debouncedQuery} />
						)
					) : (
						<KBCategoryGrid sections={activeSections} isLoading={isLoading} />
					)}

					<KBAdminEditPanel
						isEditMode={isEditMode}
						onToggleEditMode={() => setIsEditMode(!isEditMode)}
					/>
				</div>
			</div>
		</PageTransition>
	);
});

export default KnowledgeBasePage;
