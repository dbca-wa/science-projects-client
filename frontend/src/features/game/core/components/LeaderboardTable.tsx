import { DataTable } from "@/shared/components/data-table/data-table";
import { leaderboardColumns } from "./leaderboard-columns";
import type { LeaderboardEntry } from "../types/game.types";

interface LeaderboardTableProps {
	entries: LeaderboardEntry[];
	isLoading?: boolean;
}

export const LeaderboardTable = ({
	entries,
	isLoading,
}: LeaderboardTableProps) => {
	if (isLoading) {
		return (
			<div className="text-center py-8 text-gray-500">
				Loading leaderboard...
			</div>
		);
	}

	if (!entries || entries.length === 0) {
		return (
			<div className="text-center py-8 text-gray-500">
				No scores yet. Be the first to play!
			</div>
		);
	}

	return (
		<DataTable
			columns={leaderboardColumns}
			data={entries}
			searchKey="username"
			searchPlaceholder="Search players..."
		/>
	);
};
