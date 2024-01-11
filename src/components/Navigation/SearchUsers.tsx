// User Search component - works/appears on the Users page with UserSearchContext

import {
  Box,
  Flex,
  Input,
  InputGroup,
  InputRightElement,
  Select,
  useColorMode,
} from "@chakra-ui/react";
import { FiSearch } from "react-icons/fi";
import { useUserSearchContext } from "../../lib/hooks/UserSearchContext";
import { useEffect, useState } from "react";
import { getAllBusinessAreas } from "@/lib/api";

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

  const [businessAreas, setBusinessAreas] = useState<any[]>([]);

  const handleOnlySelectedBusinessAreaChange: React.ChangeEventHandler<
    HTMLSelectElement
  > = (event) => {
    const businessAreaValue = event.target.value;
    console.log(businessAreaValue);
    setSearchFilters({
      onlySuperuser: onlySuperuser,
      onlyExternal: onlyExternal,
      onlyStaff: onlyStaff,
      businessArea: businessAreaValue,
    });
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

  console.log(businessAreas);

  return (
    <Flex>
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
        {businessAreas &&
          businessAreas
            .sort((a, b) => a.name.localeCompare(b.name)) // Sort the array alphabetically
            .map((ba, index) => (
              <option key={index} value={ba.name}>
                {ba.name}
              </option>
            ))}
      </Select>

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
