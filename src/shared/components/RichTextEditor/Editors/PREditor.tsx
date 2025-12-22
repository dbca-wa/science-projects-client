import { ExtractedHTMLTitle } from "@/shared/components/ExtractedHTMLTitle";
import {
  ISaveProgressReportSection,
  updateProgressReportSection,
} from "@/features/reports/services/reports.service";
import type { IProjectData, IProjectMember } from "@/shared/types";
import { $generateHtmlFromNodes } from "@lexical/html";
import { AutoFocusPlugin } from "@lexical/react/LexicalAutoFocusPlugin";
import {
  InitialConfigType,
  LexicalComposer,
} from "@lexical/react/LexicalComposer";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
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
import { FaSave, FaUndo } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { CustomPastePlugin } from "../Plugins/CustomPastePlugin";
import ListMaxIndentLevelPlugin from "../Plugins/ListMaxIndentLevelPlugin";
import { PrepopulateHTMLPlugin } from "../Plugins/PrepopulateHTMLPlugin";
import { RevisedRichTextToolbar } from "../Toolbar/RevisedRichTextToolbar";
import type { IProgressReportDisplayData } from "./ARProgressReportHandler";
import { ApproveProgressReportModal } from "@/features/reports/components/modals/ApproveProgressReportModal";
import { TiTick } from "react-icons/ti";
import { useNoImage } from "@/shared/hooks/useNoImage";
import { useColorMode } from "@/shared/utils/theme.utils";
import { Button } from "@/shared/components/ui/button";
import { toast } from "sonner";

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
          `${member.user.display_first_name ?? member.user.first_name} ${member.user.display_last_name ?? member.user.last_name}`,
      );
  };

  const orderedTeam = getOrderedTeam(team_members);

  return (
    <div className="py-3">
      <div className="mb-0.5 flex flex-wrap">
        <p
          className={`font-semibold mr-1 ${
            project?.status === "completed" || project?.status === "terminated"
              ? "text-green-500"
              : project?.status === "updating"
                ? "text-red-500"
                : project?.status === "suspended"
                  ? "text-orange-500"
                  : ""
          }`}
        >
          Status:{" "}
        </p>
        <p
          className={
            project?.status === "completed" || project?.status === "terminated"
              ? "text-green-500"
              : project?.status === "updating"
                ? "text-red-500"
                : project?.status === "suspended"
                  ? "text-orange-500"
                  : ""
          }
        >
          {`${project?.status[0].toUpperCase()}${project?.status.slice(1)}`}
        </p>
      </div>
      <div className="mb-0.5 flex flex-wrap">
        <p className="font-semibold mr-1">
          Tag:{" "}
        </p>
        <p>{`${project.kind === "science" ? "SP" : project.kind === "external" ? "EXT" : "CF"}-${project?.year}-${project?.number}`}</p>
      </div>
      <div className="mb-0.5 flex flex-wrap">
        <p className="font-semibold mr-1">
          Scientists:{" "}
        </p>
        <p>{orderedTeam.join(", ")}</p>
      </div>
    </div>
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
}: // key
IPREditorProps) => {
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
  const toolbarRef = useRef<HTMLDivElement | null>(null);

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
  
  const [isApproveProgressReportOpen, setIsApproveProgressReportOpen] = useState(false);
  const onOpenApproveProgressReport = () => setIsApproveProgressReportOpen(true);
  const onCloseApproveProgressReport = () => setIsApproveProgressReportOpen(false);

  const saveMutation = useMutation({
    mutationFn: updateProgressReportSection,
    onMutate: () => {
      toast.loading("Updating Progress Report");
    },
    onSuccess: () => {
      toast.success("Progress Report Updated");
    },
    onError: (error) => {
      toast.error(`Could Not Update Progress Report: ${error}`);
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
    uneditableInitialConfig,
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

  const [reportHovered, setReportHovered] = useState(false);
  const [isActive, setIsActive] = useState(
    fullPRData?.document?.project?.status === "active",
  );
  useEffect(() => {
    setIsActive(fullPRData?.document?.project?.status === "active");
  }, [fullPRData]);

  const noImage = useNoImage();

  return (
    <>
      {/* setIsEditing */}
      <ApproveProgressReportModal
        isActive={isActive}
        report={fullPRData}
        isOpen={isApproveProgressReportOpen}
        onClose={onCloseApproveProgressReport}
      />
      <div
        className="mx-4 relative rounded-b-[20px] rounded-t-[20px] mb-4 shadow-[0_8px_24px_rgba(0,0,0,0.1),0_2px_8px_rgba(0,0,0,0.1)]"
        style={{
          backgroundColor: colorMode === "light" ? "rgba(255, 255, 255, 0.6)" : "rgba(0, 0, 0, 0.5)"
        }}
        onMouseOver={() => setReportHovered(true)}
        onMouseOut={() => setReportHovered(false)}
      >
        {reportHovered ? (
          <div className="absolute right-4 top-4">
            <Button
              className={`ml-2 min-w-8 min-h-8 max-w-8 max-h-8 rounded-full ${
                isActive
                  ? colorMode === "light"
                    ? "bg-orange-500 hover:bg-orange-600"
                    : "bg-orange-600 hover:bg-orange-500"
                  : colorMode === "light"
                    ? "bg-green-500 hover:bg-green-600"
                    : "bg-green-600 hover:bg-green-500"
              } ${
                colorMode === "light" ? "text-white/90" : "text-white/80"
              } hover:text-white`}
              data-tip="Click to edit"
              onClick={onOpenApproveProgressReport}
            >
              {isActive ? <FaUndo /> : <TiTick />}
            </Button>
          </div>
        ) : null}

        <div
          id={`topContent_${fullPRData?.document?.project?.pk}`}
          className="pt-6 mx-8 flex"
        >
          {!shouldAlternatePicture ? (
            <>
              <div className="rounded-md overflow-hidden w-[276px] h-[200px]">
                <img
                  src={fullPRData?.document?.project?.image?.file ?? noImage}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="ml-4 flex-1">
                <div>
                  <ExtractedHTMLTitle
                    htmlContent={fullPRData?.document?.project?.title}
                    color={"blue.500"}
                    fontWeight={"bold"}
                    fontSize={"17px"}
                    // fontSize={"xs"}
                    noOfLines={4}
                    cursor={"pointer"}
                    onClick={() => {
                      const url = `/projects/${fullPRData?.document?.project?.pk}/progress`;
                      window.open(url, "_blank");
                      // navigate(url);
                    }}
                  />
                </div>

                <PRProjDetails
                  project={fullPRData?.document?.project}
                  team_members={fullPRData?.team_members}
                />
              </div>
            </>
          ) : (
            <>
              <div className="mr-4 flex-1">
                <div>
                  <ExtractedHTMLTitle
                    htmlContent={fullPRData?.document?.project?.title}
                    color={"blue.500"}
                    fontWeight={"bold"}
                    fontSize={"17px"}
                    // fontSize={"xs"}
                    cursor={"pointer"}
                    onClick={() => {
                      const url = `/projects/${fullPRData?.document?.project?.pk}/progress`;
                      window.open(url, "_blank");
                      // navigate(url);
                    }}
                    noOfLines={4}
                  />
                </div>

                <PRProjDetails
                  project={fullPRData?.document?.project}
                  team_members={fullPRData?.team_members}
                />
              </div>
              <div className="rounded-md overflow-hidden w-[276px] h-[200px]">
                <img
                  src={fullPRData?.document?.project?.image?.file ?? noImage}
                  className="w-full h-full object-cover"
                />
              </div>
            </>
          )}
        </div>
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
            placeholder={<p></p>}
            contentEditable={
              <div
                className="mt-4"
                onMouseOver={onMouseOverContext}
                onMouseLeave={onMouseOutContext}
                // bg={"red"}
              >
                {/* Toolbar */}
                {isEditingContext === false ? null : (
                  <RevisedRichTextToolbar
                    allowTable={false}
                    toolbarRef={toolbarRef}
                  />
                )}

                <div className="relative">
                  <p
                    className="font-bold text-lg px-8 ml-0.5 mt-4"
                    // userSelect={"none"}
                  >
                    Context
                  </p>

                  {isEditingContext === true ? (
                    <div className="absolute right-10 top-0">
                      <div className="flex flex-row">
                        <Button
                          className={`min-w-8 min-h-8 max-w-8 max-h-8 rounded-full ${
                            colorMode === "light" 
                              ? "bg-green-500 hover:bg-green-600 text-white/90" 
                              : "bg-green-600 hover:bg-green-500 text-white/80"
                          } hover:text-white`}
                          data-tip="Click to Save"
                          onClick={() =>
                            onSave({
                              mainDocumentId: fullPRData?.document?.pk,
                              section: "context",
                              htmlData: contextDisplayData,
                            })
                          }
                        >
                          <FaSave />
                        </Button>

                        <Button
                          className={`ml-2 min-w-8 min-h-8 max-w-8 max-h-8 rounded-full ${
                            colorMode === "light" 
                              ? "bg-gray-500 hover:bg-gray-600 text-white/90" 
                              : "bg-gray-600 hover:bg-gray-500 text-white/80"
                          } hover:text-white`}
                          data-tip="Click to Save"
                          onClick={() => setIsEditingContext(false)}
                        >
                          <AiFillEyeInvisible />
                        </Button>
                      </div>
                    </div>
                  ) : isHoveredContext ? (
                    <div className="absolute right-10 top-0">
                      <Button
                        className={`ml-2 min-w-8 min-h-8 max-w-8 max-h-8 rounded-full ${
                          colorMode === "light" 
                            ? "bg-gray-500 hover:bg-gray-600 text-white/90" 
                            : "bg-gray-600 hover:bg-gray-500 text-white/80"
                        } hover:text-white`}
                        data-tip="Click to Save"
                        onClick={() => setIsEditingContext(true)}
                      >
                        <AiFillEdit />
                      </Button>
                    </div>
                  ) : null}
                </div>

                <div className="mt-[-15px] editor-scroller">
                  <div
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
                  </div>
                </div>
                {/* <div>Editor: {editorText}</div> */}
              </div>
            }
            // placeholder={
            //     isEditing ?
            //         <div
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
            //         </div>
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
            placeholder={<p></p>}
            contentEditable={
              <div
                className="mt-4"
                onMouseOver={onMouseOverAims}
                onMouseLeave={onMouseOutAims}
                // bg={"red"}
              >
                {/* Toolbar */}
                {isEditingAims === false ? null : (
                  <RevisedRichTextToolbar
                    allowTable={false}
                    toolbarRef={toolbarRef}
                  />
                )}

                <div className="relative">
                  <p
                    className="font-bold text-lg px-8 ml-0.5 mt-4"
                    // userSelect={"none"}
                  >
                    Aims
                  </p>

                  {isEditingAims === true ? (
                    <div className="absolute right-10 top-0">
                      <div className="flex flex-row">
                        <Button
                          className={`min-w-8 min-h-8 max-w-8 max-h-8 rounded-full ${
                            colorMode === "light" 
                              ? "bg-green-500 hover:bg-green-600 text-white/90" 
                              : "bg-green-600 hover:bg-green-500 text-white/80"
                          } hover:text-white`}
                          data-tip="Click to Save"
                          onClick={() =>
                            onSave({
                              mainDocumentId: fullPRData?.document?.pk,
                              section: "aims",
                              htmlData: aimsDisplayData,
                            })
                          }
                        >
                          <FaSave />
                        </Button>

                        <Button
                          className={`ml-2 min-w-8 min-h-8 max-w-8 max-h-8 rounded-full ${
                            colorMode === "light" 
                              ? "bg-gray-500 hover:bg-gray-600 text-white/90" 
                              : "bg-gray-600 hover:bg-gray-500 text-white/80"
                          } hover:text-white`}
                          data-tip="Click to Save"
                          onClick={() => setIsEditingAims(false)}
                        >
                          <AiFillEyeInvisible />
                        </Button>
                      </div>
                    </div>
                  ) : isHoveredAims ? (
                    <div className="absolute right-10 top-0">
                      <Button
                        className={`ml-2 min-w-8 min-h-8 max-w-8 max-h-8 rounded-full ${
                          colorMode === "light" 
                            ? "bg-gray-500 hover:bg-gray-600 text-white/90" 
                            : "bg-gray-600 hover:bg-gray-500 text-white/80"
                        } hover:text-white`}
                        data-tip="Click to Save"
                        onClick={() => setIsEditingAims(true)}
                      >
                        <AiFillEdit />
                      </Button>
                    </div>
                  ) : null}
                </div>

                <div className="mt-[-15px] editor-scroller">
                  <div
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
                  </div>
                </div>
                {/* <div>Editor: {editorText}</div> */}
              </div>
            }
            // placeholder={
            //     isEditing ?
            //         <div
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
            //         </div>
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
            placeholder={<p></p>}
            contentEditable={
              <div
                className="mt-4"
                onMouseOver={onMouseOverProgress}
                onMouseLeave={onMouseOutProgress}
                // bg={"red"}
              >
                {/* Toolbar */}
                {isEditingProgress === false ? null : (
                  <RevisedRichTextToolbar
                    allowTable={false}
                    toolbarRef={toolbarRef}
                  />
                )}

                <div className="relative">
                  <p
                    className="font-bold text-lg px-8 ml-0.5 mt-4"
                    // userSelect={"none"}
                  >
                    Progress
                  </p>

                  {isEditingProgress === true ? (
                    <div className="absolute right-10 top-0">
                      <div className="flex flex-row">
                        <Button
                          className={`min-w-8 min-h-8 max-w-8 max-h-8 rounded-full ${
                            colorMode === "light" 
                              ? "bg-green-500 hover:bg-green-600 text-white/90" 
                              : "bg-green-600 hover:bg-green-500 text-white/80"
                          } hover:text-white`}
                          data-tip="Click to Save"
                          onClick={() =>
                            onSave({
                              mainDocumentId: fullPRData?.document?.pk,
                              section: "progress",
                              htmlData: progressReportDisplayData,
                            })
                          }
                        >
                          <FaSave />
                        </Button>

                        <Button
                          className={`ml-2 min-w-8 min-h-8 max-w-8 max-h-8 rounded-full ${
                            colorMode === "light" 
                              ? "bg-gray-500 hover:bg-gray-600 text-white/90" 
                              : "bg-gray-600 hover:bg-gray-500 text-white/80"
                          } hover:text-white`}
                          data-tip="Click to Save"
                          onClick={() => setIsEditingProgress(false)}
                        >
                          <AiFillEyeInvisible />
                        </Button>
                      </div>
                    </div>
                  ) : isHoveredProgress ? (
                    <div className="absolute right-10 top-0">
                      <Button
                        className={`ml-2 min-w-8 min-h-8 max-w-8 max-h-8 rounded-full ${
                          colorMode === "light" 
                            ? "bg-gray-500 hover:bg-gray-600 text-white/90" 
                            : "bg-gray-600 hover:bg-gray-500 text-white/80"
                        } hover:text-white`}
                        data-tip="Click to Save"
                        onClick={() => setIsEditingProgress(true)}
                      >
                        <AiFillEdit />
                      </Button>
                    </div>
                  ) : null}
                </div>

                <div className="mt-[-15px] editor-scroller">
                  <div
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
                  </div>
                </div>
                {/* <div>Editor: {editorText}</div> */}
              </div>
            }
            // placeholder={
            //     isEditing ?
            //         <div
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
            //         </div>
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
            placeholder={<p></p>}
            contentEditable={
              <div
                className="mt-4"
                onMouseOver={onMouseOverImplications}
                onMouseLeave={onMouseOutImplications}
                // bg={"red"}
              >
                {/* Toolbar */}
                {isEditingImplications === false ? null : (
                  <RevisedRichTextToolbar
                    allowTable={true}
                    toolbarRef={toolbarRef}
                  />
                )}

                <div className="relative">
                  <p
                    className="font-bold text-lg px-8 ml-0.5 mt-4"
                    // userSelect={"none"}
                  >
                    Management Implications
                  </p>

                  {isEditingImplications === true ? (
                    <div className="absolute right-10 top-0">
                      <div className="flex flex-row">
                        <Button
                          className={`min-w-8 min-h-8 max-w-8 max-h-8 rounded-full ${
                            colorMode === "light" 
                              ? "bg-green-500 hover:bg-green-600 text-white/90" 
                              : "bg-green-600 hover:bg-green-500 text-white/80"
                          } hover:text-white`}
                          data-tip="Click to Save"
                          onClick={() =>
                            onSave({
                              mainDocumentId: fullPRData?.document?.pk,
                              section: "implications",
                              htmlData: managementImplicationsDisplayData,
                            })
                          }
                        >
                          <FaSave />
                        </Button>

                        <Button
                          className={`ml-2 min-w-8 min-h-8 max-w-8 max-h-8 rounded-full ${
                            colorMode === "light" 
                              ? "bg-gray-500 hover:bg-gray-600 text-white/90" 
                              : "bg-gray-600 hover:bg-gray-500 text-white/80"
                          } hover:text-white`}
                          data-tip="Click to Save"
                          onClick={() => setIsEditingImplications(false)}
                        >
                          <AiFillEyeInvisible />
                        </Button>
                      </div>
                    </div>
                  ) : isHoveredImplications ? (
                    <div className="absolute right-10 top-0">
                      <Button
                        className={`ml-2 min-w-8 min-h-8 max-w-8 max-h-8 rounded-full ${
                          colorMode === "light" 
                            ? "bg-gray-500 hover:bg-gray-600 text-white/90" 
                            : "bg-gray-600 hover:bg-gray-500 text-white/80"
                        } hover:text-white`}
                        data-tip="Click to Save"
                        onClick={() => setIsEditingImplications(true)}
                      >
                        <AiFillEdit />
                      </Button>
                    </div>
                  ) : null}
                </div>

                <div className="mt-[-15px] editor-scroller">
                  <div
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
                  </div>
                </div>
                {/* <div>Editor: {editorText}</div> */}
              </div>
            }
            // placeholder={
            //     isEditing ?
            //         <div
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
            //         </div>
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
            placeholder={<p></p>}
            contentEditable={
              <div
                className="mt-4"
                onMouseOver={onMouseOverFuture}
                onMouseLeave={onMouseOutFuture}
                // bg={"red"}
              >
                {/* Toolbar */}
                {isEditingFuture === false ? null : (
                  <RevisedRichTextToolbar
                    allowTable={true}
                    toolbarRef={toolbarRef}
                  />
                )}

                <div className="relative">
                  <p
                    className="font-bold text-lg px-8 ml-0.5 mt-4"
                    // userSelect={"none"}
                  >
                    Future Directions
                  </p>

                  {isEditingFuture === true ? (
                    <div className="absolute right-10 top-0">
                      <div className="flex flex-row">
                        <Button
                          className={`min-w-8 min-h-8 max-w-8 max-h-8 rounded-full ${
                            colorMode === "light" 
                              ? "bg-green-500 hover:bg-green-600 text-white/90" 
                              : "bg-green-600 hover:bg-green-500 text-white/80"
                          } hover:text-white`}
                          data-tip="Click to Save"
                          onClick={() =>
                            onSave({
                              mainDocumentId: fullPRData?.document?.pk,
                              section: "future",
                              htmlData: futureDirectionsDisplayData,
                            })
                          }
                        >
                          <FaSave />
                        </Button>

                        <Button
                          className={`ml-2 min-w-8 min-h-8 max-w-8 max-h-8 rounded-full ${
                            colorMode === "light" 
                              ? "bg-gray-500 hover:bg-gray-600 text-white/90" 
                              : "bg-gray-600 hover:bg-gray-500 text-white/80"
                          } hover:text-white`}
                          data-tip="Click to Save"
                          onClick={() => setIsEditingFuture(false)}
                        >
                          <AiFillEyeInvisible />
                        </Button>
                      </div>
                    </div>
                  ) : isHoveredFuture ? (
                    <div className="absolute right-10 top-0">
                      <Button
                        className={`ml-2 min-w-8 min-h-8 max-w-8 max-h-8 rounded-full ${
                          colorMode === "light" 
                            ? "bg-gray-500 hover:bg-gray-600 text-white/90" 
                            : "bg-gray-600 hover:bg-gray-500 text-white/80"
                        } hover:text-white`}
                        data-tip="Click to Save"
                        onClick={() => setIsEditingFuture(true)}
                      >
                        <AiFillEdit />
                      </Button>
                    </div>
                  ) : null}
                </div>

                <div className="mt-[-15px] editor-scroller">
                  <div
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
                  </div>
                </div>
                {/* <div>Editor: {editorText}</div> */}
              </div>
            }
            // placeholder={
            //     isEditing ?
            //         <div
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
            //         </div>
            //         : null
            // }
            ErrorBoundary={LexicalErrorBoundary}
          />

          <TabIndentationPlugin />
          <ListMaxIndentLevelPlugin maxDepth={3} />
          <AutoFocusPlugin />
        </LexicalComposer>
      </div>
    </>
  );
};