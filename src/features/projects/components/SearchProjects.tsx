// Project search component - works/appears on the Users page with ProjectSearchContext

import { useColorMode } from "@/shared/utils/theme.utils";
import { Input } from "@/shared/components/ui/input";
import { Checkbox } from "@/shared/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { Search } from "lucide-react";
import { useEffect, useState, type ChangeEventHandler, type ChangeEvent } from "react";
import { FiSearch } from "react-icons/fi";
import { cn } from "@/shared/utils";
import { getAllProjectsYears } from "@/features/projects/services/projects.service";
import { useProjectSearchContext } from "@/features/projects/hooks/useProjectSearch";
import SearchProjectsByUser from "./SearchProjectsByUser";

interface IProps {
  orientation?: "vertical" | "horizontal";
  handleFilterUserChange?: (user: number | null) => void;
}

export const SearchProjects = ({ orientation }: IProps) => {
  const { colorMode } = useColorMode();
  const [inputValue, setInputValue] = useState("");

  const {
    setSearchTerm,
    setIsOnProjectsPage,
    searchTerm,
    setCurrentProjectResultsPage,
    setSearchFilters,
    onlyActive,
    onlyInactive,
    filterProjectKind,
    filterProjectStatus,
    filterBA,
    filterYear,
    filterUser,
  } = useProjectSearchContext();

  // useEffect(() => console.log(businessAreas));
  const [availableYears, setAvailableYears] = useState<number[]>([]);

  const handleFilterUserChange = (userId: number | null) => {
    setSearchFilters({
      onlyActive,
      onlyInactive,
      filterBA,
      filterProjectKind,
      filterProjectStatus,
      filterYear,
      filterUser: userId,
    });
  };

  const handleOnlyActiveProjectsChange = () => {
    if (!onlyActive) {
      setSearchFilters({
        onlyActive: true,
        onlyInactive: false,
        filterBA,
        filterProjectKind,
        filterProjectStatus,
        filterYear,
        filterUser,
      });
    } else {
      setSearchFilters({
        onlyActive: false,
        onlyInactive: false,
        filterBA,
        filterProjectKind,
        filterProjectStatus,
        filterYear,
        filterUser,
      });
    }
  };

  const handleOnlyInactiveProjectsChange = () => {
    if (!onlyInactive) {
      setSearchFilters({
        onlyActive: false,
        onlyInactive: true,
        filterBA,
        filterProjectKind,
        filterProjectStatus,
        filterYear,
        filterUser,
      });
    } else {
      setSearchFilters({
        onlyInactive: false,
        onlyActive: false,
        filterBA,
        filterProjectKind,
        filterProjectStatus,
        filterYear,
        filterUser,
      });
    }
  };

  const handleOnlySelectedYearChange = (value: string) => {
    const yearValue = Number(value);
    setSearchFilters({
      onlyActive: onlyActive,
      onlyInactive: onlyInactive,
      filterBA: filterBA,
      filterProjectKind: filterProjectKind,
      filterProjectStatus: filterProjectStatus,
      filterYear: yearValue,
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

  useEffect(() => {
    const fetchAvailableProjectYears = async () => {
      try {
        const data = await getAllProjectsYears();
        // console.log(data);
        setAvailableYears(data);
      } catch (error) {
        console.log("Error fetching Project's years", error);
      }
    };
    fetchAvailableProjectYears();
  }, []);

  useEffect(() => {
    setIsOnProjectsPage(true); // Set initial value

    return () => {
      setIsOnProjectsPage(false); // Set value to false when navigating away
    };
  }, []);

  useEffect(() => {
    setCurrentProjectResultsPage(1);
  }, [searchTerm]);

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      setSearchTerm(inputValue);
    }, 500);

    return () => clearTimeout(debounceTimer);
  }, [inputValue]);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setInputValue(value);
  };
  if (orientation && orientation === "vertical") {
    return (
      <div className="w-full h-full space-y-4">
        {/* Project Search Input */}
        <div className="relative">
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <FiSearch className="h-4 w-4 text-gray-400" />
          </div>
          <Input
            placeholder="Search projects by name, keyword or tag..."
            type="text"
            value={inputValue}
            onChange={handleChange}
            className={cn(
              "pr-10 rounded-md",
              colorMode === "dark" 
                ? "bg-transparent text-white placeholder:text-gray-300" 
                : "bg-white text-gray-900 placeholder:text-gray-500"
            )}
          />
        </div>

        <div>
          <SearchProjectsByUser
            handleFilterUserChange={handleFilterUserChange}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
          <Select
            value={filterYear?.toString() || "0"}
            onValueChange={handleOnlySelectedYearChange}
          >
            <SelectTrigger className="rounded-md">
              <SelectValue placeholder="All Years" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="0">All Years</SelectItem>
              {availableYears &&
                availableYears
                  .sort((a, b) => b - a)
                  .map((year, index) => (
                    <SelectItem key={`${year}${index}`} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
            </SelectContent>
          </Select>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="active-projects"
                checked={onlyActive}
                onCheckedChange={handleOnlyActiveProjectsChange}
                disabled={onlyInactive}
              />
              <label 
                htmlFor="active-projects" 
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Active
              </label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="inactive-projects"
                checked={onlyInactive}
                onCheckedChange={handleOnlyInactiveProjectsChange}
                disabled={onlyActive}
              />
              <label 
                htmlFor="inactive-projects" 
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Inactive
              </label>
            </div>
          </div>
        </div>
      </div>
    );
  } else {
    return (
      <div className="flex">
        <div className="relative w-full">
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <FiSearch className="h-4 w-4 text-gray-400" />
          </div>
          <Input
            placeholder="Search Projects..."
            type="text"
            value={inputValue}
            onChange={handleChange}
            className={cn(
              "pr-10 rounded-md bg-white",
              colorMode === "dark" 
                ? "text-gray-800 placeholder:text-gray-500" 
                : "text-gray-900 placeholder:text-gray-500"
            )}
          />
        </div>
      </div>
    );
  }
};
