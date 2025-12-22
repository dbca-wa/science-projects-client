// User Search component - works/appears on the Users page with UserSearchContext

import { getAllBusinessAreas } from "@/features/business-areas/services/business-areas.service";
import type { IBusinessArea, IDivision } from "@/shared/types";
import {
  useEffect,
  useState,
  type ChangeEventHandler,
  type ChangeEvent,
} from "react";
import { FiSearch } from "react-icons/fi";
import { useUserSearchContext } from "@/features/users/hooks/UserSearchContext";
import { useTheme } from "next-themes";
import { Input } from "@/shared/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";

export const SearchUsers = () => {
  const {
    setSearchTerm,
    setIsOnUserPage,
    searchTerm,
    onlySuperuser,
    onlyStaff,
    onlyExternal,
    setCurrentUserResultsPage,
    setSearchFilters,
  } = useUserSearchContext();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [inputValue, setInputValue] = useState("");

  useEffect(() => {
    setIsOnUserPage(true); // Set initial value

    return () => {
      setIsOnUserPage(false); // Set value to false when navigating away
    };
  }, []);

  useEffect(() => {
    setCurrentUserResultsPage(1);
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

  const [businessAreas, setBusinessAreas] = useState<IBusinessArea[]>([]);

  const handleOnlySelectedBusinessAreaChange = (businessAreaValue: string) => {
    setSearchFilters({
      onlySuperuser: onlySuperuser,
      onlyExternal: onlyExternal,
      onlyStaff: onlyStaff,
      businessArea: businessAreaValue,
    });
  };

  // const handleOnlySelectedBusinessAreaChange: React.ChangeEventHandler<
  //   HTMLSelectElement
  // > = (event) => {
  //   const businessAreaValue = event.target.value;
  //   // console.log(businessAreaValue);
  //   setSearchFilters({
  //     onlyActive: onlyActive,
  //     onlyInactive: onlyInactive,
  //     filterBA: businessAreaValue,
  //     filterProjectKind: filterProjectKind,
  //     filterProjectStatus: filterProjectStatus,
  //     filterYear: filterYear,
  //   });
  // };

  // useEffect(() => console.log(businessAreaValue), [])

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

  // console.log(businessAreas);
  const orderedDivisionSlugs = ["BCS", "CEM", "RFMS"];
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

  return (
    <div className="flex gap-4">
      <Select onValueChange={handleOnlySelectedBusinessAreaChange} defaultValue="All">
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="All Business Areas" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="All">All Business Areas</SelectItem>
          {orderedDivisionSlugs.flatMap((divSlug) => {
            // Filter business areas for the current division
            const divisionBusinessAreas = businessAreas
              .filter((ba) => (ba.division as IDivision).slug === divSlug)
              .sort((a, b) => a.name.localeCompare(b.name));

            return divisionBusinessAreas.map((ba, index) => (
              <SelectItem key={`${ba.name}${index}`} value={ba.pk.toString()}>
                {ba?.division ? `[${(ba?.division as IDivision)?.slug}] ` : ""}
                {checkIsHtml(ba.name) ? sanitizeHtml(ba.name) : ba.name}{" "}
                {ba.is_active ? "" : "(INACTIVE)"}
              </SelectItem>
            ));
          })}
        </SelectContent>
      </Select>

      <div className="relative">
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
          <FiSearch className="h-4 w-4 text-gray-400" />
        </div>
        <Input
          placeholder="Search Users..."
          type="text"
          value={inputValue}
          onChange={handleChange}
          className="pr-10 bg-transparent"
        />
      </div>
    </div>
  );
};
