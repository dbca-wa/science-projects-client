import { observer } from "mobx-react-lite";
import { useStore } from "@/app/stores/useStore";
import { Button } from "@/shared/components/ui/button";

export const GameOverModal = observer(() => {
	const { gameStore } = useStore();

	if (gameStore.gameState !== "gameOver") return null;

	return (
		<div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
			<div className="bg-white dark:bg-gray-800 rounded-lg p-8 max-w-md w-full mx-4 shadow-2xl">
				<h2 className="text-3xl font-bold text-center mb-6 text-gray-900 dark:text-white">
					Game Over!
				</h2>

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
