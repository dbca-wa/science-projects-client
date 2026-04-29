import { KBCategoryCard } from "./KBCategoryCard";
import { Skeleton } from "@/shared/components/ui/skeleton";
import type { IGuideSection } from "../types/guide.types";

interface KBCategoryGridProps {
	sections: IGuideSection[];
	isLoading?: boolean;
}

export const KBCategoryGrid = ({
	sections,
	isLoading = false,
}: KBCategoryGridProps) => {
	if (isLoading) {
		return (
			<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
				{Array.from({ length: 8 }).map((_, i) => (
					<Skeleton key={i} className="h-36 rounded-xl" />
				))}
			</div>
		);
	}

	if (sections.length === 0) {
		return (
			<div className="py-12 text-center text-muted-foreground">
				<p>No categories available yet.</p>
			</div>
		);
	}

	return (
		<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
			{sections.map((section) => (
				<KBCategoryCard key={section.id} section={section} />
			))}
		</div>
	);
};
