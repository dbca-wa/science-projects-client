// Lexical =================================================================================

import { PrepopulateHTMLPlugin } from "@/components/RichTextEditor/Plugins/PrepopulateHTMLPlugin";
import { $generateHtmlFromNodes } from "@lexical/html";
import { ListItemNode, ListNode } from "@lexical/list";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import LexicalErrorBoundary from "@lexical/react/LexicalErrorBoundary";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { HeadingNode } from "@lexical/rich-text";

// Design, React & Other ====================================================================

import { Label } from "@/components/ui/label";
import { TextareaProps } from "@/components/ui/textarea";
import { Box } from "@chakra-ui/react";
import { ControllerRenderProps, Path, UseFormRegister } from "react-hook-form";
import { DatabaseRichTextToolbar } from "./DatabaseRichTextToolbar";

// CSS ======================================================================================

import { TabIndentationPlugin } from "@lexical/react/LexicalTabIndentationPlugin";
import { useRef, useState } from "react";
import RTEDragPlugin from "./RTEDragPlugin";
import "./staffprofileeditor.css";
import SaveOnCtrlSPlugin from "./SaveOnCtrlSPlugin";

// Types ====================================================================================

interface DatabaseRichTextEditorProps<T> extends TextareaProps {
  populationData: string; // the data to populate the RTE (from DB)
  label: string;
  htmlFor: keyof T;
  hideLabel?: boolean;
  isEdit?: boolean; // whether or not this is for editing or just displaying data
  field?: ControllerRenderProps<T, Path<T>>;
  registerFn?: UseFormRegister<T>; // Function for validating / updating when editing
  //
  allowTable?: boolean;
  isMobile?: boolean;
}

// Functions ================================================================================

const generateTheme = () => {
  return {
    quote: "editor-quote",
    ltr: "ltr",
    rtl: "rtl",
    paragraph: "editor-p-light",
    span: "editor-p-light",
    heading: {
      h1: "editor-h1-light",
      h2: "editor-h2-light",
      h3: "editor-h3-light",
    },
    list: {
      ul: "editor-ul-light",
      ol: "editor-ol-light",
      listitem: "editor-li-light",
      listitemChecked: "editor-list-item-checked",
      listitemUnchecked: "editor-list-item-unchecked",
      nested: {
        listitem: "editor-nested-list-item",
      },
      // Handling styling for each level of list nesting (1st is default styling)
      ulDepth: ["editor-ul1", "editor-ul2", "editor-ul3"],
      olDepth: ["editor-ol1", "editor-ol2", "editor-ol3"],
    },
    text: {
      bold: "editor-bold-light",
      italic: "editor-italics-light",
      underline: "editor-underline-light",
      strikethrough: "editor-strikethrough-light",
      subscript: "editor-textSubscript-light",
      underlineStrikethrough: "editor-underline-strikethrough-light",
      // boldItalics: "editor-bold-light editor-italics-light",
    },
  };
};

// Catch errors that occur during Lexical updates
const onError = (error: Error) => {
  console.log(error);
};

// Component ================================================================================

const DatabaseRichTextEditor = <T,>({
  label,
  hideLabel,
  htmlFor,
  populationData,
  field,
  isEdit,
  registerFn: register,
  allowTable,
  isMobile,
}: DatabaseRichTextEditorProps<T>) => {
  const theme = generateTheme();
  const initialConfig = {
    namespace: "Staff Profile Section Editor",
    editable: isEdit ?? false,
    theme,
    onError,
    nodes: [ListNode, ListItemNode, HeadingNode],
  };
  const componentRef = useRef<HTMLDivElement | null>(null);

  const dragBtnMargin = 1;
  const toolBarHeight = isEdit ? (isMobile ? 39 * 2 + 2 : 41) : -1;
  const [floatingAnchorElem, setFloatingAnchorElem] =
    useState<HTMLDivElement | null>(null);
  const onRef = (_floatingAnchorElem: HTMLDivElement) => {
    if (_floatingAnchorElem !== null) {
      setFloatingAnchorElem(_floatingAnchorElem);
    }
  };

  return (
    <>
      {isEdit && !hideLabel && (
        <Label htmlFor={htmlFor as string} className="">
          {label}
        </Label>
      )}

      <LexicalComposer initialConfig={initialConfig} key={populationData}>
        {/* Plugins*/}
        <HistoryPlugin />
        <ListPlugin />
        <OnChangePlugin
          onChange={(editorState, editor) => {
            editorState.read(() => {
              const htmlContent = $generateHtmlFromNodes(editor, null);
              field?.onChange(htmlContent);
            });
          }}
        />
        {populationData !== undefined && populationData !== null && (
          <PrepopulateHTMLPlugin data={populationData} />
        )}

        {/* Text Area */}
        <div className="relative w-full">
          <RichTextPlugin
            {...(isEdit
              ? register(htmlFor as unknown as Path<T>, { required: true })
              : {})} // Conditionally apply register
            contentEditable={
              <Box zIndex={2}>
                {/* Toolbar */}
                {isEdit && (
                  <DatabaseRichTextToolbar
                    allowInserts={true}
                    allowTable={allowTable}
                    referenceFlex={componentRef}
                  />
                )}
                <Box className="editor-scroller">
                  <Box
                    className="editor"
                    ref={onRef}
                    style={{
                      // background: "red",
                      marginLeft: `${dragBtnMargin}px`,
                    }}
                  >
                    <ContentEditable
                      style={{
                        minHeight: "50px",
                        width: "100%",
                        height: "auto",
                        padding: isEdit ? "10px" : 0,
                        paddingLeft: isEdit
                          ? `${10 + dragBtnMargin + 15}px`
                          : 0,
                        paddingRight: isEdit
                          ? `${10 + dragBtnMargin + 15}px`
                          : 0,
                        border: isEdit ? "0px gray solid" : undefined,
                        borderRadius: "0 0 8px 8px",
                        outline: "none",
                        zIndex: 2,
                        boxShadow: isEdit
                          ? "0px 4px 8px rgba(0, 0, 0, 0.2)"
                          : undefined,
                      }}
                    />
                  </Box>
                </Box>
              </Box>
            }
            placeholder={
              <div
                style={{
                  position: "absolute",
                  // left: "34px",
                  // top: "145px",
                  // position: "sticky",
                  left: "27px",
                  top: `${toolBarHeight + 10}px`,
                  userSelect: "none",
                  pointerEvents: "none",
                }}
              >
                {isEdit ? <p className="text-sm">Enter some text...</p> : ""}
              </div>
            }
            ErrorBoundary={LexicalErrorBoundary}
          />
        </div>
        <TabIndentationPlugin />
        {isEdit && floatingAnchorElem !== null && (
          <RTEDragPlugin
            anchorElem={floatingAnchorElem}
            toolbarHeight={toolBarHeight}
          />
        )}
        <SaveOnCtrlSPlugin />
      </LexicalComposer>
    </>
  );
};
export default DatabaseRichTextEditor;
