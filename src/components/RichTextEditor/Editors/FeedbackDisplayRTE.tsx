import { ChatUser } from "@/components/Pages/Chat/ChatUser";
import { IUpdateFeedbackStatus, updateUserFeedbackStatus } from "@/lib/api";
import { IBranch, IBusinessArea, IUserData } from "@/types";
import {
    Box, Flex, Select, Tag,
    ToastId, useColorMode, useToast
} from "@chakra-ui/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRef } from "react";
import { useForm } from "react-hook-form";

// Lexical
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import LexicalErrorBoundary from "@lexical/react/LexicalErrorBoundary";

// Lexical Plugins
import { ClearEditorPlugin } from "@lexical/react/LexicalClearEditorPlugin";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";

import "@/styles/texteditor.css";

import { ListItemNode, ListNode } from "@lexical/list";
import { MentionNode } from "../Plugins/MentionsPlugin";
import { CustomPastePlugin } from "../Plugins/CustomPastePlugin";
import { PrepopulateCommentDisplayPlugin } from "../Plugins/PrepopulateCommentDisplayPlugin";

interface IFeedbackProps {
    baData: IBusinessArea[];
    branchesData: IBranch[];
    user: IUserData;
    feedbackData: { id: number, user: IUserData, text: string, status: string };
}

export const FeedbackDisplayRTE = ({ baData, branchesData, user, feedbackData }: IFeedbackProps) => {

    const statusDict = {
        new: "New",
        inprogress: "In Progress",
        logged: "Logged",
        fixed: "Fixed",
    };

    const queryClient = useQueryClient();
    const { reset } = useForm<IUpdateFeedbackStatus>();
    const toast = useToast();
    const toastIdRef = useRef<ToastId>();
    const addToast = (data) => {
        toastIdRef.current = toast(data);
    };

    const feedbackUpdateMutation = useMutation(updateUserFeedbackStatus, {
        onMutate: () => {
            addToast({
                status: "loading",
                title: "Updating Status",
                position: "top-right",
            });
        },
        onSuccess: () => {
            if (toastIdRef.current) {
                toast.update(toastIdRef.current, {
                    title: "Success",
                    description: `Status Updated`,
                    status: "success",
                    position: "top-right",
                    duration: 3000,
                    isClosable: true,
                });
            }
            reset();

            setTimeout(() => {
                queryClient.invalidateQueries(["userfeedback"]);
                queryClient.refetchQueries([`userfeedback`]);
            }, 350);
        },
        onError: (error) => {
            if (toastIdRef.current) {
                toast.update(toastIdRef.current, {
                    title: "Could Not Update Status",
                    description: `${error}`,
                    status: "error",
                    position: "top-right",
                    duration: 3000,
                    isClosable: true,
                });
            }
        },
    });

    const onChangeStatus = (formData: IUpdateFeedbackStatus) => {
        feedbackUpdateMutation.mutate(formData);
    };
    const { colorMode } = useColorMode();

    const generateTheme = (colorMode) => {
        return {
            quote: "editor-quote",
            ltr: "ltr",
            rtl: "rtl",
            paragraph: colorMode === "light" ? "editor-p-light" : "editor-p-dark",
            span: colorMode === "light" ? "editor-p-light" : "editor-p-dark",
            heading: {
                h1: colorMode === "light" ? "editor-h1-light" : "editor-h1-dark",
                h2: colorMode === "light" ? "editor-h2-light" : "editor-h2-dark",
                h3: colorMode === "light" ? "editor-h3-light" : "editor-h3-dark",
            },
            list: {
                ul: colorMode === "light" ? "editor-ul-light" : "editor-ul-dark",
                ol: colorMode === "light" ? "editor-ol-light" : "editor-ol-dark",
                listitem: colorMode === "light" ? "editor-li-light" : "editor-li-dark",
                listitemChecked: "editor-listItemChecked",
                listitemUnchecked: "editor-listItemUnchecked",
            },
            text: {
                bold: colorMode === "light" ? "editor-bold-light" : "editor-bold-dark",
                italics:
                    colorMode === "light"
                        ? "editor-italics-light"
                        : "editor-italics-dark",
                underline:
                    colorMode === "light"
                        ? "editor-underline-light"
                        : "editor-underline-dark",
                strikethrough:
                    colorMode === "light"
                        ? "editor-textStrikethrough-light"
                        : "editor-textStrikethrough-dark",
                subscript:
                    colorMode === "light"
                        ? "editor-textSubscript-light"
                        : "editor-textSubscript-dark",
                underlineStrikethrough:
                    colorMode === "light"
                        ? "editor-textUnderlineStrikethrough-light"
                        : "editor-textUnderlineStrikethrough-dark",
            },
        };
    };

    const onError = (error: Error) => {
        console.log(error);
    };
    const theme = generateTheme(colorMode);

    const lightInitialConfig = {
        namespace: "Comments",
        editable: false,
        theme: generateTheme("light"),
        onError,
        nodes: [ListNode, ListItemNode, MentionNode],
    };

    const darkInitialConfig = {
        namespace: "Comments",
        editable: false,
        theme: generateTheme("dark"),
        onError,
        nodes: [ListNode, ListItemNode, MentionNode],
    };

    return (
        <LexicalComposer
            key={`${colorMode}-${theme}-${feedbackData?.id}`} // Add a key with the theme for re-rendering
            initialConfig={
                colorMode === "light" ? lightInitialConfig : darkInitialConfig
            }
        >
            <HistoryPlugin />
            <ListPlugin />
            <CustomPastePlugin />
            <PrepopulateCommentDisplayPlugin data={feedbackData?.text} />
            <RichTextPlugin
                contentEditable={
                    <Box
                        pos={"relative"}
                        minH={150}
                        height={"100%"}
                        w={"100%"}

                        roundedBottom={20}
                        boxShadow={"rgba(100, 100, 111, 0.1) 0px 7px 29px 0px"}
                        bg={colorMode === "light" ? "gray.200" : "gray.700"}

                        // bg={colorMode === "light" ? "whiteAlpha.600" : "blackAlpha.500"}
                        roundedTop={20}
                        zIndex={2}
                        pb={3}
                        px={4}
                        pt={2}
                    >
                        <ChatUser
                            branches={branchesData}
                            businessAreas={baData}
                            user={user}
                            avatarSrc={user?.image}
                            displayName={`${user?.first_name} ${user?.last_name}`}
                            nameCentered={false}
                            otherUser={true}
                        />
                        <Flex
                            justifyContent={"flex-end"}
                            pos={"absolute"}
                            right={4}
                            top={4}
                        >
                            <Tag
                                background={
                                    feedbackData?.status === "new"
                                        ? "red.600"
                                        : feedbackData?.status === "fixed"
                                            ? "green.600"
                                            : feedbackData?.status === "logged"
                                                ? "blue.600"
                                                : "orange.600"
                                }
                                color={"white"}
                            >
                                {statusDict[feedbackData?.status]}
                            </Tag>
                        </Flex>

                        <ContentEditable
                            style={{
                                // minHeight: "50px",
                                width: "100%",
                                height: "auto",
                                // padding: "32px",
                                paddingLeft: "65px",
                                paddingRight: "65px",
                                marginTop: -24,
                                top: "40px",
                                paddingBottom: "20px",
                                borderRadius: "0 0 25px 25px",
                                outline: "none",
                                zIndex: 2,
                            }}
                        />
                        <Flex
                            justifyContent={"flex-end"}
                            pos={"absolute"}
                            right={4}
                            bottom={5}
                        // w={"50%"}
                        >
                            <Select
                                background={colorMode === "light" ? "gray.50" : undefined}
                                onChange={(e) =>
                                    onChangeStatus({
                                        pk: feedbackData?.id,
                                        status: e.target.value,
                                    })
                                }
                                value={feedbackData?.status}
                                w={"135px"}
                            >
                                {Object.entries(statusDict).map(([key, value]) => (
                                    <option key={key} value={key}>
                                        {value}
                                    </option>
                                ))}
                            </Select>
                        </Flex>

                    </Box>
                }
                placeholder={
                    <div
                        style={{
                            position: "absolute",
                            left: "76px",
                            top: "40px",
                            userSelect: "none",
                            pointerEvents: "none",
                            color: "gray",
                        }}
                    >
                        {"Would you like to say something?"}
                    </div >
                }
                ErrorBoundary={LexicalErrorBoundary}
            />
            <ClearEditorPlugin />
        </LexicalComposer >
    )
}

// bg={colorMode === "light" ? "gray.100" : "gray.700"}
