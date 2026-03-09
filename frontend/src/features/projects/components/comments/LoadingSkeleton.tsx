import { Card, CardContent } from "@/shared/components/ui/card";
import { Skeleton } from "@/shared/components/ui/skeleton";

interface LoadingSkeletonProps {
	/** Number of skeleton cards to show (default: 3) */
	count?: number;
}

/**
 * LoadingSkeleton Component
 *
 * Displays shimmer loading placeholders for comments.
 * Mimics the structure of CommentCard for visual consistency.
 * Respects prefers-reduced-motion for accessibility.
 */
export const LoadingSkeleton = ({ count = 3 }: LoadingSkeletonProps) => {
	return (
		<div className="space-y-4">
			{Array.from({ length: count }).map((_, index) => (
				<Card key={index} className="mb-4">
					<CardContent className="flex gap-3 p-4">
						{/* Avatar skeleton */}
						<Skeleton className="h-10 w-10 rounded-full shrink-0" />

						<div className="flex-1 min-w-0 space-y-2">
							{/* User name and timestamp skeleton */}
							<div className="flex items-center gap-2">
								<Skeleton className="h-4 w-32" />
								<Skeleton className="h-3 w-20" />
							</div>

							{/* Comment content skeleton */}
							<div className="space-y-2">
								<Skeleton className="h-4 w-full" />
								<Skeleton className="h-4 w-5/6" />
								<Skeleton className="h-4 w-4/6" />
							</div>

							{/* Action buttons skeleton */}
							<div className="flex gap-2 mt-3">
								<Skeleton className="h-8 w-16" />
								<Skeleton className="h-8 w-16" />
							</div>
						</div>
					</CardContent>
				</Card>
			))}
		</div>
	);
};
