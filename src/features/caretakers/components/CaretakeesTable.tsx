import { useMemo, useState } from "react";
import { Button } from "@/shared/components/ui/button";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@/shared/components/ui/card";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/shared/components/ui/alert-dialog";
import {
	ExternalLink,
	Users,
	UserMinus,
	Loader2,
	MoreVertical,
} from "lucide-react";
import { UserDisplay } from "@/shared/components/user";
import { useWindowSize } from "@/shared/hooks/useWindowSize";
import { BREAKPOINTS } from "@/shared/constants/breakpoints";
import { useRemoveCaretaker } from "../hooks/useRemoveCaretaker";
import { formatDate, isDateExpired } from "@/shared/utils/common.utils";
import { getUserDisplayName } from "@/shared/utils/user.utils";
import type {
	ICaretakeesTableProps,
	ICaretakee,
} from "../types/caretaker.types";

/**
 * CaretakeesTable component
 * Displays list of users the current user is caretaking for
 *
 * Features:
 * - Table with columns: User, Reason, End Date, Actions
 * - Shows caretakee info using UserDisplay component
 * - "View Projects" link for each caretakee
 * - Empty state if no caretakees
 * - Sorts by end date (soonest first)
 * - Shows expired status if end date passed
 * - Responsive design (card layout on mobile)
 *
 * @param caretakees - Array of caretakee data
 */
export const CaretakeesTable = ({ caretakees }: ICaretakeesTableProps) => {
	const { width } = useWindowSize();
	const isMobile = width < BREAKPOINTS.md;
	const shouldUseDropdown = width < BREAKPOINTS.lg; // Same as hamburger menu
	const [caretakeeToRemove, setCaretakeeToRemove] = useState<ICaretakee | null>(
		null
	);

	const removeCaretakerMutation = useRemoveCaretaker();

	// Deduplicate and sort caretakees by end date (soonest first, null dates last)
	const sortedCaretakees = useMemo(() => {
		// Deduplicate by caretaker_obj_id (unique relationship ID)
		const seen = new Set<number>();
		const uniqueCaretakees = caretakees.filter((caretakee) => {
			const key = caretakee.caretaker_obj_id || caretakee.id;
			if (seen.has(key)) {
				return false;
			}
			seen.add(key);
			return true;
		});

		return uniqueCaretakees.sort((a, b) => {
			// If both have end dates, sort by date
			if (a.end_date && b.end_date) {
				return new Date(a.end_date).getTime() - new Date(b.end_date).getTime();
			}

			// If only one has end date, prioritize it
			if (a.end_date && !b.end_date) return -1;
			if (!a.end_date && b.end_date) return 1;

			// If neither has end date, sort by name
			const nameA = getUserDisplayName(a);
			const nameB = getUserDisplayName(b);
			return nameA.localeCompare(nameB);
		});
	}, [caretakees]);

	const handleRemoveCaretaker = (caretakee: ICaretakee) => {
		setCaretakeeToRemove(caretakee);
	};

	const confirmRemoveCaretaker = () => {
		if (!caretakeeToRemove?.caretaker_obj_id) return;

		removeCaretakerMutation.mutate(caretakeeToRemove.caretaker_obj_id, {
			onSuccess: () => {
				setCaretakeeToRemove(null);
			},
		});
	};

	const getCaretakeeName = (caretakee: ICaretakee) => {
		const firstName = caretakee.display_first_name;
		const lastName = caretakee.display_last_name;

		if (firstName && lastName) {
			return `${firstName} ${lastName}`;
		}

		return caretakee.email || "Unknown User";
	};

	// Empty state
	if (caretakees.length === 0) {
		return (
			<Card>
				<CardHeader>
					<CardTitle className="text-lg">My Caretakees</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="text-center py-8">
						<Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
						<h3 className="text-lg font-medium text-gray-900 mb-2">
							No Caretakees
						</h3>
						<p className="text-sm text-gray-500">
							You are not currently caretaking for anyone.
						</p>
					</div>
				</CardContent>
			</Card>
		);
	}

	// Mobile card layout
	if (isMobile) {
		return (
			<Card>
				<CardHeader>
					<CardTitle className="text-lg">
						My Caretakees ({caretakees.length})
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="space-y-4">
						{sortedCaretakees.map((caretakee) => (
							<Card
								key={caretakee.caretaker_obj_id || caretakee.id}
								className="border border-gray-200"
							>
								<CardContent className="p-4 space-y-3">
									{/* User Info */}
									<UserDisplay user={caretakee} showEmail={true} size="sm" />

									{/* Details */}
									<div className="grid grid-cols-2 gap-2 text-sm">
										<div>
											<span className="text-muted-foreground">End Date:</span>
											<p className="font-medium">
												{caretakee.end_date
													? formatDate(caretakee.end_date, "MMM d, yyyy")
													: "No end date"}
											</p>
										</div>
									</div>

									{/* Actions */}
									<div className="flex items-center justify-end">
										<DropdownMenu>
											<DropdownMenuTrigger asChild>
												<Button
													variant="outline"
													size="sm"
													disabled={removeCaretakerMutation.isPending}
												>
													<MoreVertical className="h-4 w-4" />
												</Button>
											</DropdownMenuTrigger>
											<DropdownMenuContent align="end" className="z-50">
												<DropdownMenuItem className="dark:text-gray-200 dark:hover:bg-gray-700 dark:hover:text-white">
													<ExternalLink className="mr-2 h-4 w-4" />
													View Projects
												</DropdownMenuItem>
												<DropdownMenuItem
													onClick={() => handleRemoveCaretaker(caretakee)}
													className="text-red-600 focus:text-red-600 dark:text-red-400 dark:hover:bg-red-900/20 dark:hover:text-red-300 dark:focus:text-red-300"
												>
													<UserMinus className="mr-2 h-4 w-4" />
													Stop Caretaking
												</DropdownMenuItem>
											</DropdownMenuContent>
										</DropdownMenu>
									</div>
								</CardContent>
							</Card>
						))}
					</div>
				</CardContent>
			</Card>
		);
	}

	// Desktop table layout
	return (
		<>
			<div className="overflow-visible">
				<Card className="overflow-visible">
					<CardHeader>
						<CardTitle className="text-lg">
							My Caretakees ({caretakees.length})
						</CardTitle>
					</CardHeader>
					<CardContent className="overflow-visible">
						<div className="overflow-visible">
							<table className="w-full caption-bottom text-sm">
								<thead className="[&_tr]:border-b">
									<tr className="hover:bg-muted/50 data-[state=selected]:bg-muted border-b transition-colors">
										<th className="text-foreground h-10 px-2 text-left align-middle font-medium whitespace-nowrap">
											User
										</th>
										<th className="text-foreground h-10 px-2 text-left align-middle font-medium whitespace-nowrap">
											End Date
										</th>
										<th className="text-foreground h-10 px-2 text-right align-middle font-medium whitespace-nowrap">
											Actions
										</th>
									</tr>
								</thead>
								<tbody className="[&_tr:last-child]:border-0">
									{sortedCaretakees.map((caretakee) => (
										<tr
											key={caretakee.caretaker_obj_id || caretakee.id}
											className="hover:bg-muted/50 data-[state=selected]:bg-muted border-b transition-colors"
										>
											<td className="p-2 align-middle whitespace-nowrap">
												<UserDisplay
													user={caretakee}
													showEmail={true}
													size="sm"
												/>
											</td>
											<td className="p-2 align-middle whitespace-nowrap">
												<span
													className={`text-sm ${isDateExpired(caretakee.end_date) ? "text-red-600 font-medium" : ""}`}
												>
													{caretakee.end_date
														? formatDate(caretakee.end_date, "MMM d, yyyy")
														: "No end date"}
												</span>
											</td>
											<td className="p-2 align-middle whitespace-nowrap text-right relative">
												{shouldUseDropdown ? (
													<div className="relative inline-block">
														<DropdownMenu>
															<DropdownMenuTrigger asChild>
																<Button
																	variant="outline"
																	size="sm"
																	disabled={removeCaretakerMutation.isPending}
																>
																	<MoreVertical className="h-4 w-4" />
																</Button>
															</DropdownMenuTrigger>
															<DropdownMenuContent align="end">
																<DropdownMenuItem className="dark:text-gray-200 dark:hover:bg-gray-700 dark:hover:text-white">
																	<ExternalLink className="mr-2 h-4 w-4" />
																	Projects
																</DropdownMenuItem>
																<DropdownMenuItem
																	onClick={() =>
																		handleRemoveCaretaker(caretakee)
																	}
																	className="text-red-600 focus:text-red-600 dark:text-red-400 dark:hover:bg-red-900/20 dark:hover:text-red-300 dark:focus:text-red-300"
																>
																	<UserMinus className="mr-2 h-4 w-4" />
																	Stop Caretaking
																</DropdownMenuItem>
															</DropdownMenuContent>
														</DropdownMenu>
													</div>
												) : (
													<div className="flex justify-end gap-2">
														<Button
															variant="outline"
															size="sm"
															className="text-blue-600 hover:text-blue-700"
														>
															<ExternalLink className="mr-1 h-3 w-3" />
															Projects
														</Button>
														<Button
															variant="outline"
															size="sm"
															onClick={() => handleRemoveCaretaker(caretakee)}
															disabled={removeCaretakerMutation.isPending}
															className="text-red-600 hover:text-red-700"
														>
															<UserMinus className="mr-1 h-3 w-3" />
															Stop Caretaking
														</Button>
													</div>
												)}
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					</CardContent>
				</Card>
			</div>

			{/* Confirmation Dialog */}
			<AlertDialog
				open={!!caretakeeToRemove}
				onOpenChange={() => setCaretakeeToRemove(null)}
			>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Stop Caretaking</AlertDialogTitle>
						<AlertDialogDescription>
							Are you sure you want to stop being{" "}
							{caretakeeToRemove
								? getCaretakeeName(caretakeeToRemove)
								: "this user"}
							's caretaker?
							<span className="block mt-2 font-medium text-foreground">
								You will no longer be able to manage their projects.
							</span>
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter className="mt-8">
						<AlertDialogCancel disabled={removeCaretakerMutation.isPending}>
							Cancel
						</AlertDialogCancel>
						<AlertDialogAction
							onClick={confirmRemoveCaretaker}
							disabled={removeCaretakerMutation.isPending}
							className="bg-red-600 hover:bg-red-700"
						>
							{removeCaretakerMutation.isPending ? (
								<>
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
									Removing...
								</>
							) : (
								"Stop Caretaking"
							)}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</>
	);
};
