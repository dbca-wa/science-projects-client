import { type ReactNode } from "react";
import "@/shared/styles/main.css";
import "@/shared/styles/science-staff.css";

import StaffProfileHeader from "./StaffProfileHeader";
import StaffProfileFooter from "./StaffProfileFooter";
import ErrorBoundary from "@/shared/components/errors/ErrorBoundary";
import { useMediaQuery } from "@/shared/hooks/ui/useMediaQuery";
import { observer } from "mobx-react-lite";
import { useAuthStore } from "@/app/stores/useStore";
import { BREAKPOINTS } from "@/shared/constants/breakpoints";


/**
 * ErrorBoundaryWrapper - Isolated component that observes auth state
 * (extracted from entire staffprofile layout)
 */
const ErrorBoundaryWrapper = observer(({ children }: { children: ReactNode }) => {
	const authStore = useAuthStore();
	return (
		<ErrorBoundary isSuperuser={authStore.isSuperuser}>
			{children}
		</ErrorBoundary>
	);
});

ErrorBoundaryWrapper.displayName = "ErrorBoundaryWrapper";



export const StaffProfileLayout = ({ children }: { children: ReactNode }) => {
		const isDesktop = useMediaQuery(`(min-width: ${BREAKPOINTS.md}px)`);

		return (
			<ErrorBoundaryWrapper>
				{/* Outer fixed app shell */}
				<div
					className="
						fixed inset-0
						h-screen w-screen
						bg-white
						overscroll-y-none
						flex flex-col
					"
				>
					{/* Scrollable content column with hidden scrollbars */}
					<div
						className="
							relative min-h-full
							overflow-y-scroll scroll-smooth
							[scrollbar-width:none]
							[-ms-overflow-style:none]
						"
						style={
							{
								// Hide webkit scrollbar
								"::-webkit-scrollbar": { display: "none" },
							} as React.CSSProperties
						}
					>
						<StaffProfileHeader isDesktop={isDesktop} />

						<div
							role="main"
							className="
								relative flex min-h-full flex-1 flex-col
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
