// User Search component - works/appears on the Users page with UserSearchContext

import { getAllBusinessAreas } from "@/lib/api";
import { IBusinessArea, IDivision } from "@/types";
import {
  Flex,
  Input,
  InputGroup,
  InputRightElement,
  Select,
  useColorMode,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { FiSearch } from "react-icons/fi";
import { useUserSearchContext } from "../../lib/hooks/helper/UserSearchContext";

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
  const { colorMode } = useColorMode();
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

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setInputValue(value);
  };

  const [businessAreas, setBusinessAreas] = useState<IBusinessArea[]>([]);

  const handleOnlySelectedBusinessAreaChange: React.ChangeEventHandler<
    HTMLSelectElement
  > = (event) => {
    const businessAreaValue = event.target.value;
    // console.log(businessAreaValue);
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
    <Flex gap={4}>
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
            .filter((ba) => (ba.division as IDivision).slug === divSlug)
            .sort((a, b) => a.name.localeCompare(b.name));

          return divisionBusinessAreas.map((ba, index) => (
            <option key={`${ba.name}${index}`} value={ba.pk}>
              {ba?.division ? `[${(ba?.division as IDivision)?.slug}] ` : ""}
              {checkIsHtml(ba.name) ? sanitizeHtml(ba.name) : ba.name}{" "}
              {ba.is_active ? "" : "(INACTIVE)"}
            </option>
          ));
        })}
      </Select>
      {/* <Select
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
              [{ba.division.slug}] {baName}
            </option>
          );
        })}{" "}
      </Select> */}

      <InputGroup borderColor="gray.200" size="sm">
        <InputRightElement
          pointerEvents="none"
          children={<FiSearch color={"#9CA3AF"} />}
        />
        <Input
          placeholder="Search Users..."
          rounded={6}
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
    </Flex>
  );
};
