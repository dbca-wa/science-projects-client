import { type ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import type { LeaderboardEntry } from "../types/game.types";

export const leaderboardColumns: ColumnDef<LeaderboardEntry>[] = [
	{
		accessorKey: "rank",
		header: ({ column }) => {
			return (
				<Button
					variant="ghost"
					onClick={() =>
						column.toggleSorting(column.getIsSorted() === "asc")
					}
				>
					Rank
					<ArrowUpDown className="ml-2 h-4 w-4" />
				</Button>
			);
		},
		cell: ({ row }) => {
			const rank = row.original.rank;
			return (
				<div className="flex items-center">
					{rank <= 3 && (
						<span className="mr-2 text-lg">
							{rank === 1 ? "🥇" : rank === 2 ? "🥈" : "🥉"}
						</span>
					)}
					<span className="text-sm font-medium">#{rank}</span>
				</div>
			);
		},
	},
	{
		accessorKey: "username",
		header: ({ column }) => {
			return (
				<Button
					variant="ghost"
					onClick={() =>
						column.toggleSorting(column.getIsSorted() === "asc")
					}
				>
					Player
					<ArrowUpDown className="ml-2 h-4 w-4" />
				</Button>
			);
		},
		cell: ({ row }) => (
			<span className="font-medium">
				{row.original.username}
				{row.original.isCurrentUser && (
					<span className="ml-2 text-xs text-blue-600 dark:text-blue-400">
						(You)
					</span>
				)}
			</span>
		),
	},
	{
		accessorKey: "score",
		header: ({ column }) => {
			return (
				<Button
					variant="ghost"
					onClick={() =>
						column.toggleSorting(column.getIsSorted() === "asc")
					}
				>
					Score
					<ArrowUpDown className="ml-2 h-4 w-4" />
				</Button>
			);
		},
		cell: ({ getValue }) => (
			<span className="font-bold">{getValue() as number}</span>
		),
	},
	{
		accessorKey: "difficulty",
		header: "Difficulty",
		cell: ({ getValue }) => {
			const difficulty = getValue() as string;
			return (
				<span
					className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full capitalize
					${
						difficulty === "easy"
							? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
							: difficulty === "normal"
							? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400"
							: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
					}
				`}
				>
					{difficulty}
				</span>
			);
		},
		filterFn: (row, id, value) => {
			return value.includes(row.getValue(id));
		},
	},
	{
		accessorKey: "playedAt",
		header: ({ column }) => {
			return (
				<Button
					variant="ghost"
					onClick={() =>
						column.toggleSorting(column.getIsSorted() === "asc")
					}
				>
					Date
					<ArrowUpDown className="ml-2 h-4 w-4" />
				</Button>
			);
		},
		cell: ({ getValue }) => (
			<span className="text-sm text-muted-foreground">
				{new Date(getValue() as string).toLocaleDateString()}
			</span>
		),
	},
];
