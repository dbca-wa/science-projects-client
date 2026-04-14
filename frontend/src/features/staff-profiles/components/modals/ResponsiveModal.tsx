import { useRef, useEffect, type ReactNode } from "react";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/shared/components/ui/dialog";
import {
	Drawer,
	DrawerContent,
	DrawerDescription,
	DrawerHeader,
	DrawerTitle,
} from "@/shared/components/ui/drawer";
import { useMediaQuery } from "@/shared/hooks/ui/useMediaQuery";
import { BREAKPOINTS } from "@/shared/constants/breakpoints";

interface ResponsiveModalProps {
	title: string;
	open: boolean;
	onOpenChange: (open: boolean) => void;
	children: ReactNode;
	/** Max width for the dialog on desktop */
	maxWidth?: string;
}

/**
 * Shared responsive modal — Dialog on desktop, Drawer on mobile.
 * Used by all staff profile modals for consistent behaviour.
 */
const ResponsiveModal = ({
	title,
	open,
	onOpenChange,
	children,
	maxWidth = "sm:max-w-[500px]",
}: ResponsiveModalProps) => {
	const isDesktop = useMediaQuery(`(min-width: ${BREAKPOINTS.md}px)`);

	if (isDesktop) {
		return (
			<Dialog open={open} onOpenChange={onOpenChange}>
				<DialogContent className={`p-4 text-slate-800 ${maxWidth}`}>
					<DialogDescription className="sr-only">{title}</DialogDescription>
					<DialogHeader>
						<DialogTitle className="mb-2 mt-3">{title}</DialogTitle>
					</DialogHeader>
					{children}
				</DialogContent>
			</Dialog>
		);
	}

	return (
		<Drawer open={open} onOpenChange={onOpenChange}>
			<DrawerContent className="px-2 pb-4">
				<DrawerDescription className="sr-only">{title}</DrawerDescription>
				<DrawerAutoFocus>
					<div className="w-full text-slate-800">
						<DrawerHeader>
							<DrawerTitle className="mb-2 mt-3">{title}</DrawerTitle>
						</DrawerHeader>
						{children}
					</div>
				</DrawerAutoFocus>
			</DrawerContent>
		</Drawer>
	);
};

/** Auto-focuses the first input inside the drawer on mount */
function DrawerAutoFocus({ children }: { children: ReactNode }) {
	const ref = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const timer = setTimeout(() => {
			const firstInput = ref.current?.querySelector<HTMLElement>(
				"input:not([disabled]), textarea:not([disabled])"
			);
			firstInput?.focus();
		}, 100);
		return () => clearTimeout(timer);
	}, []);

	return <div ref={ref}>{children}</div>;
}

export default ResponsiveModal;
