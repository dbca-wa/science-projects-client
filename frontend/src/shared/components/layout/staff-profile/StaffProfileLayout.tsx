import { type ReactNode, useEffect, useRef } from "react";
import "@/shared/styles/main.css";
import "@/shared/styles/science-staff.css";

import StaffProfileHeader from "./StaffProfileHeader";
import StaffProfileFooter from "./StaffProfileFooter";
import ErrorBoundary from "@/shared/components/errors/ErrorBoundary";
import { useMediaQuery } from "@/shared/hooks/ui/useMediaQuery";
import { observer } from "mobx-react-lite";
import { useAuthStore } from "@/app/stores/store-context";
import { BREAKPOINTS } from "@/shared/constants/breakpoints";
import { useLocation } from "react-router";

/**
 * ErrorBoundaryWrapper - Isolated component that observes auth state
 * (extracted from entire staffprofile layout)
 */
const ErrorBoundaryWrapper = observer(
	({ children }: { children: ReactNode }) => {
		const authStore = useAuthStore();
		return (
			<ErrorBoundary isSuperuser={authStore.isSuperuser}>
				{children}
			</ErrorBoundary>
		);
	}
);

ErrorBoundaryWrapper.displayName = "ErrorBoundaryWrapper";

export const StaffProfileLayout = ({ children }: { children: ReactNode }) => {
	const isDesktop = useMediaQuery(`(min-width: ${BREAKPOINTS.md}px)`);
	const scrollRef = useRef<HTMLDivElement>(null);
	const { pathname } = useLocation();

	// Scroll to top on route change
	useEffect(() => {
		scrollRef.current?.scrollTo({ top: 0, behavior: "instant" });
	}, [pathname]);

	// Force light mode on staff profile pages — remove dark class from <html>
	// and restore it on unmount so the main app keeps its theme
	useEffect(() => {
		const html = document.documentElement;
		const wasDark = html.classList.contains("dark");
		if (wasDark) {
			html.classList.remove("dark");
		}
		return () => {
			if (wasDark) {
				html.classList.add("dark");
			}
		};
	}, []);

	return (
		<ErrorBoundaryWrapper>
			{/* Outer fixed app shell */}
			<div
				className="
						fixed inset-0
						h-screen w-screen max-w-full
						bg-white
						overscroll-y-none
						flex flex-col
					"
			>
				{/* Scrollable content column with hidden scrollbars */}
				<div
					ref={scrollRef}
					className="
							flex flex-col min-h-full
							overflow-y-scroll scroll-smooth
							no-scrollbar
						"
				>
					<StaffProfileHeader isDesktop={isDesktop} />

					<div
						role="main"
						className="
								flex-1
								overscroll-y-none
								text-slate-900
							"
					>
						{children}
					</div>

					<div className="relative w-full">
						<StaffProfileFooter />
					</div>
				</div>
			</div>
		</ErrorBoundaryWrapper>
	);
};

StaffProfileLayout.displayName = "StaffProfileLayout";
