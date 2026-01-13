import { observer } from "mobx-react-lite";
import type { Difficulty } from "@/app/stores/game.store";
import { useStore } from "@/app/stores/useStore";

export const DifficultySelector = observer(() => {
	const { gameStore } = useStore();

	const difficulties: {
		value: Difficulty;
		label: string;
		description: string;
	}[] = [
		{
			value: "easy",
			label: "Easy",
			description: "Larger targets, +2s reward, -1s penalty",
		},
		{
			value: "normal",
			label: "Normal",
			description: "Standard targets, +1s reward, -2s penalty",
		},
		{
			value: "hard",
			label: "Hard",
			description: "Tiny targets, +0.5s reward, -3s penalty",
		},
	];

	return (
		<div className="space-y-4">
			<h3 className="text-lg font-semibold text-gray-900 dark:text-white">
				Select Difficulty
			</h3>
			<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
				{difficulties.map((diff) => (
					<button
						key={diff.value}
						onClick={() => gameStore.setDifficulty(diff.value)}
						className={`
							p-4 rounded-lg border-2 transition-all text-left
							${
								gameStore.difficulty === diff.value
									? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
									: "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
							}
						`}
					>
						<p className="font-bold text-gray-900 dark:text-white mb-1">
							{diff.label}
						</p>
						<p className="text-sm text-gray-600 dark:text-gray-400">
							{diff.description}
						</p>
					</button>
				))}
			</div>
		</div>
	);
});
