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
import DraggableBlockPlugin from "@/shared/components/RichTextEditor/Plugins/DraggableBlockPlugin";
import { useGetRTESectionPlaceholder } from "@/shared/hooks/helper/useGetRTESectionPlaceholder";
import { $generateHtmlFromNodes } from "@lexical/html";
import { AutoFocusPlugin } from "@lexical/react/LexicalAutoFocusPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { TabIndentationPlugin } from "@lexical/react/LexicalTabIndentationPlugin";
import { TablePlugin } from "@lexical/react/LexicalTablePlugin";
import React, { useEffect, useState } from "react";
import { TreeViewPlugin } from "@/shared/lib/plugins/TreeViewPlugin";
import { GuideOptionsBar } from "../../OptionsBar/GuideOptionsBar";
import { CustomPastePlugin } from "../../Plugins/CustomPastePlugin";
import { EditorTextInitialStatePlugin } from "../../Plugins/EditorTextInitialStatePlugin";
import FloatingToolbarPlugin from "../../Plugins/FloatingToolbarPlugin";
import ListMaxIndentLevelPlugin from "../../Plugins/ListMaxIndentLevelPlugin";
import { RevisedRichTextToolbar } from "../../Toolbar/RevisedRichTextToolbar";
import { ImagePlugin } from "../../Plugins/ImagesPlugin";

interface Props {
  initialConfig: InitialConfigType;
  editorRef: React.MutableRefObject<any>;
  originalData?: string;
  data: string;
  section: string; // Field name in the database
  fieldKey?: string; // Optional override for the API field_key parameter
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
  // Updated to match the string parameter pattern for the handleSave in GuideOptionsBar
  onSave?: (content: string) => Promise<boolean>;
}

export const EditableGuideSRTE = ({
  refetch,
  section,
  fieldKey, // Added fieldKey prop
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
  onSave, // Use the external onSave function
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

  // Try to get a placeholder based on section name
  const placeholderText = useGetRTESectionPlaceholder(section);

  // Create an adapter function to bridge between the onSave signatures
  const handleSave = async (content: string): Promise<boolean> => {
    if (!content) {
      console.error(
        "EditableGuideSRTE: handleSave received undefined or empty content",
      );
      return false;
    }

    console.log(
      `EditableGuideSRTE: handleSave called with content length: ${content.length}`,
    );
    console.log(`Content sample: ${content.substring(0, 50)}...`);

    if (onSave) {
      // Call the external onSave with the content directly
      try {
        const effectiveFieldKey = fieldKey || section;
        console.log(
          `Handling save for ${effectiveFieldKey} with content length: ${content.length}`,
        );

        // onSave expects just the content string
        const result = await onSave(content);

        return !!result; // Convert any result to boolean
      } catch (error) {
        console.error("Error in handleSave adapter:", error);
        return false;
      }
    }
    return true; // Default success if no save handler provided
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

        <PrepopulateHTMLPlugin data={data} />
        <CustomPastePlugin />

        {/* Text Area */}
        <RichTextPlugin
          contentEditable={
            <Box maxW={"100%"}>
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
                    marginLeft: `${dragBtnMargin}px`,
                  }}
                >
                  <ContentEditable
                    style={{
                      minHeight: "50px",
                      maxWidth: "100%",
                      height: "auto",
                      padding: "32px",
                      paddingBottom: "16px",
                      borderRadius: "0 0 25px 25px",
                      outline: "none",
                    }}
                  />
                </Box>
              </Box>
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
              {`Enter ${placeholderText}..`}
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
            fieldKey={fieldKey} // Pass fieldKey to GuideOptionsBar
            isUpdate={isUpdate}
            canSave={canSave}
            setCanSave={setCanSave}
            editorIsOpen={isEditorOpen}
            setIsEditorOpen={setIsEditorOpen}
            refetch={refetch}
            onSave={handleSave} // Pass our adapter function
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
