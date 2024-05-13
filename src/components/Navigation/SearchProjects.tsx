// Project search component - works/appears on the Users page with ProjectSearchContext

import { IBusinessArea } from "@/types";
import {
  Flex,
  Grid,
  Input,
  InputGroup,
  InputRightElement,
  Select,
  useColorMode,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { FiSearch } from "react-icons/fi";
import { getAllBusinessAreas, getAllProjectsYears } from "../../lib/api";
import { useProjectSearchContext } from "../../lib/hooks/helper/ProjectSearchContext";

interface IProps {
  orientation?: "vertical" | "horizontal";
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
  } = useProjectSearchContext();

  const [businessAreas, setBusinessAreas] = useState<IBusinessArea[]>([]);
  const orderedDivisionSlugs = ["BCS", "CEM", "RFMS"];

  // useEffect(() => console.log(businessAreas));
  const [availableYears, setAvailableYears] = useState<number[]>([]);

  const handleOnlySelectedBusinessAreaChange: React.ChangeEventHandler<
    HTMLSelectElement
  > = (event) => {
    const businessAreaValue = event.target.value;
    // console.log(businessAreaValue);
    setSearchFilters({
      onlyActive: onlyActive,
      onlyInactive: onlyInactive,
      filterBA: businessAreaValue,
      filterProjectKind: filterProjectKind,
      filterProjectStatus: filterProjectStatus,
      filterYear: filterYear,
    });
  };

  const handleOnlySelectedYearChange: React.ChangeEventHandler<
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

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setInputValue(value);
  };
  if (orientation && orientation === "vertical") {
    return (
      <Grid
        // bg={"red"}
        w={"100%"}
        h={"100%"}
        gridRowGap={1}
      >
        {/* Project Business Area Filters */}

        <InputGroup borderColor="gray.200" size="sm" mb={1}>
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
            }}
          />
        </InputGroup>

        <Grid gridTemplateColumns={"repeat(2, 1fr)"} gridColumnGap={4}>
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
          <Select
            onChange={handleOnlySelectedBusinessAreaChange}
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
            <option key={"All"} value={"All"} color={"black"}>
              All Business Areas
            </option>
            {orderedDivisionSlugs.flatMap((divSlug) => {
              // Filter business areas for the current division
              const divisionBusinessAreas = businessAreas
                .filter((ba) => ba.division.slug === divSlug)
                .sort((a, b) => a.name.localeCompare(b.name));

              return divisionBusinessAreas.map((ba, index) => (
                <option key={`${ba.name}${index}`} value={ba.pk}>
                  {ba?.division ? `[${ba?.division?.slug}] ` : ""}
                  {checkIsHtml(ba.name) ? sanitizeHtml(ba.name) : ba.name}{" "}
                  {ba.is_active ? "" : "(INACTIVE)"}
                </option>
              ));
            })}
          </Select>
        </Grid>
      </Grid>
    );
  } else {
    return (
      <Flex>
        {/* Project Business Area Filters */}

        <Select
          onChange={handleOnlySelectedBusinessAreaChange}
          size={"sm"}
          mx={4}
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
          <option value={"All"} color={"black"}>
            All Business Areas
          </option>
          {businessAreas.map((ba, index) => {
            const checkIsHtml = (data: string) => {
              // Regular expression to check for HTML tags
              const htmlRegex = /<\/?[a-z][\s\S]*>/i;

              // Check if the string contains any HTML tags
              return htmlRegex.test(data);
            };

            const isHtml = checkIsHtml(ba.name);
            let baName = ba?.name;
            if (isHtml === true) {
              const parser = new DOMParser();
              const dom = parser.parseFromString(ba.name, "text/html");
              const content = dom.body.textContent;
              baName = content;
            }
            return (
              <option key={index} value={ba.pk}>
                {baName}
              </option>
            );
          })}{" "}
        </Select>

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
