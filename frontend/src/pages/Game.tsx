import { observer } from "mobx-react-lite";
import { useStore } from "@/app/stores/useStore";
import { PageHead } from "@/shared/components/layout/PageHead";
import { Button } from "@/shared/components/ui/button";
import { GameBoard } from "@/features/game/components/GameBoard";
import { GameHUD } from "@/features/game/components/GameHUD";
import { GameOverModal } from "@/features/game/components/GameOverModal";
import { DifficultySelector } from "@/features/game/components/DifficultySelector";

const Game = observer(() => {
	const { gameStore } = useStore();

	return (
		<>
			<PageHead />
			<div className="space-y-4">
				{gameStore.gameState === "idle" && (
					<div className="flex flex-col items-center justify-center min-h-[60vh] space-y-8">
						<div className="text-center">
							<h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
								Reaction Clicker
							</h1>
							<p className="text-gray-600 dark:text-gray-400">
								Click the targets before they disappear!
							</p>
						</div>

						<DifficultySelector />

						<Button
							onClick={() => gameStore.startGame()}
							size="lg"
							className="px-12"
						>
							Start Game
						</Button>
					</div>
				)}

				{(gameStore.gameState === "playing" ||
					gameStore.gameState === "paused") && (
					<>
						<GameHUD />
						<GameBoard />
					</>
				)}

				<GameOverModal />
			</div>
		</>
	);
});

export default Game;
