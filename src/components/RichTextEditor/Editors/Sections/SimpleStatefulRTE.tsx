import { Box } from "@chakra-ui/react";
import { ClearEditorPlugin } from "@lexical/react/LexicalClearEditorPlugin";
import {
  InitialConfigType,
  LexicalComposer,
} from "@lexical/react/LexicalComposer";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
// import { $getRoot } from "lexical";
import { RevisedSimpleRichTextToolbar } from "../../Toolbar/RevisedSimpleRichTextToolbar";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import LexicalErrorBoundary from "@lexical/react/LexicalErrorBoundary";
import { $generateHtmlFromNodes } from "@lexical/html";
import { PrepopulateCommentDisplayPlugin } from "./../../Plugins/PrepopulateCommentDisplayPlugin";
import { CustomFocusPlugin } from "../../Plugins/CustomFocusPlugin";

interface Props {
  allowInsertButton?: boolean;
  placeholderText?: string;
  showToolbar: boolean;
  setValueAsPlainText: boolean;
  value: string;
  setValueFunction: React.Dispatch<React.SetStateAction<string>>;
  initialConfig: InitialConfigType;
  shouldFocus?: boolean;
  // editorRef: any;
}

export const SimpleStatefulRTE = ({
  allowInsertButton,
  placeholderText,
  initialConfig,
  // editorRef,
  showToolbar,
  setValueAsPlainText,
  value,
  setValueFunction,
  shouldFocus,
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
              // const root = $getRoot();
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

        {value && value !== "" && (
          <PrepopulateCommentDisplayPlugin data={value} />

        )}

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
        {shouldFocus && (<CustomFocusPlugin shouldFocus={shouldFocus} />
        )}
      </LexicalComposer>
    </>
  );
};
