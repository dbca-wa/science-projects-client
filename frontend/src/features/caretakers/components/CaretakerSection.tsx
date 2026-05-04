import { useMemo } from "react";
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
import {
	Tabs,
	TabsList,
	TabsTrigger,
	TabsContent,
} from "@/shared/components/ui/tabs";

const TAB_CARETAKING = "caretaking";
const TAB_DOCUMENTS = "documents";
const TAB_REQUESTS = "requests";

interface CaretakerSectionProps {
	userId: number;
	caretakees: ICaretakerSimpleUserData[];
}

/**
 * Standalone section for all caretaker-related functionality.
 * Shows tabs for: Caretaking For, Documents, Requests.
 */
export const CaretakerSection = ({
	userId,
	caretakees,
}: CaretakerSectionProps) => {
	const {
		data: caretakerTasks,
		isLoading: tasksLoading,
		isError: tasksError,
		error: tasksErrorObj,
	} = useCaretakerTasks(userId);

	const {
		data: incomingRequests,
		isLoading: requestsLoading,
		isError: requestsError,
		error: requestsErrorObj,
		refetch: refetchRequests,
	} = usePendingCaretakerRequests(userId);

	const { data: outgoingRequests, isLoading: outgoingLoading } =
		useOutgoingCaretakerRequests(userId);

	const caretakeesCount = caretakees.length;
	const documentTasksCount = caretakerTasks?.all?.length || 0;
	const requestsCount =
		(incomingRequests?.length || 0) + (outgoingRequests?.length || 0);

	const hasCaretakees = caretakeesCount > 0;

	// Build tab config dynamically
	const tabs = useMemo(() => {
		const tabArray: {
			value: string;
			label: string;
			shortLabel: string;
			count: number;
			badgeColor: string;
		}[] = [];
		if (hasCaretakees) {
			tabArray.push({
				value: TAB_CARETAKING,
				label: "Caretaking For",
				shortLabel: "Users",
				count: caretakeesCount,
				badgeColor: "bg-blue-600",
			});
			tabArray.push({
				value: TAB_DOCUMENTS,
				label: "Documents",
				shortLabel: "Docs",
				count: documentTasksCount,
				badgeColor: "bg-blue-600",
			});
		}
		tabArray.push({
			value: TAB_REQUESTS,
			label: "Requests",
			shortLabel: "Requests",
			count: requestsCount,
			badgeColor: "bg-red-600",
		});
		return tabArray;
	}, [hasCaretakees, caretakeesCount, documentTasksCount, requestsCount]);

	const defaultTab = hasCaretakees ? TAB_CARETAKING : TAB_REQUESTS;

	const hasContent =
		caretakeesCount > 0 || requestsCount > 0 || documentTasksCount > 0;
	const isLoading = tasksLoading || requestsLoading || outgoingLoading;

	if (!isLoading && !hasContent) {
		return null;
	}

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
						: "Manage your caretaker requests"}
				</p>
			</div>

			{/* Tabs */}
			<Tabs defaultValue={defaultTab} className="w-full mt-2">
				<TabsList className="w-full flex">
					{tabs.map((tab) => (
						<TabsTrigger key={tab.value} value={tab.value} className="flex-1">
							<span className="hidden sm:inline">{tab.label}</span>
							<span className="sm:hidden">{tab.shortLabel}</span>
							{tab.count > 0 && (
								<span
									className={`ml-1.5 inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 text-xs font-bold text-white rounded-full ${tab.badgeColor}`}
								>
									{tab.count}
								</span>
							)}
						</TabsTrigger>
					))}
				</TabsList>

				{/* Caretaking For Tab */}
				{hasCaretakees && (
					<TabsContent value={TAB_CARETAKING} className="overflow-visible">
						<CaretakeesTable caretakees={caretakees} />
					</TabsContent>
				)}

				{/* Documents Tab */}
				{hasCaretakees && (
					<TabsContent value={TAB_DOCUMENTS}>
						<CaretakerDocumentsTabContent
							caretakerTasks={caretakerTasks}
							caretakerTasksLoading={tasksLoading}
							caretakerTasksError={tasksError ? tasksErrorObj : null}
						/>
					</TabsContent>
				)}

				{/* Requests Tab */}
				<TabsContent value={TAB_REQUESTS}>
					<div className="space-y-6">
						{/* Incoming Requests Section */}
						<div>
							<h3 className="text-lg font-semibold mb-2">
								Incoming Caretaker Requests
							</h3>
							<p className="text-sm text-muted-foreground mb-4">
								Requests to become someone else's caretaker.
							</p>
							{requestsLoading ? (
								<div className="flex items-center justify-center py-12">
									<div className="text-center space-y-4">
										<Loader2 className="size-12 mx-auto animate-spin text-blue-600" />
										<div className="text-lg font-medium text-muted-foreground">
											Loading requests...
										</div>
									</div>
								</div>
							) : requestsError ? (
								<Alert variant="destructive">
									<AlertCircle className="size-4" />
									<AlertDescription className="flex items-center justify-between">
										<span>
											Failed to load requests:{" "}
											{requestsErrorObj?.message || "Unknown error"}
										</span>
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
				</TabsContent>
			</Tabs>
		</div>
	);
};
