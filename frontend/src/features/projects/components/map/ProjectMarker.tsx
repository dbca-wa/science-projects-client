import { observer } from "mobx-react-lite";
import { useRef, memo, useState, useEffect, useCallback } from "react";
import { Marker, Popup } from "react-leaflet";
import type { IProjectData } from "@/shared/types/project.types";
import { ProjectPopup } from "./ProjectPopup";
import { createProjectMarker } from "@/features/projects/utils/marker-creation";
import { useProjectMapStore } from "@/app/stores/store-context";

interface ProjectMarkerProps {
	projects: IProjectData[];
	position: [number, number];
}

/**
 * ProjectMarker component
 *
 * Renders a modern circular marker on the map for one or more projects.
 * - Uses density-based colors (blue, green, amber, red) for selected markers
 * - Uses muted colors for unselected markers
 * - Shows count number on the marker
 * - Hover animations with scale effect and elevated z-index
 * - Drop shadow for depth
 * - Displays popup with project details on click
 * - Accessible with proper ARIA labels
 * - Handles marker selection state for visual feedback
 * - Hovered markers get highest z-index (2000), selected markers get medium z-index (1000)
 * - Optimized with React.memo to prevent unnecessary re-renders
 */
const ProjectMarkerComponent = observer(
	({ projects, position }: ProjectMarkerProps) => {
		const store = useProjectMapStore();
		const popupRef = useRef<L.Popup>(null);
		const markerRef = useRef<L.Marker>(null);
		const [isHovered, setIsHovered] = useState(false);
		const lastFocusedElement = useRef<HTMLElement | null>(null);

		// Determine if this marker is selected
		const isSelected = store.isMarkerSelected(position);

		// If no marker is selected, all markers show as selected (vibrant colors)
		// If a marker is selected, only that marker shows as selected, others are muted
		const shouldShowAsSelected =
			store.state.selectedMarkerCoords === null || isSelected;

		// Create the circular marker using the utility function
		const marker = createProjectMarker(
			projects,
			position,
			shouldShowAsSelected
		);
		const icon = marker.getIcon();

		// Handle marker click for selection and open popup
		const handleMarkerClick = useCallback(() => {
			// Save the currently focused element before opening popup
			lastFocusedElement.current = document.activeElement as HTMLElement;

			store.selectMarker(position);
			// Open popup
			if (markerRef.current) {
				markerRef.current.openPopup();
			}
		}, [store, position]);

		// Handle popup close - return focus to marker
		const handlePopupClose = () => {
			if (popupRef.current) {
				popupRef.current.close();
			}

			// Return focus to the marker that opened the popup
			if (lastFocusedElement.current) {
				// Small delay to ensure popup is fully closed
				setTimeout(() => {
					lastFocusedElement.current?.focus();
				}, 50);
			}
		};

		// Handle mouse enter
		const handleMouseEnter = () => {
			setIsHovered(true);
		};

		// Handle mouse leave
		const handleMouseLeave = () => {
			setIsHovered(false);
		};

		// Calculate z-index: hovered markers get highest priority, then selected, then normal
		const getZIndexOffset = () => {
			if (isHovered) return 2000; // Highest priority for hovered markers
			if (shouldShowAsSelected) return 1000; // Selected markers
			return 0; // Normal markers
		};

		// Make marker keyboard accessible
		useEffect(() => {
			if (!markerRef.current) return;

			const marker = markerRef.current;
			let cleanup: (() => void) | undefined;
			let observer: MutationObserver | undefined;

			const setupKeyboardAccess = () => {
				const markerElement = (marker as any)._icon;
				if (!markerElement) return;

				// Make marker focusable
				markerElement.setAttribute("tabindex", "0");
				markerElement.setAttribute("role", "button");
				markerElement.setAttribute(
					"aria-label",
					`Project marker: ${projects.length} project${projects.length > 1 ? "s" : ""}. Press Enter to view details.`
				);

				// Function to disable all non-marker divs
				const disableTooltipDivs = () => {
					const markerPane = markerElement.closest(".leaflet-marker-pane");
					if (markerPane) {
						// Find all divs that are NOT project markers
						const allDivs = markerPane.querySelectorAll("div");
						allDivs.forEach((div) => {
							if (
								div instanceof HTMLElement &&
								!div.classList.contains("project-marker")
							) {
								div.setAttribute("tabindex", "-1");
								div.setAttribute("aria-hidden", "true");
								div.style.pointerEvents = "none";
							}
						});
					}
				};

				// Disable tooltip divs immediately
				disableTooltipDivs();

				// Set up MutationObserver to catch dynamically added tooltip divs
				const markerPane = markerElement.closest(".leaflet-marker-pane");
				if (markerPane) {
					observer = new MutationObserver(() => {
						disableTooltipDivs();
					});

					observer.observe(markerPane, {
						childList: true,
						subtree: true,
					});
				}

				// Add keyboard event handler
				const handleKeyDown = (e: KeyboardEvent) => {
					// Only handle Enter and Space, ignore arrow keys
					if (e.key === "Enter" || e.key === " ") {
						e.preventDefault();
						e.stopPropagation();
						handleMarkerClick();
					}
					// Prevent arrow keys from doing anything (they would normally pan the map)
					else if (
						["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)
					) {
						e.preventDefault();
						e.stopPropagation();
						// Keep focus on the marker, don't let it move
					}
				};

				// Handle focus - apply visual effects and center map on marker
				const handleFocus = (e: FocusEvent) => {
					// Pan map to center this marker
					const map = (window as Window & { __leafletMap?: L.Map })
						.__leafletMap;

					if (map && marker) {
						// Get marker's lat/lng position
						const markerLatLng = marker.getLatLng();

						// Pan to marker with smooth animation
						map.panTo(markerLatLng, {
							animate: true,
							duration: 0.5, // 500ms
							easeLinearity: 0.25,
						});
					}

					// Find the marker pane - it's the parent of all marker containers
					const markerPane = document.querySelector(".leaflet-marker-pane");
					if (markerPane) {
						// Get ALL marker divs (not img tags!) in the marker pane
						const allMarkers = markerPane.querySelectorAll(".project-marker");

						// First, restore ALL markers to normal (clear any previous focus)
						allMarkers.forEach((marker: Element) => {
							const el = marker as HTMLElement;
							el.style.opacity = "1";
							el.style.filter = "";
							el.style.transition = "";
							el.style.boxShadow = "";
							el.style.borderRadius = "";
							el.style.zIndex = "";
							el.style.animation = "";
						});

						// Then dim all OTHER markers (make them gray but still visible)
						allMarkers.forEach((marker: Element) => {
							if (marker !== markerElement) {
								const el = marker as HTMLElement;
								el.style.opacity = "0.8";
								el.style.filter = "grayscale(80%) blur(1px)";
								el.style.transition = "all 0.2s ease-in-out";
							}
						});
					}

					// Apply glow effect to THIS marker
					markerElement.style.opacity = "1";
					markerElement.style.filter = "";
					markerElement.style.boxShadow = `
						0 0 0 5px white,
						0 0 0 10px #2563eb,
						0 0 0 15px white,
						0 0 0 20px #2563eb,
						0 0 40px 20px rgba(37, 99, 235, 0.9),
						0 0 60px 30px rgba(37, 99, 235, 0.6),
						0 0 80px 40px rgba(37, 99, 235, 0.3)
					`;
					markerElement.style.borderRadius = "50%";
					markerElement.style.zIndex = "9999";
					markerElement.style.animation =
						"marker-focus-pulse 1.5s ease-in-out infinite";
				};

				// Handle blur - restore all markers
				const handleBlur = (e: FocusEvent) => {
					// Find the marker pane
					const markerPane = document.querySelector(".leaflet-marker-pane");
					if (markerPane) {
						const allMarkers = markerPane.querySelectorAll(".project-marker");

						// Restore ALL markers to normal
						allMarkers.forEach((marker: Element) => {
							const el = marker as HTMLElement;
							el.style.opacity = "";
							el.style.filter = "";
							el.style.transition = "";
							el.style.boxShadow = "";
							el.style.borderRadius = "";
							el.style.zIndex = "";
							el.style.animation = "";
						});
					}
				};

				markerElement.addEventListener("keydown", handleKeyDown);
				markerElement.addEventListener("focus", handleFocus);
				markerElement.addEventListener("blur", handleBlur);

				// Return cleanup function
				cleanup = () => {
					markerElement.removeEventListener("keydown", handleKeyDown);
					markerElement.removeEventListener("focus", handleFocus);
					markerElement.removeEventListener("blur", handleBlur);
					if (observer) {
						observer.disconnect();
					}
				};
			};

			// Try to set up immediately if icon exists
			if ((marker as any)._icon) {
				setupKeyboardAccess();
			}

			// Also listen for 'add' event in case icon doesn't exist yet
			const onAdd = () => {
				// Small delay to ensure DOM is ready
				setTimeout(setupKeyboardAccess, 0);
			};

			marker.on("add", onAdd);

			// Cleanup
			return () => {
				marker.off("add", onAdd);
				if (cleanup) cleanup();
			};
		}, [projects.length, handleMarkerClick]);

		return (
			<Marker
				ref={markerRef}
				position={position}
				icon={icon}
				zIndexOffset={getZIndexOffset()} // Dynamic z-index based on hover and selection state
				eventHandlers={{
					click: handleMarkerClick,
					mouseover: handleMouseEnter,
					mouseout: handleMouseLeave,
				}}
			>
				<Popup
					ref={popupRef}
					maxWidth={300}
					minWidth={250}
					closeButton={true}
					closeOnEscapeKey={true}
				>
					<div className="p-2">
						<ProjectPopup projects={projects} onClose={handlePopupClose} />
					</div>
				</Popup>
			</Marker>
		);
	}
);

// Memoize the component to prevent unnecessary re-renders
// Only re-render when projects, position, or selection state changes
export const ProjectMarker = memo(
	ProjectMarkerComponent,
	(prevProps, nextProps) => {
		// Custom comparison function for better performance
		return (
			prevProps.projects.length === nextProps.projects.length &&
			prevProps.projects.every(
				(project, index) => project.id === nextProps.projects[index]?.id
			) &&
			prevProps.position[0] === nextProps.position[0] &&
			prevProps.position[1] === nextProps.position[1]
		);
	}
);
