import ScienceStaffSearchBar from "@/components/Science/Staff/All/ScienceStaffSearchBar";
import ScienceStaffSearchResult from "@/components/Science/Staff/All/ScienceStaffSearchResult";
import { useScienceStaffProfileList } from "@/lib/hooks/tanstack/useScienceStaffProfileList";
import { useMediaQuery } from "@/lib/utils/useMediaQuery";
import { Grid } from "@chakra-ui/react";
import { useEffect } from "react";

export const ScienceStaff = () => {
  const { scienceStaffData, scienceStaffLoading } =
    useScienceStaffProfileList();

  useEffect(() => {
    console.log({ scienceStaffData, scienceStaffLoading });
  }, [scienceStaffLoading, scienceStaffData]);

  const isDesktop = useMediaQuery("(min-width: 768px");

  return (
    <div className="p-4">
      <h2 className="mb-4 text-center text-xl font-bold">Search BCS Staff</h2>
      <div className={`flex justify-center pt-4`}>
        {/* ${isDesktop ? "justify-end" : "justify-center"} */}
        <ScienceStaffSearchBar />
      </div>
      {/* Search Results */}
      <div className="my-4 min-h-[450px] w-full min-w-[300px] px-4">
        <p>Showing 1-16 out of 500 results</p>
        <Grid
          gridTemplateColumns={
            isDesktop
              ? {
                  md: "repeat(2, 4fr)",
                  lg: "repeat(4, 4fr)",
                  xl: "repeat(4, 4fr)",
                }
              : "repeat(1, 1fr)"
          }
          gridGap={4}
          py={4}
        >
          {/* ADD SORT BY FIRST AND LAST NAME TOGGLES */}
          <ScienceStaffSearchResult
            first_name="Ben"
            last_name="Richardson"
            email="ben.richardson@dbca.wa.gov.au"
            branch="Kensington"
            position="Senior Technical Officer"
            address="17 Dick Perry Avenue, WA. Perth. 6164"
          />
          <ScienceStaffSearchResult
            title="Dr."
            first_name="Rory"
            last_name="Mcauley"
            email="rory.mcauley@dbca.wa.gov.au"
            branch="Kensington"
            position="Research Scientist (Monitoring)"
            address="17 Dick Perry Avenue, WA. Perth. 6164"
          />
          <ScienceStaffSearchResult
            first_name="Jarid"
            last_name="Prince"
            email="jarid.prince@dbca.wa.gov.au"
            branch="Kensington"
            position="Web Application and Data Development Officer"
            address="17 Dick Perry Avenue, WA. Perth. 6164"
          />
          <ScienceStaffSearchResult
            first_name="Ben"
            last_name="Richardson"
            email="ben.richardson@dbca.wa.gov.au"
            branch="Kensington"
            position="Senior Technical Officer"
            address="17 Dick Perry Avenue, WA. Perth. 6164"
          />
          <ScienceStaffSearchResult
            title="Dr."
            first_name="Rory"
            last_name="Mcauley"
            email="rory.mcauley@dbca.wa.gov.au"
            branch="Kensington"
            position="Research Scientist (Monitoring)"
            address="17 Dick Perry Avenue, WA. Perth. 6164"
          />
          <ScienceStaffSearchResult
            first_name="Jarid"
            last_name="Prince"
            email="jarid.prince@dbca.wa.gov.au"
            branch="Kensington"
            position="Web Application and Data Development Officer"
            address="17 Dick Perry Avenue, WA. Perth. 6164"
          />
          <ScienceStaffSearchResult
            first_name="Ben"
            last_name="Richardson"
            email="ben.richardson@dbca.wa.gov.au"
            branch="Kensington"
            position="Senior Technical Officer"
            address="17 Dick Perry Avenue, WA. Perth. 6164"
          />
          <ScienceStaffSearchResult
            title="Dr."
            first_name="Rory"
            last_name="Mcauley"
            email="rory.mcauley@dbca.wa.gov.au"
            branch="Kensington"
            position="Research Scientist (Monitoring)"
            address="17 Dick Perry Avenue, WA. Perth. 6164"
          />
          <ScienceStaffSearchResult
            first_name="Jarid"
            last_name="Prince"
            email="jarid.prince@dbca.wa.gov.au"
            branch="Kensington"
            position="Web Application and Data Development Officer"
            address="17 Dick Perry Avenue, WA. Perth. 6164"
          />
          <ScienceStaffSearchResult
            first_name="Ben"
            last_name="Richardson"
            email="ben.richardson@dbca.wa.gov.au"
            branch="Kensington"
            position="Senior Technical Officer"
            address="17 Dick Perry Avenue, WA. Perth. 6164"
          />
          <ScienceStaffSearchResult
            title="Dr."
            first_name="Rory"
            last_name="Mcauley"
            email="rory.mcauley@dbca.wa.gov.au"
            branch="Kensington"
            position="Research Scientist (Monitoring)"
            address="17 Dick Perry Avenue, WA. Perth. 6164"
          />
          <ScienceStaffSearchResult
            first_name="Jarid"
            last_name="Prince"
            email="jarid.prince@dbca.wa.gov.au"
            branch="Kensington"
            position="Web Application and Data Development Officer"
            address="17 Dick Perry Avenue, WA. Perth. 6164"
          />
        </Grid>
      </div>
    </div>
  );
};
