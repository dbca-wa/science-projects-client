// Has mention and hashtag functionality

import { ChatUser } from "@/shared/components/ChatUser";
import type { IBranch, IBusinessArea, ICommentReaction, IUserData } from "@/shared/types";
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

import "@/styles/texteditor.css";

import { ListItemNode, ListNode } from "@lexical/list";

import { DeleteCommentModal } from "@/features/documents/components/modals/DeleteCommentModal";
import { createCommentReaction } from "@/features/documents/services/documents.service";
import { useFormattedDate } from "@/shared/hooks/useFormattedDate";
import { useUser } from "@/features/users/hooks/useUser";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, useAnimation } from "framer-motion";
import { useForm } from "react-hook-form";
import { ImCross } from "react-icons/im";
import { CustomPastePlugin } from "../../Plugins/CustomPastePlugin";
import { MentionNode } from "../../Plugins/MentionsPlugin";
import { PrepopulateCommentDisplayPlugin } from "../../Plugins/PrepopulateCommentDisplayPlugin";
import { useColorMode } from "@/shared/utils/theme.utils";
import { toast } from "sonner";

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
  
  const [isDeleteCommentModalOpen, setIsDeleteCommentModalOpen] = useState(false);
  const onOpenDeleteCommentModal = () => setIsDeleteCommentModalOpen(true);
  const onCloseDeleteCommentModal = () => setIsDeleteCommentModalOpen(false);

  const queryClient = useQueryClient();
  const { reset } = useForm<ICommentReaction>();
  
  const commentReactionMutation = useMutation({
    mutationFn: createCommentReaction,
    onMutate: () => {
      toast.loading("Reacting...");
    },
    onSuccess: (response) => {
      toast.success(response.status === 204 ? "Reaction Removed" : "Reacted");
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
      toast.error(`Could Not React: ${error}`);
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
    <div>
      {(!otherUser || me?.userData?.is_superuser) && (
        <DeleteCommentModal
          commentPk={commentPk}
          documentPk={documentPk}
          refetchData={refetchComments}
          isOpen={isDeleteCommentModalOpen}
          onClose={onCloseDeleteCommentModal}
        />
      )}

      <div className="flex">
        <div className="pb-2 w-full z-[2]">
          <div
            className="relative w-full rounded-b-[20px] rounded-t-[20px] z-[2] pb-3 shadow-[rgba(100,100,111,0.1)_0px_7px_29px_0px]"
            style={{
              backgroundColor: colorMode === "light" ? "rgba(255, 255, 255, 0.6)" : "rgba(0, 0, 0, 0.5)"
            }}
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
                  <div
                    className="z-[2]"
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                  >
                    <div className="absolute right-2.5 top-[15px]">
                      {!otherUser ? (
                        isHovered ? (
                          <div
                            className="flex items-center justify-center mr-3 mt-2 w-[10px] h-[10px] rounded-full text-red-500 hover:text-red-400 cursor-pointer"
                            as={motion.div}
                            initial={{ opacity: 0, x: 10 }}
                            animate={authorControls}
                            onClick={onOpenDeleteCommentModal}
                          >
                            <ImCross />
                          </div>
                        ) : null
                      ) : null}
                    </div>
                    <div className="pl-3 pt-2 pr-3">
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
                    </div>
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
                    <div
                      className="absolute right-5 bottom-4 cursor-pointer"
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
                        <div className="flex">
                          <div
                            className="flex items-center hover:text-blue-400 cursor-pointer"
                          >
                            {likeCount !== 0 ? (
                              <div className="mr-2">{likeCount}</div>
                            ) : null}

                            <div>
                              <BiSolidLike />
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="flex">
                          <div
                            className={`flex items-center hover:text-gray-400 cursor-pointer ${
                              userHasLiked ? "text-blue-400" : "text-gray-500"
                            }`}
                          >
                            {likeCount !== 0 ? (
                              <div className="mr-2">{likeCount}</div>
                            ) : null}{" "}
                            <div>
                              <BiSolidLike />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
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
          </div>
        </div>
      </div>
    </div>
  );
};
