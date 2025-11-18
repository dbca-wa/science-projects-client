// Project search component - works/appears on the Users page with ProjectSearchContext

import {
  Box,
  Checkbox,
  Flex,
  Grid,
  Input,
  InputGroup,
  InputRightElement,
  Select,
  useColorMode,
} from "@chakra-ui/react";
import { useEffect, useState, type ChangeEventHandler, type ChangeEvent } from "react";
import { FiSearch } from "react-icons/fi";
import { getAllProjectsYears } from "@/shared/lib/api";
import { useProjectSearchContext } from "@/features/projects/hooks/ProjectSearchContext";
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

  const handleOnlySelectedYearChange: ChangeEventHandler<
    HTMLSelectElement
  > = (event) => {
    const yearValue = Number(event.target.value);
    // console.log(yearValue);
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
      <Grid
        // bg={"red"}
        w={"100%"}
        h={"100%"}
        // gridRowGap={4}
      >
        {/* Project Business Area Filters */}

        <InputGroup borderColor="gray.200" size="sm">
          <InputRightElement
            pointerEvents="none"
            children={<FiSearch color={"#9CA3AF"} />}
          />
          <Input
            bg="white"
            placeholder="Search projects by name, keyword or tag..."
            rounded={"5px"}
            type="text"
            value={inputValue}
            onChange={handleChange}
            background={"transparent"}
            color={colorMode === "dark" ? "whiteAlpha.900" : ""}
            _placeholder={{
              color: colorMode === "dark" ? "gray.300" : "gray.500",
              paddingLeft: "2px",
            }}
          />
        </InputGroup>

        <Box>
          <SearchProjectsByUser
            handleFilterUserChange={handleFilterUserChange}
          />
        </Box>

        <Grid
          // mt={1}
          gridGap={4}
          gridTemplateColumns={{
            base: "repeat(1, 1fr)",
            md: "repeat(2, 1fr)",
          }}
          className="flex items-center justify-end"
        >
          <Select
            onChange={handleOnlySelectedYearChange}
            size={"sm"}
            // mx={4}
            rounded={"5px"}
            style={
              colorMode === "light"
                ? {
                    color: "black",
                    backgroundColor: "white",
                    borderColor: "gray.200",
                    caretColor: "black !important",
                  }
                : {
                    color: "white",
                    borderColor: "white",
                    caretColor: "black !important",
                  }
            }
          >
            <option value={0} color={"black"}>
              All Years
            </option>
            {availableYears &&
              availableYears
                .sort((a, b) => b - a) // Sort the array numerically
                .map((year, index) => (
                  <option key={`${year}${index}`} value={year}>
                    {year}
                  </option>
                ))}
          </Select>
          <Checkbox
            size="md"
            colorScheme="green"
            onChange={handleOnlyActiveProjectsChange}
            isChecked={onlyActive}
            isDisabled={onlyInactive}
          >
            Active
          </Checkbox>
          <Checkbox
            size="md"
            colorScheme="gray"
            onChange={handleOnlyInactiveProjectsChange}
            isChecked={onlyInactive}
            isDisabled={onlyActive}
          >
            Inactive
          </Checkbox>
        </Grid>
      </Grid>
    );
  } else {
    return (
      <Flex>
        <InputGroup borderColor="gray.200" size="sm">
          <InputRightElement
            pointerEvents="none"
            children={<FiSearch color={"#9CA3AF"} />}
          />
          <Input
            color={colorMode === "dark" ? "blackAlpha.800" : ""}
            _placeholder={{
              color: colorMode === "dark" ? "gray.500" : "gray.500",
            }}
            bg="white"
            placeholder="Search Projects..."
            rounded={"5px"}
            type="text"
            value={inputValue}
            onChange={handleChange}
          />
        </InputGroup>
      </Flex>
    );
  }
};
