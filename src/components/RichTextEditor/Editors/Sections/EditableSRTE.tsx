import { Box } from "@chakra-ui/react";
import { ClearEditorPlugin } from "@lexical/react/LexicalClearEditorPlugin";
import {
  InitialConfigType,
  LexicalComposer,
} from "@lexical/react/LexicalComposer";
import { OptionsBar } from "../../OptionsBar/OptionsBar";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { $getRoot } from "lexical";
import { PrepopulateHTMLPlugin } from "../../Plugins/PrepopulateHTMLPlugin";
// import { RichTextToolbar } from "../../Toolbar/RichTextToolbar";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import LexicalErrorBoundary from "@lexical/react/LexicalErrorBoundary";
import { TreeViewPlugin } from "../../../../lib/plugins/TreeViewPlugin";
import { useEffect, useState } from "react";
import { $generateHtmlFromNodes } from "@lexical/html";
import {
  EditorSections,
  EditorSubsections,
  EditorType,
} from "../../../../types";
import { useGetRTESectionPlaceholder } from "@/lib/hooks/useGetRTESectionPlaceholder";
import { AutoFocusPlugin } from "@lexical/react/LexicalAutoFocusPlugin";
import { TablePlugin } from "@lexical/react/LexicalTablePlugin";
import DraggableBlockPlugin from "@/components/RichTextEditor/Plugins/DraggableBlockPlugin";
import { TabIndentationPlugin } from "@lexical/react/LexicalTabIndentationPlugin";
import ListMaxIndentLevelPlugin from "../../Plugins/ListMaxIndentLevelPlugin";
import { EditorTextInitialStatePlugin } from "../../Plugins/EditorTextInitialStatePlugin";
import { CustomPastePlugin } from "../../Plugins/CustomPastePlugin";
import React from "react";
import FloatingToolbarPlugin from "../../Plugins/FloatingToolbarPlugin";
import { RevisedRichTextToolbar } from "../../Toolbar/RevisedRichTextToolbar";
// import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
// import { SimpleRichTextToolbar } from "../../Toolbar/SimpleRichTextToolbar";
// import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";

interface Props {
  initialConfig: InitialConfigType;
  editorRef: React.MutableRefObject<any>;
  originalData?: string;
  data: string;
  section: EditorSubsections;
  project_pk: number;
  document_pk: number;
  editorType: EditorType;
  isUpdate: boolean;
  writeable_document_kind?: EditorSections | null;
  writeable_document_pk?: number | null;

  editorText: string;
  setEditorText: React.Dispatch<React.SetStateAction<string>>;
  shouldShowTree: boolean;
  setShouldShowTree: React.Dispatch<React.SetStateAction<boolean>>;
  isEditorOpen: boolean;
  setIsEditorOpen: React.Dispatch<React.SetStateAction<boolean>>;
  displayData: string;

  setDisplayData: React.Dispatch<React.SetStateAction<string>>;
  textEditorName?: string;
  wordLimit: number;
  limitCanBePassed: boolean;

  canSave: boolean;
  setCanSave: React.Dispatch<React.SetStateAction<boolean>>;
}

export const EditableSRTE = ({
  section,
  project_pk,
  document_pk,
  editorType,
  isUpdate,
  writeable_document_kind,
  writeable_document_pk,
  initialConfig,
  editorRef,
  data,
  editorText,
  setEditorText,
  isEditorOpen,
  setIsEditorOpen,
  displayData,
  setDisplayData,
  shouldShowTree,
  setShouldShowTree,
  wordLimit,
  limitCanBePassed,
  canSave,
  setCanSave,
}: Props) => {
  const dragBtnMargin = 10;
  const toolBarHeight = 45;
  const [floatingAnchorElem, setFloatingAnchorElem] =
    useState<HTMLDivElement | null>(null);
  const onRef = (_floatingAnchorElem: HTMLDivElement) => {
    if (_floatingAnchorElem !== null) {
      setFloatingAnchorElem(_floatingAnchorElem);
    }
  };

  useEffect(() => {
    const editorInstance = editorRef.current;

    if (editorInstance) {
      // Perform operations on the Lexical editor instance
      const root = editorInstance.$getRoot();
      setEditorText(root.__cachedText);
    }
  }, [editorRef, setEditorText]);

  // const blockTypeToBlockName = {
  //   bullet: "Bulleted List",
  //   check: "Check List",
  //   code: "Code Block",
  //   h1: "Heading 1",
  //   h2: "Heading 2",
  //   h3: "Heading 3",
  //   h4: "Heading 4",
  //   h5: "Heading 5",
  //   h6: "Heading 6",
  //   number: "Numbered List",
  //   paragraph: "Normal",
  //   quote: "Quote",
  // };

  // const [blockType, setBlockType] =
  //   useState<keyof typeof blockTypeToBlockName>("paragraph");

  return (
    <>
      <LexicalComposer initialConfig={initialConfig}>
        {/* Plugins*/}
        <TablePlugin hasCellMerge={true} hasCellBackgroundColor={false} />
        <HistoryPlugin />
        <ListPlugin />

        <OnChangePlugin
          onChange={(editorState, editor) => {
            editorState.read(() => {
              const root = $getRoot();

              setEditorText(root.__cachedText);
              const newHtml = $generateHtmlFromNodes(editor, null);
              setDisplayData(newHtml);
            });
          }}
        />
        {/* {data !== undefined && data !== null && ( */}
        <PrepopulateHTMLPlugin data={data} />
        {/* )} */}
        <CustomPastePlugin />

        {/* Text Area */}
        <RichTextPlugin
          contentEditable={
            <Box
            // mr={3}
            >
              {/* Toolbar */}
              <RevisedRichTextToolbar />

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
                      padding: "32px",
                      paddingBottom: "16px",
                      borderRadius: "0 0 25px 25px",
                      outline: "none",
                    }}

                    // autoFocus
                  />
                </Box>
              </Box>
              {/* <Box>Editor: {editorText}</Box> */}
            </Box>
          }
          placeholder={
            <Box
              style={{
                position: "absolute",
                left: `${32 + dragBtnMargin}px`,
                top: `${30 + toolBarHeight}px`,
                userSelect: "none",
                pointerEvents: "none",
                color: "gray",
              }}
            >
              {`Enter ${useGetRTESectionPlaceholder(section)}..`}
            </Box>
          }
          ErrorBoundary={LexicalErrorBoundary}
        />
        {floatingAnchorElem !== null && (
          <DraggableBlockPlugin
            anchorElem={floatingAnchorElem}
            toolbarHeight={toolBarHeight}
          />
        )}

        <Box>
          <OptionsBar
            editorType={editorType}
            displayData={displayData}
            editorText={editorText}
            shouldShowTree={shouldShowTree}
            setShouldShowTree={setShouldShowTree}
            rawHTML={displayData}
            section={section}
            project_pk={project_pk}
            document_pk={document_pk}
            isUpdate={isUpdate}
            writeable_document_kind={writeable_document_kind}
            writeable_document_pk={writeable_document_pk}
            wordLimit={wordLimit}
            limitCanBePassed={limitCanBePassed}
            canSave={canSave}
            setCanSave={setCanSave}
            editorIsOpen={isEditorOpen}
            setIsEditorOpen={setIsEditorOpen}
            // setDisplayData={setDisplayData}
          />
        </Box>
        {shouldShowTree ? <TreeViewPlugin /> : null}
        <ClearEditorPlugin />
        <TabIndentationPlugin />
        <ListMaxIndentLevelPlugin maxDepth={3} />

        <EditorTextInitialStatePlugin
          setEditorText={setEditorText}
          editorText={editorText}
          isOpen={isEditorOpen}
        />

        <FloatingToolbarPlugin anchorElem={floatingAnchorElem} />

        <AutoFocusPlugin />
      </LexicalComposer>
    </>
  );
};
