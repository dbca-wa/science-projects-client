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
import { $getRoot, LexicalNode } from "lexical";
import { PrepopulateHTMLPlugin } from "../../Plugins/PrepopulateHTMLPlugin";
// import { RichTextToolbar } from "../../Toolbar/RichTextToolbar";
import DraggableBlockPlugin from "@/components/RichTextEditor/Plugins/DraggableBlockPlugin";
import { GuideSections } from "@/lib/api";
import { useGetRTESectionPlaceholder } from "@/lib/hooks/helper/useGetRTESectionPlaceholder";
import { $generateHtmlFromNodes } from "@lexical/html";
import { AutoFocusPlugin } from "@lexical/react/LexicalAutoFocusPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
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
import { $isImageNode } from "../../Nodes/ImageNode";
import { ImagePlugin } from "../../Plugins/ImagesPlugin";
import { set } from "lodash";
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
  const toolbarRef = React.useRef<HTMLDivElement | null>(null);

  const dragBtnMargin = 10;
  const [toolbarHeight, setToolbarHeight] = useState(37); // Default height

  useEffect(() => {
    // Initial measurement
    if (toolbarRef.current) {
      setToolbarHeight(toolbarRef.current.clientHeight);
    }

    // Set up a ResizeObserver to detect height changes
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        console.log("Toolbar height changed:", entry.target.clientHeight);
        setToolbarHeight(entry.target.clientHeight);
      }
    });

    // Start observing the toolbar element
    if (toolbarRef.current) {
      resizeObserver.observe(toolbarRef.current);
    }

    // Clean up
    return () => {
      if (toolbarRef.current) {
        resizeObserver.unobserve(toolbarRef.current);
      }
      resizeObserver.disconnect();
    };
  }, []); // Empty dependency array means this runs once after mount

  // Using the height in your component
  console.log("Current toolbar height:", toolbarHeight);

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

  const processEditorOutput = (editor) => {
    // First get standard HTML
    let html = $generateHtmlFromNodes(editor, null);

    // Process editor state to ensure images are included
    editor.getEditorState().read(() => {
      // Track if we've added any images
      let hasAddedImages = false;

      // Find all image nodes
      editor._editorState._nodeMap.forEach((node) => {
        if (node.__type === "image") {
          const src = node.__src;
          // Check if this image is already in the HTML
          if (!html.includes(src)) {
            // If not, add it to the HTML
            if (!hasAddedImages) {
              html += '<div class="appended-images">';
              hasAddedImages = true;
            }

            const altText = node.__altText || "";
            const width = node.__width ? ` width="${node.__width}"` : "";
            const height = node.__height ? ` height="${node.__height}"` : "";

            html += `<img src="${src}" alt="${altText}"${width}${height} style="max-width:100%;">`;
          }
        }
      });

      if (hasAddedImages) {
        html += "</div>";
      }
    });

    return html;
  };

  return (
    <>
      <LexicalComposer initialConfig={initialConfig}>
        {/* Plugins*/}
        <TablePlugin hasCellMerge={true} hasCellBackgroundColor={false} />
        <HistoryPlugin />
        <ListPlugin />
        <ImagePlugin />

        <OnChangePlugin
          onChange={(editorState, editor) => {
            editorState.read(() => {
              const root = $getRoot();
              setEditorText(root.__cachedText);

              // Get HTML with custom handling for images
              const newHtml = processEditorOutput(editor);
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
              <RevisedRichTextToolbar
                allowTable={true}
                allowImages={true}
                toolbarRef={toolbarRef}
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
                top: `${30 + toolbarHeight}px`,
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
            toolbarHeight={toolbarHeight}
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
