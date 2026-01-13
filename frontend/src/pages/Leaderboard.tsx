import { useState } from "react";
import { observer } from "mobx-react-lite";
import { PageHead } from "@/shared/components/layout/PageHead";
import type { LeaderboardFilters } from "@/features/game/core/types/game.types";
import { useLeaderboard } from "@/features/game/core/hooks/useGameQueries";
import { LeaderboardFiltersComponent } from "@/features/game/core/components/LeaderboardFilters";
import { LeaderboardTable } from "@/features/game/core/components/LeaderboardTable";

const Leaderboard = observer(() => {
	const [filters, setFilters] = useState<LeaderboardFilters>({
		difficulty: "all",
		timeframe: "allTime",
	});

	const { data: leaderboard, isLoading } = useLeaderboard(filters);

	return (
		<>
			<PageHead />
			<div className="space-y-6">
				<div>
					<h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
						Leaderboard
					</h1>
					<p className="text-gray-600 dark:text-gray-400">
						Top players ranked by score
					</p>
				</div>

				<div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
					<LeaderboardFiltersComponent onFilterChange={setFilters} />
					<LeaderboardTable
						entries={leaderboard || []}
						isLoading={isLoading}
					/>
				</div>
			</div>
		</>
	);
});

export default Leaderboard;
