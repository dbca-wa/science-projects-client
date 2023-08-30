// WIP Route for chat feature

import { Flex, useColorMode } from "@chakra-ui/react"
import { Head } from "../components/Base/Head"
import { ChatSidebar } from "../components/Pages/Chat/ChatSidebar"
import { ChatView } from "../components/Pages/Chat/ChatView"
import { useUserLastOnline } from "../lib/hooks/useUserLastOnline"
import { useState } from "react"

interface IChatMessage {
    sendingUser: IUser;
    timeSent: Date;
    payload: string;
    isRead: boolean;
    reactions: { type: string; count: number; }[];
}

interface IUser {
    first_name: string;
    last_name: string;
    username: string;
    avatar: string | null;
}


export const Chat = () => {

    const { colorMode } = useColorMode();
    const [currentChatRoom, setCurrentChatRoom] = useState<string | null>(null);
    const [currentChatMessages, setCurrentChatMessages] = useState<IChatMessage[]>([]);
    const [chatRoomsWithLastMessage, setChatRoomsWithLastMessage] = useState<
        {
            chatWith: string;
            lastMessage: IChatMessage;
            isOnline: boolean | null;
        }[]
    >([]);

    const userIdd = "1"
    const lastOnlineDate = useUserLastOnline(userIdd);

    const checkIfOnline = (date: Date | null) => {
        const currentTime = Date.now();
        const twoMinutesAgo = currentTime - 2 * 60 * 1000; // Calculate the timestamp of 2 minutes ago

        if (date) {
            return date.getTime() >= twoMinutesAgo;
        }
        else {
            return null;

        }
    }

    // useEffect(() => {
    //     const updatedChatRoomsWithLastMessage = testChatData.map((chatRoom) => {
    //         const lastMessage = chatRoom.messages[chatRoom.messages.length - 1];
    //         const isOnline = checkIfOnline(lastOnlineDate); // Call the checkIfOnline function with the last online date

    //         return { chatWith: chatRoom.chatWith, lastMessage, isOnline };
    //     });

    //     setChatRoomsWithLastMessage(updatedChatRoomsWithLastMessage);
    // }, [lastOnlineDate]);

    // useEffect(() => {
    //     if (currentChatRoom) {
    //         const selectedChatRoom = testChatData.find((chatRoom) => chatRoom.chatWith === currentChatRoom);
    //         if (selectedChatRoom) {
    //             setCurrentChatMessages(selectedChatRoom.messages);
    //         }
    //     } else if (testChatData.length > 0) {
    //         setCurrentChatRoom(testChatData[0].chatWith);
    //     }
    // }, [currentChatRoom]);

    // useEffect(() => {
    //     if (!currentChatRoom && chatRoomsWithLastMessage.length > 0) {
    //         const firstChatRoom = chatRoomsWithLastMessage[0];
    //         setCurrentChatRoom(firstChatRoom.chatWith);
    //         setCurrentChatMessages([firstChatRoom.lastMessage]);
    //     }
    // }, [currentChatRoom, chatRoomsWithLastMessage]);

    return (
        <>
            <Head title="Chat" />

            <Flex
                my={"16px"}
                h={"100%"}
            // display={"flex"}
            // flex={1}

            // borderTopWidth="1px"
            // borderTopColor={colorMode === "light" ? "gray.300" : "whiteAlpha.400"}
            >

                <ChatView messages={currentChatMessages} />
                <ChatSidebar
                    currentChatValue={currentChatRoom}
                    setCurrentChatFunction={setCurrentChatRoom}
                    chatRooms={chatRoomsWithLastMessage}
                />
            </Flex>
        </>
    );
};

    // const chatRoomsWithLastMessage = testChatData.map((chatData) => {
    //     const lastMessage = chatData.messages[chatData.messages.length - 1];
    //     return {
    //       chatWith: chatData.chatWith,
    //       lastMessage: lastMessage ? lastMessage : null,
    //     };
    //   });
