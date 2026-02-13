import { observer } from "mobx-react-lite";
import { useEffect, useState } from "react";

interface ZoomLevelProps {
	zoomLevel: number;
}

/**
 * ZoomLevel - Displays current map zoom level with fancy animation
 *
 * Positioned in the bottom-right corner of the map
 * Shows zoom as a multiplier where 1x = most zoomed out (minZoom = 5)
 * Each zoom level represents a 2x increase in scale (standard Leaflet behavior)
 * Animates with a "damage counter" style scale effect when zoom changes
 * Shown in both normal and fullscreen modes
 */
export const ZoomLevel = observer(({ zoomLevel }: ZoomLevelProps) => {
	const [animationKey, setAnimationKey] = useState(0);

	// Leaflet zoom levels work on a power of 2 scale
	// Each zoom level doubles the scale
	const minZoom = 5;
	const zoomMultiplier = Math.pow(2, zoomLevel - minZoom);

	// Trigger animation when zoom level changes
	useEffect(() => {
		setAnimationKey((prev) => prev + 1);
	}, [zoomLevel]);

	return (
		<div className="relative pointer-events-none select-none">
			<style>{`
				@keyframes zoomPop {
					0% {
						transform: scale(1);
					}
					50% {
						transform: scale(1.5);
					}
					100% {
						transform: scale(1);
					}
				}
				.zoom-animate {
					animation: zoomPop 0.3s ease-out;
				}
			`}</style>
			<span
				key={animationKey}
				className="zoom-animate font-semibold text-blue-500 dark:text-cyan-300 text-2xl sm:text-3xl inline-block"
				style={{
					textShadow:
						"0 0 8px rgba(59, 130, 246, 0.3), 0 0 15px rgba(59, 130, 246, 0.2), 1px 1px 2px rgba(0, 0, 0, 0.2)",
					filter: "drop-shadow(0 1px 4px rgba(59, 130, 246, 0.3))",
				}}
			>
				{zoomMultiplier}x
			</span>
		</div>
	);
});
