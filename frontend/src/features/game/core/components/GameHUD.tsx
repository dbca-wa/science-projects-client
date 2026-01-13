import { observer } from "mobx-react-lite";
import { useStore } from "@/app/stores/useStore";
import { Button } from "@/shared/components/ui/button";

export const GameHUD = observer(() => {
	const { gameStore } = useStore();

	return (
		<div className="flex justify-between items-center mb-4 p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
			<div className="flex gap-6">
				<div>
					<p className="text-sm text-gray-600 dark:text-gray-400">
						Score
					</p>
					<p className="text-2xl font-bold text-gray-900 dark:text-white">
						{gameStore.score}
					</p>
				</div>
				<div>
					<p className="text-sm text-gray-600 dark:text-gray-400">
						Time
					</p>
					<p className="text-2xl font-bold text-gray-900 dark:text-white">
						{(gameStore.timeRemainingMs / 1000).toFixed(1)}s
					</p>
				</div>
				<div>
					<p className="text-sm text-gray-600 dark:text-gray-400">
						Combo
					</p>
					<p className="text-2xl font-bold text-orange-500">
						{gameStore.currentCombo}x
					</p>
				</div>
				<div>
					<p className="text-sm text-gray-600 dark:text-gray-400">
						Accuracy
					</p>
					<p className="text-2xl font-bold text-blue-500">
						{gameStore.accuracy}%
					</p>
				</div>
			</div>
			<div className="flex gap-2">
				{gameStore.gameState === "playing" && (
					<Button
						onClick={() => gameStore.pauseGame()}
						variant="outline"
					>
						⏸️ Pause
					</Button>
				)}
				{gameStore.gameState === "paused" && (
					<Button onClick={() => gameStore.resumeGame()}>
						▶️ Resume
					</Button>
				)}
			</div>
		</div>
	);
});
