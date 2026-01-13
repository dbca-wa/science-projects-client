import type { GameScore } from "@/features/game/types/game.types";

interface RecentGamesProps {
	games: GameScore[];
}

export const RecentGames = ({ games }: RecentGamesProps) => {
	if (!games || games.length === 0) {
		return (
			<div className="text-center py-8 text-gray-500">
				No games played yet. Start playing to see your history!
			</div>
		);
	}

	return (
		<div className="space-y-3">
			{games.map((game) => (
				<div
					key={game.id}
					className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 flex items-center justify-between"
				>
					<div>
						<p className="font-bold text-gray-900 dark:text-white">
							Score: {game.score}
						</p>
						<p className="text-sm text-gray-600 dark:text-gray-400">
							{game.hits} hits, {game.misses} misses •{" "}
							{game.accuracy}% accuracy
						</p>
						<p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
							{new Date(game.playedAt).toLocaleString()}
						</p>
					</div>
					<div>
						<span
							className={`px-3 py-1 text-sm font-semibold rounded-full capitalize
							${
								game.difficulty === "easy"
									? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
									: game.difficulty === "normal"
									? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400"
									: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
							}
						`}
						>
							{game.difficulty}
						</span>
					</div>
				</div>
			))}
		</div>
	);
};
