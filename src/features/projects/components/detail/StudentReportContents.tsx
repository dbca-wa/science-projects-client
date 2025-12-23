// Maps out the document provided to the rich text editor components for student report documents.

import { useColorMode } from "@/shared/utils/theme.utils";
import { useState, useEffect } from "react";
import { Button } from "@/shared/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { motion } from "framer-motion";
import { BsPlus } from "react-icons/bs";
import { getStudentReportForYear } from "@/features/reports/services/reports.service";
import { useCheckUserInTeam } from "@/features/users/hooks/useCheckUserInTeam";
import { useGetStudentReportAvailableReportYears } from "@/features/reports/hooks/useGetStudentReportAvailableReportYears";
import type {
  ICaretakerPermissions,
  IProjectMember,
  IStudentReport,
  IUserMe,
} from "@/shared/types";
import { CreateStudentReportModal } from "@/features/reports/components/modals/CreateStudentReportModal";
import { RichTextEditor } from "@/shared/components/RichTextEditor/Editors/RichTextEditor";
import { CommentSection } from "./CommentSection";
import { UnifiedDocumentActions } from "./DocActions/UnifiedDocumentActions";
import { cn } from "@/shared/utils";
import { Loader2 } from "lucide-react";

interface Props extends ICaretakerPermissions {
  documents: IStudentReport[];
  userData: IUserMe;
  members: IProjectMember[];
  refetch: () => void;
  projectPk: number | string;
  setToLastTab: (tabToGoTo?: number) => void;
  baseAPI: string;
  baLead: number;
}

export const StudentReportContents = ({
  userData,
  members,
  documents,
  refetch,
  projectPk,
  setToLastTab,
  baseAPI,
  baLead,
  userIsCaretakerOfAdmin,
  userIsCaretakerOfBaLeader,
  userIsCaretakerOfMember,
  userIsCaretakerOfProjectLeader,
}: Props) => {
  // useEffect(() => console.log(documents))
  // Handling years
  const { availableStudentYearsData } = useGetStudentReportAvailableReportYears(
    Number(documents[0].document?.project?.pk),
  );
  const years = Array.from(
    new Set(documents.map((studentReport) => studentReport.year)),
  ).sort((a, b) => b - a);
  const [selectedYear, setSelectedYear] = useState(() => {
    const years = documents.map((studentReport) => studentReport.year);
    const highestYear = Math.max(...years);
    return highestYear;
  });

  // Selected Report State
  const [selectedStudentReport, setselectedStudentReport] = useState(() => {
    const highestYearDocument = documents.reduce(
      (maxDocument, currentDocument) => {
        if (!maxDocument || currentDocument.year > maxDocument.year) {
          return currentDocument;
        }
        return maxDocument;
      },
      null,
    );
    return highestYearDocument;
  });

  // Force a rerender when dark mode or year changed to update design and content
  const [isLoading, setIsLoading] = useState(false);
  const { colorMode } = useColorMode();
  const documentType = "studentreport";

  const editorKey = colorMode + documentType + selectedStudentReport?.year;

  const mePk = userData?.pk ? userData?.pk : userData?.id;
  const userInTeam = useCheckUserInTeam(mePk, members);

  const [forceRefresh, setForceRefresh] = useState(false);

  const handleSetSameYear = () => {
    setForceRefresh((prevForceRefresh) => !prevForceRefresh);
  };

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);

      try {
        const newPRData = await getStudentReportForYear(
          selectedYear,
          Number(projectPk),
        );
        setselectedStudentReport(newPRData);
      } catch (error) {
        // Handle error
        console.error("Error fetching student report data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [selectedYear, forceRefresh, projectPk]);

  useEffect(() => {
    if (selectedStudentReport) setIsLoading(false);
  }, [selectedStudentReport]);

  useEffect(() => {
    setIsLoading(false);
  }, [editorKey, documents]);

  const handleNewYearSelection = (event) => {
    setIsLoading(true);
    setSelectedYear(Number(event.target.value));
  };

  const [isCreateStudentReportModalOpen, setIsCreateStudentReportModalOpen] = useState(false);

  const isBaLead = mePk === baLead;
  const isFullyApproved =
    documents?.filter((r) => r.year === selectedYear)[0]?.document
      .project_lead_approval_granted &&
    documents?.filter((r) => r.year === selectedYear)[0]?.document
      .business_area_lead_approval_granted &&
    documents?.filter((r) => r.year === selectedYear)[0]?.document
      .directorate_approval_granted;

  const canEditPermission =
    ((userInTeam ||
      isBaLead ||
      userIsCaretakerOfBaLeader ||
      userIsCaretakerOfMember) &&
      !isFullyApproved) ||
    userData?.is_superuser ||
    userIsCaretakerOfAdmin;

  return (
    <>
      <CreateStudentReportModal
        projectPk={selectedStudentReport?.document?.project?.pk}
        documentKind="studentreport"
        onClose={() => setIsCreateStudentReportModalOpen(false)}
        isOpen={isCreateStudentReportModalOpen}
        refetchData={refetch}
      />

      {/* Selector */}
      <div
        className={cn(
          "p-4 rounded-xl border w-full mb-8",
          colorMode === "light" ? "border-gray-300" : "border-gray-500"
        )}
      >
        <div className="w-full flex justify-between">
          {(isBaLead || userInTeam || userData?.is_superuser) && (
            <div className="flex items-center justify-center">
              <Button
                className={cn(
                  "text-white",
                  colorMode === "light" 
                    ? "bg-orange-500 hover:bg-orange-400" 
                    : "bg-orange-600 hover:bg-orange-500"
                )}
                size="sm"
                onClick={() => setIsCreateStudentReportModalOpen(true)}
                disabled={
                  availableStudentYearsData?.length < 1 ||
                  documents[0].document?.project?.status === "suspended"
                }
              >
                <BsPlus className="mr-2" size="20px" />
                New Report
              </Button>
            </div>
          )}

          <div className="flex-1 flex justify-end items-center">
            <div className="flex items-center">
              <p
                className={cn(
                  "mr-3 font-semibold text-base",
                  colorMode === "light" ? "text-gray-600" : "text-gray-200"
                )}
              >
                Selected
              </p>
              <Select
                value={selectedYear.toString()}
                onValueChange={(value) => {
                  setIsLoading(true);
                  setSelectedYear(Number(value));
                }}
              >
                <SelectTrigger className="min-w-[100px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {years.map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      {`FY ${year - 1} - ${String(year).slice(2)}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="min-h-screen flex justify-center pt-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        </div>
      ) : (
        <motion.div
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 10, opacity: 0 }}
          transition={{
            duration: 0.7,
            delay: 1 / 7,
          }}
          style={{
            height: "100%",
            animation: "oscillate 8s ease-in-out infinite",
          }}
        >
          {/* Actions */}

          <UnifiedDocumentActions
            documentType="studentreport"
            documentData={selectedStudentReport}
            refetchData={refetch}
            callSameData={handleSetSameYear}
            documents={documents}
            setToLastTab={setToLastTab}
            isBaLead={isBaLead}
            userIsCaretakerOfAdmin={userIsCaretakerOfAdmin}
            userIsCaretakerOfBaLeader={userIsCaretakerOfBaLeader}
            userIsCaretakerOfMember={userIsCaretakerOfMember}
            userIsCaretakerOfProjectLeader={userIsCaretakerOfProjectLeader}
          />

          {/* Editors */}

          <RichTextEditor
            wordLimit={300}
            limitCanBePassed={false}
            canEdit={canEditPermission}
            writeable_document_kind={"Student Report"}
            writeable_document_pk={selectedStudentReport?.pk}
            project_pk={selectedStudentReport?.document?.project?.pk}
            document_pk={selectedStudentReport?.document?.pk}
            isUpdate={true}
            editorType="ProjectDocument"
            key={`progress${editorKey}`} // Change the key to force a re-render
            data={selectedStudentReport?.progress_report}
            section={"progress_report"}
            documentsCount={documents.length}
          />
          <CommentSection
            // projectPk={selectedStudentReport?.document?.project?.pk}
            baseAPI={baseAPI}
            documentID={selectedStudentReport?.document?.pk}
            documentKind={selectedStudentReport?.document?.kind}
            userData={userData}
            project={selectedStudentReport?.document?.project}
          />
        </motion.div>
      )}
    </>
  );
};
