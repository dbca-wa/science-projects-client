import { ExtractedHTMLTitle } from "@/components/ExtractedHTMLTitle";
import {
  ISaveProgressReportSection,
  updateProgressReportSection,
} from "@/lib/api";
import { IProjectData, IProjectMember } from "@/types";
import {
  Box,
  Button,
  Flex,
  Icon,
  Image,
  Text,
  ToastId,
  useColorMode,
  useToast,
} from "@chakra-ui/react";
import { $generateHtmlFromNodes } from "@lexical/html";
import { AutoFocusPlugin } from "@lexical/react/LexicalAutoFocusPlugin";
import {
  InitialConfigType,
  LexicalComposer,
} from "@lexical/react/LexicalComposer";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import LexicalErrorBoundary from "@lexical/react/LexicalErrorBoundary";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { TabIndentationPlugin } from "@lexical/react/LexicalTabIndentationPlugin";
import { TablePlugin } from "@lexical/react/LexicalTablePlugin";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { $getRoot } from "lexical";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { AiFillEdit, AiFillEyeInvisible } from "react-icons/ai";
import { FaSave } from "react-icons/fa";
import { CustomPastePlugin } from "../Plugins/CustomPastePlugin";
import ListMaxIndentLevelPlugin from "../Plugins/ListMaxIndentLevelPlugin";
import { PrepopulateHTMLPlugin } from "../Plugins/PrepopulateHTMLPlugin";
import { RevisedRichTextToolbar } from "../Toolbar/RevisedRichTextToolbar";
import { IProgressReportDisplayData } from "./ARProgressReportHandler";

interface IPREditorProps {
  // isEditing: boolean;
  // setIsEditing: React.Dispatch<React.SetStateAction<boolean>>;

  isEditingContext: boolean;
  setIsEditingContext: React.Dispatch<React.SetStateAction<boolean>>;
  isEditingAims: boolean;
  setIsEditingAims: React.Dispatch<React.SetStateAction<boolean>>;
  isEditingProgress: boolean;
  setIsEditingProgress: React.Dispatch<React.SetStateAction<boolean>>;
  isEditingImplications: boolean;
  setIsEditingImplications: React.Dispatch<React.SetStateAction<boolean>>;
  isEditingFuture: boolean;
  setIsEditingFuture: React.Dispatch<React.SetStateAction<boolean>>;

  canEdit: boolean;
  shouldAlternatePicture: boolean;
  fullPRData: IProgressReportDisplayData;

  editableInitialConfig: InitialConfigType;
  uneditableInitialConfig: InitialConfigType;

  contextDisplayData: string;
  setContextDisplayData: React.Dispatch<React.SetStateAction<string>>;

  aimsDisplayData: string;
  setAimsDisplayData: React.Dispatch<React.SetStateAction<string>>;

  progressReportDisplayData: string;
  setProgressReportDisplayData: React.Dispatch<React.SetStateAction<string>>;

  managementImplicationsDisplayData: string;
  setManagementImplicationsDisplayData: React.Dispatch<
    React.SetStateAction<string>
  >;

  futureDirectionsDisplayData: string;
  setFutureDirectionsDisplayData: React.Dispatch<React.SetStateAction<string>>;

  // key: string;
}

interface IPRProjDetails {
  project: IProjectData;
  team_members: IProjectMember[];
}
const PRProjDetails = ({ project, team_members }: IPRProjDetails) => {
  const getOrderedTeam = (teamMembers) => {
    return Array.from(teamMembers)
      .sort((a: IProjectMember, b: IProjectMember) => {
        // Prioritize members with is_leader = true
        if (a.is_leader && !b.is_leader) {
          return -1;
        } else if (!a.is_leader && b.is_leader) {
          return 1;
        } else {
          // If both have the same is_leader status, sort by position
          return a.position - b.position;
        }
      })
      .map(
        (member: IProjectMember) =>
          `${member.user.first_name} ${member.user.last_name}`
      );
  };

  const orderedTeam = getOrderedTeam(team_members);

  return (
    <Box py={3}>
      <Flex mb={0.5} flexWrap={"wrap"}>
        <Text fontWeight={"semibold"} mr={1}>
          Tag:{" "}
        </Text>
        <Text>{`STP-${project?.year}-${project?.number}`}</Text>
      </Flex>
      <Flex mb={0.5} flexWrap={"wrap"}>
        <Text fontWeight={"semibold"} mr={1}>
          Scientists:{" "}
        </Text>
        <Text>{orderedTeam.join(", ")}</Text>
      </Flex>
    </Box>
  );
};

export const PREditor = ({
  shouldAlternatePicture,
  fullPRData,
  editableInitialConfig,
  uneditableInitialConfig,
  canEdit,
  isEditingContext,
  setIsEditingContext,
  isEditingAims,
  setIsEditingAims,
  isEditingProgress,
  setIsEditingProgress,
  isEditingImplications,
  setIsEditingImplications,
  isEditingFuture,
  setIsEditingFuture,
  aimsDisplayData,
  progressReportDisplayData,
  managementImplicationsDisplayData,
  futureDirectionsDisplayData,
  contextDisplayData,
  setAimsDisplayData,
  setProgressReportDisplayData,
  setManagementImplicationsDisplayData,
  setFutureDirectionsDisplayData,
  setContextDisplayData,
  // key
}: IPREditorProps) => {
  const navigate = useNavigate();
  const { colorMode } = useColorMode();

  // const editorInstance = useLexicalComposerContext();

  // useEffect(() => {

  //     if (editorInstance) {
  //       // Perform operations on the Lexical editor instance
  //       const root = editorInstance.$getRoot();
  //       setEditorText(root.__cachedText);
  //     }
  //   }, [editorRef, setEditorText]);

  const dragBtnMargin = 10;
  const toolBarHeight = 45;
  const [aboveHeightSet, setAboveHeightSet] = useState<boolean>(false);
  const [aboveContentHeight, setAboveContentHeight] = useState<number>();

  // const [htmlData, setHtmlData] = useState(fullSRData?.progress_report);

  // Mouse Over and Out each editor
  const [isHoveredContext, setIsHoveredContext] = useState(false);
  const [isHoveredAims, setIsHoveredAims] = useState(false);
  const [isHoveredProgress, setIsHoveredProgress] = useState(false);
  const [isHoveredImplications, setIsHoveredImplications] = useState(false);
  const [isHoveredFuture, setIsHoveredFuture] = useState(false);

  const onMouseOverContext = () => {
    if (!isHoveredContext) {
      setIsHoveredContext(true);
    }
  };

  const onMouseOutContext = () => {
    if (isHoveredContext) {
      setIsHoveredContext(false);
    }
  };

  const onMouseOverAims = () => {
    if (!isHoveredAims) {
      setIsHoveredAims(true);
    }
  };

  const onMouseOutAims = () => {
    if (isHoveredAims) {
      setIsHoveredAims(false);
    }
  };
  const onMouseOverProgress = () => {
    if (!isHoveredProgress) {
      setIsHoveredProgress(true);
    }
  };

  const onMouseOutProgress = () => {
    if (isHoveredProgress) {
      setIsHoveredProgress(false);
    }
  };
  const onMouseOverImplications = () => {
    if (!isHoveredImplications) {
      setIsHoveredImplications(true);
    }
  };

  const onMouseOutImplications = () => {
    if (isHoveredImplications) {
      setIsHoveredImplications(false);
    }
  };
  const onMouseOverFuture = () => {
    if (!isHoveredFuture) {
      setIsHoveredFuture(true);
    }
  };

  const onMouseOutFuture = () => {
    if (isHoveredFuture) {
      setIsHoveredFuture(false);
    }
  };

  // useEffect(() => {
  //     setAboveHeightSet(false);
  //     const calculateAboveContentHeight = () => {
  //         const aboveContentElement = document.getElementById(`topContent_${fullPRData?.project?.pk}`);

  //         if (aboveContentElement) {
  //             const rect = aboveContentElement.getBoundingClientRect();
  //             const contentAboveHeight = rect.bottom - rect.top;
  //             setAboveContentHeight(contentAboveHeight);
  //         }
  //     };

  //     // Call the function initially
  //     calculateAboveContentHeight();

  //     // Attach resize event listener to recalculate height when the window is resized
  //     window.addEventListener('resize', calculateAboveContentHeight);
  //     setAboveHeightSet(true);

  //     // Cleanup event listener on component unmount
  //     return () => {
  //         window.removeEventListener('resize', calculateAboveContentHeight);
  //     };
  // }, [displayData, isEditing, fullPRData?.project?.pk, initialConfig]);

  const queryClient = useQueryClient();
  const { register, handleSubmit, reset } =
    useForm<ISaveProgressReportSection>();
  const toast = useToast();
  const toastIdRef = useRef<ToastId>();
  const addToast = (data) => {
    toastIdRef.current = toast(data);
  };

  const saveMutation = useMutation({
    mutationFn: updateProgressReportSection,
    onMutate: () => {
      addToast({
        status: "loading",
        title: "Updating Progress Report",
        position: "top-right",
      });
    },
    onSuccess: () => {
      if (toastIdRef.current) {
        toast.update(toastIdRef.current, {
          title: "Success",
          description: `Progress Report Updated`,
          status: "success",
          position: "top-right",
          duration: 3000,
          isClosable: true,
        });
      }
      // reset();

      // setTimeout(() => {
      //   queryClient.invalidateQueries(["mytasks"]);
      // }, 350);
    },
    onError: (error) => {
      if (toastIdRef.current) {
        toast.update(toastIdRef.current, {
          title: "Could Not Update Progress Report",
          description: `${error}`,
          status: "error",
          position: "top-right",
          duration: 3000,
          isClosable: true,
        });
      }
    },
  });

  const onSave = (formData: ISaveProgressReportSection) => {
    const section = formData.section;

    saveMutation.mutate(formData);
    if (section === "context") {
      setIsEditingContext(false);
    } else if (section === "aims") {
      setIsEditingAims(false);
    } else if (section === "progress") {
      setIsEditingProgress(false);
    } else if (section === "implications") {
      setIsEditingImplications(false);
    } else if (section === "future") {
      setIsEditingFuture(false);
    }
  };

  const [initialConfigFuture, setInitialConfigFuture] =
    useState<InitialConfigType>(uneditableInitialConfig);
  const [initialConfigImplications, setInitialConfigImplications] =
    useState<InitialConfigType>(uneditableInitialConfig);
  const [initialConfigProgress, setInitialConfigProgress] =
    useState<InitialConfigType>(uneditableInitialConfig);
  const [initialConfigAims, setInitialConfigAims] = useState<InitialConfigType>(
    uneditableInitialConfig
  );
  const [initialConfigContext, setInitialConfigContext] =
    useState<InitialConfigType>(uneditableInitialConfig);

  useEffect(() => {
    if (isEditingContext) {
      if (initialConfigContext.editable === false) {
        setInitialConfigContext(editableInitialConfig);
      }
    } else {
      if (initialConfigContext.editable === true) {
        setInitialConfigContext(uneditableInitialConfig);
      }
    }
  }, [
    initialConfigContext,
    isEditingContext,
    editableInitialConfig,
    uneditableInitialConfig,
  ]);

  useEffect(() => {
    if (isEditingAims) {
      if (initialConfigAims.editable === false) {
        setInitialConfigAims(editableInitialConfig);
      }
    } else {
      if (initialConfigAims.editable === true) {
        setInitialConfigAims(uneditableInitialConfig);
      }
    }
  }, [
    initialConfigAims,
    isEditingAims,
    editableInitialConfig,
    uneditableInitialConfig,
  ]);

  useEffect(() => {
    if (isEditingProgress) {
      if (initialConfigProgress.editable === false) {
        setInitialConfigProgress(editableInitialConfig);
      }
    } else {
      if (initialConfigProgress.editable === true) {
        setInitialConfigProgress(uneditableInitialConfig);
      }
    }
  }, [
    initialConfigProgress,
    isEditingProgress,
    editableInitialConfig,
    uneditableInitialConfig,
  ]);

  useEffect(() => {
    if (initialConfigFuture.editable === false) {
      if (isEditingFuture) {
        setInitialConfigFuture(editableInitialConfig);
      }
    } else if (initialConfigFuture.editable === true) {
      if (!isEditingFuture) {
        setInitialConfigFuture(uneditableInitialConfig);
      }
    }
  }, [
    initialConfigFuture,
    isEditingFuture,
    editableInitialConfig,
    uneditableInitialConfig,
  ]);

  useEffect(() => {
    if (initialConfigImplications.editable === false) {
      if (isEditingImplications) {
        setInitialConfigImplications(editableInitialConfig);
      }
    } else if (initialConfigImplications.editable === true) {
      if (!isEditingImplications) {
        setInitialConfigImplications(uneditableInitialConfig);
      }
    }
  }, [
    initialConfigImplications,
    isEditingImplications,
    editableInitialConfig,
    uneditableInitialConfig,
  ]);

  return (
    <>
      {/* setIsEditing */}

      <Box
        mx={4}
        pos={"relative"}
        roundedBottom={20}
        roundedTop={20}
        mb={4}
        boxShadow={
          "0 8px 24px rgba(0, 0, 0, 0.1), 0 2px 8px rgba(0, 0, 0, 0.1)"
        }
        bg={colorMode === "light" ? "whiteAlpha.600" : "blackAlpha.500"}
      >
        <Flex
          id={`topContent_${fullPRData?.document?.project?.pk}`}
          pt={6}
          mx={8}
        >
          {!shouldAlternatePicture ? (
            <>
              <Box rounded={"md"} overflow={"hidden"} w={"276px"} h={"200px"}>
                <Image
                  src={fullPRData?.document?.project?.image?.file}
                  w={"100%"}
                  h={"100%"}
                  objectFit={"cover"}
                />
              </Box>
              <Box ml={4} flex={1}>
                <Box
                  cursor={"pointer"}
                  onClick={() =>
                    navigate({
                      to: `/projects/${fullPRData?.document?.project?.pk}/progress`,
                    })
                  }
                >
                  <ExtractedHTMLTitle
                    htmlContent={fullPRData?.document?.project?.title}
                    color={"blue.500"}
                    fontWeight={"bold"}
                    fontSize={"17px"}
                    // fontSize={"xs"}
                    noOfLines={4}
                  />
                </Box>

                <PRProjDetails
                  project={fullPRData?.document?.project}
                  team_members={fullPRData?.team_members}
                />
              </Box>
            </>
          ) : (
            <>
              <Box mr={4} flex={1}>
                <Box
                  cursor={"pointer"}
                  onClick={() =>
                    navigate({
                      to: `/projects/${fullPRData?.document?.project?.pk}/progress`,
                    })
                  }
                >
                  <ExtractedHTMLTitle
                    htmlContent={fullPRData?.document?.project?.title}
                    color={"blue.500"}
                    fontWeight={"bold"}
                    fontSize={"17px"}
                    // fontSize={"xs"}
                    noOfLines={4}
                  />
                </Box>

                <PRProjDetails
                  project={fullPRData?.document?.project}
                  team_members={fullPRData?.team_members}
                />
              </Box>
              <Box rounded={"md"} overflow={"hidden"} w={"276px"} h={"200px"}>
                <Image
                  src={fullPRData?.document?.project?.image?.file}
                  w={"100%"}
                  h={"100%"}
                  objectFit={"cover"}
                />
              </Box>
            </>
          )}
        </Flex>
        {/* Context */}
        <LexicalComposer
          key={`context-${initialConfigContext.editable}`}
          initialConfig={initialConfigContext}
        >
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
                // setHtmlData(newHtml);
                setContextDisplayData(newHtml);
              });
            }}
          />
          {/* {data !== undefined && data !== null && ( */}
          <PrepopulateHTMLPlugin data={contextDisplayData} />
          {/* )} */}
          <CustomPastePlugin />

          {/* Text Area */}
          <RichTextPlugin
            placeholder={<Text></Text>}
            contentEditable={
              <Box
                mt={4}
                onMouseOver={onMouseOverContext}
                onMouseLeave={onMouseOutContext}
                // bg={"red"}
              >
                {/* Toolbar */}
                {isEditingContext === false ? null : <RevisedRichTextToolbar />}

                <Box pos={"relative"}>
                  <Text
                    fontWeight={"bold"}
                    fontSize={"lg"}
                    px={8}
                    ml={"2px"}
                    mt={4}
                    // userSelect={"none"}
                  >
                    Context
                  </Text>

                  {isEditingContext === true ? (
                    <Box pos={"absolute"} right={10} top={0}>
                      <Flex flexDir={"row"}>
                        <Button
                          bg={colorMode === "light" ? `green.500` : `green.600`}
                          color={
                            colorMode === "light"
                              ? "whiteAlpha.900"
                              : "whiteAlpha.800"
                          }
                          _hover={
                            colorMode === "light"
                              ? {
                                  bg: `green.600`,
                                  color: `white`,
                                }
                              : {
                                  bg: `green.500`,
                                  color: `white`,
                                }
                          }
                          minW={"32px"}
                          minH={"32px"}
                          maxW={"32px"}
                          maxH={"32px"}
                          rounded={"full"}
                          data-tip="Click to Save"
                          onClick={() =>
                            onSave({
                              mainDocumentId: fullPRData?.document?.pk,
                              section: "context",
                              htmlData: contextDisplayData,
                            })
                          }
                        >
                          <Icon as={FaSave} />
                        </Button>

                        <Button
                          ml={2}
                          bg={colorMode === "light" ? `gray.500` : `gray.600`}
                          color={
                            colorMode === "light"
                              ? "whiteAlpha.900"
                              : "whiteAlpha.800"
                          }
                          _hover={
                            colorMode === "light"
                              ? {
                                  bg: `gray.600`,
                                  color: `white`,
                                }
                              : {
                                  bg: `gray.500`,
                                  color: `white`,
                                }
                          }
                          minW={"32px"}
                          minH={"32px"}
                          maxW={"32px"}
                          maxH={"32px"}
                          rounded={"full"}
                          data-tip="Click to Save"
                          onClick={() => setIsEditingContext(false)}
                        >
                          <Icon as={AiFillEyeInvisible} />
                        </Button>
                      </Flex>
                    </Box>
                  ) : isHoveredContext ? (
                    <Box pos={"absolute"} right={10} top={0}>
                      <Button
                        ml={2}
                        bg={colorMode === "light" ? `gray.500` : `gray.600`}
                        color={
                          colorMode === "light"
                            ? "whiteAlpha.900"
                            : "whiteAlpha.800"
                        }
                        _hover={
                          colorMode === "light"
                            ? {
                                bg: `gray.600`,
                                color: `white`,
                              }
                            : {
                                bg: `gray.500`,
                                color: `white`,
                              }
                        }
                        minW={"32px"}
                        minH={"32px"}
                        maxW={"32px"}
                        maxH={"32px"}
                        rounded={"full"}
                        data-tip="Click to Save"
                        onClick={() => setIsEditingContext(true)}
                      >
                        <Icon as={AiFillEdit} />
                      </Button>
                    </Box>
                  ) : null}
                </Box>

                <Box mt={"-15px"} className="editor-scroller">
                  <Box
                    //   className="editor"
                    //   ref={onRef}
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
                        //   borderRadius: "0 0 25px 25px",
                        outline: "none",
                        marginLeft: -8,
                      }}

                      // autoFocus
                    />
                  </Box>
                </Box>
                {/* <Box>Editor: {editorText}</Box> */}
              </Box>
            }
            // placeholder={
            //     isEditing ?
            //         <Box
            //             style={{
            //                 position: "absolute",
            //                 left: `${24 + dragBtnMargin}px`,
            //                 top: `${75 + aboveContentHeight + toolBarHeight}px`,
            //                 userSelect: "none",
            //                 pointerEvents: "none",
            //                 color: "gray",
            //             }}
            //         >
            //             {`Enter text...`}
            //         </Box>
            //         : null
            // }
            ErrorBoundary={LexicalErrorBoundary}
          />

          <TabIndentationPlugin />
          <ListMaxIndentLevelPlugin maxDepth={3} />
          <AutoFocusPlugin />
        </LexicalComposer>

        {/* Aims */}
        <LexicalComposer
          key={`aims-${initialConfigAims.editable}`}
          initialConfig={initialConfigAims}
        >
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
                // setHtmlData(newHtml);
                setAimsDisplayData(newHtml);
              });
            }}
          />
          {/* {data !== undefined && data !== null && ( */}
          <PrepopulateHTMLPlugin data={aimsDisplayData} />
          {/* )} */}
          <CustomPastePlugin />

          {/* Text Area */}
          <RichTextPlugin
            placeholder={<Text></Text>}
            contentEditable={
              <Box
                mt={4}
                onMouseOver={onMouseOverAims}
                onMouseLeave={onMouseOutAims}
                // bg={"red"}
              >
                {/* Toolbar */}
                {isEditingAims === false ? null : <RevisedRichTextToolbar />}

                <Box pos={"relative"}>
                  <Text
                    fontWeight={"bold"}
                    fontSize={"lg"}
                    px={8}
                    ml={"2px"}
                    mt={4}
                    // userSelect={"none"}
                  >
                    Aims
                  </Text>

                  {isEditingAims === true ? (
                    <Box pos={"absolute"} right={10} top={0}>
                      <Flex flexDir={"row"}>
                        <Button
                          bg={colorMode === "light" ? `green.500` : `green.600`}
                          color={
                            colorMode === "light"
                              ? "whiteAlpha.900"
                              : "whiteAlpha.800"
                          }
                          _hover={
                            colorMode === "light"
                              ? {
                                  bg: `green.600`,
                                  color: `white`,
                                }
                              : {
                                  bg: `green.500`,
                                  color: `white`,
                                }
                          }
                          minW={"32px"}
                          minH={"32px"}
                          maxW={"32px"}
                          maxH={"32px"}
                          rounded={"full"}
                          data-tip="Click to Save"
                          onClick={() =>
                            onSave({
                              mainDocumentId: fullPRData?.document?.pk,
                              section: "aims",
                              htmlData: aimsDisplayData,
                            })
                          }
                        >
                          <Icon as={FaSave} />
                        </Button>

                        <Button
                          ml={2}
                          bg={colorMode === "light" ? `gray.500` : `gray.600`}
                          color={
                            colorMode === "light"
                              ? "whiteAlpha.900"
                              : "whiteAlpha.800"
                          }
                          _hover={
                            colorMode === "light"
                              ? {
                                  bg: `gray.600`,
                                  color: `white`,
                                }
                              : {
                                  bg: `gray.500`,
                                  color: `white`,
                                }
                          }
                          minW={"32px"}
                          minH={"32px"}
                          maxW={"32px"}
                          maxH={"32px"}
                          rounded={"full"}
                          data-tip="Click to Save"
                          onClick={() => setIsEditingAims(false)}
                        >
                          <Icon as={AiFillEyeInvisible} />
                        </Button>
                      </Flex>
                    </Box>
                  ) : isHoveredAims ? (
                    <Box pos={"absolute"} right={10} top={0}>
                      <Button
                        ml={2}
                        bg={colorMode === "light" ? `gray.500` : `gray.600`}
                        color={
                          colorMode === "light"
                            ? "whiteAlpha.900"
                            : "whiteAlpha.800"
                        }
                        _hover={
                          colorMode === "light"
                            ? {
                                bg: `gray.600`,
                                color: `white`,
                              }
                            : {
                                bg: `gray.500`,
                                color: `white`,
                              }
                        }
                        minW={"32px"}
                        minH={"32px"}
                        maxW={"32px"}
                        maxH={"32px"}
                        rounded={"full"}
                        data-tip="Click to Save"
                        onClick={() => setIsEditingAims(true)}
                      >
                        <Icon as={AiFillEdit} />
                      </Button>
                    </Box>
                  ) : null}
                </Box>

                <Box mt={"-15px"} className="editor-scroller">
                  <Box
                    //   className="editor"
                    //   ref={onRef}
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
                        //   borderRadius: "0 0 25px 25px",
                        outline: "none",
                        marginLeft: -8,
                      }}

                      // autoFocus
                    />
                  </Box>
                </Box>
                {/* <Box>Editor: {editorText}</Box> */}
              </Box>
            }
            // placeholder={
            //     isEditing ?
            //         <Box
            //             style={{
            //                 position: "absolute",
            //                 left: `${24 + dragBtnMargin}px`,
            //                 top: `${75 + aboveContentHeight + toolBarHeight}px`,
            //                 userSelect: "none",
            //                 pointerEvents: "none",
            //                 color: "gray",
            //             }}
            //         >
            //             {`Enter text...`}
            //         </Box>
            //         : null
            // }
            ErrorBoundary={LexicalErrorBoundary}
          />

          <TabIndentationPlugin />
          <ListMaxIndentLevelPlugin maxDepth={3} />
          <AutoFocusPlugin />
        </LexicalComposer>

        {/* Progress */}
        <LexicalComposer
          key={`progress-${initialConfigProgress.editable}`}
          initialConfig={initialConfigProgress}
        >
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
                // setHtmlData(newHtml);
                setProgressReportDisplayData(newHtml);
              });
            }}
          />
          {/* {data !== undefined && data !== null && ( */}
          <PrepopulateHTMLPlugin data={progressReportDisplayData} />
          {/* )} */}
          <CustomPastePlugin />

          {/* Text Area */}
          <RichTextPlugin
            placeholder={<Text></Text>}
            contentEditable={
              <Box
                mt={4}
                onMouseOver={onMouseOverProgress}
                onMouseLeave={onMouseOutProgress}
                // bg={"red"}
              >
                {/* Toolbar */}
                {isEditingProgress === false ? null : (
                  <RevisedRichTextToolbar />
                )}

                <Box pos={"relative"}>
                  <Text
                    fontWeight={"bold"}
                    fontSize={"lg"}
                    px={8}
                    ml={"2px"}
                    mt={4}
                    // userSelect={"none"}
                  >
                    Progress
                  </Text>

                  {isEditingProgress === true ? (
                    <Box pos={"absolute"} right={10} top={0}>
                      <Flex flexDir={"row"}>
                        <Button
                          bg={colorMode === "light" ? `green.500` : `green.600`}
                          color={
                            colorMode === "light"
                              ? "whiteAlpha.900"
                              : "whiteAlpha.800"
                          }
                          _hover={
                            colorMode === "light"
                              ? {
                                  bg: `green.600`,
                                  color: `white`,
                                }
                              : {
                                  bg: `green.500`,
                                  color: `white`,
                                }
                          }
                          minW={"32px"}
                          minH={"32px"}
                          maxW={"32px"}
                          maxH={"32px"}
                          rounded={"full"}
                          data-tip="Click to Save"
                          onClick={() =>
                            onSave({
                              mainDocumentId: fullPRData?.document?.pk,
                              section: "progress",
                              htmlData: progressReportDisplayData,
                            })
                          }
                        >
                          <Icon as={FaSave} />
                        </Button>

                        <Button
                          ml={2}
                          bg={colorMode === "light" ? `gray.500` : `gray.600`}
                          color={
                            colorMode === "light"
                              ? "whiteAlpha.900"
                              : "whiteAlpha.800"
                          }
                          _hover={
                            colorMode === "light"
                              ? {
                                  bg: `gray.600`,
                                  color: `white`,
                                }
                              : {
                                  bg: `gray.500`,
                                  color: `white`,
                                }
                          }
                          minW={"32px"}
                          minH={"32px"}
                          maxW={"32px"}
                          maxH={"32px"}
                          rounded={"full"}
                          data-tip="Click to Save"
                          onClick={() => setIsEditingProgress(false)}
                        >
                          <Icon as={AiFillEyeInvisible} />
                        </Button>
                      </Flex>
                    </Box>
                  ) : isHoveredProgress ? (
                    <Box pos={"absolute"} right={10} top={0}>
                      <Button
                        ml={2}
                        bg={colorMode === "light" ? `gray.500` : `gray.600`}
                        color={
                          colorMode === "light"
                            ? "whiteAlpha.900"
                            : "whiteAlpha.800"
                        }
                        _hover={
                          colorMode === "light"
                            ? {
                                bg: `gray.600`,
                                color: `white`,
                              }
                            : {
                                bg: `gray.500`,
                                color: `white`,
                              }
                        }
                        minW={"32px"}
                        minH={"32px"}
                        maxW={"32px"}
                        maxH={"32px"}
                        rounded={"full"}
                        data-tip="Click to Save"
                        onClick={() => setIsEditingProgress(true)}
                      >
                        <Icon as={AiFillEdit} />
                      </Button>
                    </Box>
                  ) : null}
                </Box>

                <Box mt={"-15px"} className="editor-scroller">
                  <Box
                    //   className="editor"
                    //   ref={onRef}
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
                        //   borderRadius: "0 0 25px 25px",
                        outline: "none",
                        marginLeft: -8,
                      }}

                      // autoFocus
                    />
                  </Box>
                </Box>
                {/* <Box>Editor: {editorText}</Box> */}
              </Box>
            }
            // placeholder={
            //     isEditing ?
            //         <Box
            //             style={{
            //                 position: "absolute",
            //                 left: `${24 + dragBtnMargin}px`,
            //                 top: `${75 + aboveContentHeight + toolBarHeight}px`,
            //                 userSelect: "none",
            //                 pointerEvents: "none",
            //                 color: "gray",
            //             }}
            //         >
            //             {`Enter text...`}
            //         </Box>
            //         : null
            // }
            ErrorBoundary={LexicalErrorBoundary}
          />

          <TabIndentationPlugin />
          <ListMaxIndentLevelPlugin maxDepth={3} />
          <AutoFocusPlugin />
        </LexicalComposer>

        {/* Management Implications */}
        <LexicalComposer
          key={`implications-${initialConfigImplications.editable}`}
          initialConfig={initialConfigImplications}
        >
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
                // setHtmlData(newHtml);
                setManagementImplicationsDisplayData(newHtml);
              });
            }}
          />
          {/* {data !== undefined && data !== null && ( */}
          <PrepopulateHTMLPlugin data={managementImplicationsDisplayData} />
          {/* )} */}
          <CustomPastePlugin />

          {/* Text Area */}
          <RichTextPlugin
            placeholder={<Text></Text>}
            contentEditable={
              <Box
                mt={4}
                onMouseOver={onMouseOverImplications}
                onMouseLeave={onMouseOutImplications}
                // bg={"red"}
              >
                {/* Toolbar */}
                {isEditingImplications === false ? null : (
                  <RevisedRichTextToolbar />
                )}

                <Box pos={"relative"}>
                  <Text
                    fontWeight={"bold"}
                    fontSize={"lg"}
                    px={8}
                    ml={"2px"}
                    mt={4}
                    // userSelect={"none"}
                  >
                    Management Implications
                  </Text>

                  {isEditingImplications === true ? (
                    <Box pos={"absolute"} right={10} top={0}>
                      <Flex flexDir={"row"}>
                        <Button
                          bg={colorMode === "light" ? `green.500` : `green.600`}
                          color={
                            colorMode === "light"
                              ? "whiteAlpha.900"
                              : "whiteAlpha.800"
                          }
                          _hover={
                            colorMode === "light"
                              ? {
                                  bg: `green.600`,
                                  color: `white`,
                                }
                              : {
                                  bg: `green.500`,
                                  color: `white`,
                                }
                          }
                          minW={"32px"}
                          minH={"32px"}
                          maxW={"32px"}
                          maxH={"32px"}
                          rounded={"full"}
                          data-tip="Click to Save"
                          onClick={() =>
                            onSave({
                              mainDocumentId: fullPRData?.document?.pk,
                              section: "implications",
                              htmlData: managementImplicationsDisplayData,
                            })
                          }
                        >
                          <Icon as={FaSave} />
                        </Button>

                        <Button
                          ml={2}
                          bg={colorMode === "light" ? `gray.500` : `gray.600`}
                          color={
                            colorMode === "light"
                              ? "whiteAlpha.900"
                              : "whiteAlpha.800"
                          }
                          _hover={
                            colorMode === "light"
                              ? {
                                  bg: `gray.600`,
                                  color: `white`,
                                }
                              : {
                                  bg: `gray.500`,
                                  color: `white`,
                                }
                          }
                          minW={"32px"}
                          minH={"32px"}
                          maxW={"32px"}
                          maxH={"32px"}
                          rounded={"full"}
                          data-tip="Click to Save"
                          onClick={() => setIsEditingImplications(false)}
                        >
                          <Icon as={AiFillEyeInvisible} />
                        </Button>
                      </Flex>
                    </Box>
                  ) : isHoveredImplications ? (
                    <Box pos={"absolute"} right={10} top={0}>
                      <Button
                        ml={2}
                        bg={colorMode === "light" ? `gray.500` : `gray.600`}
                        color={
                          colorMode === "light"
                            ? "whiteAlpha.900"
                            : "whiteAlpha.800"
                        }
                        _hover={
                          colorMode === "light"
                            ? {
                                bg: `gray.600`,
                                color: `white`,
                              }
                            : {
                                bg: `gray.500`,
                                color: `white`,
                              }
                        }
                        minW={"32px"}
                        minH={"32px"}
                        maxW={"32px"}
                        maxH={"32px"}
                        rounded={"full"}
                        data-tip="Click to Save"
                        onClick={() => setIsEditingImplications(true)}
                      >
                        <Icon as={AiFillEdit} />
                      </Button>
                    </Box>
                  ) : null}
                </Box>

                <Box mt={"-15px"} className="editor-scroller">
                  <Box
                    //   className="editor"
                    //   ref={onRef}
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
                        //   borderRadius: "0 0 25px 25px",
                        outline: "none",
                        marginLeft: -8,
                      }}

                      // autoFocus
                    />
                  </Box>
                </Box>
                {/* <Box>Editor: {editorText}</Box> */}
              </Box>
            }
            // placeholder={
            //     isEditing ?
            //         <Box
            //             style={{
            //                 position: "absolute",
            //                 left: `${24 + dragBtnMargin}px`,
            //                 top: `${75 + aboveContentHeight + toolBarHeight}px`,
            //                 userSelect: "none",
            //                 pointerEvents: "none",
            //                 color: "gray",
            //             }}
            //         >
            //             {`Enter text...`}
            //         </Box>
            //         : null
            // }
            ErrorBoundary={LexicalErrorBoundary}
          />

          <TabIndentationPlugin />
          <ListMaxIndentLevelPlugin maxDepth={3} />
          <AutoFocusPlugin />
        </LexicalComposer>

        {/* Future Directions */}
        <LexicalComposer
          key={`future-${initialConfigFuture.editable}`}
          initialConfig={initialConfigFuture}
        >
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
                // setHtmlData(newHtml);
                setFutureDirectionsDisplayData(newHtml);
              });
            }}
          />
          {/* {data !== undefined && data !== null && ( */}
          <PrepopulateHTMLPlugin data={futureDirectionsDisplayData} />
          {/* )} */}
          <CustomPastePlugin />

          {/* Text Area */}
          <RichTextPlugin
            placeholder={<Text></Text>}
            contentEditable={
              <Box
                mt={4}
                onMouseOver={onMouseOverFuture}
                onMouseLeave={onMouseOutFuture}
                // bg={"red"}
              >
                {/* Toolbar */}
                {isEditingFuture === false ? null : <RevisedRichTextToolbar />}

                <Box pos={"relative"}>
                  <Text
                    fontWeight={"bold"}
                    fontSize={"lg"}
                    px={8}
                    ml={"2px"}
                    mt={4}
                    // userSelect={"none"}
                  >
                    Future Directions
                  </Text>

                  {isEditingFuture === true ? (
                    <Box pos={"absolute"} right={10} top={0}>
                      <Flex flexDir={"row"}>
                        <Button
                          bg={colorMode === "light" ? `green.500` : `green.600`}
                          color={
                            colorMode === "light"
                              ? "whiteAlpha.900"
                              : "whiteAlpha.800"
                          }
                          _hover={
                            colorMode === "light"
                              ? {
                                  bg: `green.600`,
                                  color: `white`,
                                }
                              : {
                                  bg: `green.500`,
                                  color: `white`,
                                }
                          }
                          minW={"32px"}
                          minH={"32px"}
                          maxW={"32px"}
                          maxH={"32px"}
                          rounded={"full"}
                          data-tip="Click to Save"
                          onClick={() =>
                            onSave({
                              mainDocumentId: fullPRData?.document?.pk,
                              section: "future",
                              htmlData: futureDirectionsDisplayData,
                            })
                          }
                        >
                          <Icon as={FaSave} />
                        </Button>

                        <Button
                          ml={2}
                          bg={colorMode === "light" ? `gray.500` : `gray.600`}
                          color={
                            colorMode === "light"
                              ? "whiteAlpha.900"
                              : "whiteAlpha.800"
                          }
                          _hover={
                            colorMode === "light"
                              ? {
                                  bg: `gray.600`,
                                  color: `white`,
                                }
                              : {
                                  bg: `gray.500`,
                                  color: `white`,
                                }
                          }
                          minW={"32px"}
                          minH={"32px"}
                          maxW={"32px"}
                          maxH={"32px"}
                          rounded={"full"}
                          data-tip="Click to Save"
                          onClick={() => setIsEditingFuture(false)}
                        >
                          <Icon as={AiFillEyeInvisible} />
                        </Button>
                      </Flex>
                    </Box>
                  ) : isHoveredFuture ? (
                    <Box pos={"absolute"} right={10} top={0}>
                      <Button
                        ml={2}
                        bg={colorMode === "light" ? `gray.500` : `gray.600`}
                        color={
                          colorMode === "light"
                            ? "whiteAlpha.900"
                            : "whiteAlpha.800"
                        }
                        _hover={
                          colorMode === "light"
                            ? {
                                bg: `gray.600`,
                                color: `white`,
                              }
                            : {
                                bg: `gray.500`,
                                color: `white`,
                              }
                        }
                        minW={"32px"}
                        minH={"32px"}
                        maxW={"32px"}
                        maxH={"32px"}
                        rounded={"full"}
                        data-tip="Click to Save"
                        onClick={() => setIsEditingFuture(true)}
                      >
                        <Icon as={AiFillEdit} />
                      </Button>
                    </Box>
                  ) : null}
                </Box>

                <Box mt={"-15px"} className="editor-scroller">
                  <Box
                    //   className="editor"
                    //   ref={onRef}
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
                        //   borderRadius: "0 0 25px 25px",
                        outline: "none",
                        marginLeft: -8,
                      }}

                      // autoFocus
                    />
                  </Box>
                </Box>
                {/* <Box>Editor: {editorText}</Box> */}
              </Box>
            }
            // placeholder={
            //     isEditing ?
            //         <Box
            //             style={{
            //                 position: "absolute",
            //                 left: `${24 + dragBtnMargin}px`,
            //                 top: `${75 + aboveContentHeight + toolBarHeight}px`,
            //                 userSelect: "none",
            //                 pointerEvents: "none",
            //                 color: "gray",
            //             }}
            //         >
            //             {`Enter text...`}
            //         </Box>
            //         : null
            // }
            ErrorBoundary={LexicalErrorBoundary}
          />

          <TabIndentationPlugin />
          <ListMaxIndentLevelPlugin maxDepth={3} />
          <AutoFocusPlugin />
        </LexicalComposer>
      </Box>
    </>
  );
};
