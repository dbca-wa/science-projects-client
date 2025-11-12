import { useMemo } from "react";

export const useGetRTESectionPlaceholder = (section: string) => {
  const placeholderText = useMemo(() => {
    // Legacy implementation - check for exact matches first
    switch (section) {
      // Project related fields
      case "description":
        return "a project description";
      case "title":
        return "a project title";
      case "tagline":
        return "a project tagline";
      case "background":
        return "some background";
      case "aims":
        return "some aims";
      case "outcome":
        return "an expected outcome";
      case "collaborations":
        return "expected collaborations";
      case "strategic_context":
        return "a strategic context";
      case "staff_time_allocation":
        return "a staff time allocation";
      case "budget":
        return "an operating budget";
      case "external_budget":
        return "an external budget";
      case "knowledge_transfer":
        return "knowledge transfer";
      case "project_tasks":
        return "milestones";
      case "related_projects":
        return "names of related projects";
      case "listed_references":
        return "references";
      case "data_management":
        return "data management";
      case "methodology":
        return "methodology";
      case "progress":
        return "this year's progress";
      case "progress_report":
        return "progress made.";
      case "implications":
        return "management implications";
      case "future":
        return "future directions";
      case "reason":
        return "a reason of closure";
      case "intended_outcome":
        return "an intended outcome";
      case "data_location":
        return "a data location";
      case "hardcopy_location":
        return "a hardcopy location";
      case "backup_location":
        return "a backup location";
      case "scientific_outputs":
      case "outputs":
        return "scientific outputs";
      case "context":
        return "some context";

      // Guide section fields
      case "guide_admin":
        return "administration instructions";
      case "guide_about":
        return "information about the platform";
      case "guide_login":
        return "login instructions";
      case "guide_profile":
        return "profile management instructions";
      case "guide_user_creation":
        return "user creation instructions";
      case "guide_user_view":
        return "user viewing instructions";
      case "guide_project_creation":
        return "project creation instructions";
      case "guide_project_view":
        return "project viewing instructions";
      case "guide_project_team":
        return "team management instructions";
      case "guide_documents":
        return "document management instructions";
      case "guide_report":
        return "report creation instructions";

      default:
        // For dynamic section keys, check for common patterns
        if (section.startsWith("guide_")) {
          // This is a guide section field
          const sectionName = section.replace(/^guide_/, "");

          // Look for common patterns in the field key
          if (
            sectionName.includes("_creation") ||
            sectionName.includes("_create")
          ) {
            return (
              sectionName.replace(/(_creation|_create).*$/, "") +
              " creation instructions"
            );
          }

          if (
            sectionName.includes("_view") ||
            sectionName.includes("_display")
          ) {
            return (
              sectionName.replace(/(_view|_display).*$/, "") +
              " viewing instructions"
            );
          }

          if (
            sectionName.includes("_manage") ||
            sectionName.includes("_management")
          ) {
            return (
              sectionName.replace(/(_manage|_management).*$/, "") +
              " management instructions"
            );
          }

          if (sectionName.includes("_help") || sectionName.includes("_guide")) {
            return sectionName.replace(/(_help|_guide).*$/, "") + " guidance";
          }

          // Default case for guide sections - replace underscores with spaces
          return sectionName.replace(/_/g, " ") + " content";
        }

        // Default for non-guide fields
        return "some text";
    }
  }, [section]);

  return placeholderText;
};

export default useGetRTESectionPlaceholder;
