// Has mention and hashtag functionality

import { ChatUser } from "@/components/Pages/Chat/ChatUser";
import { IBranch, IBusinessArea, IUserData, IUserMe } from "@/types";
import {
  Box,
  Button,
  Flex,
  Input,
  Text,
  Textarea,
  useColorMode,
  Grid,
  useToast,
  ToastId,
  Avatar,
} from "@chakra-ui/react";
import { useState, useEffect, useRef } from "react";

// Lexical
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import LexicalErrorBoundary from "@lexical/react/LexicalErrorBoundary";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { $generateNodesFromDOM, $generateHtmlFromNodes } from "@lexical/html";

// Lexical Plugins
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { NodeEventPlugin } from "@lexical/react/LexicalNodeEventPlugin";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ClearEditorPlugin } from "@lexical/react/LexicalClearEditorPlugin";

// Custom Components
import { OptionsBar } from "../OptionsBar/OptionsBar";
// import { AutoFocusPlugin } from "../../../../lib/plugins/AutoFocusPlugin";

import "../../../styles/texteditor.css";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
  $getRoot,
  $getSelection,
  CLEAR_EDITOR_COMMAND,
  ParagraphNode,
} from "lexical";

import { ListItemNode, ListNode } from "@lexical/list";
import { HeadingNode } from "@lexical/rich-text";

import { EditableSRTE } from "./Sections/EditableSRTE";
import { DisplaySRTE } from "./Sections/DisplaySRTE";
import { EditorSubsections, EditorType } from "../../../types";
import { HideEditorButton } from "../Buttons/HideEditorButton";
import { SimpleEditableRTE } from "./Sections/SimpleEditableRTE";
import { SimpleRichTextToolbar } from "../Toolbar/SimpleRichTextToolbar";
import { CustomPastePlugin } from "../Plugins/CustomPastePlugin";
import { BsFillSendFill } from "react-icons/bs";
import useDistilledHtml from "@/lib/hooks/useDistilledHtml";
import { createDocumentComment } from "@/lib/api";
import MentionsPlugin, { MentionNode } from "../Plugins/MentionsPlugin";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { PostCommentButton } from "../Buttons/PostCommentButton";
import useServerImageUrl from "@/lib/hooks/useServerImageUrl";
import useApiEndpoint from "@/lib/hooks/useApiEndpoint";

interface Props {
  userData: IUserMe;
  documentId: number;
  refetchDocumentComments: () => void;
  businessAreas: IBusinessArea[];
  branches: IBranch[];
}

export const CommentRichTextEditor = ({
  userData,
  documentId,
  refetchDocumentComments,
  businessAreas,
  branches,
}: Props) => {
  useEffect(() => {
    console.log("USER", userData);
  }, []);
  const { colorMode } = useColorMode();
  const editorRef = useRef(null);
  const [comment, setComment] = useState("");

  const usersImage = useServerImageUrl(userData?.image?.file);

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
  const [theme, setTheme] = useState(generateTheme(colorMode));

  const [lastSelectedNode, setLastSelectedNode] = useState();
  const [shouldShowTree, setShouldShowTree] = useState(false);

  const [editorText, setEditorText] = useState<string | null>("");
  const [selectedNodeType, setSelectedNodeType] = useState<string>();

  const distilled = useDistilledHtml(comment);

  const lightInitialConfig = {
    namespace: "Comments",
    editable: true,
    theme: generateTheme("light"),
    onError,
    nodes: [ListNode, ListItemNode],
  };

  const darkInitialConfig = {
    namespace: "Comments",
    editable: true,
    theme: generateTheme("dark"),
    onError,
    nodes: [ListNode, ListItemNode, MentionNode],
  };

  return (
    <Box>
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
          >
            <LexicalComposer
              key={`${colorMode}-${theme}`} // Add a key with the theme for re-rendering
              initialConfig={
                colorMode === "light" ? lightInitialConfig : darkInitialConfig
              }
            >
              <HistoryPlugin />
              <ListPlugin />
              <CustomPastePlugin />
              <MentionsPlugin />

              <OnChangePlugin
                onChange={(editorState, editor) => {
                  editorState.read(() => {
                    const root = $getRoot();
                    setEditorText(root.__cachedText);
                    const newHtml = $generateHtmlFromNodes(editor, null);
                    // console.log(newHtml)
                    // console.log("DATA DISPLAY PLUGIN:", newHtml);
                    setComment(newHtml);
                  });
                }}
              />
              <RichTextPlugin
                contentEditable={
                  <Box zIndex={2}>
                    {/* Toolbar */}

                    {/* <SimpleRichTextToolbar
                        editorRef={editorRef}
                        selectedNodeType={selectedNodeType}
                        setSelectedNodeType={setSelectedNodeType}
                      /> */}
                    <UserContainer
                      userData={userData as IUserData}
                      image={usersImage}
                      businessAreas={businessAreas}
                      branches={branches}
                    />
                    <ContentEditable
                      style={{
                        // minHeight: "50px",
                        width: "100%",
                        height: "auto",
                        // padding: "32px",
                        paddingLeft: "76px",
                        paddingRight: "90px",
                        marginTop: -24,
                        top: "40px",
                        paddingBottom: "16px",
                        borderRadius: "0 0 25px 25px",
                        outline: "none",
                        zIndex: 2,
                      }}
                    />
                    <Box pos={"absolute"} right={5} bottom={4}>
                      <PostCommentButton
                        refetchComments={refetchDocumentComments}
                        distilled={distilled}
                        comment={comment}
                        documentId={documentId}
                        userData={userData}
                      />
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
                    {"Say something..."}
                  </div>
                }
                ErrorBoundary={LexicalErrorBoundary}
              />
              <ClearEditorPlugin />
              <NodeEventPlugin
                nodeType={ParagraphNode}
                eventType={"click"}
                eventListener={(e: Event) => {
                  console.log(e);
                  console.log("paragaph node clicked");
                  setSelectedNodeType("paragraph");
                }}
              />
              <NodeEventPlugin
                nodeType={ListItemNode}
                eventType={"click"}
                eventListener={(e: Event) => {
                  console.log(e);
                  console.log("li node clicked");
                  setSelectedNodeType("li");
                }}
              />
            </LexicalComposer>
          </Box>
        </Box>
      </Flex>
    </Box>
  );
};

interface UserContainerProps {
  userData: IUserData;
  image: string;
  businessAreas: IBusinessArea[];
  branches: IBranch[];
}

const UserContainer = ({
  userData,
  businessAreas,
  branches,
}: UserContainerProps) => {
  const [editor] = useLexicalComposerContext();

  const { colorMode } = useColorMode();
  const baseUrl = useApiEndpoint();
  const imageUrl = useServerImageUrl(userData?.image?.file);

  return userData?.image?.file ? (
    <Box
      pl={3}
      pt={2}
      onClick={() => {
        console.log("hi", userData?.image?.file);
        // If the editor is not focused, focus it.
        editor.focus();
      }}
    >
      <Flex
        flexDir="row"
        // color="gray.500"
        sx={{ alignSelf: "flex-start" }}
        mt={2}
      >
        <Avatar
          size={"md"}
          src={imageUrl}
          name={`${userData?.first_name} ${userData?.last_name}`}
          mr={2}
          userSelect={"none"}
          style={{ pointerEvents: "none" }}
          draggable={false}
        />
        <Flex
          pl={1}
          pr={0}
          w={"100%"}
          h={"100%"}
          justifyContent={"space-between"}
          paddingRight={"40px"}
        >
          <Box userSelect={"none"}>
            <Text
              fontWeight="bold"
              pl={1}
              mt={0}
              color={
                colorMode === "light" ? "blackAlpha.700" : "whiteAlpha.800"
              }
              // w={"100%"}
            >
              {`${userData?.first_name} ${userData?.last_name}`}
            </Text>
          </Box>
        </Flex>
      </Flex>
    </Box>
  ) : null;
};
