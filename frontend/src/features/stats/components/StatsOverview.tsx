import type { UserStats } from "@/features/game/types/game.types";

interface StatsOverviewProps {
	stats: UserStats;
}

export const StatsOverview = ({ stats }: StatsOverviewProps) => {
	const statCards = [
		{
			label: "Total Games",
			value: stats.totalGames,
			color: "text-blue-600 dark:text-blue-400",
		},
		{
			label: "Best Score",
			value: stats.bestScore,
			color: "text-green-600 dark:text-green-400",
		},
		{
			label: "Average Score",
			value: Math.round(stats.averageScore),
			color: "text-purple-600 dark:text-purple-400",
		},
		{
			label: "Overall Accuracy",
			value: `${stats.overallAccuracy}%`,
			color: "text-orange-600 dark:text-orange-400",
		},
		{
			label: "Best Combo",
			value: `${stats.bestCombo}x`,
			color: "text-red-600 dark:text-red-400",
		},
		{
			label: "Favorite Difficulty",
			value: stats.favoritesDifficulty,
			color: "text-indigo-600 dark:text-indigo-400",
			capitalize: true,
		},
	];

	return (
		<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
			{statCards.map((stat) => (
				<div
					key={stat.label}
					className="bg-white dark:bg-gray-800 rounded-lg shadow p-6"
				>
					<p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
						{stat.label}
					</p>
					<p
						className={`text-3xl font-bold ${stat.color} ${
							stat.capitalize ? "capitalize" : ""
						}`}
					>
						{stat.value}
					</p>
				</div>
			))}
		</div>
	);
};
