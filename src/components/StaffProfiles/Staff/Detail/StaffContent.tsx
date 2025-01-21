import { useColorMode } from "@chakra-ui/react";
import { useState } from "react";
import CVSection from "./CVSection";
import OverviewSection from "./OverviewSection";
import ProjectsSection from "./ProjectsSection";
import PublicationsSection from "./PublicationsSection";
import ScrollArea from "./ScrollArea";
import { IStaffProfileBaseData, IUserMe } from "@/types";
import { useMediaQuery } from "@/lib/utils/useMediaQuery";
import clsx from "clsx";
import StaffProfileNavMenuItemButton from "./StaffProfileNavMenuItemButton";

const StaffContent = ({
  buttonsVisible,
  usersPk,
  viewingUser,
  refetchBaseData,
  baseData,
}: {
  buttonsVisible: boolean;
  usersPk: number;
  viewingUser: IUserMe;
  refetchBaseData: () => void;
  baseData: IStaffProfileBaseData;
}) => {
  const [selectedNav, setSelectedNav] = useState<string>("Overview");
  const { colorMode } = useColorMode();
  const isDesktop = useMediaQuery("(min-width: 768px)");

  return (
    <div className="mx-auto w-full dark:text-slate-300">
      {/* Scrollbar / Navigation */}
      <div className={`${!isDesktop ? "flex justify-center" : ""}`}>
        <div style={{ unicodeBidi: "isolate" }} className="mt-2 px-4">
          <ScrollArea
            hideScrollbar={true}
            showOverflowIndicator={true}
            showIndicatorButton={false}
            indicatorColor={
              colorMode === "light" ? "rgb(241 245 249)" : "black"
            }
          >
            <div className="relative flex pb-2">
              <StaffProfileNavMenuItemButton
                setterFn={setSelectedNav}
                selected={selectedNav}
                title={"Overview"}
              />
              <StaffProfileNavMenuItemButton
                setterFn={setSelectedNav}
                selected={selectedNav}
                title={"Projects"}
              />
              <StaffProfileNavMenuItemButton
                setterFn={setSelectedNav}
                selected={selectedNav}
                title={"CV"}
              />
            </div>
          </ScrollArea>
        </div>
      </div>

      {/* Content */}
      <div
        className={clsx(
          "w-full",
          isDesktop && "min-w-[720px]",
          !isDesktop && "min-w-[500px]",
        )}
      >
        {selectedNav === "Overview" ? (
          <OverviewSection
            userId={usersPk}
            buttonsVisible={buttonsVisible}
            viewingUser={viewingUser}
            // refetchBaseData={refetchBaseData}
            // baseData={baseData}
          />
        ) : selectedNav === "Projects" ? (
          <ProjectsSection userId={usersPk} buttonsVisible={buttonsVisible} />
        ) : selectedNav === "CV" ? (
          <CVSection
            userId={usersPk}
            buttonsVisible={buttonsVisible}
            viewingUser={viewingUser}
          />
        ) : (
          <PublicationsSection
            userId={usersPk}
            buttonsVisible={buttonsVisible}
          />
        )}
      </div>
    </div>
  );
};

export default StaffContent;
