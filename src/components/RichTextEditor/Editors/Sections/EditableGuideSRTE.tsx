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
import { $getRoot } from "lexical";
import { PrepopulateHTMLPlugin } from "../../Plugins/PrepopulateHTMLPlugin";
// import { RichTextToolbar } from "../../Toolbar/RichTextToolbar";
import DraggableBlockPlugin from "@/components/RichTextEditor/Plugins/DraggableBlockPlugin";
import { GuideSections } from "@/lib/api";
import { useGetRTESectionPlaceholder } from "@/lib/hooks/helper/useGetRTESectionPlaceholder";
import { $generateHtmlFromNodes } from "@lexical/html";
import { AutoFocusPlugin } from "@lexical/react/LexicalAutoFocusPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import LexicalErrorBoundary from "@lexical/react/LexicalErrorBoundary";
import { TabIndentationPlugin } from "@lexical/react/LexicalTabIndentationPlugin";
import { TablePlugin } from "@lexical/react/LexicalTablePlugin";
import React, { useEffect, useState } from "react";
import { TreeViewPlugin } from "../../../../lib/plugins/TreeViewPlugin";
import { GuideOptionsBar } from "../../OptionsBar/GuideOptionsBar";
import { CustomPastePlugin } from "../../Plugins/CustomPastePlugin";
import { EditorTextInitialStatePlugin } from "../../Plugins/EditorTextInitialStatePlugin";
import FloatingToolbarPlugin from "../../Plugins/FloatingToolbarPlugin";
import ListMaxIndentLevelPlugin from "../../Plugins/ListMaxIndentLevelPlugin";
import { RevisedRichTextToolbar } from "../../Toolbar/RevisedRichTextToolbar";
// import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
// import { SimpleRichTextToolbar } from "../../Toolbar/SimpleRichTextToolbar";
// import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";

interface Props {
  initialConfig: InitialConfigType;
  editorRef: React.MutableRefObject<any>;
  originalData?: string;
  data: string;
  section: GuideSections;
  isUpdate: boolean;

  editorText: string;
  setEditorText: React.Dispatch<React.SetStateAction<string>>;
  shouldShowTree: boolean;
  setShouldShowTree: React.Dispatch<React.SetStateAction<boolean>>;
  isEditorOpen: boolean;
  setIsEditorOpen: React.Dispatch<React.SetStateAction<boolean>>;
  displayData: string;

  setDisplayData: React.Dispatch<React.SetStateAction<string>>;
  textEditorName?: string;

  canSave: boolean;
  setCanSave: React.Dispatch<React.SetStateAction<boolean>>;
  adminOptionsPk: number;

  refetch: () => void;
}

export const EditableGuideSRTE = ({
  refetch,
  section,
  isUpdate,
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
  canSave,
  setCanSave,
  adminOptionsPk,
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
              maxW={"100%"}
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
                      // width: "100%",
                      maxWidth: "100%",
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
          <GuideOptionsBar
            adminOptionsByPk={adminOptionsPk}
            displayData={displayData}
            editorText={editorText}
            shouldShowTree={shouldShowTree}
            setShouldShowTree={setShouldShowTree}
            rawHTML={displayData}
            section={section}
            isUpdate={isUpdate}
            canSave={canSave}
            setCanSave={setCanSave}
            editorIsOpen={isEditorOpen}
            setIsEditorOpen={setIsEditorOpen}
            refetch={refetch}
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