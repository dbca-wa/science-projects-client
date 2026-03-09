import { cn } from "@/shared/lib/utils";
import { useEffect, useRef, useState } from "react";

interface ProjectStatusOverlayProps {
	status: string;
	className?: string;
}

/**
 * ProjectStatusOverlay component
 *
 * Displays a diagonal "SUSPENDED" or "TERMINATED" overlay on project images
 * when the project is in one of these states. Similar to "CONFIDENTIAL" stamps on documents.
 *
 * Design:
 * - Diagonal text from bottom-left to top-right
 * - Red text with red border
 * - No background (transparent)
 * - Fits within container with padding
 * - Only shows for suspended or terminated projects
 * - Font size scales based on container dimensions
 */
export function ProjectStatusOverlay({
	status,
	className,
}: ProjectStatusOverlayProps) {
	const containerRef = useRef<HTMLDivElement>(null);
	const [fontSize, setFontSize] = useState(32);

	// Calculate font size based on container dimensions
	useEffect(() => {
		const updateFontSize = () => {
			if (containerRef.current) {
				const { width, height } = containerRef.current.getBoundingClientRect();
				// Calculate diagonal length
				const diagonal = Math.sqrt(width * width + height * height);
				// Scale font size to fit the diagonal - larger percentage for full span
				const calculatedSize = Math.max(24, Math.min(diagonal * 0.12, 200));
				setFontSize(calculatedSize);
			}
		};

		updateFontSize();

		// Update on resize
		const resizeObserver = new ResizeObserver(updateFontSize);
		if (containerRef.current) {
			resizeObserver.observe(containerRef.current);
		}

		return () => resizeObserver.disconnect();
	}, []);

	// Early return if status is undefined or null
	if (!status) {
		return null;
	}

	const displayText = status.toUpperCase();

	// Only show for suspended or terminated projects
	if (status !== "suspended" && status !== "terminated") {
		return null;
	}

	return (
		<div
			ref={containerRef}
			className={cn(
				"absolute inset-0 pointer-events-none flex items-center justify-center overflow-hidden",
				className
			)}
			style={{
				// Add fixed padding to prevent border cutoff at corners
				padding: "8px",
			}}
		>
			{/* Diagonal overlay text - spans full diagonal with padding accounted for */}
			<div
				className="transform rotate-[-45deg] whitespace-nowrap select-none"
				style={{
					// Span close to full diagonal width (slightly reduced to fit with padding)
					width: "135%", // Slightly less than sqrt(2) * 100% to account for padding
				}}
			>
				<span
					className="font-bold tracking-widest border-[3px] border-red-600 text-red-600 inline-block rounded-md w-full text-center"
					style={{
						// Dynamic font size based on container diagonal
						fontSize: `${fontSize}px`,
						// Padding scales with font size
						padding: `${fontSize * 0.08}px ${fontSize * 0.15}px`,
					}}
				>
					{displayText}
				</span>
			</div>
		</div>
	);
}
