import { ExtractedHTMLTitle } from "@/shared/components/ExtractedHTMLTitle";
import {
  ISaveStudentReport,
  updateStudentReportProgress,
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
import { FaSave, FaStamp, FaUndo } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { CustomPastePlugin } from "../Plugins/CustomPastePlugin";
import ListMaxIndentLevelPlugin from "../Plugins/ListMaxIndentLevelPlugin";
import { PrepopulateHTMLPlugin } from "../Plugins/PrepopulateHTMLPlugin";
import { RevisedRichTextToolbar } from "../Toolbar/RevisedRichTextToolbar";
import type { IStudentReportDisplayData } from "./ARStudentReportHandler";
import { FcApproval } from "react-icons/fc";
import { MdApproval } from "react-icons/md";
import { TiTick } from "react-icons/ti";
import { ApproveProgressReportModal } from "@/features/reports/components/modals/ApproveProgressReportModal";
import { useNoImage } from "@/shared/hooks/useNoImage";
import { useColorMode } from "@/shared/utils/theme.utils";
import { Button } from "@/shared/components/ui/button";
import { toast } from "sonner";

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
          `${member.user.display_first_name ?? member.user.first_name} ${member.user.display_last_name ?? member.user.last_name}`,
      );
  };

  const students = getMembersByRole(team_members, "student");
  const academicSupervisors = getMembersByRole(team_members, "academicsuper");
  const scientists = getMembersByRole(team_members, "supervising");

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
        <p>{`STP-${project?.year}-${project?.number}`}</p>
      </div>
      <div className="mb-0.5 flex flex-wrap">
        <p className="font-semibold mr-1">
          Student:
        </p>
        <p>{students.join(", ")}</p>
      </div>
      <div className="mb-0.5 flex flex-wrap">
        <p className="font-semibold mr-1">
          Academics:{" "}
        </p>
        <p>{academicSupervisors.join(", ")}</p>
      </div>
      <div className="mb-0.5 flex flex-wrap">
        <p className="font-semibold mr-1">
          Scientists:{" "}
        </p>
        <p>{scientists.join(", ")}</p>
      </div>
    </div>
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
  const toolbarRef = useRef<HTMLDivElement | null>(null);

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
  
  const [isApproveProgressReportOpen, setIsApproveProgressReportOpen] = useState(false);
  const onOpenApproveProgressReport = () => setIsApproveProgressReportOpen(true);
  const onCloseApproveProgressReport = () => setIsApproveProgressReportOpen(false);

  const saveMutation = useMutation({
    mutationFn: updateStudentReportProgress,
    onMutate: () => {
      toast.loading("Saving Student Report");
    },
    onSuccess: () => {
      toast.success("Student Report Saved");
    },
    onError: (error) => {
      toast.error(`Could Not Save Student Progress Report: ${error}`);
    },
  });

  const onSave = (formData: ISaveStudentReport) => {
    saveMutation.mutate(formData);
    setIsEditing(false);
  };

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
      <div
        className="mx-4 relative rounded-b-[20px] rounded-t-[20px] mb-4 shadow-[0_8px_24px_rgba(0,0,0,0.1),0_2px_8px_rgba(0,0,0,0.1)]"
        style={{
          backgroundColor: colorMode === "light" ? "rgba(255, 255, 255, 0.6)" : "rgba(0, 0, 0, 0.5)"
        }}
        onMouseOver={onMouseOver}
        onMouseLeave={onMouseOut}
      >
        <div
          id={`topContent_${fullSRData?.document?.project?.pk}`}
          className="pt-6 mx-8 flex"
        >
          {!shouldAlternatePicture ? (
            <>
              <div className="rounded-md overflow-hidden w-[276px] h-[200px]">
                <img
                  src={fullSRData?.document?.project?.image?.file ?? noImage}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="ml-4 flex-1">
                <div>
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
                </div>

                <SRProjDetails
                  project={fullSRData?.document?.project}
                  team_members={fullSRData?.team_members}
                />
              </div>
            </>
          ) : (
            <>
              <div className="mr-4 flex-1">
                <div>
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
                </div>

                <SRProjDetails
                  project={fullSRData?.document?.project}
                  team_members={fullSRData?.team_members}
                />
              </div>
              <div className="rounded-md overflow-hidden w-[276px] h-[200px]">
                <img
                  src={fullSRData?.document?.project?.image?.file ?? noImage}
                  className="w-full h-full object-cover"
                />
              </div>
            </>
          )}
        </div>

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
            placeholder={<p></p>}
            contentEditable={
              <div
                className="mt-4"
                // bg={"red"}
              >
                {/* Toolbar */}
                {isEditing === false ? null : (
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
                    Progress Report
                  </p>

                  {isEditing === true ? (
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
                              mainDocumentId: fullSRData?.document?.pk,
                              progressReportHtml: displayData,
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
                          onClick={() => setIsEditing(false)}
                        >
                          <AiFillEyeInvisible />
                        </Button>
                      </div>
                    </div>
                  ) : isHovered ? (
                    <>
                      <div className="absolute right-8 top-0">
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
                      <div className="absolute right-20 top-0">
                        <Button
                          className={`ml-2 min-w-8 min-h-8 max-w-8 max-h-8 rounded-full ${
                            colorMode === "light" 
                              ? "bg-gray-500 hover:bg-gray-600 text-white/90" 
                              : "bg-gray-600 hover:bg-gray-500 text-white/80"
                          } hover:text-white`}
                          data-tip="Click to Save"
                          onClick={() => setIsEditing(true)}
                        >
                          <AiFillEdit />
                        </Button>
                      </div>
                    </>
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
      </div>
    </>
  );
};
