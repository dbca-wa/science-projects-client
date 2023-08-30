// Component for handling data for one chat room. This is the component displayed on sidebar.

import { Avatar, Box, useColorMode, Text, Badge } from "@chakra-ui/react"
import { ISingleChatData } from "../../../types";


interface IChatRoomProps {
    selected: boolean;
    chatData: ISingleChatData
    onClick: () => void;
}

export const ChatRoom = ({ chatData, selected, onClick }: IChatRoomProps) => {

    const { colorMode } = useColorMode();
    const isOnline = true;

    const handleOnClick = () => {
        console.log("clicked");
        onClick();
    }

    return (
        <Box
            p={2}
            width={"100%"}
            bg={selected ? (colorMode === "light" ? "blue.400" : "blue.500") : "transparent"}
            color={selected ? ("white") : "inherit"}
            _hover={
                colorMode === "light" ?
                    {
                        bg: selected ? "blue.400" : "blue.100",
                        color: selected ? "white" : "black",
                    } :
                    {
                        bg: selected ? "blue.400" : "gray.300",
                        color: selected ? "white" : "black",
                    }
            }

            position={"relative"}
            display={"flex"}
            rounded={"lg"}
            cursor={"pointer"}
            alignItems={"center"}
            transitionProperty={"background-color, border-color, color, fill, stroke, opacity, box-shadow, transform"}
            onClick={handleOnClick}
        >
            <Avatar size={"sm"} />
            {isOnline && (
                <Badge
                    position="absolute"
                    top={1}
                    right={1}
                    bg="green.400"
                    boxSize={3}
                    border="2px solid white"
                    borderRadius="full"
                />
            )}

            <Box
                minW={0}
                flex={1}
            >
                <Box
                    _focus={{ outline: "none" }}
                >
                    <Box
                        display={"flex"}
                        justifyContent={"space-between"}
                        alignItems={"center"}
                        mb={0.5}
                        pl={2}
                    >
                        <Text>
                            {chatData.chatWith}
                        </Text>
                    </Box>
                </Box>

            </Box>
        </Box>
    )
}