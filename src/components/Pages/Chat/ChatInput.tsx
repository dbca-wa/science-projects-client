// Handles input for typing a message

import { Box, Flex, useColorMode, IconButton, Textarea } from "@chakra-ui/react"
import { IoMdSend } from "react-icons/io";
import { useRef } from "react";


interface ChatInputProps {
    scrollBot: () => void;
}

export const ChatInput = ({ scrollBot }: ChatInputProps) => {
    const { colorMode } = useColorMode();
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const adjustTextareaHeight = () => {
        const textarea = textareaRef.current;
        if (textarea) {
            const previousHeight = textarea.style.height;
            textarea.style.height = "auto";
            textarea.style.height = `${textarea.scrollHeight}px`;
            const newHeight = textarea.style.height;
            if (previousHeight !== newHeight) {
                scrollBot(); // Call the scrollBot function to scroll to the bottom
            }
        }
    };

    const handleTextareaChange = () => {
        adjustTextareaHeight();
    };

    return (
        <Box
            p={3}
            borderTopWidth="1px"
            borderTopColor={colorMode === "light" ? "gray.300" : "whiteAlpha.400"}
        // bgColor={colorMode === "light" ? "whiteAlpha.900" : "blackAlpha.900"}
        >
            <Flex align="center">
                <Textarea
                    ref={textareaRef}
                    placeholder="Enter your message"
                    css={{
                        resize: "none",
                        minHeight: "auto",
                        height: "auto",
                        overflow: "hidden",
                        whiteSpace: "pre-wrap",
                        "&:focus": {
                            boxShadow: "none",
                        },
                    }}
                    autoFocus
                    onChange={handleTextareaChange}
                />
                <IconButton
                    icon={<IoMdSend />}
                    aria-label="Send"
                    // colorScheme="blue"
                    bg={"blue.500"}
                    color={"white"}
                    _hover={
                        { bg: "blue.400" }
                    }
                    ml={2}
                    alignSelf="center"
                />
            </Flex>
        </Box>
    );
};