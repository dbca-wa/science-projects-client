import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";

interface ConfettiPortalProps {
	/**
	 * Whether the portal should be active
	 */
	isActive: boolean;
	/**
	 * Children to render in the portal (typically a canvas)
	 */
	children: React.ReactNode;
}

/**
 * ConfettiPortal - Renders confetti canvas at layout level using React Portal
 * 
 * This component uses React Portal to render the confetti canvas in the
 * #confetti-root container that exists at the layout level. This ensures
 * proper positioning relative to the sidebar in Modern layout and full-screen
 * coverage in Traditional layout.
 * 
 * Features:
 * - Renders at layout level (not nested in page content)
 * - Respects sidebar boundaries in Modern layout
 * - Full-screen in Traditional layout
 * - Proper z-index management
 * - Pointer-events-none to avoid blocking interactions
 * 
 * @example
 * <ConfettiPortal isActive={showConfetti}>
 *   <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
 * </ConfettiPortal>
 */
export function ConfettiPortal({ isActive, children }: ConfettiPortalProps) {
	const portalRoot = useRef<HTMLElement | null>(null);

	useEffect(() => {
		// Find the portal container in the layout
		portalRoot.current = document.getElementById("confetti-root");
		
		if (!portalRoot.current) {
			console.warn("ConfettiPortal: #confetti-root container not found in layout");
		}
	}, []);

	// Only render if active and portal root exists
	if (!isActive || !portalRoot.current) {
		return null;
	}

	return createPortal(children, portalRoot.current);
}
