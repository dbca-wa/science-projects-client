// Component for adjusting the layout to Modern

import { Outlet } from "react-router";

import { motion } from "framer-motion";
import ModernHeader from "./ModernHeader";
import ModernSidebar from "./ModernSidebar";
import ModernPageWrapper from "./ModernPageWrapper";

export const ModernLayout = () => {
	return (
		<div className="flex min-h-full max-h-full w-full overscroll-y-none fixed">
			<ModernSidebar />
			<div className="flex-1 h-full relative flex flex-col">
				<ModernHeader />
				<ModernPageWrapper>
					<motion.div
						key={location.pathname}
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						transition={{ duration: 1 }}
						exit={{ opacity: 0 }}
					>
						<Outlet />
					</motion.div>
				</ModernPageWrapper>
			</div>
		</div>
	);
};
