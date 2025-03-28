// Has mention and hashtag functionality

import { ChatUser } from "@/components/Pages/Chat/ChatUser";
import { IBranch, IBusinessArea, ICommentReaction, IUserData } from "@/types";
import {
  Box,
  Center,
  Flex,
  ToastId,
  useColorMode,
  useDisclosure,
  useToast,
  UseToastOptions,
} from "@chakra-ui/react";
import { useEffect, useRef, useState } from "react";
import { BiSolidLike } from "react-icons/bi";

// Lexical
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";

// Lexical Plugins
import { ClearEditorPlugin } from "@lexical/react/LexicalClearEditorPlugin";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";

import "../../../../styles/texteditor.css";

import { ListItemNode, ListNode } from "@lexical/list";

import { DeleteCommentModal } from "@/components/Modals/DeleteCommentModal";
import { createCommentReaction } from "@/lib/api";
import { useFormattedDate } from "@/lib/hooks/helper/useFormattedDate";
import { useUser } from "@/lib/hooks/tanstack/useUser";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, useAnimation } from "framer-motion";
import { useForm } from "react-hook-form";
import { ImCross } from "react-icons/im";
import { CustomPastePlugin } from "../../Plugins/CustomPastePlugin";
import { MentionNode } from "../../Plugins/MentionsPlugin";
import { PrepopulateCommentDisplayPlugin } from "../../Plugins/PrepopulateCommentDisplayPlugin";

interface Props {
  baseAPI: string;
  commentPk: string | number;
  documentPk: string | number;
  refetchComments: () => void;

  user: IUserData;
  created_at: string;
  updated_at: string;
  payload: string;
  reactions: ICommentReaction[];

  businessAreas: IBusinessArea[];
  branches: IBranch[];
}

export const CommentDisplayRTE = ({
  baseAPI,
  commentPk,
  documentPk,
  refetchComments,
  payload,
  user,
  created_at,
  updated_at,
  businessAreas,
  branches,
  reactions,
}: Props) => {
  const { colorMode } = useColorMode();
  const me = useUser();

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

  // Generate the theme based on the current colorMode
  //   const theme = generateTheme(colorMode);
  // Catch errors that occur during Lexical updates
  const onError = (error: Error) => {
    console.log(error);
  };
  const theme = generateTheme(colorMode);

  const displayDate = updated_at > created_at ? updated_at : created_at;

  const formattedDate = useFormattedDate(displayDate);

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

  const otherUser = me?.userData?.pk !== user?.pk;

  const [likeCount, setLikeCount] = useState<number>(0);

  useEffect(() => {
    // console.log(reactions);
    const likes = reactions?.map((r) => r.reaction === "thumbup");
    setLikeCount(likes?.length ? likes.length : 0);
  }, []);

  const [isHovered, setIsHovered] = useState(false);

  const authorControls = useAnimation();
  useEffect(() => {
    if (isHovered) {
      authorControls.start({
        opacity: 1,
        y: 0,
        x: 0,
        transition: { delay: 0.1, duration: 0.075 },
      });
    }
  }, [authorControls, isHovered]);
  const {
    isOpen: isDeleteCommentModalOpen,
    onOpen: onOpenDeleteCommentModal,
    onClose: onCloseDeleteCommentModal,
  } = useDisclosure();

  const queryClient = useQueryClient();
  const { reset } = useForm<ICommentReaction>();
  const toast = useToast();
  const toastIdRef = useRef<ToastId | undefined>(undefined);
  const addToast = (data: UseToastOptions) => {
    toastIdRef.current = toast(data);
  };
  const commentReactionMutation = useMutation({
    mutationFn: createCommentReaction,
    onMutate: () => {
      addToast({
        status: "loading",
        title: "Reacting...",
        position: "top-right",
      });
    },
    onSuccess: (response) => {
      if (toastIdRef.current) {
        toast.update(toastIdRef.current, {
          title: "Success",
          description: response.status === 204 ? `Reaction Removed` : `Reacted`,
          status: "success",
          position: "top-right",
          duration: 3000,
          isClosable: true,
        });
      }
      reset();

      setTimeout(() => {
        queryClient.invalidateQueries({
          queryKey: ["documentComments", documentPk],
        });
        if (response.status === 204) {
          setLikeCount((prev) => prev - 1);
        } else if (response.status === 201) {
          setLikeCount((prev) => prev + 1);
        }
      }, 350);
    },
    onError: (error) => {
      if (toastIdRef.current) {
        toast.update(toastIdRef.current, {
          title: "Could Not React",
          description: `${error}`,
          status: "error",
          position: "top-right",
          duration: 3000,
          isClosable: true,
        });
      }
    },
  });

  const onLike = (formData: ICommentReaction) => {
    commentReactionMutation.mutate(formData);
  };

  const [userHasLiked, setUserHasLiked] = useState(false);

  useEffect(() => {
    const userLiked = reactions.some(
      (r) =>
        Number(r.user) === Number(me?.userData?.pk) && r.reaction === "thumbup",
    );
    setUserHasLiked(userLiked);
  }, [reactions, me?.userData?.pk]);

  return (
    <Box>
      {(!otherUser || me?.userData?.is_superuser) && (
        <DeleteCommentModal
          commentPk={commentPk}
          documentPk={documentPk}
          refetchData={refetchComments}
          isOpen={isDeleteCommentModalOpen}
          onClose={onCloseDeleteCommentModal}
        />
      )}

      <Flex>
        <Box pb={2} w={"100%"} zIndex={2}>
          <Box
            pos={"relative"}
            w={"100%"}
            roundedBottom={20}
            boxShadow={"rgba(100, 100, 111, 0.1) 0px 7px 29px 0px"}
            bg={colorMode === "light" ? "whiteAlpha.600" : "blackAlpha.500"}
            roundedTop={20}
            zIndex={2}
            pb={3}
          >
            {/* {colorMode === "light" ? ( */}
            <LexicalComposer
              key={`${colorMode}-${theme}`} // Add a key with the theme for re-rendering
              initialConfig={
                colorMode === "light" ? lightInitialConfig : darkInitialConfig
              }
            >
              <HistoryPlugin />
              <ListPlugin />
              <CustomPastePlugin />
              <PrepopulateCommentDisplayPlugin data={payload} />
              <RichTextPlugin
                contentEditable={
                  <Box
                    zIndex={2}
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                  >
                    <Box pos={"absolute"} right={2.5} top={"15px"}>
                      {!otherUser ? (
                        isHovered ? (
                          <Center
                            as={motion.div}
                            initial={{ opacity: 0, x: 10 }}
                            animate={authorControls}
                            color={"red.500"}
                            _hover={{ color: "red.400", cursor: "pointer" }}
                            mr={3}
                            mt={2}
                            alignItems={"center"}
                            boxSize={"10px"}
                            borderRadius={"full"}
                            onClick={onOpenDeleteCommentModal}
                          >
                            <ImCross />
                          </Center>
                        ) : null
                      ) : null}
                    </Box>
                    <Box pl={3} pt={2} pr={3}>
                      <ChatUser
                        baseAPI={baseAPI}
                        otherUser={otherUser}
                        displayName={`${user?.first_name} ${user?.last_name}`}
                        avatarSrc={user?.image}
                        iconSize="lg"
                        user={user as IUserData}
                        displayDate={formattedDate}
                        branches={branches}
                        businessAreas={businessAreas}
                      />
                    </Box>
                    <ContentEditable
                      style={{
                        // minHeight: "50px",
                        width: "100%",
                        height: "auto",
                        // padding: "32px",
                        paddingLeft: "92px",
                        paddingRight: "40px",
                        marginTop: -38,
                        top: "40px",
                        paddingBottom: "16px",
                        borderRadius: "0 0 25px 25px",
                        outline: "none",
                        zIndex: 2,
                      }}
                    />
                    <Box
                      pos={"absolute"}
                      right={5}
                      bottom={4}
                      onClick={() => {
                        // console.log("liked");
                        onLike({
                          user: me?.userData?.pk,
                          reaction: "thumbup",
                          comment: Number(commentPk),
                        });
                      }}
                    >
                      {isHovered ? (
                        <Flex>
                          <Flex
                            alignItems={"center"}
                            // color={"blue.500"}
                            _hover={{
                              color: "blue.400",
                              cursor: "pointer",
                            }}
                          >
                            {likeCount !== 0 ? (
                              <Box mr={2}>{likeCount}</Box>
                            ) : null}

                            <Box>
                              <BiSolidLike />
                            </Box>
                          </Flex>
                        </Flex>
                      ) : (
                        <Flex>
                          <Flex
                            alignItems={"center"}
                            color={userHasLiked ? "blue.400" : "gray.500"}
                            _hover={{ color: "gray.400", cursor: "pointer" }}
                          >
                            {likeCount !== 0 ? (
                              <Box mr={2}>{likeCount}</Box>
                            ) : null}{" "}
                            <Box>
                              <BiSolidLike />
                            </Box>
                          </Flex>
                        </Flex>
                      )}
                    </Box>
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
                  </div>
                }
                ErrorBoundary={LexicalErrorBoundary}
              />
              <ClearEditorPlugin />
            </LexicalComposer>
          </Box>
        </Box>
      </Flex>
    </Box>
  );
};
