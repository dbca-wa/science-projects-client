// Part of the options bar, displays the word and character counts

import { Text, useColorMode } from "@chakra-ui/react";

interface IWordCountProps {
    text: string | null;
}

export const WordCount = ({ text }: IWordCountProps) => {


    let wordCount = 0;
    let charCount = 0;
    if (text === undefined || text === null) {
        wordCount = 0;
        charCount = 0;
    } else {
        wordCount = getWordCount(text)
        charCount = getCharacterCount(text)
    }

    const { colorMode } = useColorMode();

    return (
        <Text
            fontWeight={"semibold"}
            fontSize={"lg"}
            color={colorMode === "light" ? "blackAlpha.500" : "whiteAlpha.700"}
            userSelect={"none"}
        >
            {`${wordCount} word${wordCount > 1 || wordCount === 0 ? "s" : ""}`} | {`${charCount} character${charCount > 1 || charCount === 0 ? "s" : ""}`}
        </Text>
    )
}

const stripHTML = (dataToStrip: string) => {
    if (!dataToStrip) return "";

    // Remove HTML tags using regex and insert spaces between opening/closing tags
    const strippedVersion = dataToStrip.replace(/<\/?[^>]+(>|$)/g, " ").trim();

    // Insert spaces after sentence enders, commas, and semicolons if needed
    return strippedVersion.replace(/([!.;]+)(?=\S)/g, "$1 ").replace(/\s{2,}/g, " ");
};

const getWordCount = (data: string) => {
    // Check if the input is empty or null
    if (!data) return 0;

    // Split the string into an array of words using whitespace as the delimiter
    const wordsArray = data.split(/\s+/);

    // Filter out any empty strings from the array (e.g., caused by multiple consecutive spaces)
    const filteredWordsArray = wordsArray.filter((word) => word.trim() !== "");

    // Return the length of the filtered array, which represents the word count
    return filteredWordsArray.length;

}


const getCharacterCount = (data: string) => {
    // Check if the input is empty or null
    if (!data) return 0;

    // Remove whitespace from the string to get the character count
    const characterCount = data.replace(/\s/g, "").length;

    return characterCount;
};