// The basic rich text editor component; does not allow sticky notes, emotes, etc.

// React
import { useEffect, useRef, useState } from "react";

// Styles and Styling Components
import { useColorMode } from "@/shared/utils/theme.utils";

import "@/styles/texteditor.css";

import { ListItemNode, ListNode } from "@lexical/list";

import { useGetRTESectionTitle } from "@/features/reports/utils/useGetRTESectionTitle";
import { TableCellNode, TableNode, TableRowNode } from "@lexical/table";
import { HideEditorButton } from "../Buttons/HideEditorButton";
import { DisplayGuideSRTE } from "./Sections/DisplayGuideSRTE";
import { EditableGuideSRTE } from "./Sections/EditableGuideSRTE";
import { ImageNode } from "../Nodes/ImageNode";
import axios from "axios";

interface IProps {
  canEdit: boolean;
  data: string;
  titleTextSize?: string;
  section: string; // Changed from GuideSections enum to string for dynamic field keys
  fieldKey?: string; // Optional field key override for API calls
  fieldTitle?: string; // Optional title to display (if provided)
  adminOptionsPk: number;
  isUpdate: boolean;
  refetch: () => void;
  // Updated to match the saveGuideContentToDB signature
  onSave?: (params: {
    fieldKey: string;
    content: string;
    adminOptionsPk: number;
  }) => Promise<any>;
}

export const GuideRichTextEditor = ({
  canEdit,
  data,
  titleTextSize,
  section,
  fieldKey, // Added fieldKey prop
  fieldTitle,
  adminOptionsPk,
  isUpdate,
  refetch,
  onSave,
}: IProps) => {
  const [shouldShowTree, setShouldShowTree] = useState(false);
  const { colorMode } = useColorMode();
  const [canSave, setCanSave] = useState<boolean>(true);

  // const [lastSelectedNode, setLastSelectedNode] = useState();

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
        bold: colorMode === "light" ? "editor-bold-light" : "editor-bold-dark",
        italic:
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
      table: colorMode === "light" ? "table-light" : "table-dark",
      tableAddColumns:
        colorMode === "light"
          ? "table-add-columns-light"
          : "table-add-columns-dark",
      tableAddRows:
        colorMode === "light" ? "table-add-rows-light" : "table-add-rows-dark",
      tableCell: colorMode === "light" ? "table-cell-light" : "table-cell-dark",
      tableCellActionButton:
        colorMode === "light"
          ? "table-action-button-light"
          : "table-action-button-dark",
      tableCellActionButtonContainer:
        colorMode === "light"
          ? "table-action-button-container-light"
          : "table-action-button-container-dark",
      tableCellEditing:
        colorMode === "light"
          ? "table-cell-editing-light"
          : "table-cell-editing-dark",
      tableCellHeader:
        colorMode === "light"
          ? "table-cell-header-light"
          : "table-cell-header-dark",
      tableCellPrimarySelected:
        colorMode === "light"
          ? "table-cell-primary-selected-light"
          : "table-cell-primary-selected-dark",
      tableCellResizer:
        colorMode === "light"
          ? "table-cell-resizer-light"
          : "table-cell-resizer-dark",
      tableCellSelected:
        colorMode === "light"
          ? "table-cell-selected-light"
          : "table-cell-selected-dark",
      tableCellSortedIndicator:
        colorMode === "light"
          ? "table-cell-sorted-indicator-light"
          : "table-cell-sorted-indicator-dark",
      tableResizeRuler:
        colorMode === "light"
          ? "table-cell-resize-ruler-light"
          : "table-cell-resize-ruler-dark",
      tableSelected:
        colorMode === "light" ? "table-selected-light" : "table-selected-dark",
      tableSelection:
        colorMode === "light"
          ? "table-selection-light"
          : "table-selection-dark",
    };
  };

  // Generate the theme based on the current colorMode
  const theme = generateTheme(colorMode);

  // Catch errors that occur during Lexical updates
  const onError = (error: Error) => {
    console.log(error);
  };

  const [editorText, setEditorText] = useState<string | null>("");
  const editorRef = useRef(null);

  const initialConfig = {
    namespace: "Guide Document Editor",
    editable: true,
    theme,
    onError,
    nodes: [
      ListNode,
      ListItemNode,
      TableCellNode,
      TableNode,
      TableRowNode,
      ImageNode,
    ],
  };

  const uneditableInitialCOnfig = {
    ...initialConfig,
    editable: false,
  };

  const [isEditorOpen, setIsEditorOpen] = useState(false);

  useEffect(() => {
    if (data !== undefined && data !== null) {
      setDisplayData(data);
    }
  }, []);

  const [displayData, setDisplayData] = useState(data);

  useEffect(() => {
    setPrepopulationData(displayData);
  }, [displayData]);

  const [prepopulationData, setPrepopulationData] = useState(displayData);

  // New save handler to use the dynamic guide content endpoint
  // This function receives a content string and must create the proper object for onSave
  const handleDynamicContentSave = async (
    content: string,
  ): Promise<boolean> => {
    try {
      console.log(
        `GuideRichTextEditor: handleDynamicContentSave called with content length: ${content ? content.length : "undefined"}`,
      );
      console.log(
        `Content sample: ${content ? content.substring(0, 50) + "..." : "undefined"}`,
      );

      // Ensure content is not undefined
      if (!content) {
        console.error(
          "Content is undefined or empty in handleDynamicContentSave",
        );
        return false;
      }

      // Determine which field key to use
      const effectiveFieldKey = fieldKey || section;
      console.log(`Using field key: ${effectiveFieldKey}`);

      if (onSave) {
        // Use the callback with the proper parameter structure
        console.log("Calling provided onSave function with object parameters");
        const result = await onSave({
          fieldKey: effectiveFieldKey,
          content: content,
          adminOptionsPk: adminOptionsPk,
        });
        return !!result;
      } else {
        // Legacy approach - fallback for backward compatibility
        console.log("Using legacy API endpoint");
        // Use PUT instead of POST, with the right data structure
        const response = await axios.put(
          `/api/v1/adminoptions/${adminOptionsPk}/`,
          {
            guide_content: {
              [effectiveFieldKey]: content,
            },
          },
        );
        // Refresh data
        refetch();
        return !!response.data;
      }
    } catch (error) {
      console.error("Error saving content:", error);
      return false;
    }
  };

  // Get section title - use fieldTitle if provided, otherwise try to derive from section name
  const sectionTitle = fieldTitle || useGetRTESectionTitle(section);

  return (
    // Wrapper
    <div className="pb-6 max-w-full">
      <div className={`flex rounded-t-[20px] max-w-full ${
        colorMode === "light" ? "bg-gray-200" : "bg-gray-700"
      }`}>
        <div className="flex justify-start items-center">
          <p className={`pl-8 my-0 py-2 font-bold text-xl ${
            colorMode === "dark" ? "text-gray-400" : ""
          }`} style={{ fontSize: titleTextSize || "1.25rem" }}>
            {sectionTitle}
          </p>
        </div>

        <div className="flex justify-end flex-1">
          <div className="pr-8 py-2 grid grid-cols-1 gap-2">
            {canEdit && (
              <HideEditorButton
                setIsEditorOpen={setIsEditorOpen}
                editorIsOpen={isEditorOpen}
              />
            )}
          </div>
        </div>
      </div>

      <div className={`relative max-w-full rounded-b-[20px] shadow-[rgba(100,100,111,0.1)_0px_7px_29px_0px] ${
        colorMode === "light"
          ? isEditorOpen
            ? "bg-white/60"
            : "bg-white/40"
          : isEditorOpen
            ? "bg-black/50"
            : "bg-black/40"
      }`}>
        {isEditorOpen ? (
          <EditableGuideSRTE
            adminOptionsPk={adminOptionsPk}
            initialConfig={initialConfig}
            editorRef={editorRef}
            data={prepopulationData}
            section={section}
            fieldKey={fieldKey} // Pass fieldKey to EditableGuideSRTE
            isUpdate={isUpdate}
            displayData={displayData}
            editorText={editorText}
            setEditorText={setEditorText}
            shouldShowTree={shouldShowTree}
            setShouldShowTree={setShouldShowTree}
            isEditorOpen={isEditorOpen}
            setIsEditorOpen={setIsEditorOpen}
            setDisplayData={setDisplayData}
            canSave={canSave}
            setCanSave={setCanSave}
            refetch={refetch}
            // Pass the adapter function which has the right signature for EditableGuideSRTE
            onSave={handleDynamicContentSave}
          />
        ) : (
          <DisplayGuideSRTE
            key={prepopulationData}
            initialConfig={uneditableInitialCOnfig}
            data={prepopulationData}
            section={section}
            shouldShowTree={shouldShowTree}
          />
        )}
      </div>
    </div>
  );
};
