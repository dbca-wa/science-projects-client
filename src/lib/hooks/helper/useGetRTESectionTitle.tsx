import { GuideSections } from "@/lib/api/api";
import { EditorSubsections } from "@/types";
import { useState, useEffect } from "react";

export const useGetRTESectionTitle = (
  section: GuideSections | EditorSubsections,
) => {
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
        setSectionText("Expected Outcomes");
        break;
      case "collaborations":
        setSectionText("Collaborations");
        break;
      case "strategic_context":
        setSectionText("Strategic Context");
        break;
      case "staff_time_allocation":
        setSectionText("Staff Time Allocation (FTE)");
        break;
      case "budget":
        setSectionText("Indicative Operating Budget ($)");
        break;
      case "knowledge_transfer":
        setSectionText("Knowledge Transfer");
        break;
      case "project_tasks":
        setSectionText("Milestones");
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
        setSectionText("Number of Voucher Specimens");
        break;
      case "operating_budget":
        setSectionText("Consolidated Funds");
        break;
      case "operating_budget_external":
        setSectionText("External Funds");
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
      case "dm_sign":
        setSectionText("Director's Message Sign-Off");
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
      case "guide_report":
        setSectionText("Annual Report");
        break;
      case "guide_documents":
        setSectionText("Project Documents");
        break;
      case "guide_project_team":
        setSectionText("Project Teams");
        break;
      case "guide_project_view":
        setSectionText("Search Projects");
        break;
      case "guide_project_creation":
        setSectionText("Project Creation");
        break;
      case "guide_user_view":
        setSectionText("Search Users");
        break;
      case "guide_user_creation":
        setSectionText("User Creation");
        break;
      case "guide_profile":
        setSectionText("User Profile");
        break;
      case "guide_login":
        setSectionText("Login");
        break;
      case "guide_about":
        setSectionText("About");
        break;
      case "guide_admin":
        setSectionText("Admin");
        break;
      default:
        setSectionText("Scientific Outputs");
    }
  }, [section]);

  return sectionText;
};
