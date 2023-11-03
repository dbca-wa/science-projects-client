// Used to input keywords and save them to a parametised state - similar to linkedin skill

import React, { useEffect, useState } from 'react';
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
} from '@chakra-ui/react';

const capitalizeFirstLetter = (text: string) => {
    return text.charAt(0).toUpperCase() + text.slice(1);
};

interface Props {
    setTagFunction: React.Dispatch<React.SetStateAction<string[]>>;
}
const TagInput = ({ setTagFunction }: Props) => {
    const [inputValue, setInputValue] = useState<string>('');
    const [tags, setTags] = useState<string[]>([]);

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setInputValue(event.target.value);
    };

    const updateTags = (updatedTags: string[]) => {
        setTagFunction(updatedTags);
        setTags(updatedTags);
    };

    useEffect(() => {
        if (tags) {
            console.log(tags)
        }
    }, [tags])

    const addTags = () => {
        const newTags = inputValue

            .split(', ')
            .map((tag) => tag.trim())
            .filter((tag) => tag !== '')
            .filter((tag) => !tags.some((existingTag) => existingTag.toLowerCase() === tag.toLowerCase()));

        console.log(newTags)

        if (newTags.length > 0) {
            const updatedTags = [...tags, ...newTags.map(capitalizeFirstLetter)];
            updateTags(updatedTags);
        }

        // Clear after adding/detecting duplicate tags
        setInputValue('');

    };

    const removeTag = (tag: string) => {
        const updatedTags = tags.filter((t) => t !== tag);
        updateTags(updatedTags);
    };

    useEffect(() => {
        if (inputValue.includes(', ')) {
            addTags();
        }
    }, [inputValue]);

    return (
        <FormControl isRequired mb={4}
            zIndex={1}
            pos={"relative"}
        >
            <FormLabel>Keywords</FormLabel>
            <InputGroup>
                <Input
                    value={inputValue}
                    onChange={handleInputChange}
                    placeholder="Add some keywords..."
                    onBlur={addTags}
                />
            </InputGroup>
            <FormHelperText>Add some keywords as a comma-separated list. Press space after a comma to add the tag.</FormHelperText>
            <Flex flexWrap="wrap" gap={2} pt={3} userSelect={"none"}>
                {tags.map((tag, index) => (
                    <Tag key={index} size="md" borderRadius="full" variant="solid" colorScheme="blue" userSelect={"none"}>
                        <TagLabel pl={1} userSelect={"none"}>{tag}</TagLabel>
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


// .split(', ')
// .map((tag) => tag.trim())
// .filter((tag) => tag !== '' && !tags.includes(tag));