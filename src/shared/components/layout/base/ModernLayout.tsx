// Component for adjusting the layout to Modern

import { Outlet } from "react-router-dom";
import { motion } from "framer-motion";
import { useLayoutSwitcher } from "@/shared/hooks/useLayout";
import { ModernHeader } from "../../Navigation/ModernHeader";
import { Sidebar } from "../../Navigation/Sidebar";
import { ModernPageWrapper } from "../wrappers/ModernPageWrapper";

export const ModernLayout = () => {
  const { loading } = useLayoutSwitcher();

  return (
    <div className="flex min-h-screen max-h-screen w-screen overscroll-none fixed">
      <Sidebar />
      <div className="flex-1 h-screen overflow-auto relative">
        <ModernHeader />
        <ModernPageWrapper>
          {loading ? (
            <div className="flex justify-center items-center h-screen">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-blue-500"></div>
            </div>
          ) : (
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1 }}
              exit={{ opacity: 0 }}
              style={{
                height: "100%",
              }}
            >
              <Outlet />
            </motion.div>
          )}
        </ModernPageWrapper>
      </div>
    </div>
  );
};
