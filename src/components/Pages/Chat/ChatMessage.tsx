// A single message in a chat room

import { Box, Flex, Text, useColorMode } from "@chakra-ui/react"
import { ChatUser } from "./ChatUser";
import { IChatMessage } from "../../../types";


interface IMessageProps {
    chatMessage: IChatMessage;
    displayName: string;
}

export const ChatMessage = ({ chatMessage, displayName }: IMessageProps) => {
    const { colorMode } = useColorMode();
    const messageTime = chatMessage.timeSent.toLocaleTimeString([], {
        hour: "numeric",
        minute: "numeric",
    });

    return (
        <Box
            display="flex"
            my={4}
            pb={4}
            flexDir={"column"}
        >
            <ChatUser displayName={displayName} avatarSrc={chatMessage.sendingUser.avatar} />

            {/* Chat Message */}
            <Flex
                flexDir={"column"}
                sx={

                    displayName === "You" ?
                        {
                            backgroundColor: "blue.400",
                            color: "white",
                            alignSelf: "flex-end",
                        } : {
                            backgroundColor: colorMode === "light" ? "gray.200" : "gray.600",
                            color: colorMode === "light" ? "black" : "white",
                            alignSelf: "flex-start",

                        }}
                py={2}
                px={4}
                rounded={"3xl"}
                maxW={"40%"}
                ml={displayName !== "You" ? 16 : 0}
                mr={displayName === "You" ? "69px" : 0}
                mt={-2}
                position={"relative"}
            >
                <Text wordBreak="break-word">{chatMessage.payload}</Text>

                {/* Timestamp */}
                <Text
                    fontSize="xs"
                    mt={1}
                    color={"gray.400"}
                    position="absolute"
                    bottom={-6}
                    right={displayName !== "You" ? 1.5 : "auto"}
                    left={displayName === "You" ? 1.5 : "auto"}
                >
                    {messageTime}
                </Text>
            </Flex>
        </Box>
    );

};
