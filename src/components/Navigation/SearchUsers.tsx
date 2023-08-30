// User Search component - works/appears on the Users page with UserSearchContext

import { Box, Input, InputGroup, InputRightElement, useColorMode } from "@chakra-ui/react";
import { FiSearch } from "react-icons/fi";
import { useUserSearchContext } from "../../lib/hooks/UserSearchContext";
import { useEffect, useState } from "react";

export const SearchUsers = () => {
    const { setSearchTerm, setIsOnUserPage, searchTerm, setCurrentUserResultsPage } = useUserSearchContext();
    const { colorMode } = useColorMode();
    const [inputValue, setInputValue] = useState('');

    useEffect(() => {
        setIsOnUserPage(true); // Set initial value

        return () => {
            setIsOnUserPage(false); // Set value to false when navigating away
        };
    }, []);

    useEffect(() => {
        setCurrentUserResultsPage(1);
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

    return (
        <Box>
            <InputGroup borderColor="gray.200" size="sm">
                <InputRightElement pointerEvents="none" children={<FiSearch color={"#9CA3AF"} />} />
                <Input
                    color={colorMode === "dark" ? "blackAlpha.800" : ""}
                    _placeholder={{
                        color: colorMode === "dark" ? "gray.500" : "gray.500",
                    }}
                    bg="white"
                    placeholder="Search Users..."
                    rounded={6}
                    type="text"
                    value={inputValue}
                    onChange={handleChange}
                />
            </InputGroup>
        </Box>
    );
};