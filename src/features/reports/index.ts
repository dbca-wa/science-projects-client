// ============================================================================
// Components
// ============================================================================

export { default as AnnualReportPDFGridItem } from "./components/AnnualReportPDFGridItem";
export { default as GeneratePDFButton } from "./components/GeneratePDFButton";

// Current Report Components
export { default as AnnualReportDetails } from "./components/current/AnnualReportDetails";
export { default as AnnualReportMedia } from "./components/current/AnnualReportMedia";
export { default as LatestReportsNotYetApproved } from "./components/current/LatestReportsNotYetApproved";
export { default as ParticipatingProjectReports } from "./components/current/ParticipatingProjectReports";

// Print Preview Sections
export { default as CoverPageSection } from "./components/current/PrintPreviewSections/CoverPageSection";
export { default as DirectorsMessageSection } from "./components/current/PrintPreviewSections/DirectorsMessageSection";
export { default as ServiceDeliverySection } from "./components/current/PrintPreviewSections/ServiceDeliverySection";

// Modals
export { default as AddReportModal } from "./components/modals/AddReportModal";
export { default as AddReportPDFModal } from "./components/modals/AddReportPDFModal";
export { default as AddLegacyReportPDFModal } from "./components/modals/AddLegacyReportPDFModal";
export { default as ChangeReportPDFModal } from "./components/modals/ChangeReportPDFModal";
export { default as CreateProgressReportModal } from "./components/modals/CreateProgressReportModal";
export { default as CreateStudentReportModal } from "./components/modals/CreateStudentReportModal";
export { default as GenerateARPDFModal } from "./components/modals/GenerateARPDFModal";
export { default as NewCycleModal } from "./components/modals/NewCycleModal";
export { default as RTEPriorReportPopulationModal } from "./components/modals/RTEPriorReportPopulationModal";

// PDF Components
export { default as PDFViewer } from "./components/pdfs/PDFViewer";

// ============================================================================
// Hooks
// ============================================================================

export { default as useCompletedReports } from "./hooks/useCompletedReports";
export { default as useGetAnnualReportPDF } from "./hooks/useGetAnnualReportPDF";
export { default as useGetARARsWithoputPDF } from "./hooks/useGetARARsWithoputPDF";
export { default as useGetARARsWithPDF } from "./hooks/useGetARARsWithPDF";
export { default as useGetFullLatestReport } from "./hooks/useGetFullLatestReport";
export { default as useGetFullReport } from "./hooks/useGetFullReport";
export { default as useGetLatestReportMedia } from "./hooks/useGetLatestReportMedia";
export { default as useGetLegacyARPDFs } from "./hooks/useGetLegacyARPDFs";
export { default as useGetProgressReportAvailableReportYears } from "./hooks/useGetProgressReportAvailableReportYears";
export { default as useGetReportMedia } from "./hooks/useGetReportMedia";
export { default as useGetReportPDFs } from "./hooks/useGetReportPDFs";
export { default as useGetStudentReportAvailableReportYears } from "./hooks/useGetStudentReportAvailableReportYears";
export { default as useLatestReportsUnapproved } from "./hooks/useLatestReportsUnapproved";
export { default as useLatestReportYear } from "./hooks/useLatestReportYear";
export { default as useLatestYearsActiveProgressReports } from "./hooks/useLatestYearsActiveProgressReports";

// ============================================================================
// Services
// ============================================================================

export * from "./services/reports.service";

// ============================================================================
// Types
// ============================================================================

export type {
  AnnualReportSection,
  ProgressReportSection,
  StudentReportSection,
  IProgressReport,
  IStudentReport,
  IAnnualReportPDFObject,
  IReportEmailData,
} from "./types/reports.types";
