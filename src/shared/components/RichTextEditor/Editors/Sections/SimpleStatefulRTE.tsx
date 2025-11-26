import { Box } from "@chakra-ui/react";
import { ClearEditorPlugin } from "@lexical/react/LexicalClearEditorPlugin";
import {
  InitialConfigType,
  LexicalComposer,
} from "@lexical/react/LexicalComposer";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
// import { $getRoot } from "lexical";
import { $generateHtmlFromNodes } from "@lexical/html";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { useState } from "react";
import { CustomFocusPlugin } from "../../Plugins/CustomFocusPlugin";
import { RevisedSimpleRichTextToolbar } from "../../Toolbar/RevisedSimpleRichTextToolbar";
import { PrepopulateCommentDisplayPlugin } from "./../../Plugins/PrepopulateCommentDisplayPlugin";

interface Props {
  allowInsertButton?: boolean;
  placeholderText?: string;
  showToolbar: boolean;
  setValueAsPlainText: boolean;
  value: string;
  setValueFunction: React.Dispatch<React.SetStateAction<string>>;
  initialConfig: InitialConfigType;
  shouldFocus?: boolean;
  buttonSize?: "sm" | "md" | "lg";
  tabbable?: boolean;
  hideBold?: boolean;
  hideUnderline?: boolean;
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
  buttonSize,
  tabbable,
  hideBold,
  hideUnderline,
}: Props) => {
  const [firstRender, setFirstRender] = useState(true);

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

              if (setValueAsPlainText === true && value !== "") {
                if (firstRender === false) {
                  const text = $generateHtmlFromNodes(editor, null);
                  const parser = new DOMParser();
                  const doc = parser.parseFromString(text, "text/html");
                  setValueFunction(doc.body.innerText);
                }
              } else {
                const newHtml = $generateHtmlFromNodes(editor, null);
                setValueFunction(newHtml);
              }
            });
          }}
        />

        {value && value !== "" && (
          <PrepopulateCommentDisplayPlugin
            data={value}
            setPopulationInProgress={setFirstRender}
          />
        )}

        {/* Text Area */}
        <RichTextPlugin
          contentEditable={
            <Box zIndex={2}>
              {/* Toolbar */}

              {showToolbar ? (
                <RevisedSimpleRichTextToolbar
                  buttonSize={buttonSize}
                  allowInserts={allowInsertButton}
                  hideBold={hideBold}
                  hideUnderline={hideUnderline}
                />
              ) : null}

              <ContentEditable
                tabIndex={tabbable ? undefined : -1}
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
        {shouldFocus && <CustomFocusPlugin shouldFocus={shouldFocus} />}
      </LexicalComposer>
    </>
  );
};
