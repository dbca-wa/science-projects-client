// An RTE SOLELY FOR displaying HTML RT Data - Guide and BA
// No modals, no functions
import { useColorMode } from "@/shared/utils/theme.utils";
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
import { PrepopulateDisplayPlugin } from "../Plugins/PrepopulateDisplayPlugin";

interface Props {
  payload: string;
}

export const DisplayRTE = ({ payload }: Props) => {
  const { colorMode } = useColorMode();

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

  const lightInitialConfig = {
    namespace: "Comments",
    editable: false,
    theme: generateTheme("light"),
    onError,
    nodes: [ListNode, ListItemNode],
  };

  const darkInitialConfig = {
    namespace: "Comments",
    editable: false,
    theme: generateTheme("dark"),
    onError,
    nodes: [ListNode, ListItemNode],
  };

  return (
    <LexicalComposer
      key={`${colorMode}-${theme}`} // Add a key with the theme for re-rendering
      initialConfig={
        colorMode === "light" ? lightInitialConfig : darkInitialConfig
      }
    >
      <HistoryPlugin />
      <ListPlugin />
      {/* <CustomPastePlugin /> */}
      <PrepopulateDisplayPlugin displayData={payload} />
      {/* <PrepopulateHTMLPlugin data={payload} /> */}
      <RichTextPlugin
        contentEditable={
          <ContentEditable
            style={{
              width: "100%",
              height: "auto",
              marginTop: -38,
              textAlign: "justify",
              top: "40px",
              paddingBottom: "16px",
              borderRadius: "0 0 25px 25px",
              outline: "none",
              zIndex: 2,
            }}
          />
        }
        placeholder={<p></p>}
        ErrorBoundary={LexicalErrorBoundary}
      />
      <ClearEditorPlugin />
    </LexicalComposer>
  );
};
