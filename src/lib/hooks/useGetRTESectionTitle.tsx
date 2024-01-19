import { useState, useEffect } from "react";

export const useGetRTESectionTitle = (section: string) => {
  const [sectionText, setSectionText] = useState("");

  useEffect(() => {
    switch (section) {
      case "description":
        setSectionText("Description");
        break;
      case "background":
        setSectionText("Background");
        break;
      case "aims":
        setSectionText("Aims");
        break;
      case "outcome":
        setSectionText("Expected Outcome");
        break;
      case "collaborations":
        setSectionText("Collaborations");
        break;
      case "strategic_context":
        setSectionText("Strategic Context");
        break;
      case "staff_time_allocation":
        setSectionText("Staff Time Allocation");
        break;
      case "budget":
        setSectionText("Indicative Operating Budget");
        break;
      case "knowledge_transfer":
        setSectionText("Knowledge Transfer");
        break;
      case "project_tasks":
        setSectionText("Tasks and Milestones");
        break;
      case "related_projects":
        setSectionText("Related Science Projects");
        break;
      case "listed_references":
        setSectionText("References");
        break;
      case "data_management":
        setSectionText("Data Management");
        break;
      case "methodology":
        setSectionText("Methodology");
        break;
      case "specimens":
        setSectionText("No. of Specimens");
        break;
      case "operating_budget":
        setSectionText("Operating Budget");
        break;
      case "operating_budget_external":
        setSectionText("External Budget");
        break;
      case "context":
        setSectionText("Context");
        break;
      case "progress":
        setSectionText("Progress");
        break;
      case "implications":
        setSectionText("Management Implications");
        break;
      case "future":
        setSectionText("Future Directions");
        break;
      case "progress_report":
        setSectionText("Progress Report");
        break;
      case "reason":
        setSectionText("Reason");
        break;
      case "intended_outcome":
        setSectionText("Intended Outcome");
        break;
      case "data_location":
        setSectionText("Data Location");
        break;
      case "hardcopy_location":
        setSectionText("Hardcopy Location");
        break;
      case "backup_location":
        setSectionText("Backup Location");
        break;
      case "dm":
        setSectionText("Director's Message");
        break;
      case "service_delivery_intro":
        setSectionText("Service Delivery Intro");
        break;
      case "research_intro":
        setSectionText("Research Intro");
        break;
      case "student_intro":
        setSectionText("Student Intro");
        break;
      case "publications":
        setSectionText("Publications");
        break;
      case "externalDescription":
        setSectionText("External Description");
        break;
      case "externalAims":
        setSectionText("External Aims");
        break;
      default:
        setSectionText("Scientific Outputs");
    }
  }, [section]);

  return sectionText;
};
