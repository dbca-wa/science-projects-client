import ScienceStaffSearchBar from "@/components/StaffProfiles/Staff/All/ScienceStaffSearchBar";
import ScienceStaffSearchResult from "@/components/StaffProfiles/Staff/All/ScienceStaffSearchResult";
import StaffResultSkeleton from "@/components/StaffProfiles/StaffResultSkeleton";
import { useScienceStaffProfileList } from "@/lib/hooks/tanstack/useScienceStaffProfileList";
import { useUser } from "@/lib/hooks/tanstack/useUser";
import { useMediaQuery } from "@/lib/utils/useMediaQuery";
import { Grid, Button as ChakraButton } from "@chakra-ui/react";
import { useSearchParams } from "react-router-dom";
import { Head } from "@/components/Base/Head";
import { Button } from "@/components/ui/button";
import clsx from "clsx";
import { useState } from "react";

export const ScienceStaff = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const searchTerm = searchParams.get("searchTerm") || "";
  const page = parseInt(searchParams.get("page") || "1", 10);
  const showHidden = searchParams.get("showHidden") === "true";

  const { scienceStaffData, scienceStaffLoading } = useScienceStaffProfileList({
    searchTerm,
    page,
    showHidden, // New flag for admins
  });

  const { userData, userLoading } = useUser();

  const handlePageChange = (newPage: number) => {
    setSearchParams({
      searchTerm,
      page: newPage.toString(),
      ...(showHidden && { showHidden: "true" }), // Preserve showHidden state
    });
  };

  const toggleHiddenProfiles = () => {
    setSearchParams({
      searchTerm,
      page: "1", // Reset to page 1 when toggling
      showHidden: showHidden ? "false" : "true",
    });
  };

  const isDesktop = useMediaQuery("(min-width: 768px)");

  const getDisplayName = (user) => {
    const firstName = user?.display_first_name ?? user?.first_name;
    const lastName = user?.display_last_name ?? user?.last_name;
    return `${firstName} ${lastName}`.toLowerCase(); // lowercase for case-insensitive sorting
  };

  return (
    <div className="p-4">
      <Head title="DBCA | Staff Profiles" isStandalone />
      <h2 className="mb-4 text-center text-xl font-bold">Search BCS Staff</h2>

      {/* Admin Toggle Button - only show for superusers */}
      {userData?.is_superuser && (
        <div className="mb-4 flex justify-center">
          <ChakraButton
            onClick={toggleHiddenProfiles}
            colorScheme={showHidden ? "red" : "blue"}
            variant="outline"
            size="sm"
          >
            {showHidden ? "Hide Hidden Profiles" : "Show Hidden Profiles"}
          </ChakraButton>
        </div>
      )}

      <div className={`flex justify-center pt-4`}>
        <ScienceStaffSearchBar
          searchTerm={searchTerm}
          onSearch={(newSearchTerm) =>
            setSearchParams({
              searchTerm: newSearchTerm,
              page: "1",
              ...(showHidden && { showHidden: "true" }), // Preserve showHidden state
            })
          }
        />
      </div>
      {scienceStaffLoading || !scienceStaffData ? (
        <StaffResultSkeleton />
      ) : (
        <div
          className={clsx(
            "my-4 min-h-[450px] w-full min-w-[300px] px-4",
            scienceStaffData?.total_results === 0
              ? "flex items-center justify-center"
              : "",
          )}
        >
          <p>
            {scienceStaffData?.total_results === 0
              ? searchTerm
                ? `No results for '${searchTerm}'`
                : "Service is down for maintenance. Please try again later."
              : scienceStaffData?.total_results === 1
                ? `Showing 1 result${searchTerm ? ` for '${searchTerm}'` : ""}`
                : `Showing ${(scienceStaffData?.page - 1) * 16 + 1}-${Math.min(
                    scienceStaffData?.page * 16,
                    scienceStaffData?.total_results,
                  )} results${searchTerm ? ` for '${searchTerm}'` : ""} out of ${scienceStaffData?.total_results}`}
            {scienceStaffData?.showing_hidden && (
              <span className="ml-2 font-medium text-red-600">
                (including hidden profiles)
              </span>
            )}
          </p>
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
            {scienceStaffData?.users
              ?.sort((a, b) =>
                getDisplayName(a).localeCompare(getDisplayName(b)),
              )
              ?.map((user, index) => {
                return (
                  <ScienceStaffSearchResult
                    key={user.pk || index} // Use pk as key for better performance
                    pk={user?.pk}
                    name={`${user?.display_first_name ?? user?.first_name} ${user?.display_last_name ?? user?.last_name}`}
                    position={
                      user.custom_title_on && user.custom_title
                        ? `${user.custom_title[0].toUpperCase()}${user.custom_title.slice(1)}`
                        : user?.position
                    }
                    is_hidden={user?.is_hidden}
                    location={user?.location}
                    unit={user?.unit}
                    division={user?.division}
                  />
                );
              })}
          </Grid>
          <Pagination
            totalResults={scienceStaffData?.total_results}
            currentPage={page}
            totalPages={scienceStaffData?.total_pages}
            onPageChange={handlePageChange}
          />
        </div>
      )}
    </div>
  );
};

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalResults: number;
}

const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
  totalResults,
}: PaginationProps) => {
  const pageNumbers = [];

  // Determine the start and end page numbers
  let startPage = Math.max(currentPage - 2, 1);
  const endPage = Math.min(startPage + 4, totalPages);

  if (endPage - startPage < 4) {
    startPage = Math.max(endPage - 4, 1);
  }

  for (let i = startPage; i <= endPage; i++) {
    pageNumbers.push(i);
  }

  const changePageScrollTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (totalPages === 1 || totalResults === 0) {
    return null;
  }

  return (
    <div className="mt-8 flex items-center justify-center space-x-2">
      <Button
        onClick={() => {
          onPageChange(currentPage - 1);
          changePageScrollTop();
        }}
        disabled={currentPage === 1 || totalResults === 0}
        className="bg-gray-300 text-gray-700 hover:bg-gray-200 disabled:opacity-50"
      >
        Previous
      </Button>

      {pageNumbers.map((pageNumber) => (
        <Button
          key={pageNumber}
          onClick={() => {
            onPageChange(pageNumber);
            changePageScrollTop();
          }}
          disabled={totalResults === 0}
          className={`${
            pageNumber === currentPage
              ? "bg-blue-500 text-white hover:bg-blue-400"
              : "bg-gray-300 text-gray-700 hover:bg-gray-200"
          }`}
        >
          {pageNumber}
        </Button>
      ))}

      <Button
        onClick={() => {
          onPageChange(currentPage + 1);
          changePageScrollTop();
        }}
        disabled={currentPage === totalPages || totalResults === 0}
        className="bg-gray-300 text-gray-700 hover:bg-gray-200 disabled:opacity-50"
      >
        Next
      </Button>
    </div>
  );
};
