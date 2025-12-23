// Route for displaying paginated projects

import { BreadCrumb } from "@/shared/components/layout/base/BreadCrumb";
import { Head } from "@/shared/components/layout/base/Head";
import { SearchProjects } from "@/features/projects/components/SearchProjects";
import { DownloadProjectsCSVButton } from "@/features/projects/components/DownloadProjectsCSVButton";
import { PaginatorProject } from "@/features/projects/components/PaginatorProject";
import { useLayoutSwitcher } from "@/shared/hooks/useLayout";
import { useProjectSearchContext } from "@/features/projects/hooks/useProjectSearch";
import { useUser } from "@/features/users/hooks/useUser";
import { getAllBusinessAreas } from "@/features/business-areas/services/business-areas.service";
import type { IBusinessArea, IDivision } from "@/shared/types";
import { useWindowWidth } from "@/shared/utils/useWindowWidth";
import { Button } from "@/shared/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { FaMapMarkerAlt } from "react-icons/fa";
import { IoMdAdd } from "react-icons/io";
import { useNavigate } from "react-router-dom";

export const Projects = () => {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const {
    filteredItems,
    loading,
    totalPages,
    currentProjectResultsPage,
    setCurrentProjectResultsPage,
    onlyInactive,
    onlyActive,
    filterBA,
    filterProjectKind,
    filterProjectStatus,
    filterYear,
    totalResults,
    filterUser,
    setSearchFilters,
  } = useProjectSearchContext();

  const handleOnlySelectedStatusChange = (statusValue: string) => {
    setSearchFilters({
      onlyActive,
      onlyInactive,
      filterBA,
      filterProjectKind,
      filterProjectStatus: statusValue,
      filterYear,
      filterUser,
    });
  };

  const handleOnlySelectedProjectKindChange = (projectKindValue: string) => {
    setSearchFilters({
      onlyActive,
      onlyInactive,
      filterBA,
      filterProjectStatus,
      filterProjectKind: projectKindValue,
      filterYear,
      filterUser,
    });
  };

  const navigate = useNavigate();

  const { layout } = useLayoutSwitcher();

  const handleOnlySelectedBusinessAreaChange = (businessAreaValue: string) => {
    // console.log(businessAreaValue);
    setSearchFilters({
      onlyActive: onlyActive,
      onlyInactive: onlyInactive,
      filterBA: businessAreaValue,
      filterProjectKind: filterProjectKind,
      filterProjectStatus: filterProjectStatus,
      filterYear: filterYear,
      filterUser,
    });
  };

  // Function to check if a string contains HTML tags
  const checkIsHtml = (data) => {
    const htmlRegex = /<\/?[a-z][\s\S]*>/i;
    return htmlRegex.test(data);
  };

  // Function to sanitize HTML content and extract text
  const sanitizeHtml = (htmlString) => {
    const doc = new DOMParser().parseFromString(htmlString, "text/html");
    return doc.body.textContent || "";
  };

  const [businessAreas, setBusinessAreas] = useState<IBusinessArea[]>([]);
  // console.log(businessAreas);
  const orderedDivisionSlugs = ["BCS", "CEM", "RFMS"];
  useEffect(() => {
    const fetchBusinessAreas = async () => {
      try {
        const data = await getAllBusinessAreas();
        setBusinessAreas(data);
      } catch (error) {
        console.error("Error fetching business areas:", error);
      }
    };

    fetchBusinessAreas();
  }, []);

  const windowWidth = useWindowWidth(200); // 200ms debounce
  const showMapButton = windowWidth > 900;

  const { userData, userLoading } = useUser();

  return (
    <>
      {layout === "traditional" && (
        <BreadCrumb
          subDirOne={{
            title: "Projects",
            link: "/users",
          }}
        />
      )}
      <Head title="Projects" />

      <div className="flex w-full mt-2 mb-6 flex-row">
        <div className="flex-1 w-full flex-col">
          <h1 className="text-2xl font-bold">
            Projects ({totalResults})
          </h1>
          <p className={`text-sm ${isDark ? "text-gray-200" : "text-gray-600"}`}>
            Ctrl + Click to open projects in another tab and keep filters.
          </p>
        </div>

        <div className="flex flex-1 w-full justify-end items-center gap-2">
          {!userLoading && userData.is_superuser ? (
            <DownloadProjectsCSVButton />
          ) : null}

          <Button
            className={`text-white ${
              isDark 
                ? "bg-green-600 hover:bg-green-500" 
                : "bg-green-500 hover:bg-green-400"
            }`}
            onClick={() => navigate("/projects/add")}
          >
            <IoMdAdd className="mr-2 h-4 w-4" />
            New Project
          </Button>

          {showMapButton ? (
            <Button
              className={`text-white ${
                isDark 
                  ? "bg-blue-600 hover:bg-blue-500" 
                  : "bg-blue-500 hover:bg-blue-400"
              }`}
              onClick={() => navigate("/projects/map")}
            >
              <FaMapMarkerAlt className="mr-2 h-4 w-4" />
              Map
            </Button>
          ) : null}
        </div>
      </div>

      <div
        className="flex items-center border w-full select-none p-4"
      >
        <div className="w-full flex-1 grid lg:grid-cols-2 grid-cols-1 gap-4 justify-between">
          <div className="grid gap-3 md:grid-cols-1 grid-cols-1 w-full">
            {/* Filter BA */}
            <Select
              onValueChange={handleOnlySelectedBusinessAreaChange}
            >
              <SelectTrigger className={`text-sm rounded-md ${
                isDark 
                  ? "text-white border-white" 
                  : "text-black bg-white border-gray-200"
              }`}>
                <SelectValue placeholder="All Business Areas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Business Areas</SelectItem>
                {orderedDivisionSlugs.flatMap((divSlug) => {
                  // Filter business areas for the current division
                  const divisionBusinessAreas = businessAreas
                    .filter((ba) => {
                      const division = ba.division as IDivision;
                      return division.slug === divSlug;
                    })
                    .sort((a, b) => a.name.localeCompare(b.name));

                  return divisionBusinessAreas.map((ba, index) => (
                    <SelectItem key={`${ba.name}${index}`} value={ba.pk.toString()}>
                      {ba?.division
                        ? `[${(ba?.division as IDivision)?.slug}] `
                        : ""}
                      {checkIsHtml(ba.name) ? sanitizeHtml(ba.name) : ba.name}{" "}
                      {ba.is_active ? "" : "(INACTIVE)"}
                    </SelectItem>
                  ));
                })}
              </SelectContent>
            </Select>

            {/* Filter Project Kind */}
            <Select
              onValueChange={handleOnlySelectedProjectKindChange}
            >
              <SelectTrigger className={`text-sm rounded-md ${
                isDark 
                  ? "text-white border-white" 
                  : "text-black border-gray-100"
              }`}>
                <SelectValue placeholder="All Kinds" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Kinds</SelectItem>
                <SelectItem value="core_function">Core Function</SelectItem>
                <SelectItem value="science">Science Project</SelectItem>
                <SelectItem value="student">Student Project</SelectItem>
                <SelectItem value="external">External Project</SelectItem>
              </SelectContent>
            </Select>

            {/* Filter Status */}
            <Select
              onValueChange={handleOnlySelectedStatusChange}
            >
              <SelectTrigger className={`text-sm rounded-md ${
                isDark 
                  ? "text-white border-white" 
                  : "text-black border-gray-100"
              }`}>
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Statuses</SelectItem>
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="pending">Pending Project Plan</SelectItem>
                <SelectItem value="active">Active (Approved)</SelectItem>
                <SelectItem value="updating">Update Requested</SelectItem>
                <SelectItem value="closure_requested">Closure Requested</SelectItem>
                <SelectItem value="completed">Completed and Closed</SelectItem>
                <SelectItem value="terminated">Terminated</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col w-full justify-between gap-4">
            <SearchProjects orientation={"vertical"} />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex w-full min-h-[100px] pt-10 justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-gray-100"></div>
        </div>
      ) : (
        <PaginatorProject
          loading={loading}
          data={filteredItems}
          currentProjectResultsPage={currentProjectResultsPage}
          setCurrentProjectResultsPage={setCurrentProjectResultsPage}
          totalPages={totalPages}
        />
      )}
    </>
  );
};
