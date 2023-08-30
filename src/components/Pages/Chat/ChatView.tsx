// Component for showing the actual chat page. Used with the sidebar to populate this view with
// data from the selected chatroom.

import { Box } from "@chakra-ui/react"
import { ChatMessage } from "./ChatMessage";
import { useUser } from "../../../lib/hooks/useUser";
import { ChatInput } from "./ChatInput";
import { useEffect, useRef } from "react";
import { IChatMessage } from "../../../types";

interface IChatViewProps {
    messages: IChatMessage[];
}


export const ChatView = ({ messages }: IChatViewProps) => {
    const user = useUser();
    const chatViewRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        if (chatViewRef.current) {
            chatViewRef.current.scrollTop = chatViewRef.current.scrollHeight;
        }
    };

    return (
        <Box height="100%" display="flex" flexDirection="column" flex={1}>
            <Box overflowY="auto" flex="1" p={3} ref={chatViewRef}>
                {messages.map((message, index) => {
                    const isCurrentUser = user.userData.username === message.sendingUser.username;
                    const displayName = isCurrentUser ? "You" : `${message.sendingUser.first_name} ${message.sendingUser.last_name}`;
                    return <ChatMessage key={index} chatMessage={message} displayName={displayName} />;
                })}
            </Box>
            <div style={{ flexShrink: 0 }} />
            <ChatInput scrollBot={scrollToBottom} />
        </Box>
    );
};