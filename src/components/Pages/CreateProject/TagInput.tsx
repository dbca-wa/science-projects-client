// Used to input keywords and save them to a parametised state - similar to linkedin skill

import React, { useEffect, useState } from "react";
import {
  FormControl,
  FormLabel,
  InputGroup,
  Input,
  FormHelperText,
  Tag,
  TagLabel,
  TagCloseButton,
  Flex,
  useColorMode,
} from "@chakra-ui/react";


interface Props {
  setTagFunction: React.Dispatch<React.SetStateAction<string[]>>;
  preExistingTags?: string[];
}


const TagInput = ({ setTagFunction, preExistingTags }: Props) => {

  // Helpers
  const capitalizeFirstLetter = (text: string) => {
    return text.charAt(0).toUpperCase() + text.slice(1);
  };
  const updateTags = (updatedTags: string[]) => {
    setTagFunction(updatedTags);
    setTags(updatedTags);
  };

  const removeTag = (tag: string) => {
    const updatedTags = tags.filter((t) => t !== tag);
    updateTags(updatedTags);
  };

  // State and Use Effects
  const [isInputActive, setInputActive] = useState<boolean>(false);

  const [inputValue, setInputValue] = useState<string>("");
  const [tags, setTags] = useState<string[]>([]);
  useEffect(() => {
    console.log(preExistingTags)
    if (preExistingTags?.length >= 1) {
      // console.log(preExistingTags.length, preExistingTags);
      if (preExistingTags[0] === "") {
        setTags([]);
      } else {
        const splitTags = preExistingTags[0].split(', ')
        setTags([...splitTags]);
      }
    }
  }, []);


  // Funcs

  const handleInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" && isInputActive) {
      // Prevent the default behavior of the Enter key
      event.preventDefault();
      addTags();
    }
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.target.value);
  };


  const addTags = () => {
    const newTags = inputValue
      .split(", ")
      // .map((tag) => tag.trim())
      .map((tag) => tag.trim().replace(/,$/, ""))
      .filter((tag) => tag !== "")
      .filter(
        (tag) =>
          !tags.some(
            (existingTag) => existingTag.toLowerCase() === tag.toLowerCase()
          )
      );

    if (newTags.length > 0) {
      const updatedTags = [...tags, ...newTags.map(capitalizeFirstLetter)];
      updateTags(updatedTags);
    }

    setInputValue("");
  };

  // Variables

  const { colorMode } = useColorMode();

  return (
    <FormControl isRequired mb={4} zIndex={1} pos={"relative"}>
      <FormLabel>Keywords</FormLabel>
      <InputGroup>
        <Input
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleInputKeyDown}
          placeholder="Add some keywords..."
          onFocus={() => setInputActive(true)}
          onBlur={() => setInputActive(false)}
        />
      </InputGroup>
      <FormHelperText color={colorMode === "light" ? "gray.500" : "gray.400"}>
        Add some keywords as a comma-separated list. Press space after a comma
        to add the tag.
      </FormHelperText>
      <Flex flexWrap="wrap" gap={2} pt={3}>
        {tags?.map((tag, index) => (
          <Tag
            key={index}
            size="md"
            borderRadius="full"
            variant="solid"
            color={"white"}
            background={colorMode === "light" ? "blue.500" : "blue.600"}
            _hover={{
              background: colorMode === "light" ? "blue.400" : "blue.500",
            }}
          >
            <TagLabel pl={1}>{tag}</TagLabel>
            <TagCloseButton
              onClick={() => removeTag(tag)}
              userSelect={"none"}
              tabIndex={-1}
            />
          </Tag>
        ))}
      </Flex>
    </FormControl>
  );
};

export default TagInput;