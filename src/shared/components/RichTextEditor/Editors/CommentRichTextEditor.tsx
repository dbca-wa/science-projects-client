import type {
  IBranch,
  IBusinessArea,
  IProjectData,
  IUserData,
  IUserMe,
} from "@/shared/types";
import { Avatar } from "@/shared/components/ui/avatar";
import { useColorMode } from "@/shared/utils/theme.utils";
import { useState } from "react";
import { cn } from "@/shared/utils";
// import { TreeViewPlugin } from "@/shared/lib/plugins/TreeViewPlugin";

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
import "@/styles/texteditor.css";

import useDistilledHtml from "@/shared/hooks/useDistilledHtml";
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

  const generateTheme = (colorMode: "light" | "dark") => {
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
    <div>
      <div className="flex">
        <div className="pb-2 w-full z-[2]">
          <div
            className={cn(
              "relative w-full rounded-b-[20px] rounded-t-[20px] z-[2]",
              "shadow-[rgba(100,100,111,0.1)_0px_7px_29px_0px]",
              colorMode === "light" ? "bg-white/60" : "bg-black/50"
            )}
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
              <MentionsPlugin projectPk={project?.pk ?? 0} />

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
                  <div className="z-[2]">
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
                    <div className="absolute right-5 bottom-4">
                      <PostCommentButton
                        refetchComments={refetchDocumentComments}
                        distilled={distilled}
                        comment={comment}
                        documentId={documentId}
                        documentKind={documentKind}
                        userData={userData}
                        project={project} // Pass project to the PostCommentButton
                      />
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
                    {"Say something..."}
                  </div>
                }
                ErrorBoundary={LexicalErrorBoundary}
              />
              <ClearEditorPlugin />
              {/* <TreeViewPlugin /> */}
            </LexicalComposer>
          </div>
        </div>
      </div>
    </div>
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
    <div
      className="pl-3 pt-2"
      onClick={() => {
        // If the editor is not focused, focus it.
        editor.focus();
      }}
    >
      <div className="flex flex-row self-start mt-2">
        {userData?.image ? (
          <Avatar
            className="mr-2 select-none pointer-events-none"
            src={
              userData?.image?.file?.startsWith("http")
                ? userData?.image?.file
                : `${baseAPI}${userData?.image?.file}`
            }
            name={`${userData?.first_name} ${userData?.last_name}`}
            draggable={false}
          />
        ) : (
          <Avatar
            className="mr-2 select-none pointer-events-none"
            src={""}
            name={`${userData?.first_name} ${userData?.last_name}`}
            draggable={false}
          />
        )}

        <div className="flex pl-1 pr-0 w-full h-full justify-between pr-10">
          <div className="select-none">
            <p
              className={cn(
                "font-bold pl-1 mt-0",
                colorMode === "light" ? "text-black/70" : "text-white/80"
              )}
            >
              {`${userData?.first_name} ${userData?.last_name}`}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
