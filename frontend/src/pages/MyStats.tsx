import { observer } from "mobx-react-lite";
import { PageHead } from "@/shared/components/layout/PageHead";
import { useUserStats } from "@/features/game/hooks/useGameQueries";
import { StatsOverview } from "@/features/stats/components/StatsOverview";
import { RecentGames } from "@/features/stats/components/RecentGames";

const MyStats = observer(() => {
	const { data: stats, isLoading, error } = useUserStats();

	if (isLoading) {
		return (
			<>
				<PageHead />
				<div className="text-center py-12">
					<p className="text-gray-600 dark:text-gray-400">
						Loading your statistics...
					</p>
				</div>
			</>
		);
	}

	if (error || !stats) {
		return (
			<>
				<PageHead />
				<div className="text-center py-12">
					<p className="text-red-600">Failed to load statistics</p>
				</div>
			</>
		);
	}

	return (
		<>
			<PageHead />
			<div className="space-y-6">
				<div>
					<h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
						My Statistics
					</h1>
					<p className="text-gray-600 dark:text-gray-400">
						Track your progress and performance
					</p>
				</div>

				<StatsOverview stats={stats} />

				<div className="bg-gray-50 dark:bg-gray-800 rounded-lg shadow p-6">
					<h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
						Recent Games
					</h2>
					<RecentGames games={stats.recentGames} />
				</div>

				<div className="bg-gray-50 dark:bg-gray-800 rounded-lg shadow p-6">
					<h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
						Games by Difficulty
					</h2>
					<div className="grid grid-cols-3 gap-4">
						<div className="text-center">
							<p className="text-2xl font-bold text-green-600 dark:text-green-400">
								{stats.gamesPerDifficulty.easy}
							</p>
							<p className="text-sm text-gray-600 dark:text-gray-400">
								Easy
							</p>
						</div>
						<div className="text-center">
							<p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
								{stats.gamesPerDifficulty.normal}
							</p>
							<p className="text-sm text-gray-600 dark:text-gray-400">
								Normal
							</p>
						</div>
						<div className="text-center">
							<p className="text-2xl font-bold text-red-600 dark:text-red-400">
								{stats.gamesPerDifficulty.hard}
							</p>
							<p className="text-sm text-gray-600 dark:text-gray-400">
								Hard
							</p>
						</div>
					</div>
				</div>
			</div>
		</>
	);
});

export default MyStats;
