import { observer } from "mobx-react-lite";
import { useStore } from "@/app/stores/useStore";
import { Button } from "@/shared/components/ui/button";
import { useSubmitScore } from "../hooks/useGameQueries";
import { useEffect } from "react";

export const GameOverModal = observer(() => {
	const { gameStore, authStore } = useStore();
	const { mutate: submitScore } = useSubmitScore();

	// Submit score when game ends (only if authenticated)
	useEffect(() => {
		if (gameStore.gameState === "gameOver" && authStore.isAuthenticated) {
			submitScore({
				...gameStore.finalStats,
			});
		}
	}, [gameStore.gameState, authStore.isAuthenticated, submitScore]);

	if (gameStore.gameState !== "gameOver") return null;

	return (
		<div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
			<div className="bg-white dark:bg-gray-800 rounded-lg p-8 max-w-md w-full mx-4 shadow-2xl">
				<h2 className="text-3xl font-bold text-center mb-6 text-gray-900 dark:text-white">
					Game Over!
				</h2>

				{!authStore.isAuthenticated && (
					<div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
						<p className="text-sm text-blue-800 dark:text-blue-200 text-center">
							💡 Login to save your score and compete on the
							leaderboard!
						</p>
					</div>
				)}

				<div className="space-y-4 mb-6">
					<div className="flex justify-between items-center">
						<span className="text-gray-600 dark:text-gray-400">
							Final Score:
						</span>
						<span className="text-2xl font-bold text-gray-900 dark:text-white">
							{gameStore.score}
						</span>
					</div>
					<div className="flex justify-between items-center">
						<span className="text-gray-600 dark:text-gray-400">
							Hits:
						</span>
						<span className="text-lg font-semibold text-green-500">
							{gameStore.hits}
						</span>
					</div>
					<div className="flex justify-between items-center">
						<span className="text-gray-600 dark:text-gray-400">
							Misses:
						</span>
						<span className="text-lg font-semibold text-red-500">
							{gameStore.misses}
						</span>
					</div>
					<div className="flex justify-between items-center">
						<span className="text-gray-600 dark:text-gray-400">
							Accuracy:
						</span>
						<span className="text-lg font-semibold text-blue-500">
							{gameStore.accuracy}%
						</span>
					</div>
					<div className="flex justify-between items-center">
						<span className="text-gray-600 dark:text-gray-400">
							Highest Combo:
						</span>
						<span className="text-lg font-semibold text-orange-500">
							{gameStore.highestCombo}x
						</span>
					</div>
					<div className="flex justify-between items-center">
						<span className="text-gray-600 dark:text-gray-400">
							Difficulty:
						</span>
						<span className="text-lg font-semibold text-purple-500 capitalize">
							{gameStore.difficulty}
						</span>
					</div>
				</div>

				<div className="flex gap-3">
					<Button
						onClick={() => gameStore.startGame()}
						className="flex-1"
						size="lg"
					>
						Play Again
					</Button>
					<Button
						onClick={() => gameStore.resetGame()}
						variant="outline"
						className="flex-1"
						size="lg"
					>
						Main Menu
					</Button>
				</div>
			</div>
		</div>
	);
});
