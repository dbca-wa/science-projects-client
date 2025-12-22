// A component for handlign the traditional layout

import { Outlet } from "react-router-dom";
import { useTheme } from "next-themes";
import dayImage from "@/assets/80mile.jpg";
import nightImage from "@/assets/night.webp";
import { useLayoutSwitcher } from "@/shared/hooks/LayoutSwitcherContext";
import OldHeader from "../../Navigation/OldHeader";
import { TraditionalPageWrapper } from "../wrappers/TraditionalPageWrapper";
import { Footer } from "./Footer";

export const TraditionalLayout = () => {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const { loading } = useLayoutSwitcher();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-blue-500"></div>
      </div>
    );
  }
  return (
    <div
      className="h-screen w-screen top-0 left-0 overscroll-none min-w-[720px] flex flex-col fixed"
    >
      <div
        className="top-0 left-0 right-0 scroll-smooth overflow-y-scroll"
        style={{
          msOverflowStyle: "none",
          scrollbarWidth: "none",
          listStyle: "none",
        }}
      >
        <style jsx>{`
          div::-webkit-scrollbar {
            display: none;
          }
        `}</style>
        <OldHeader />

        <TraditionalPageWrapper>
          <div
            className={`overscroll-none my-6 min-h-[1000px] rounded-md py-4 ${
              isDark ? "bg-black/80" : "bg-white"
            }`}
          >
            <div className="mx-10 h-full min-h-screen">
              <Outlet />
            </div>
          </div>

          <img
            src={isDark ? nightImage : dayImage}
            className="w-full h-full object-cover fixed -z-10 top-0 left-0 select-none"
            alt="Background"
          />
        </TraditionalPageWrapper>

        <Footer />
      </div>
    </div>
  );
};
