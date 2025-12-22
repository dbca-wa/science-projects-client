// The basic rich text editor component; does not allow sticky notes, emotes, etc.

// React
import { useEffect, useRef, useState } from "react";

// Styles and Styling Components
import { useColorMode } from "@/shared/utils/theme.utils";

import "@/styles/texteditor.css";

import { ListItemNode, ListNode } from "@lexical/list";

import { useGetRTESectionTitle } from "@/features/reports/utils/useGetRTESectionTitle";
import { TableCellNode, TableNode, TableRowNode } from "@lexical/table";
import type { EditorSections, EditorSubsections, EditorType } from "@/shared/types";
import { HideEditorButton } from "../Buttons/HideEditorButton";
import { DisplaySRTE } from "./Sections/DisplaySRTE";
import { EditableSRTE } from "./Sections/EditableSRTE";

interface IProps {
  canEdit: boolean;
  data: string;
  titleTextSize?: string;
  section: EditorSubsections;
  project_pk?: number;
  details_pk?: number;
  document_pk?: number;
  writeable_document_kind?: EditorSections | null;
  writeable_document_pk?: number | null;
  editorType: EditorType;
  isUpdate: boolean;
  wordLimit?: number;
  limitCanBePassed?: boolean;
  documentsCount?: number;
}

export const RichTextEditor = ({
  canEdit,
  data,
  titleTextSize,
  section,
  project_pk,
  document_pk,
  editorType,
  isUpdate,
  writeable_document_kind,
  writeable_document_pk,
  details_pk,
  wordLimit,
  limitCanBePassed,
  documentsCount,
}: IProps) => {
  const [shouldShowTree, setShouldShowTree] = useState(false);
  const { colorMode } = useColorMode();
  const [canSave, setCanSave] = useState<boolean>(true);

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

  // useEffect(() => {
  //     setDisplayData(data);
  // }, [data])

  const initialConfig = {
    namespace: "Annual Report Document Editor",
    editable: true,
    theme,
    onError,
    nodes: [ListNode, ListItemNode, TableCellNode, TableNode, TableRowNode],
  };

  // if (section === "methodology") {
  //   initialConfig.nodes.push(ImageNode)
  // }

  const uneditableInitialCOnfig = {
    ...initialConfig,
    editable: false,
  };

  useEffect(() => {
    if (data !== undefined && data !== null) {
      setDisplayData(data);
    }
  }, []);

  const [displayData, setDisplayData] = useState(data);

  useEffect(() => {
    // console.log("DISPLAY DATA:", displayData);
    setPrepopulationData(displayData);
  }, [displayData]);

  const [prepopulationData, setPrepopulationData] = useState(displayData);
  const [shouldCheckForPrepopulation, setShouldCheckForPrepopulation] =
    useState(
      writeable_document_kind === "Student Report" ||
        writeable_document_kind === "Progress Report",
    );

  const [isEditorOpen, setIsEditorOpen] = useState(false);

  return (
    // Wrapper
    <div className="max-w-full pb-6">
      {/* <div>
           <p>An editor is open. Are you sure you want to leave?</p>
           <button onClick={blocker.proceed}>Yes, Leave</button>
           <button onClick={blocker.reset}>Cancel</button>
         </div> */}

      <div
        className={`flex max-w-full rounded-t-[20px] px-4 ${
          colorMode === "light"
            ? section === "description" ||
              section === "externalAims" ||
              section === "externalDescription"
              ? "bg-gray-200"
              : "bg-gray-100"
            : section === "description" ||
                section === "externalAims" ||
                section === "externalDescription"
              ? "bg-gray-800"
              : "bg-gray-700"
        }`}
      >
        <div className="flex items-center justify-start">
          <p
            className={`my-0 py-2 text-xl font-bold ${
              colorMode === "dark" ? "text-gray-400" : ""
            }`}
            style={{ fontSize: titleTextSize || "1.25rem" }}
          >
            {useGetRTESectionTitle(section)}
          </p>
        </div>

        <div className="flex flex-1 justify-end">
          <div className="grid grid-cols-1 gap-2 py-2">
            {canEdit && (
              <HideEditorButton
                setIsEditorOpen={setIsEditorOpen}
                editorIsOpen={isEditorOpen}
              />
            )}
          </div>
        </div>
      </div>

      <div
        className={`relative max-w-full rounded-b-[20px] ${
          colorMode === "light"
            ? isEditorOpen
              ? "bg-white/60"
              : "bg-white/40"
            : isEditorOpen
              ? "bg-black/50"
              : "bg-black/40"
        }`}
        style={{ boxShadow: "rgba(100, 100, 111, 0.1) 0px 7px 29px 0px" }}
      >
        {isEditorOpen ? (
          <EditableSRTE
            // key={prepopulationData}

            initialConfig={initialConfig}
            editorRef={editorRef}
            data={prepopulationData}
            section={section}
            project_pk={project_pk}
            document_pk={document_pk}
            editorType={editorType}
            isUpdate={isUpdate}
            writeable_document_kind={writeable_document_kind}
            writeable_document_pk={writeable_document_pk}
            details_pk={details_pk}
            displayData={displayData}
            editorText={editorText}
            setEditorText={setEditorText}
            shouldShowTree={shouldShowTree}
            setShouldShowTree={setShouldShowTree}
            isEditorOpen={isEditorOpen}
            setIsEditorOpen={setIsEditorOpen}
            setDisplayData={setDisplayData}
            wordLimit={wordLimit}
            limitCanBePassed={limitCanBePassed}
            canSave={canSave}
            setCanSave={setCanSave}
            shouldCheckForPrepopulation={shouldCheckForPrepopulation}
            documentsCount={documentsCount ? documentsCount : 1}
          />
        ) : (
          <DisplaySRTE
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
