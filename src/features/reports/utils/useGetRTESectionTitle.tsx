import type { GuideSections } from "@/features/admin/services/admin.service";
import type { EditorSubsections } from "@/shared/types";
import { useEffect, useState } from "react";

export const useGetRTESectionTitle = (
  section: GuideSections | EditorSubsections | string, // Add string type for dynamic sections
) => {
  const [sectionText, setSectionText] = useState("");

  useEffect(() => {
    // Handle all existing cases first to maintain backward compatibility
    switch (section) {
      // Project fields
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

      // Guide section keys
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
        // Handle dynamic guide section keys
        if (typeof section === "string") {
          if (section.startsWith("guide_")) {
            // Extract title from guide section key
            const sectionName = section.replace(/^guide_/, "");

            // Format the section name
            const formattedTitle = sectionName
              .split("_")
              .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
              .join(" ");

            setSectionText(formattedTitle);
            break;
          }
        }

        // Fallback to default
        setSectionText("Scientific Outputs");
    }
  }, [section]);

  return sectionText;
};
