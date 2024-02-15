// The basic rich text editor component; does not allow sticky notes, emotes, etc.

// React
import { useRef, useState } from "react";

// Styles and Styling Components
import { Box, Flex, Image, Text, useColorMode } from "@chakra-ui/react";

import "../../../styles/texteditor.css";

import { ListItemNode, ListNode } from "@lexical/list";

import { ExtractedHTMLTitle } from "@/components/ExtractedHTMLTitle";
import { TableCellNode, TableNode, TableRowNode } from "@lexical/table";
import { useNavigate } from "react-router-dom";
import { IProgressReport, IProjectData, IStudentReport } from "../../../types";
import { ARProgressReportEditor } from "./ARProgressReportEditor";

interface IProps {
  canEdit: boolean;
  project: IProjectData;
  document: IStudentReport | IProgressReport;
  // report: IReport;
  report: any;
  reportKind: "student" | "ordinary";
  shouldAlternatePicture: boolean;
}

export const ARProgressReportHandler = ({
  canEdit,
  project,
  document,
  report,
  reportKind,
  shouldAlternatePicture,
}: IProps) => {
  const { colorMode } = useColorMode();

  const navigate = useNavigate();

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

  const editorRef = useRef(null);

  const initialConfig = {
    namespace: "Progress Report Editor",
    editable: true,
    theme,
    onError,
    nodes: [ListNode, ListItemNode, TableCellNode, TableNode, TableRowNode],
  };

  // const uneditableInitialCOnfig = {
  //   ...initialConfig,
  //   editable: false,
  // };

  const A4Width = 210; // in millimeters
  // const A4Height = A4Width * 1.414; // 1.414 is the aspect ratio of A4 paper (297 / 210)

  // const [editorText, setEditorText] = useState<string | null>("");
  const [isEditing, setIsEditing] = useState(false);

  return (
    // Wrapper
    <Box pb={4} roundedTop={20} w={`${A4Width}mm`}>
      <Box
        pos={"relative"}
        w={"100%"}
        // bg={"gray.100"}
        roundedBottom={20}
        roundedTop={20}
        // overflow={"hidden"}
        boxShadow={
          "0 8px 24px rgba(0, 0, 0, 0.1), 0 2px 8px rgba(0, 0, 0, 0.1)"
        }
        bg={
          colorMode === "light"
            ? isEditing
              ? "whiteAlpha.600"
              : "whiteAlpha.400"
            : isEditing
            ? "blackAlpha.500"
            : "blackAlpha.400"
        }
      >
        {/* Image, tag, title, scientits, student, academics */}
        <Flex mx={8} mt={4} pt={8}>
          {!shouldAlternatePicture ? (
            <>
              <Box rounded={"md"} overflow={"hidden"} w={"276px"} h={"200px"}>
                <Image
                  src={project?.image?.file}
                  w={"100%"}
                  h={"100%"}
                  objectFit={"cover"}
                />
              </Box>
              <Box ml={4} flex={1}>
                <Box
                  cursor={"pointer"}
                  onClick={() =>
                    navigate(
                      `/projects/${project?.pk}/${
                        reportKind === "student" ? "student" : "progress"
                      }`
                    )
                  }
                >
                  <ExtractedHTMLTitle
                    htmlContent={project?.title}
                    color={"blue.500"}
                    fontWeight={"bold"}
                    fontSize={"17px"}
                    // fontSize={"xs"}
                    noOfLines={4}
                  />
                </Box>

                <Box py={3}>
                  {/* <Text fontWeight={"bold"}>{project?.title}</Text> */}
                  <Flex mb={0.5} flexWrap={"wrap"}>
                    <Text fontWeight={"semibold"} mr={1}>
                      Tag:{" "}
                    </Text>
                    <Text>Jarid Prince</Text>
                  </Flex>
                  <Flex mb={0.5} flexWrap={"wrap"}>
                    <Text fontWeight={"semibold"} mr={1}>
                      Team:{" "}
                    </Text>
                    <Text>Jarid Prince</Text>
                  </Flex>
                </Box>
              </Box>
            </>
          ) : (
            <>
              <Box mr={4} flex={1}>
                <Box
                  cursor={"pointer"}
                  onClick={() =>
                    navigate(
                      `/projects/${project?.pk}/${
                        reportKind === "student" ? "student" : "progress"
                      }`
                    )
                  }
                >
                  <ExtractedHTMLTitle
                    htmlContent={project?.title}
                    color={"blue.500"}
                    fontWeight={"bold"}
                    fontSize={"17px"}
                    // fontSize={"xs"}
                    noOfLines={4}
                  />
                </Box>

                <Box py={3}>
                  <Flex mb={0.5} flexWrap={"wrap"}>
                    <Text fontWeight={"semibold"} mr={1}>
                      Tag:{" "}
                    </Text>
                    <Text>Jarid Prince</Text>
                  </Flex>
                  <Flex mb={0.5} flexWrap={"wrap"}>
                    <Text fontWeight={"semibold"} mr={1}>
                      Team:{" "}
                    </Text>
                    <Text>Jarid Prince</Text>
                  </Flex>
                </Box>
              </Box>
              <Box rounded={"md"} overflow={"hidden"} w={"276px"} h={"200px"}>
                <Image
                  src={project?.image?.file}
                  w={"100%"}
                  h={"100%"}
                  objectFit={"cover"}
                />
              </Box>
            </>
          )}
        </Flex>

        <Text fontWeight={"bold"} fontSize={"lg"} px={8} mt={4}>
          Context
        </Text>
        {/* Context */}
        {canEdit && (
          <ARProgressReportEditor
            initialConfig={initialConfig}
            editorRef={editorRef}
            context_prepopulation_data={
              reportKind !== "student" ? report?.context : undefined
            }
            aims_prepopulation_data={
              reportKind !== "student" ? report?.aims : undefined
            }
            progress_report_prepopulation_data={
              reportKind === "student"
                ? report?.progress_report
                : report?.progress
            }
            management_implications_prepopulation_data={
              reportKind !== "student" ? report?.implications : undefined
            }
            future_directions_prepopulation_data={
              reportKind !== "student" ? report?.future : undefined
            }
            project_pk={project?.pk}
            document_pk={document?.document?.pk}
            writeable_document_pk={document?.pk}
            isEditorOpen={isEditing}
            setIsEditorOpen={setIsEditing}
          />
        )}
      </Box>
    </Box>
  );
};

{
  /* ) : (
          <DisplaySRTE
            key={prepopulationData}
            initialConfig={uneditableInitialCOnfig}
            data={prepopulationData}
            section={section}
            shouldShowTree={shouldShowTree}
          />
        )} */
}
