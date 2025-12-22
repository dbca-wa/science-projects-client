// React
import { useState } from "react";

// Styles and Styling Components
import { useColorMode } from "@/shared/utils/theme.utils";

import "@/styles/texteditor.css";

import { ListItemNode, ListNode } from "@lexical/list";

import type { IMainDoc, IProjectData, IProjectMember, IReport } from "@/shared/types";
import { TableCellNode, TableNode, TableRowNode } from "@lexical/table";
import { PREditor } from "./PREditor";

export interface IProgressReportDisplayData {
  pk?: number;
  id?: number;
  aims: string;
  context: string;
  future: string;
  implications: string;
  progress: string;
  year: number;
  team_members: IProjectMember[];
  report: IReport;
  document: IMainDoc;
  project: IProjectData;
}

interface IProps {
  canEdit: boolean;
  // report: IReport;
  report: IProgressReportDisplayData;
  shouldAlternatePicture: boolean;
}

export const ARProgressReportHandler = ({
  canEdit,
  report,
  shouldAlternatePicture,
}: IProps) => {
  // useEffect(() => console.log(report))
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
  const theme = generateTheme(colorMode);

  const onError = (error: Error) => {
    console.log(error);
  };

  const initialConfig = {
    namespace: `Progress Report Editor`,
    editable: true,
    theme,
    onError,
    nodes: [ListNode, ListItemNode, TableCellNode, TableNode, TableRowNode],
  };

  const uneditableInitialConfig = {
    ...initialConfig,
    editable: false,
    theme: generateTheme(colorMode),
  };

  // const [editorText, setEditorText] = useState<string | null>("");
  const [isEditingContext, setIsEditingContext] = useState(false);
  const [isEditingAims, setIsEditingAims] = useState(false);
  const [isEditingProgress, setIsEditingProgress] = useState(false);
  const [isEditingImplications, setIsEditingImplications] = useState(false);
  const [isEditingFuture, setIsEditingFuture] = useState(false);
  const [aimsDisplayData, setAimsDisplayData] = useState(report?.aims);
  const [progressReportDisplayData, setProgressReportDisplayData] = useState(
    report?.progress,
  );
  const [
    managementImplicationsDisplayData,
    setManagementImplicationsDisplayData,
  ] = useState(report?.implications);
  const [futureDirectionsDisplayData, setFutureDirectionsDisplayData] =
    useState(report?.future);
  const [contextDisplayData, setContextDisplayData] = useState(report?.context);

  return (
    <PREditor
      key={`${colorMode}-${report?.pk ? report.pk : report.id}`}
      canEdit={canEdit}
      isEditingContext={isEditingContext}
      setIsEditingContext={setIsEditingContext}
      isEditingAims={isEditingAims}
      setIsEditingAims={setIsEditingAims}
      isEditingProgress={isEditingProgress}
      setIsEditingProgress={setIsEditingProgress}
      isEditingImplications={isEditingImplications}
      setIsEditingImplications={setIsEditingImplications}
      isEditingFuture={isEditingFuture}
      setIsEditingFuture={setIsEditingFuture}
      shouldAlternatePicture={shouldAlternatePicture}
      fullPRData={report}
      editableInitialConfig={initialConfig}
      uneditableInitialConfig={uneditableInitialConfig}
      aimsDisplayData={aimsDisplayData}
      setAimsDisplayData={setAimsDisplayData}
      progressReportDisplayData={progressReportDisplayData}
      setProgressReportDisplayData={setProgressReportDisplayData}
      contextDisplayData={contextDisplayData}
      setContextDisplayData={setContextDisplayData}
      managementImplicationsDisplayData={managementImplicationsDisplayData}
      setManagementImplicationsDisplayData={
        setManagementImplicationsDisplayData
      }
      futureDirectionsDisplayData={futureDirectionsDisplayData}
      setFutureDirectionsDisplayData={setFutureDirectionsDisplayData}
    />
  );
};
