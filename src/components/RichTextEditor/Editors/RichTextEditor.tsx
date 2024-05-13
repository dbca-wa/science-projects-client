// The basic rich text editor component; does not allow sticky notes, emotes, etc.

// React
import { useEffect, useRef, useState } from "react";

// Styles and Styling Components
import { Box, Flex, Grid, Text, useColorMode } from "@chakra-ui/react";

import "../../../styles/texteditor.css";

import { ListItemNode, ListNode } from "@lexical/list";

import { useGetRTESectionTitle } from "@/lib/hooks/helper/useGetRTESectionTitle";
import { TableCellNode, TableNode, TableRowNode } from "@lexical/table";
import { EditorSections, EditorSubsections, EditorType } from "../../../types";
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

  const [isEditorOpen, setIsEditorOpen] = useState(false);

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

  return (
    // Wrapper
    <Box pb={6} maxW={"100%"}>
      <Flex
        bg={
          colorMode === "light"
            ? section === "description" ||
              section === "externalAims" ||
              section === "externalDescription"
              ? "gray.200"
              : "gray.100"
            : section === "description" ||
              section === "externalAims" ||
              section === "externalDescription"
              ? "gray.800"
              : "gray.700"
        }
        // roundedTop={"8px"}
        roundedTop={20} maxW={"100%"}
      >
        <Flex justifyContent="flex-start" alignItems={"center"}>
          <Text
            // pt={1}
            pl={8}
            // paddingBottom={"12px"}
            my={0}
            py={2}
            fontWeight={"bold"}
            fontSize={titleTextSize ? titleTextSize : "xl"}
          >
            {useGetRTESectionTitle(section)}
          </Text>
        </Flex>

        <Flex justifyContent="flex-end" flex={1}>
          <Grid
            pr={8}
            py={2}
            gridTemplateColumns={"repeat(1, 1fr)"}
            gridColumnGap={2}
          >
            {canEdit && (
              <HideEditorButton
                setIsEditorOpen={setIsEditorOpen}
                editorIsOpen={isEditorOpen}
              />
            )}
          </Grid>
        </Flex>
      </Flex>

      <Box
        pos={"relative"}
        // w={"100%"}
        maxW={"100%"}
        // bg={"gray.100"}
        roundedBottom={20}
        boxShadow={"rgba(100, 100, 111, 0.1) 0px 7px 29px 0px"}
        bg={
          colorMode === "light"
            ? isEditorOpen
              ? "whiteAlpha.600"
              : "whiteAlpha.400"
            : isEditorOpen
              ? "blackAlpha.500"
              : "blackAlpha.400"
        }
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
          />
        ) : (
          <DisplaySRTE
            key={prepopulationData}
            initialConfig={uneditableInitialCOnfig}
            // editorRef={editorRef}
            data={prepopulationData}
            section={section}
            // project_pk={project_pk}
            // document_pk={document_pk}
            // editorType={editorType}
            // isUpdate={isUpdate}
            // displayData={displayData}
            // editorText={editorText}
            // setEditorText={setEditorText}
            shouldShowTree={shouldShowTree}
          // setShouldShowTree={setShouldShowTree}
          // isEditorOpen={isEditorOpen}
          // setIsEditorOpen={setIsEditorOpen}
          // setDisplayData={setDisplayData}
          // textEditorName={
          //   section === "description" ? "Description" : undefined
          // }
          />
        )}
      </Box>
      {/* <p>Editor text is: {`${editorText}`}</p>
            <p>Data is: {`${data}`}</p>
            <p>Display Data is: {`${displayData}`}</p> */}
    </Box>
  );
};
