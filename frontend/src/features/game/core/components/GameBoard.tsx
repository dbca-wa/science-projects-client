import { observer } from "mobx-react-lite";
import { useStore } from "@/app/stores/useStore";
import { Target } from "./Target";
import { useGameLoop } from "../hooks/useGameLoop";
import { useEffect, useRef } from "react";

export const GameBoard = observer(() => {
	const { gameStore } = useStore();
	const boardRef = useRef<HTMLDivElement>(null);

	// Heartbeat for the timer
	useGameLoop();

	useEffect(() => {
		const updateDimensions = () => {
			if (boardRef.current) {
				// This gives us the exact usable pixel area of the div
				gameStore.setBoardDimensions(
					boardRef.current.clientWidth,
					boardRef.current.clientHeight
				);
			}
		};

		updateDimensions();
		window.addEventListener("resize", updateDimensions);
		return () => window.removeEventListener("resize", updateDimensions);
	}, [gameStore]);

	const handleBoardClick = (e: React.MouseEvent) => {
		if (e.target === e.currentTarget && gameStore.gameState === "playing") {
			if (gameStore.targets.length > 0) {
				const targetId = gameStore.targets[0].id;
				gameStore.missTarget(targetId);
			}
		}
	};

	return (
		<div
			ref={boardRef}
			onClick={handleBoardClick}
			className="relative w-full h-[calc(100vh-20rem)] bg-linear-to-br from-gray-100 to-gray-200 dark:from-gray-900 dark:to-gray-800 rounded-lg overflow-hidden border-2 border-gray-300 dark:border-gray-700 cursor-crosshair"
		>
			{gameStore.targets.map((target) => (
				<Target key={target.id} target={target} />
			))}

			{gameStore.gameState === "paused" && (
				<div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm pointer-events-none">
					<div className="text-white text-4xl font-bold">PAUSED</div>
				</div>
			)}
		</div>
	);
});
