// Display of users above their message in chat route

import { Avatar, Flex, Text, useColorMode } from "@chakra-ui/react"
import React from "react";

interface ChatUserProps {
    displayName: string;
    avatarSrc: string | null;
}

export const ChatUser: React.FC<ChatUserProps> = React.memo(({ displayName, avatarSrc }) => {

    const { colorMode } = useColorMode();

    return (
        <Flex
            flexDir="row" color="gray.500" sx={{ alignSelf: displayName === "You" ? "flex-end" : "flex-start" }}
            mt={2}
        >
            {displayName === "You" && (
                <>
                    <Flex
                        pl={0}
                        pr={4}
                    >
                        <Text
                            fontWeight="bold"
                            pl={2}
                            color={colorMode === "light" ? "blackAlpha.700" : "whiteAlpha.800"}
                        >
                            {displayName}
                        </Text>
                    </Flex>
                    <Avatar size="md" src={avatarSrc !== null ? avatarSrc : undefined} name={displayName} mr={2} />

                </>
            )}
            {displayName !== "You" && (
                <>
                    <Avatar size="md" src={avatarSrc !== null ? avatarSrc : undefined} name={displayName} mr={2} />
                    <Flex
                        pl={1}
                        pr={0}
                    >
                        <Text
                            fontWeight="bold"
                            pl={2}
                            color={colorMode === "light" ? "blackAlpha.700" : "whiteAlpha.800"}
                        >
                            {displayName}
                        </Text>
                    </Flex>
                </>
            )}
        </Flex>
    );
});

