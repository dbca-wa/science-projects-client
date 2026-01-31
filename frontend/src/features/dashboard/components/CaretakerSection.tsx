import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import type { ICaretakerSimpleUserData } from "@/shared/types/user.types";
import { CaretakeesTable } from "@/features/users/components/caretaker/CaretakeesTable";
import { CaretakerDocumentsTabContent } from "./CaretakerDocumentsTabContent";
import { PendingCaretakerRequest } from "@/features/users/components/caretaker/PendingCaretakerRequest";
import { useCaretakerTasks } from "../hooks/useCaretakerTasks";
import { usePendingCaretakerRequests } from "@/features/users/hooks/usePendingCaretakerRequests";
import { Loader2, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/shared/components/ui/alert";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent } from "@/shared/components/ui/card";

interface CaretakerSectionProps {
	userId: number;
	caretakees: ICaretakerSimpleUserData[];
}

/**
 * Standalone section for all caretaker-related functionality
 * Shows tabs for: Caretaking For, Documents, Requests
 */
export const CaretakerSection = ({ userId, caretakees }: CaretakerSectionProps) => {
	const [activeTab, setActiveTab] = useState<number>(0);
	
	// Fetch caretaker document tasks
	const { data: caretakerTasks, isLoading: tasksLoading, isError: tasksError, error: tasksErrorObj, refetch: refetchTasks } = useCaretakerTasks(userId);
	
	// Fetch incoming caretaker requests (someone wants YOU to be THEIR caretaker)
	const { data: incomingRequests, isLoading: requestsLoading, isError: requestsError, error: requestsErrorObj, refetch: refetchRequests } = usePendingCaretakerRequests(userId);
	
	// Calculate counts (use 0 while loading to avoid flicker)
	const caretakeesCount = caretakees.length;
	const documentTasksCount = caretakerTasks?.all?.length || 0;
	const requestsCount = incomingRequests?.length || 0;

	// Determine which tabs to show
	const showCaretakeesTab = caretakeesCount > 0;
	const showDocumentsTab = true; // Always show, even if empty (might have tasks later)
	const showRequestsTab = true; // Always show, even if empty (might get requests later)
	
	// Build tab array dynamically - memoize to prevent re-renders
	const tabs = useMemo(() => {
		const tabArray = [];
		if (showCaretakeesTab) tabArray.push({ id: 0, label: "Caretaking For", shortLabel: "Users", count: caretakeesCount });
		if (showDocumentsTab) tabArray.push({ id: 1, label: "Documents", shortLabel: "Docs", count: documentTasksCount });
		if (showRequestsTab) tabArray.push({ id: 2, label: "Requests", shortLabel: "Requests", count: requestsCount });
		return tabArray;
	}, [showCaretakeesTab, showDocumentsTab, showRequestsTab, caretakeesCount, documentTasksCount, requestsCount]);
	
	// Ensure activeTab is valid
	const validActiveTab = activeTab < tabs.length ? activeTab : 0;

	// Don't render if no caretakees, no requests, and no tasks
	// Show section if ANY of these conditions are true:
	// 1. Has caretakees
	// 2. Has incoming requests
	// 3. Has document tasks
	const hasContent = caretakeesCount > 0 || requestsCount > 0 || documentTasksCount > 0;
	
	// Still loading - don't hide yet
	if (tasksLoading || requestsLoading) {
		// Show section while loading
	} else if (!hasContent) {
		// No content and not loading - hide section
		return null;
	}

	return (
		<div className="space-y-6">
			{/* Section Header */}
			<div className="pt-6">
				<h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
					Caretaker Tasks
				</h2>
				<p className="text-sm text-gray-600 dark:text-gray-400">
					Act in your capacity as caretaker
				</p>
			</div>

			{/* Tabs */}
			<div>
				{/* Tab Navigation */}
				<div className="flex border-b border-gray-200 dark:border-gray-700 mb-6 relative">
					{tabs.map((tab, index) => (
						<button
							key={tab.id}
							onClick={() => setActiveTab(index)}
							className={`relative flex-1 px-2 sm:px-4 md:px-6 py-3 md:py-4 font-semibold text-sm md:text-base transition-all cursor-pointer ${
								validActiveTab === index
									? "text-blue-600 dark:text-blue-400"
									: "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
							}`}
						>
							<div className="flex items-center justify-center gap-1 sm:gap-2">
								<span className="hidden sm:inline">{tab.label}</span>
								<span className="sm:hidden">{tab.shortLabel}</span>
								{tab.count > 0 && (
									<span className={`inline-flex items-center justify-center min-w-[20px] sm:min-w-[22px] h-5 sm:h-6 px-1.5 sm:px-2 text-xs font-bold text-white rounded-full ${
										tab.id === 2 ? "bg-red-600" : "bg-blue-600"
									}`}>
										{tab.count}
									</span>
								)}
							</div>
						</button>
					))}

					{/* Active tab indicator */}
					<motion.div
						layoutId="caretakerActiveTab"
						className="absolute bottom-0 h-0.5 bg-blue-600 dark:bg-blue-400"
						style={{
							left: `${(validActiveTab / tabs.length) * 100}%`,
							width: `${100 / tabs.length}%`,
						}}
						transition={{ type: "spring", stiffness: 500, damping: 30 }}
					/>
				</div>

				{/* Tab Content */}
				<div className="min-h-[400px]">
					{/* Caretaking For Tab */}
					{tabs[validActiveTab]?.id === 0 && (
						<motion.div
							initial={{ opacity: 0, y: 10 }}
							animate={{ opacity: 1, y: 0 }}
							exit={{ opacity: 0, y: -10 }}
							transition={{ duration: 0.2 }}
						>
							<CaretakeesTable caretakees={caretakees} />
						</motion.div>
					)}

					{/* Documents Tab */}
					{tabs[validActiveTab]?.id === 1 && (
						<motion.div
							initial={{ opacity: 0, y: 10 }}
							animate={{ opacity: 1, y: 0 }}
							exit={{ opacity: 0, y: -10 }}
							transition={{ duration: 0.2 }}
						>
							<CaretakerDocumentsTabContent
								caretakerTasks={caretakerTasks}
								caretakerTasksLoading={tasksLoading}
								caretakerTasksError={tasksError ? tasksErrorObj : null}
							/>
						</motion.div>
					)}

					{/* Requests Tab */}
					{tabs[validActiveTab]?.id === 2 && (
						<motion.div
							initial={{ opacity: 0, y: 10 }}
							animate={{ opacity: 1, y: 0 }}
							exit={{ opacity: 0, y: -10 }}
							transition={{ duration: 0.2 }}
						>
							{requestsLoading ? (
								<div className="flex items-center justify-center py-20">
									<div className="text-center space-y-4">
										<Loader2 className="size-12 mx-auto animate-spin text-blue-600" />
										<div className="text-lg font-medium text-muted-foreground">Loading requests...</div>
									</div>
								</div>
							) : requestsError ? (
								<Alert variant="destructive">
									<AlertCircle className="size-4" />
									<AlertDescription className="flex items-center justify-between">
										<span>Failed to load requests: {requestsErrorObj?.message || "Unknown error"}</span>
										<Button
											variant="outline"
											size="sm"
											onClick={() => refetchRequests()}
										>
											Retry
										</Button>
									</AlertDescription>
								</Alert>
							) : incomingRequests && incomingRequests.length > 0 ? (
								<div className="space-y-4">
									{incomingRequests.map((request) => (
										<PendingCaretakerRequest 
											key={request.id}
											request={request}
											onCancel={() => refetchRequests()}
										/>
									))}
								</div>
							) : (
								<Card>
									<CardContent className="py-12 text-center">
										<div className="text-gray-500 dark:text-gray-400">
											No pending caretaker requests.
										</div>
									</CardContent>
								</Card>
							)}
						</motion.div>
					)}
				</div>
			</div>
		</div>
	);
};
