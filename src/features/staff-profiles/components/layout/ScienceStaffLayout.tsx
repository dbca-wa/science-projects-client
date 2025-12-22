import { useMediaQuery } from "@/shared/utils/useMediaQuery";
import { ReactNode } from "react";
import "@/main.css";
import "@/features/staff-profiles/styles/science_staff.css";
import ScienceHeader from "../Header/ScienceHeader";
import ScienceFooter from "../Footer/ScienceFooter";
import { useUser } from "@/features/users/hooks/useUser";
import ErrorBoundary from "@/shared/components/layout/base/ErrorBoundary";

export const ScienceStaffLayout = ({ children }: { children: ReactNode }) => {
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const { userData, userLoading } = useUser();

  return (
    <ErrorBoundary isSuperuser={userData?.is_superuser}>
      <div
        className="fixed flex h-screen w-screen min-w-[420px] flex-col bg-white"
        style={{ overscrollBehaviorY: "none" }}
      >
        <div
          className="min-h-full overflow-y-scroll"
          style={{
            scrollBehavior: "smooth",
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
          <ScienceHeader isDesktop={isDesktop} />
          <main
            className="relative flex min-h-full flex-1 flex-col text-slate-900"
            style={{ overscrollBehaviorY: "none" }}
          >
            {children}
          </main>
          <div className="relative bottom-0 w-full">
            <ScienceFooter />
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
};
