import { ExtractedHTMLTitle } from "@/components/ExtractedHTMLTitle";
import { ISaveStudentReport, updateStudentReportProgress } from "@/lib/api";
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
  useDisclosure,
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
import { $getRoot } from "lexical";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { AiFillEdit, AiFillEyeInvisible } from "react-icons/ai";
import { FaSave, FaStamp, FaUndo } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { CustomPastePlugin } from "../Plugins/CustomPastePlugin";
import ListMaxIndentLevelPlugin from "../Plugins/ListMaxIndentLevelPlugin";
import { PrepopulateHTMLPlugin } from "../Plugins/PrepopulateHTMLPlugin";
import { RevisedRichTextToolbar } from "../Toolbar/RevisedRichTextToolbar";
import { IStudentReportDisplayData } from "./ARStudentReportHandler";
import { FcApproval } from "react-icons/fc";
import { MdApproval } from "react-icons/md";
import { TiTick } from "react-icons/ti";
import { ApproveProgressReportModal } from "@/components/Modals/RTEModals/ApproveProgressReportModal";
import { useNoImage } from "@/lib/hooks/helper/useNoImage";

interface ISREditorProps {
  isEditing: boolean;
  setIsEditing: React.Dispatch<React.SetStateAction<boolean>>;
  canEdit: boolean;
  shouldAlternatePicture: boolean;
  fullSRData: IStudentReportDisplayData;
  initialConfig: InitialConfigType;
  displayData: string;
  setDisplayData: React.Dispatch<React.SetStateAction<string>>;
  // key: string;
}

interface ISRProjDetails {
  project: IProjectData;
  team_members: IProjectMember[];
}
const SRProjDetails = ({ project, team_members }: ISRProjDetails) => {
  const getMembersByRole = (teamMembers, role) => {
    return Array.from(teamMembers)
      .filter((member: IProjectMember) => member.role === role)
      .map(
        (member: IProjectMember) =>
          `${member.user.first_name} ${member.user.last_name}`,
      );
  };

  const students = getMembersByRole(team_members, "student");
  const academicSupervisors = getMembersByRole(team_members, "academicsuper");
  const scientists = getMembersByRole(team_members, "supervising");

  return (
    <Box py={3}>
      <Flex mb={0.5} flexWrap={"wrap"}>
        <Text
          fontWeight={"semibold"}
          mr={1}
          color={
            project?.status === "completed" || project?.status === "terminated"
              ? "green.500"
              : project?.status === "updating"
                ? "red.500"
                : project?.status === "suspended"
                  ? "orange.500"
                  : undefined
          }
        >
          Status:{" "}
        </Text>
        <Text
          color={
            project?.status === "completed" || project?.status === "terminated"
              ? "green.500"
              : project?.status === "updating"
                ? "red.500"
                : project?.status === "suspended"
                  ? "orange.500"
                  : undefined
          }
        >
          {`${project?.status[0].toUpperCase()}${project?.status.slice(1)}`}
        </Text>
      </Flex>
      <Flex mb={0.5} flexWrap={"wrap"}>
        <Text fontWeight={"semibold"} mr={1}>
          Tag:{" "}
        </Text>
        <Text>{`STP-${project?.year}-${project?.number}`}</Text>
      </Flex>
      <Flex mb={0.5} flexWrap={"wrap"}>
        <Text fontWeight={"semibold"} mr={1}>
          Student:
        </Text>
        <Text>{students.join(", ")}</Text>
      </Flex>
      <Flex mb={0.5} flexWrap={"wrap"}>
        <Text fontWeight={"semibold"} mr={1}>
          Academics:{" "}
        </Text>
        <Text>{academicSupervisors.join(", ")}</Text>
      </Flex>
      <Flex mb={0.5} flexWrap={"wrap"}>
        <Text fontWeight={"semibold"} mr={1}>
          Scientists:{" "}
        </Text>
        <Text>{scientists.join(", ")}</Text>
      </Flex>
    </Box>
  );
};

export const SREditor = ({
  shouldAlternatePicture,
  fullSRData,
  initialConfig,
  isEditing,
  setIsEditing,
  canEdit,
  displayData,
  setDisplayData,
}: // key
ISREditorProps) => {
  // const navigate = useNavigate();
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
  const [isHovered, setIsHovered] = useState(false);

  const onMouseOver = () => {
    if (!isHovered) {
      setIsHovered(true);
    }
  };

  const onMouseOut = () => {
    if (isHovered) {
      setIsHovered(false);
    }
  };

  useEffect(() => {
    setAboveHeightSet(false);
    const calculateAboveContentHeight = () => {
      const aboveContentElement = document.getElementById(
        `topContent_${fullSRData?.document?.project?.pk}`,
      );

      if (aboveContentElement) {
        const rect = aboveContentElement.getBoundingClientRect();
        const contentAboveHeight = rect.bottom - rect.top;
        setAboveContentHeight(contentAboveHeight);
      }
    };

    // Call the function initially
    calculateAboveContentHeight();

    // Attach resize event listener to recalculate height when the window is resized
    window.addEventListener("resize", calculateAboveContentHeight);
    setAboveHeightSet(true);

    // Cleanup event listener on component unmount
    return () => {
      window.removeEventListener("resize", calculateAboveContentHeight);
    };
  }, [
    displayData,
    isEditing,
    fullSRData?.document?.project?.pk,
    initialConfig,
  ]);

  const queryClient = useQueryClient();
  const { register, handleSubmit, reset } = useForm<ISaveStudentReport>();
  const toast = useToast();
  const toastIdRef = useRef<ToastId>();
  const addToast = (data) => {
    toastIdRef.current = toast(data);
  };

  const saveMutation = useMutation({
    mutationFn: updateStudentReportProgress,
    onMutate: () => {
      addToast({
        status: "loading",
        title: "Saving Student Report",
        position: "top-right",
      });
    },
    onSuccess: () => {
      if (toastIdRef.current) {
        toast.update(toastIdRef.current, {
          title: "Success",
          description: `Student Report Saved`,
          status: "success",
          position: "top-right",
          duration: 3000,
          isClosable: true,
        });
      }
    },
    onError: (error) => {
      if (toastIdRef.current) {
        toast.update(toastIdRef.current, {
          title: "Could Not Save Student Progress Report",
          description: `${error}`,
          status: "error",
          position: "top-right",
          duration: 3000,
          isClosable: true,
        });
      }
    },
  });

  const onSave = (formData: ISaveStudentReport) => {
    saveMutation.mutate(formData);
    setIsEditing(false);
  };

  const {
    isOpen: isApproveProgressReportOpen,
    onOpen: onOpenApproveProgressReport,
    onClose: onCloseApproveProgressReport,
  } = useDisclosure();

  const [isActive, setIsActive] = useState(
    fullSRData?.document?.project?.status === "active",
  );
  useEffect(() => {
    setIsActive(fullSRData?.document?.project?.status === "active");
  }, [fullSRData]);

  const noImage = useNoImage();

  return (
    <>
      {/* setIsEditing */}
      <ApproveProgressReportModal
        isActive={isActive}
        report={fullSRData}
        isOpen={isApproveProgressReportOpen}
        onClose={onCloseApproveProgressReport}
      />
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
        onMouseOver={onMouseOver}
        onMouseLeave={onMouseOut}
      >
        <Flex
          id={`topContent_${fullSRData?.document?.project?.pk}`}
          pt={6}
          mx={8}
        >
          {!shouldAlternatePicture ? (
            <>
              <Box rounded={"md"} overflow={"hidden"} w={"276px"} h={"200px"}>
                <Image
                  src={fullSRData?.document?.project?.image?.file ?? noImage}
                  w={"100%"}
                  h={"100%"}
                  objectFit={"cover"}
                />
              </Box>
              <Box ml={4} flex={1}>
                <Box>
                  <ExtractedHTMLTitle
                    htmlContent={fullSRData?.document?.project?.title}
                    color={"blue.500"}
                    fontWeight={"bold"}
                    fontSize={"17px"}
                    // fontSize={"xs"}
                    noOfLines={4}
                    cursor={"pointer"}
                    onClick={() => {
                      const url = `/projects/${fullSRData?.document?.project?.pk}/student`;
                      window.open(url, "_blank");
                      // navigate(url);
                    }}
                  />
                </Box>

                <SRProjDetails
                  project={fullSRData?.document?.project}
                  team_members={fullSRData?.team_members}
                />
              </Box>
            </>
          ) : (
            <>
              <Box mr={4} flex={1}>
                <Box>
                  <ExtractedHTMLTitle
                    htmlContent={fullSRData?.document?.project?.title}
                    color={"blue.500"}
                    fontWeight={"bold"}
                    fontSize={"17px"}
                    // fontSize={"xs"}
                    noOfLines={4}
                    cursor={"pointer"}
                    onClick={() => {
                      const url = `/projects/${fullSRData?.document?.project?.pk}/student`;
                      window.open(url, "_blank");
                      // navigate(url);
                    }}
                  />
                </Box>

                <SRProjDetails
                  project={fullSRData?.document?.project}
                  team_members={fullSRData?.team_members}
                />
              </Box>
              <Box rounded={"md"} overflow={"hidden"} w={"276px"} h={"200px"}>
                <Image
                  src={fullSRData?.document?.project?.image?.file ?? noImage}
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
                // setHtmlData(newHtml);
                setDisplayData(newHtml);
              });
            }}
          />
          {/* {data !== undefined && data !== null && ( */}
          <PrepopulateHTMLPlugin data={displayData} />
          {/* )} */}
          <CustomPastePlugin />

          {/* Text Area */}
          <RichTextPlugin
            placeholder={<Text></Text>}
            contentEditable={
              <Box
                mt={4}
                // bg={"red"}
              >
                {/* Toolbar */}
                {isEditing === false ? null : (
                  <RevisedRichTextToolbar allowTable={false} />
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
                    Progress Report
                  </Text>

                  {isEditing === true ? (
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
                              mainDocumentId: fullSRData?.document?.pk,
                              progressReportHtml: displayData,
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
                          onClick={() => setIsEditing(false)}
                        >
                          <Icon as={AiFillEyeInvisible} />
                        </Button>
                      </Flex>
                    </Box>
                  ) : isHovered ? (
                    <>
                      <Box pos={"absolute"} right={8} top={0}>
                        <Button
                          ml={2}
                          bg={
                            isActive
                              ? colorMode === "light"
                                ? `orange.500`
                                : `orange.600`
                              : colorMode === "light"
                                ? `green.500`
                                : `green.600`
                          }
                          color={
                            colorMode === "light"
                              ? "whiteAlpha.900"
                              : "whiteAlpha.800"
                          }
                          _hover={
                            colorMode === "light"
                              ? {
                                  bg: isActive ? `orange.600` : `green.600`,
                                  color: `white`,
                                }
                              : {
                                  bg: isActive ? `orange.500` : `green.500`,
                                  color: `white`,
                                }
                          }
                          minW={"32px"}
                          minH={"32px"}
                          maxW={"32px"}
                          maxH={"32px"}
                          rounded={"full"}
                          data-tip="Click to edit"
                          onClick={onOpenApproveProgressReport}
                        >
                          <Icon as={isActive ? FaUndo : TiTick} />
                        </Button>
                      </Box>
                      <Box pos={"absolute"} right={20} top={0}>
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
                          onClick={() => setIsEditing(true)}
                        >
                          <Icon as={AiFillEdit} />
                        </Button>
                      </Box>
                    </>
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

{
  /* <Flex mx={8} mt={4} pt={8}>
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
                      `/projects/${project?.pk}/${reportKind === "student" ? "student" : "progress"
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
                      `/projects/${project?.pk}/${reportKind === "student" ? "student" : "progress"
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
        </Flex> */
}
{
  /* <ARProgressReportEditor
                initialConfig={initialConfig}
                editorRef={editorRef}
                // context_prepopulation_data={
                //   reportKind !== "student" ? report?.context : undefined
                // }
                // aims_prepopulation_data={
                //   reportKind !== "student" ? report?.aims : undefined
                // }
                progress_report_prepopulation_data={
                  reportKind === "student"
                    ? report?.progress_report
                    : report?.progress
                }
                // management_implications_prepopulation_data={
                //   reportKind !== "student" ? report?.implications : undefined
                // }
                // future_directions_prepopulation_data={
                //   reportKind !== "student" ? report?.future : undefined
                // }
                project_pk={project?.pk}
                document_pk={document?.document?.pk}
                writeable_document_pk={document?.pk}
                isEditorOpen={isEditing}
                setIsEditorOpen={setIsEditing}
              /> */
}
