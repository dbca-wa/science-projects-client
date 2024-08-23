import ScienceStaffSearchBar from "@/components/StaffProfiles/Staff/All/ScienceStaffSearchBar";
import ScienceStaffSearchResult from "@/components/StaffProfiles/Staff/All/ScienceStaffSearchResult";
import StaffResultSkeleton from "@/components/StaffProfiles/StaffResultSkeleton";
import { useScienceStaffProfileList } from "@/lib/hooks/tanstack/useScienceStaffProfileList";
import { useMediaQuery } from "@/lib/utils/useMediaQuery";
import { Grid } from "@chakra-ui/react";
import { useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";

export const ScienceStaff = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const searchTerm = searchParams.get("searchTerm") || "";
  const page = parseInt(searchParams.get("page") || "1", 10);

  const { scienceStaffData, scienceStaffLoading } = useScienceStaffProfileList({
    searchTerm,
    page,
  });

  const handlePageChange = (newPage: number) => {
    setSearchParams({
      searchTerm,
      page: newPage.toString(),
    });
  };

  // const { scienceStaffData, scienceStaffLoading } =
  //   useScienceStaffProfileList();

  useEffect(() => {
    console.log({ scienceStaffData, scienceStaffLoading });
  }, [scienceStaffLoading, scienceStaffData]);

  const isDesktop = useMediaQuery("(min-width: 768px)");

  return (
    <div className="p-4">
      <Head title="DBCA | Staff Profiles" isStandalone />
      <h2 className="mb-4 text-center text-xl font-bold">Search BCS Staff</h2>
      <div className={`flex justify-center pt-4`}>
        <ScienceStaffSearchBar
          searchTerm={searchTerm}
          onSearch={(newSearchTerm) =>
            setSearchParams({ searchTerm: newSearchTerm, page: "1" })
          }
        />
      </div>
      {scienceStaffLoading || !scienceStaffData ? (
        <StaffResultSkeleton />
      ) : (
        <div className="my-4 min-h-[450px] w-full min-w-[300px] px-4">
          <p>{`Showing ${
            scienceStaffData?.page === 1
              ? 1
              : scienceStaffData?.page === scienceStaffData?.total_pages
                ? scienceStaffData?.total_results - 16
                : scienceStaffData?.page * 16 + 1
          }-${scienceStaffData?.page * 16} out of ${scienceStaffData?.total_results} results ${searchTerm && "for "}${searchTerm && `'${searchTerm}'`}`}</p>
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
            {scienceStaffData?.users?.map((user, index) => (
              <ScienceStaffSearchResult
                key={index}
                pk={user?.pk}
                name={`${user?.first_name} ${user?.last_name}`}
                position={user?.role}
                branch={user?.branch}
              />
            ))}
          </Grid>
          <Pagination
            currentPage={page}
            totalPages={scienceStaffData?.total_pages}
            onPageChange={handlePageChange}
          />
          {/* <div className="mt-4 flex justify-between">
            <button
              onClick={() => handlePageChange(page - 1)}
              disabled={page <= 1}
            >
              Previous
            </button>
            <button
              onClick={() => handlePageChange(page + 1)}
              disabled={page >= scienceStaffData.total_pages}
            >
              Next
            </button>
          </div> */}
        </div>
      )}
    </div>
  );
};

import { Button } from "@/components/ui/button";
import { Head } from "@/components/Base/Head";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
}: PaginationProps) => {
  const pageNumbers = [];

  // Determine the start and end page numbers
  let startPage = Math.max(currentPage - 2, 1);
  let endPage = Math.min(startPage + 4, totalPages);

  if (endPage - startPage < 4) {
    startPage = Math.max(endPage - 4, 1);
  }

  for (let i = startPage; i <= endPage; i++) {
    pageNumbers.push(i);
  }

  return (
    <div className="mt-4 flex items-center justify-center space-x-2">
      <Button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="bg-gray-300 text-gray-700 hover:bg-gray-200 disabled:opacity-50"
      >
        Previous
      </Button>

      {pageNumbers.map((pageNumber) => (
        <Button
          key={pageNumber}
          onClick={() => onPageChange(pageNumber)}
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
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="bg-gray-300 text-gray-700 hover:bg-gray-200 disabled:opacity-50"
      >
        Next
      </Button>
    </div>
  );
};
