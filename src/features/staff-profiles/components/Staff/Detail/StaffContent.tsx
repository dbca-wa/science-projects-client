import { useColorMode } from "@chakra-ui/react";
import { useState } from "react";
import CVSection from "./CVSection";
import OverviewSection from "./OverviewSection";
import ProjectsSection from "./ProjectsSection";
import PublicationsSection from "./PublicationsSection";
import ScrollArea from "./ScrollArea";
import type { IStaffProfileBaseData, IUserMe } from "@/shared/types";
import { useMediaQuery } from "@/shared/utils/useMediaQuery";
import clsx from "clsx";
import StaffProfileNavMenuItemButton from "./StaffProfileNavMenuItemButton";
import { Button } from "@/shared/components/ui/button";

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
  // const [shouldError, setShouldError] = useState(false);
  // if (shouldError) {
  //   // This will trigger during render, simulating a failed data requirement
  //   throw new Error("Failed to load required staff profile data");
  // }

  const CV_TAB_NAMES = ["CV", "Background", "Experience"];

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
                // title={"Background"}
                // title={"Experience"}
                title={"CV"}
              />
              <StaffProfileNavMenuItemButton
                setterFn={setSelectedNav}
                selected={selectedNav}
                title={"Publications"}
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
          !isDesktop && "w-[420px]",
        )}
      >
        {/* {viewingUser.is_superuser && (
          <Button
            className="ml-3 mt-4 bg-red-800"
            onClick={() => setShouldError(true)}
          >
            Trigger error
          </Button>
        )} */}
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
        ) : CV_TAB_NAMES.includes(selectedNav) ? (
          <CVSection
            userId={usersPk}
            buttonsVisible={buttonsVisible}
            viewingUser={viewingUser}
          />
        ) : (
          <PublicationsSection
            userId={usersPk}
            viewingUser={viewingUser}
            buttonsVisible={buttonsVisible}
            // There will always be employee_id for these users if IT Assets working correctly
            employee_id={baseData.employee_id}
          />
        )}
      </div>
    </div>
  );
};

export default StaffContent;
