import { Box, Center, Flex, Text, useColorMode, Image } from "@chakra-ui/react";
import {
  InitialConfigType,
  LexicalComposer,
} from "@lexical/react/LexicalComposer";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { $getRoot } from "lexical";
// import { RichTextToolbar } from "../../Toolbar/RichTextToolbar";
import DraggableBlockPlugin from "@/components/RichTextEditor/Plugins/DraggableBlockPlugin";
import { $generateHtmlFromNodes } from "@lexical/html";
import { AutoFocusPlugin } from "@lexical/react/LexicalAutoFocusPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import LexicalErrorBoundary from "@lexical/react/LexicalErrorBoundary";
import { TabIndentationPlugin } from "@lexical/react/LexicalTabIndentationPlugin";
import { TablePlugin } from "@lexical/react/LexicalTablePlugin";
import React, { useEffect, useState } from "react";
import { EditorSections, IProjectData } from "@/types";
import FloatingToolbarPlugin from "../Plugins/FloatingToolbarPlugin";
import ListMaxIndentLevelPlugin from "../Plugins/ListMaxIndentLevelPlugin";
import { CustomPastePlugin } from "../Plugins/CustomPastePlugin";
import { RevisedRichTextToolbar } from "../Toolbar/RevisedRichTextToolbar";
import { PrepopulateHTMLPlugin } from "../Plugins/PrepopulateHTMLPlugin";
import { ExtractedHTMLTitle } from "@/components/ExtractedHTMLTitle";
import { useNavigate } from "react-router-dom";
// import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
// import { SimpleRichTextToolbar } from "../../Toolbar/SimpleRichTextToolbar";
// import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";

interface Props {
  initialConfig: InitialConfigType;
  progress_report_prepopulation_data: string;
  shouldAlternatePicture: boolean;
  isEditing: boolean;
  project: IProjectData;
  // editorRef: React.MutableRefObject<any>;
  // context_prepopulation_data?: string;
  // aims_prepopulation_data?: string;
  // management_implications_prepopulation_data?: string;
  // future_directions_prepopulation_data?: string;

  // project_pk: number;
  // document_pk: number;
  // writeable_document_pk?: number | null;
  // isEditorOpen: boolean;
  // setIsEditorOpen: React.Dispatch<React.SetStateAction<boolean>>;
  //   displayData: string;
  //   setDisplayData: React.Dispatch<React.SetStateAction<string>>;

  // editorText: string;
  // setEditorText: React.Dispatch<React.SetStateAction<string>>;
}

export const ARProgressReportEditor = ({
  initialConfig,
  progress_report_prepopulation_data,
  shouldAlternatePicture,
  isEditing,
  project,
  // editorRef,
  // context_prepopulation_data,
  // aims_prepopulation_data,
  // management_implications_prepopulation_data,
  // future_directions_prepopulation_data,
  // project_pk,
  // document_pk,
  // writeable_document_pk,
  // isEditorOpen,
  // setIsEditorOpen,
  // //    editorText,
  // // setEditorText,
}:
  Props) => {
  const dragBtnMargin = 10;
  const toolBarHeight = 45;
  const [floatingAnchorElem, setFloatingAnchorElem] =
    useState<HTMLDivElement | null>(null);
  const onRef = (_floatingAnchorElem: HTMLDivElement) => {
    if (_floatingAnchorElem !== null) {
      setFloatingAnchorElem(_floatingAnchorElem);
    }
  };

  // useEffect(() => {
  //   const editorInstance = editorRef.current;

  //   if (editorInstance) {
  //     // Perform operations on the Lexical editor instance
  //     const root = editorInstance.$getRoot();
  //     setEditorText(root.__cachedText);
  //   }
  // }, [editorRef, setEditorText]);

  const { colorMode } = useColorMode();

  const navigate = useNavigate();

  return (
    <>
      <Center pb={4} roundedTop={20}>
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
                        `/projects/${project?.pk}/student`
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
                        Team Members:{" "}
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
                        `/projects/${project?.pk}/student`
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
                        Team Members:{" "}
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
          <LexicalComposer initialConfig={initialConfig}>
            {/* Plugins*/}
            <TablePlugin hasCellMerge={true} hasCellBackgroundColor={false} />
            <HistoryPlugin />
            <ListPlugin />

            <OnChangePlugin
              onChange={(editorState, editor) => {
                editorState.read(() => {
                  const root = $getRoot();

                  // setEditorText(root.__cachedText);
                  const newHtml = $generateHtmlFromNodes(editor, null);
                  // setDisplayData(newHtml);
                });
              }}
            />
            {/* {data !== undefined && data !== null && ( */}
            <PrepopulateHTMLPlugin data={progress_report_prepopulation_data} />
            {/* )} */}
            <CustomPastePlugin />

            {/* Text Area */}
            <RichTextPlugin
              contentEditable={
                <Box
                // mr={3}
                >
                  {/* Toolbar */}
                  {/* <RevisedRichTextToolbar /> */}
                  <Text fontWeight={"bold"} fontSize={"lg"} px={8} mt={2} ml={3}>
                    Progress Report
                  </Text>

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
                  {`Enter text...`}
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

            <TabIndentationPlugin />
            <ListMaxIndentLevelPlugin maxDepth={3} />

            <FloatingToolbarPlugin anchorElem={floatingAnchorElem} />

            <AutoFocusPlugin />
          </LexicalComposer>
        </Box>
      </Center>
    </>
  );
};
