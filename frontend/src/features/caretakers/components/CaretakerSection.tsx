import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import type { ICaretakerSimpleUserData } from "@/shared/types/user.types";
import { CaretakeesTable } from "./CaretakeesTable";
import { CaretakerDocumentsTabContent } from "./CaretakerDocumentsTabContent";
import { PendingCaretakerRequest } from "./PendingCaretakerRequest";
import { OutgoingRequestsList } from "./OutgoingRequestsList";
import { useCaretakerTasks } from "../hooks/useCaretakerTasks";
import { usePendingCaretakerRequests } from "../hooks/usePendingCaretakerRequests";
import { useOutgoingCaretakerRequests } from "../hooks/useOutgoingCaretakerRequests";
import { Loader2, AlertCircle, Info } from "lucide-react";
import { Alert, AlertDescription } from "@/shared/components/ui/alert";
import { Button } from "@/shared/components/ui/button";

import { Separator } from "@/shared/components/ui/separator";

interface CaretakerSectionProps {
	userId: number;
	caretakees: ICaretakerSimpleUserData[];
}

/**
 * Standalone section for all caretaker-related functionality
 * Shows tabs for: Caretaking For, Documents, Requests
 */
export const CaretakerSection = ({ userId, caretakees }: CaretakerSectionProps) => {
	// Fetch caretaker document tasks
	const { data: caretakerTasks, isLoading: tasksLoading, isError: tasksError, error: tasksErrorObj } = useCaretakerTasks(userId);
	
	// Fetch incoming caretaker requests (someone wants YOU to be THEIR caretaker)
	const { data: incomingRequests, isLoading: requestsLoading, isError: requestsError, error: requestsErrorObj, refetch: refetchRequests } = usePendingCaretakerRequests(userId);
	
	// Fetch outgoing caretaker requests (YOU want someone to be YOUR caretaker)
	const { data: outgoingRequests, isLoading: outgoingLoading } = useOutgoingCaretakerRequests(userId);
	
	// Calculate counts (use 0 while loading to avoid flicker)
	const caretakeesCount = caretakees.length;
	const documentTasksCount = caretakerTasks?.all?.length || 0;
	const requestsCount = (incomingRequests?.length || 0) + (outgoingRequests?.length || 0);

	// Determine which tabs to show based on whether user is caretaking for anyone
	const hasCaretakees = caretakeesCount > 0;
	const showCaretakeesTab = hasCaretakees;
	const showDocumentsTab = hasCaretakees; // Only show if caretaking for someone
	const showRequestsTab = true; // Always show (might have requests even without caretakees)
	
	// Build tab array dynamically - memoize to prevent re-renders
	const tabs = useMemo(() => {
		const tabArray = [];
		if (showCaretakeesTab) tabArray.push({ id: 0, label: "Caretaking For", shortLabel: "Users", count: caretakeesCount });
		if (showDocumentsTab) tabArray.push({ id: 1, label: "Documents", shortLabel: "Docs", count: documentTasksCount });
		if (showRequestsTab) tabArray.push({ id: 2, label: "Requests", shortLabel: "Requests", count: requestsCount });
		return tabArray;
	}, [showCaretakeesTab, showDocumentsTab, showRequestsTab, caretakeesCount, documentTasksCount, requestsCount]);
	
	// Initialize activeTab - if no caretakees, default to Requests tab (which will be index 0)
	const [activeTab, setActiveTab] = useState<number>(() => {
		// If no caretakees, Requests tab will be the only tab (index 0)
		// If has caretakees, default to first tab (Caretaking For at index 0)
		return 0;
	});
	
	// Ensure activeTab is valid
	const validActiveTab = activeTab < tabs.length ? activeTab : 0;

	// Show section if ANY of these conditions are true:
	// 1. Has caretakees (will show all 3 tabs)
	// 2. Has incoming or outgoing requests (will show only Requests tab)
	// 3. Has document tasks (will show Documents tab if caretaking)
	const hasContent = caretakeesCount > 0 || requestsCount > 0 || documentTasksCount > 0;
	
	// Don't render section if no content (even while loading)
	// This prevents showing an empty section that will just disappear
	const isLoading = tasksLoading || requestsLoading || outgoingLoading;
	
	// Hide section if:
	// - Not loading AND no content, OR
	// - Loading but we already know there's no caretakees and no way to have content
	if (!isLoading && !hasContent) {
		return null;
	}
	
	// If loading and no caretakees, we might still have requests, so show loading state
	// If loading and has caretakees, definitely show the section

	return (
		<div className="space-y-6">
			{/* Section Header */}
			<div className="pt-6">
				<h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
					{hasCaretakees ? "Caretaker Tasks" : "Caretaker Requests"}
				</h2>
				<p className="text-sm text-gray-600 dark:text-gray-400">
					{hasCaretakees 
						? "Act in your capacity as caretaker"
						: "Manage your caretaker requests"
					}
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
				<div className="min-h-[400px] overflow-visible">
					{/* Caretaking For Tab */}
					{tabs[validActiveTab]?.id === 0 && (
						<motion.div
							key="caretakees-tab"
							initial={{ opacity: 0, y: 10 }}
							animate={{ opacity: 1, y: 0 }}
							exit={{ opacity: 0, y: -10 }}
							transition={{ duration: 0.2 }}
							className="overflow-visible"
						>
							<CaretakeesTable caretakees={caretakees} />
						</motion.div>
					)}

					{/* Documents Tab */}
					{tabs[validActiveTab]?.id === 1 && (
						<motion.div
							key="documents-tab"
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
							key="requests-tab"
							initial={{ opacity: 0, y: 10 }}
							animate={{ opacity: 1, y: 0 }}
							exit={{ opacity: 0, y: -10 }}
							transition={{ duration: 0.2 }}
						>
							<div className="space-y-6">
								{/* Incoming Requests Section */}
								<div>
									<h3 className="text-lg font-semibold mb-2">Incoming Caretaker Requests</h3>
									<p className="text-sm text-muted-foreground mb-4">
										Requests to become someone else's caretaker.
									</p>
									{requestsLoading ? (
										<div className="flex items-center justify-center py-12">
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
										<Alert>
											<Info className="h-4 w-4" />
											<AlertDescription>
												No incoming caretaker requests.
											</AlertDescription>
										</Alert>
									)}
								</div>

								<Separator className="my-6" />

								{/* Outgoing Requests Section */}
								<div>
									<h3 className="text-lg font-semibold mb-2">Outgoing Requests</h3>
									<p className="text-sm text-muted-foreground mb-4">
										Requests you made for someone to be your caretaker.
									</p>
									<OutgoingRequestsList 
										userId={userId}
										onRequestChange={() => refetchRequests()}
									/>
								</div>
							</div>
						</motion.div>
					)}
				</div>
			</div>
		</div>
	);
};
