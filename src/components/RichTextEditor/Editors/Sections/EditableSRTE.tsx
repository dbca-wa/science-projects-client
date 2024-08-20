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
import { OptionsBar } from "../../OptionsBar/OptionsBar";
import { PrepopulateHTMLPlugin } from "../../Plugins/PrepopulateHTMLPlugin";
// import { RichTextToolbar } from "../../Toolbar/RichTextToolbar";
import DraggableBlockPlugin from "@/components/RichTextEditor/Plugins/DraggableBlockPlugin";
import { useGetRTESectionPlaceholder } from "@/lib/hooks/helper/useGetRTESectionPlaceholder";
import { $generateHtmlFromNodes } from "@lexical/html";
import { AutoFocusPlugin } from "@lexical/react/LexicalAutoFocusPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import LexicalErrorBoundary from "@lexical/react/LexicalErrorBoundary";
import { TabIndentationPlugin } from "@lexical/react/LexicalTabIndentationPlugin";
import { TablePlugin } from "@lexical/react/LexicalTablePlugin";
import React, { useEffect, useState } from "react";
import { TreeViewPlugin } from "../../../../lib/plugins/TreeViewPlugin";
import {
  EditorSections,
  EditorSubsections,
  EditorType,
} from "../../../../types";
import { CustomPastePlugin } from "../../Plugins/CustomPastePlugin";
import { EditorTextInitialStatePlugin } from "../../Plugins/EditorTextInitialStatePlugin";
import FloatingToolbarPlugin from "../../Plugins/FloatingToolbarPlugin";
import ListMaxIndentLevelPlugin from "../../Plugins/ListMaxIndentLevelPlugin";
import { RevisedRichTextToolbar } from "../../Toolbar/RevisedRichTextToolbar";
// import TableActionMenuPlugin from "../../Plugins/TableActionMenuPlugin";

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
  details_pk?: number | null;

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
  shouldCheckForPrepopulation: boolean;
  documentsCount?: number;
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
  details_pk,
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
  shouldCheckForPrepopulation,
  documentsCount,
}: Props) => {
  const dragBtnMargin = 10;
  const toolBarHeight = 37;
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

        {/* Text Area */}
        <RichTextPlugin
          contentEditable={
            <Box
              // mr={3}
              maxW={"100%"}
            >
              {/* Toolbar */}
              <RevisedRichTextToolbar
                allowTable={
                  writeable_document_kind === "Progress Report" ||
                  writeable_document_kind === "Student Report"
                    ? false
                    : true
                }
              />

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
                      // overflow: "hidden"
                      overflowY: "scroll",
                      msOverflowY: "scroll",
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
          <>
            <DraggableBlockPlugin
              anchorElem={floatingAnchorElem}
              toolbarHeight={toolBarHeight}
            />
            {/* <TableActionMenuPlugin
              anchorElem={floatingAnchorElem}
              cellMerge={true}
            /> */}
          </>
        )}

        <Box>
          <OptionsBar
            details_pk={details_pk}
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
            shouldCheckForPrepopulation={shouldCheckForPrepopulation}
            documentTypeCount={documentsCount}
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
        {/* {data !== undefined && data !== null && ( */}
        <PrepopulateHTMLPlugin data={data} />
        {/* )} */}
        <CustomPastePlugin />
      </LexicalComposer>
    </>
  );
};
