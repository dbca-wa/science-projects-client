import {
  IBranch,
  IBusinessArea,
  IProjectData,
  IUserData,
  IUserMe,
} from "@/types";
import { Avatar, Box, Flex, Text, useColorMode } from "@chakra-ui/react";
import { useState } from "react";
import { TreeViewPlugin } from "@/lib/plugins/TreeViewPlugin";

// Lexical
import { $generateHtmlFromNodes } from "@lexical/html";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";

// Lexical Plugins
import { ClearEditorPlugin } from "@lexical/react/LexicalClearEditorPlugin";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";

import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import "../../../styles/texteditor.css";

import useDistilledHtml from "@/lib/hooks/helper/useDistilledHtml";
import { ListItemNode, ListNode } from "@lexical/list";
import { PostCommentButton } from "../Buttons/PostCommentButton";
import { CustomPastePlugin } from "../Plugins/CustomPastePlugin";
import MentionsPlugin, { MentionNode } from "../Plugins/MentionsPlugin";

interface Props {
  baseAPI: string;
  userData: IUserMe;
  documentId: number;
  documentKind: string;
  refetchDocumentComments: () => void;
  businessAreas: IBusinessArea[];
  branches: IBranch[];
  project?: IProjectData; // Add project info prop
}

export const CommentRichTextEditor = ({
  baseAPI,
  userData,
  documentId,
  documentKind,
  refetchDocumentComments,
  businessAreas,
  branches,
  project, // Add project to destructured props
}: Props) => {
  const { colorMode } = useColorMode();
  const [comment, setComment] = useState("");

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

  // Catch errors that occur during Lexical updates
  const onError = (error: Error) => {
    console.log(error);
  };
  const theme = generateTheme(colorMode);

  const distilled = useDistilledHtml(comment);

  // IMPORTANT: Add MentionNode to both config objects
  const lightInitialConfig = {
    namespace: "Comments",
    editable: true,
    theme: generateTheme("light"),
    onError,
    nodes: [ListNode, ListItemNode, MentionNode],
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
              <MentionsPlugin projectPk={project?.pk} />

              <OnChangePlugin
                onChange={(editorState, editor) => {
                  editorState.read(() => {
                    const newHtml = $generateHtmlFromNodes(editor, null);
                    setComment(newHtml);
                  });
                }}
              />
              <RichTextPlugin
                contentEditable={
                  <Box zIndex={2}>
                    <UserContainer
                      userData={userData as IUserData}
                      baseAPI={baseAPI}
                      businessAreas={businessAreas}
                      branches={branches}
                    />
                    <ContentEditable
                      style={{
                        width: "100%",
                        height: "auto",
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
                        documentKind={documentKind}
                        userData={userData}
                        project={project} // Pass project to the PostCommentButton
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
              {/* <TreeViewPlugin /> */}
            </LexicalComposer>
          </Box>
        </Box>
      </Flex>
    </Box>
  );
};

interface UserContainerProps {
  userData: IUserData;
  baseAPI: string;
  image?: string;
  businessAreas?: IBusinessArea[];
  branches?: IBranch[];
}

const UserContainer = ({ userData, baseAPI }: UserContainerProps) => {
  const [editor] = useLexicalComposerContext();
  const { colorMode } = useColorMode();

  return (
    <Box
      pl={3}
      pt={2}
      onClick={() => {
        // If the editor is not focused, focus it.
        editor.focus();
      }}
    >
      <Flex flexDir="row" sx={{ alignSelf: "flex-start" }} mt={2}>
        {userData?.image ? (
          <Avatar
            size={"md"}
            src={
              userData?.image?.file?.startsWith("http")
                ? userData?.image?.file
                : `${baseAPI}${userData?.image?.file}`
            }
            name={`${userData?.first_name} ${userData?.last_name}`}
            mr={2}
            userSelect={"none"}
            style={{ pointerEvents: "none" }}
            draggable={false}
          />
        ) : (
          <Avatar
            size={"md"}
            src={""}
            name={`${userData?.first_name} ${userData?.last_name}`}
            mr={2}
            userSelect={"none"}
            style={{ pointerEvents: "none" }}
            draggable={false}
          />
        )}

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
            >
              {`${userData?.first_name} ${userData?.last_name}`}
            </Text>
          </Box>
        </Flex>
      </Flex>
    </Box>
  );
};
