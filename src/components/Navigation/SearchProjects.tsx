// Project search component - works/appears on the Users page with ProjectSearchContext

import { Flex, Grid, Input, InputGroup, InputRightElement, Select, useColorMode } from "@chakra-ui/react";
import { FiSearch } from "react-icons/fi";
import { useEffect, useState } from "react";
import { useProjectSearchContext } from "../../lib/hooks/ProjectSearchContext";
import { getAllBusinessAreas, getAllProjectsYears } from "../../lib/api";

interface IProps {
    orientation?: "vertical" | "horizontal"
}

export const SearchProjects = ({ orientation }: IProps) => {
    const { colorMode } = useColorMode();
    const [inputValue, setInputValue] = useState('');

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


    const [businessAreas, setBusinessAreas] = useState<any[]>([]);
    const [availableYears, setAvailableYears] = useState<number[]>([]);

    const handleOnlySelectedBusinessAreaChange: React.ChangeEventHandler<HTMLSelectElement> = (event) => {
        const businessAreaValue = event.target.value;
        console.log(businessAreaValue);
        setSearchFilters(
            {
                onlyActive: onlyActive,
                onlyInactive: onlyInactive,
                filterBA: businessAreaValue,
                filterProjectKind: filterProjectKind,
                filterProjectStatus: filterProjectStatus,
                filterYear: filterYear
            });
    };

    const handleOnlySelectedYearChange: React.ChangeEventHandler<HTMLSelectElement> = (event) => {

        const yearValue = Number(event.target.value);
        console.log(yearValue);
        setSearchFilters(
            {
                onlyActive: onlyActive,
                onlyInactive: onlyInactive,
                filterBA: filterBA,
                filterProjectKind: filterProjectKind,
                filterProjectStatus: filterProjectStatus,
                filterYear: yearValue,
            });

    }


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
                console.log(data)
                setAvailableYears(data);
            } catch (error) {
                console.log("Error fetching Project's years", error)
            }
        }
        fetchAvailableProjectYears();
    }, [])

    useEffect(() => {
        setIsOnProjectsPage(true); // Set initial value

        return () => {
            setIsOnProjectsPage(false); // Set value to false when navigating away
        };
    }, []);

    useEffect(() => {
        setCurrentProjectResultsPage(1);
    }, [searchTerm])


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



                <InputGroup borderColor="gray.200" size="sm"
                    mb={1}
                >
                    <InputRightElement pointerEvents="none" children={<FiSearch color={"#9CA3AF"} />} />
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

                <Grid
                    gridTemplateColumns={"repeat(2, 1fr)"}
                    gridColumnGap={4}

                >
                    <Select
                        onChange={handleOnlySelectedYearChange}
                        size={"sm"}
                        // mx={4}
                        rounded={"5px"}
                        style={
                            colorMode === "light" ? {
                                color: 'black',
                                backgroundColor: 'white',
                                borderColor: 'gray.200',
                                caretColor: 'black !important',
                            } :
                                {
                                    color: 'white',
                                    borderColor: 'white',
                                    caretColor: 'black !important',
                                }

                        }
                    >
                        <option value={0}
                            color={"black"}
                        >
                            All Years
                        </option>
                        {availableYears &&
                            availableYears
                                .sort((a, b) => b - a) // Sort the array numerically
                                .map((year, index) => (
                                    <option key={index} value={year}>
                                        {year}
                                    </option>
                                ))
                        }
                    </Select>
                    <Select onChange={handleOnlySelectedBusinessAreaChange}
                        size={"sm"}
                        // mx={4}
                        rounded={"5px"}
                        style={
                            colorMode === "light" ? {
                                color: 'black',
                                backgroundColor: 'white',
                                borderColor: 'gray.200',
                                caretColor: 'black !important',
                            } :
                                {
                                    color: 'white',
                                    borderColor: 'white',
                                    caretColor: 'black !important',
                                }

                        }
                    >
                        <option value={"All"}
                            color={"black"}

                        >All Business Areas</option>
                        {businessAreas &&
                            businessAreas
                                .sort((a, b) => a.name.localeCompare(b.name)) // Sort the array alphabetically
                                .map((ba, index) => (
                                    <option key={index} value={ba.slug}>
                                        {ba.name}
                                    </option>
                                ))
                        }
                    </Select>

                </Grid>

            </Grid>
        );
    } else {
        return (
            <Flex>
                {/* Project Business Area Filters */}

                <Select onChange={handleOnlySelectedBusinessAreaChange}
                    size={"sm"}
                    mx={4}
                    rounded={"5px"}
                    style={
                        colorMode === "light" ? {
                            color: 'black',
                            backgroundColor: 'white',
                            borderColor: 'gray.200',
                            caretColor: 'black !important',
                        } :
                            {
                                color: 'white',
                                borderColor: 'white',
                                caretColor: 'black !important',
                            }

                    }
                >
                    <option value={"All"}
                        color={"black"}

                    >All Business Areas</option>
                    {businessAreas &&
                        businessAreas
                            .sort((a, b) => a.name.localeCompare(b.name)) // Sort the array alphabetically
                            .map((ba, index) => (
                                <option key={index} value={ba.slug}>
                                    {ba.name}
                                </option>
                            ))
                    }
                </Select>

                <InputGroup borderColor="gray.200" size="sm">
                    <InputRightElement pointerEvents="none" children={<FiSearch color={"#9CA3AF"} />} />
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