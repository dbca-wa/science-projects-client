import { Head } from "@/shared/components/layout/base/Head";
import HomeConfetti from "@/shared/components/Fun/HomeConfetti";
import theme from "@/theme";
import type { IUserMe } from "@/shared/types";
import { Button } from "@/shared/components/ui/button";
import { useColorMode } from "@/shared/utils/theme.utils";
import { useCallback, useEffect, useState } from "react";
import PatchNotes from "./PatchNotes";

interface IUserInterface {
  userData: IUserMe;
  showNotes: boolean;
}

export const WelcomeBox = ({ userData, showNotes }: IUserInterface) => {
  const VITE_PRODUCTION_BASE_URL = import.meta.env.VITE_PRODUCTION_BASE_URL;
  const VERSION = import.meta.env.VITE_SPMS_VERSION || "Development v3";

  const [welcomeUser, setWelcomeUser] = useState("");
  const [spmsText, setSpmsText] = useState("Science Project Management System");
  const [shouldConcat, setShouldConcat] = useState(false);
  const { colorMode } = useColorMode();

  const handleResize = useCallback(() => {
    if (window.innerWidth < 1150) {
      setShouldConcat(true);
      setSpmsText(
        `SPMS ${VITE_PRODUCTION_BASE_URL?.includes("-test") ? "(TEST)" : ""}`,
      );
      // setAnnualReportText("Report");
    } else {
      setShouldConcat(false);
      // setAnnualReportText("Annual Report");
      if (window.innerWidth < 1350) {
        setSpmsText(
          `Science Project <br/> Management System ${
            VITE_PRODUCTION_BASE_URL?.includes("-test") ? "(TEST)" : ""
          }`,
        );
      } else {
        setSpmsText(
          `Science Project Management System ${
            VITE_PRODUCTION_BASE_URL?.includes("-test") ? "(TEST)" : ""
          }`,
        );
      }
    }
  }, [theme.breakpoints.lg, userData?.first_name]);

  useEffect(() => {
    handleResize(); // call the handleResize function once after mounting
    window.addEventListener("resize", handleResize); // add event listener to window object
    return () => window.removeEventListener("resize", handleResize); // remove event listener when unmounting
  }, [handleResize]);

  useEffect(() => {
    setWelcomeUser(
      `Hello ${userData?.display_first_name ?? userData?.first_name} ${userData?.display_last_name ?? userData?.last_name}! Welcome to SPMS, DBCA's portal for science project planning, approval and reporting.`,
    );
  }, []);

  return (
    <>
      <HomeConfetti />
      <div
        className={`mt-5 rounded-md flex-col p-10 relative select-none ${
          colorMode === "dark" 
            ? "bg-gray-700 text-white" 
            : "bg-gray-200 text-black"
        }`}
      >
        <Head title="Home" />

        <h1 className={`mb-0 text-2xl font-bold ${shouldConcat ? "pb-4" : ""}`}>
          <div dangerouslySetInnerHTML={{ __html: spmsText }} />
        </h1>
        {/* <br /> */}
        {/* {!shouldConcat && ( */}
        <p className="pt-4 text-lg font-normal">
          {welcomeUser}
        </p>

        {/* Patch Notes */}
        {showNotes ? <PatchNotes /> : null}

        {/* Feedback */}
        <div className="mt-4">
          <span style={{ marginTop: 20 }}>
            <span className="text-base font-normal">
              We are always looking for ways to improve, and value your
              feedback! If you notice something off, or would like to request a
              change, please send an email to{" "}
            </span>
            <a
              href={`mailto:ecoinformatics.admin@dbca.wa.gov.au?subject=SPMS Feedback`}
              className={colorMode === "light" ? "text-blue-400" : "text-blue-300"}
            >
              ecoinformatics.admin@dbca.wa.gov.au
            </a>
            .
          </span>
          <span className="text-base font-normal">
            {" "}
            Don't be shy, we can only make things better with your help!
          </span>

          <div className="mt-6 flex items-center justify-between">
            <p className="text-blue-500">Version {VERSION}</p>
            <Button
              className="text-white bg-blue-500 hover:bg-blue-400"
              asChild
            >
              <a href={`mailto:ecoinformatics.admin@dbca.wa.gov.au?subject=SPMS Feedback`}>
                Submit Feedback
              </a>
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};
