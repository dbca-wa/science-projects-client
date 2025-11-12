import { Box } from "@chakra-ui/react";
import { $generateHtmlFromNodes } from "@lexical/html";
import { ClearEditorPlugin } from "@lexical/react/LexicalClearEditorPlugin";
import {
  InitialConfigType,
  LexicalComposer,
} from "@lexical/react/LexicalComposer";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { $getRoot } from "lexical";
import { EditorSubsections, EditorType } from "@/types";
import { PrepopulateHTMLPlugin } from "../../Plugins/PrepopulateHTMLPlugin";
import { RevisedSimpleRichTextToolbar } from "../../Toolbar/RevisedSimpleRichTextToolbar";

interface Props {
  initialConfig: InitialConfigType;
  // editorRef: any;
  data: string;
  section: EditorSubsections;
  editorType: EditorType;
  isUpdate: boolean;

  editorText: string;
  setEditorText: React.Dispatch<React.SetStateAction<string>>;
  shouldShowTree: boolean;
  setShouldShowTree: React.Dispatch<React.SetStateAction<boolean>>;
  displayData: string;

  setDisplayData: React.Dispatch<React.SetStateAction<string>>;
  textEditorName?: string;
}

export const SimpleEditableRTE = ({
  initialConfig,
  data,
  setEditorText,
  displayData,
  setDisplayData,
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
              setEditorText(root.__cachedText);
              const newHtml = $generateHtmlFromNodes(editor, null);
              // console.log(newHtml)
              // console.log("DATA DISPLAY PLUGIN:", newHtml);
              setDisplayData(newHtml);
            });
          }}
        />
        {data !== undefined && data !== null && (
          <PrepopulateHTMLPlugin data={displayData} />
        )}

        {/* Text Area */}
        <RichTextPlugin
          contentEditable={
            <Box zIndex={2}>
              {/* Toolbar */}

              <RevisedSimpleRichTextToolbar allowInserts={false} />

              <ContentEditable
                style={{
                  minHeight: "50px",
                  width: "100%",
                  height: "auto",
                  padding: "32px",
                  paddingBottom: "16px",
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
                top: "89px",
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
      </LexicalComposer>
    </>
  );
};
