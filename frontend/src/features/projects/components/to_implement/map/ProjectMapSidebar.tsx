import { ArrowLeft, Menu, X } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { ScrollArea } from "@/shared/components/ui/scroll-area";
import { Link } from "react-router";
import { cn } from "@/shared/lib/utils";

interface ProjectMapSidebarProps {
	isOpen: boolean;
	onToggle: () => void;
	children: React.ReactNode;
}

/**
 * ProjectMapSidebar component
 * 
 * Responsive sidebar container for map filters.
 * - Fixed width 384px on desktop
 * - Hidden by default on mobile (<1024px)
 * - Overlay with backdrop on mobile when shown
 */
export function ProjectMapSidebar({
	isOpen,
	onToggle,
	children,
}: ProjectMapSidebarProps) {
	return (
		<>
			{/* Mobile toggle button */}
			<Button
				variant="outline"
				size="icon"
				className="fixed top-4 left-4 z-50 lg:hidden"
				onClick={onToggle}
				aria-label={isOpen ? "Close sidebar" : "Open sidebar"}
			>
				{isOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
			</Button>

			{/* Backdrop for mobile */}
			{isOpen && (
				<div
					className="fixed inset-0 bg-black/50 z-40 lg:hidden"
					onClick={onToggle}
					aria-hidden="true"
				/>
			)}

			{/* Sidebar */}
			<aside
				className={cn(
					"fixed lg:relative inset-y-0 left-0 z-40",
					"w-96 bg-background border-r",
					"transform transition-transform duration-300 ease-in-out",
					"lg:transform-none",
					isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
				)}
			>
				<ScrollArea className="h-full">
					<div className="p-6 space-y-6">
						{/* Back button */}
						<Link to="/projects">
							<Button variant="ghost" className="w-full justify-start">
								<ArrowLeft className="h-4 w-4 mr-2" />
								Back to Projects
							</Button>
						</Link>

						{children}
					</div>
				</ScrollArea>
			</aside>
		</>
	);
}
