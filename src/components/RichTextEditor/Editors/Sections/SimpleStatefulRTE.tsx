import { Box, Text } from "@chakra-ui/react";
import { ClearEditorPlugin } from "@lexical/react/LexicalClearEditorPlugin";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { NodeEventPlugin } from "@lexical/react/LexicalNodeEventPlugin";
import { OptionsBar } from "../../OptionsBar/OptionsBar";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { ListItemNode, ListNode } from "@lexical/list";
import { HeadingNode } from "@lexical/rich-text";
import { $getRoot, $getSelection, ParagraphNode } from "lexical";
import { PrepopulateHTMLPlugin } from "../../Plugins/PrepopulateHTMLPlugin";
import { RevisedSimpleRichTextToolbar } from "../../Toolbar/RevisedSimpleRichTextToolbar";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import LexicalErrorBoundary from "@lexical/react/LexicalErrorBoundary";
import { TreeViewPlugin } from "../../../../lib/plugins/TreeViewPlugin";
import { useEffect, useState } from "react";
import { DataDisplayPlugin } from "../../Plugins/DataDisplayPlugin";
import { $generateNodesFromDOM, $generateHtmlFromNodes } from "@lexical/html";
import { EditorSubsections, EditorType } from "../../../../types";
import { PrepopulateCommentDisplayPlugin } from "./../../Plugins/PrepopulateCommentDisplayPlugin";

interface Props {
  allowInsertButton?: boolean;
  placeholderText?: string;
  showToolbar: boolean;
  setValueAsPlainText: boolean;
  value: string;
  setValueFunction: React.Dispatch<React.SetStateAction<string>>;
  initialConfig: any;
  editorRef: any;
}

export const SimpleStatefulRTE = ({
  allowInsertButton,
  placeholderText,
  initialConfig,
  editorRef,
  showToolbar,
  setValueAsPlainText,
  value,
  setValueFunction,
}: Props) => {
  return (
    <>
      <LexicalComposer initialConfig={initialConfig}>
        {/* Plugins*/}
        <HistoryPlugin />
        <ListPlugin />
        <OnChangePlugin
          onChange={(editorState, editor) => {
            editorState.read(() => {
              const root = $getRoot();
              //   setEditorText(root.__cachedText);
              const newHtml = $generateHtmlFromNodes(editor, null);
              if (setValueAsPlainText === true) {
                const parserA = new DOMParser();
                const docA = parserA.parseFromString(newHtml, "text/html");
                const contentA = docA.body.textContent;
                // console.log(contentA);
                setValueFunction(contentA);
              } else {
                setValueFunction(newHtml);
              }
            });
          }}
        />
        <PrepopulateCommentDisplayPlugin data={value} />

        {/* Text Area */}
        <RichTextPlugin
          contentEditable={
            <Box zIndex={2}>
              {/* Toolbar */}

              {showToolbar ? (
                <RevisedSimpleRichTextToolbar
                  allowInserts={allowInsertButton}
                />
              ) : null}

              <ContentEditable
                style={{
                  minHeight: "50px",
                  width: "100%",
                  height: "auto",
                  padding: "32px",
                  paddingTop: showToolbar ? "20px" : "23px",
                  paddingBottom: "20px",
                  borderRadius: "0 0 25px 25px",
                  outline: "none",
                  zIndex: 2,
                }}
              />
            </Box>
          }
          placeholder={
            <div
              style={{
                position: "absolute",
                left: "32px",
                top: showToolbar ? "64px" : "22px",
                userSelect: "none",
                pointerEvents: "none",
              }}
            >
              {placeholderText ? placeholderText : "Enter some text..."}
            </div>
          }
          ErrorBoundary={LexicalErrorBoundary}
        />

        <ClearEditorPlugin />
        {/* <DataDisplayPlugin setDisplayData={setDisplayData} /> */}
      </LexicalComposer>
    </>
  );
};
