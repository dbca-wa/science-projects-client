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
import { SimpleRichTextToolbar } from "../../Toolbar/SimpleRichTextToolbar";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import LexicalErrorBoundary from "@lexical/react/LexicalErrorBoundary";
import { TreeViewPlugin } from "../../../../lib/plugins/TreeViewPlugin";
import { useEffect, useState } from "react";
import { DataDisplayPlugin } from "../../Plugins/DataDisplayPlugin";
import { $generateNodesFromDOM, $generateHtmlFromNodes } from "@lexical/html";
import { EditorSubsections, EditorType } from "../../../../types";
import { PrepopulateCommentDisplayPlugin } from "./../../Plugins/PrepopulateCommentDisplayPlugin";

interface Props {
  showToolbar: boolean;
  value: string;
  setValueFunction: React.Dispatch<React.SetStateAction<string>>;
  initialConfig: any;
  editorRef: any;
}

export const SimpleStatefulRTE = ({
  initialConfig,
  editorRef,
  showToolbar,
  value,
  setValueFunction,
}: Props) => {
  const [selectedNodeType, setSelectedNodeType] = useState<string>();

  // useEffect(() => console.log(displayData), [displayData])

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
              setValueFunction(newHtml);
              // console.log(newHtml)
              // console.log("DATA DISPLAY PLUGIN:", newHtml);
              //   setDisplayData(newHtml);
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
                <SimpleRichTextToolbar
                  editorRef={editorRef}
                  selectedNodeType={selectedNodeType}
                  setSelectedNodeType={setSelectedNodeType}
                />
              ) : null}

              <ContentEditable
                style={{
                  minHeight: "50px",
                  width: "100%",
                  height: "auto",
                  padding: "32px",
                  paddingTop: "23px",
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
                top: "80px",
                userSelect: "none",
                pointerEvents: "none",
              }}
            >
              {"Enter some text..."}
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

        {/* <DataDisplayPlugin setDisplayData={setDisplayData} /> */}
      </LexicalComposer>
    </>
  );
};
