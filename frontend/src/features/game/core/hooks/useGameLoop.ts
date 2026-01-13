import { useEffect, useRef } from "react";
import { useStore } from "@/app/stores/useStore";

/**
 * Custom hook to manage the game timer
 * Ticks 10 times per second when game is in playing state
 */
export const useGameLoop = () => {
	const { gameStore } = useStore();
	const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

	useEffect(() => {
		// Only run timer when game is playing
		if (gameStore.gameState === "playing") {
			intervalRef.current = setInterval(() => {
				gameStore.tick();
			}, 100); // Tick ten times every second
		}

		// Cleanup interval when game state changes or component unmounts
		return () => {
			if (intervalRef.current) {
				clearInterval(intervalRef.current);
			}
		};
	}, [gameStore, gameStore.gameState]);
};
