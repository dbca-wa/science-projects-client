// Sidebar for selecting chatrooms and creating them

import { Box, useColorMode } from "@chakra-ui/react"
import { ChatRoom } from "./ChatRoom";
import { ChatSidebarUserSearch } from "./ChatSidebarUserSearch";

interface IReaction {
    type: string;
    count: number;
}

interface IUser {
    first_name: string;
    last_name: string;
    username: string;
    avatar: string | null;
}

interface IChatMessage {
    sendingUser: IUser;
    timeSent: Date;
    payload: string;
    isRead: boolean;
    reactions: IReaction[];
}

interface ISingleChatData {
    chatWith: string;
    lastMessage: IChatMessage;
    isOnline: boolean | null;
}

interface ChatSidebarProps {
    chatRooms: ISingleChatData[];
    currentChatValue: string | null;
    setCurrentChatFunction: (chatWith: string | null) => void;
}

export const ChatSidebar: React.FC<ChatSidebarProps> = ({
    chatRooms,
    currentChatValue,
    setCurrentChatFunction,
}) => {
    const { colorMode } = useColorMode();

    const handleChatRoomClick = (chatWith: string) => {
        setCurrentChatFunction(chatWith);
    };

    return (
        <Box
            borderLeftWidth="1px"
            borderLeftColor={colorMode === "light" ? "gray.300" : "whiteAlpha.400"}

            overflowY={"auto"}
            flexShrink={0}
            maxH={"100vh"}

            minW={250}

            maxW={250}
            display={"flex"}
            flexDirection={"column"}
            py={1}
            px={2}

        >
            <ChatSidebarUserSearch />
            {chatRooms.map((room, index) => {
                const { chatWith } = room;
                const isSelected = currentChatValue === chatWith;

                return (
                    <ChatRoom
                        key={index}
                        selected={isSelected}
                        chatData={room}
                        onClick={() => handleChatRoomClick(chatWith)}
                    />
                );
            })}
        </Box>
    );
};