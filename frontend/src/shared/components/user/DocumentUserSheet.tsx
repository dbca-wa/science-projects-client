/**
 * DocumentUserSheet Component
 *
 * Comprehensive user detail sheet for document contexts.
 * Displays user information when clicking "Created By" or "Modified By" names
 * in document details without navigating away from the document page.
 *
 * Reuses modular user-sheet components to maintain DRY principles and consistency.
 */

import { observer } from "mobx-react-lite";
import { Sheet, SheetContent } from "@/shared/components/ui/sheet";
import { Button } from "@/shared/components/ui/button";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { Alert, AlertDescription } from "@/shared/components/ui/alert";
import { AlertCircle, X } from "lucide-react";
import { useUserDetail } from "@/features/users/hooks/useUserDetail";
import {
	UserSheetHeader,
	UserSheetOrganisationSection,
	UserSheetAboutSection,
	UserSheetDetailsSection,
} from "@/shared/components/user-sheet";

interface DocumentUserSheetProps {
	userId: number | null;
	open: boolean;
	onClose: () => void;
}

/**
 * DocumentUserSheet component
 *
 * Displays comprehensive user information in a side sheet without navigation.
 * Used in document contexts to show creator/modifier details.
 */
export const DocumentUserSheet = observer(
	({ userId, open, onClose }: DocumentUserSheetProps) => {
		// Fetch user details
		const { data: user, isLoading, error } = useUserDetail(userId || 0);

		return (
			<Sheet open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
				<SheetContent
					side="right"
					className="w-full sm:max-w-md overflow-y-auto p-6"
				>
					{/* Close button */}
					<Button
						variant="ghost"
						size="icon"
						onClick={onClose}
						className="absolute right-4 top-4 z-10 size-8"
						aria-label="Close user details"
					>
						<X className="size-4" />
					</Button>

					{/* Loading state */}
					{isLoading && <LoadingSkeleton />}

					{/* Error state */}
					{error && (
						<Alert variant="destructive">
							<AlertCircle className="size-4" />
							<AlertDescription>
								Failed to load user details. Please try again.
							</AlertDescription>
						</Alert>
					)}

					{/* User details */}
					{user && (
						<div className="flex flex-col">
							<UserSheetHeader user={user} />
							<UserSheetOrganisationSection user={user} />
							<UserSheetAboutSection user={user} />
							<UserSheetDetailsSection user={user} showJoinedDate={false} />
						</div>
					)}
				</SheetContent>
			</Sheet>
		);
	}
);

/**
 * Loading skeleton for user details
 */
// eslint-disable-next-line react-refresh/only-export-components
function LoadingSkeleton() {
	return (
		<div className="space-y-6">
			{/* Header skeleton */}
			<div className="flex gap-4">
				<Skeleton className="size-24 rounded-full" />
				<div className="flex-1 space-y-2">
					<Skeleton className="h-6 w-48" />
					<Skeleton className="h-4 w-32" />
					<Skeleton className="h-4 w-40" />
				</div>
			</div>

			{/* Organisation skeleton */}
			<div className="space-y-3">
				<Skeleton className="h-20 w-full" />
			</div>

			{/* About skeleton */}
			<div className="space-y-3">
				<Skeleton className="h-5 w-24" />
				<Skeleton className="h-16 w-full" />
				<Skeleton className="h-5 w-24 mt-4" />
				<Skeleton className="h-16 w-full" />
			</div>

			{/* Details skeleton */}
			<div className="space-y-3">
				<Skeleton className="h-5 w-24" />
				<Skeleton className="h-24 w-full" />
			</div>
		</div>
	);
}
