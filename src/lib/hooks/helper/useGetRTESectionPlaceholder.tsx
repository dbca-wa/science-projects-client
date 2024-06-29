import { useMemo } from "react";

export const useGetRTESectionPlaceholder = (section: string) => {
  const placeholderText = useMemo(() => {
    switch (section) {
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
      case "scientific_outputs" || "outputs":
        return "scientific outputs";
      case "context":
        return "some context";
      default:
        return "some text";
    }
  }, [section]);

  return placeholderText;
};
