import { toast } from "sonner";
import { useMutation } from "@tanstack/react-query";
import { useRef, useState } from "react";
import { FaSave } from "react-icons/fa";
import {
  IHTMLGuideSave,
  saveGuideContentToDB,
  saveGuideHtmlToDB,
} from "@/features/admin/services/admin.service";
import { BaseOptionsButton } from "./BaseOptionsButton";

// Extended interface to support dynamic saving
interface ExtendedIHTMLGuideSave extends IHTMLGuideSave {
  // Updated the type signature to match our actual implementation
  onSave?: (content: string) => Promise<boolean>;
  fieldKey?: string; // Make fieldKey optional again, but we'll use section as fallback
}

export const GuideSaveButton = ({
  htmlData,
  adminOptionsPk,
  section,
  isUpdate,
  softRefetch,
  setIsEditorOpen,
  canSave,
  onSave, // Dynamic saving function
  fieldKey, // Added fieldKey prop
}: ExtendedIHTMLGuideSave) => {
  const [btnLoading, setBtnLoading] = useState(false);

  // Implement the second handleSave function
  const handleSave = async () => {
    if (!canSave) return;

    setBtnLoading(true);
    // Use fieldKey if provided, otherwise fall back to section
    const effectiveFieldKey = fieldKey || section;

    console.log("Save button clicked for field:", effectiveFieldKey);
    console.log(
      "HTML data:",
      typeof htmlData,
      htmlData ? htmlData.substring(0, 50) + "..." : "undefined",
    );
    console.log("HTML data length:", htmlData ? htmlData.length : 0);
    console.log("Admin options PK:", adminOptionsPk);

    try {
      let success = false;

      if (onSave) {
        // Dynamic saving method - onSave expects just the content string
        console.log("Using dynamic save method for field:", effectiveFieldKey);

        if (!htmlData) {
          console.error("HTML data is undefined or empty");
          toast.error("Error", {
            description: "No content to save",
          });
          setBtnLoading(false);
          return;
        }

        // Direct call to saveGuideContentToDB instead of going through the adapter chain
        // This is for debugging and can be removed later
        try {
          console.log("Direct call to saveGuideContentToDB with params:");
          const params = {
            fieldKey: effectiveFieldKey,
            content: htmlData,
            adminOptionsPk: adminOptionsPk,
          };
          console.log(
            "Params:",
            JSON.stringify({
              fieldKey: params.fieldKey,
              contentLength: params.content
                ? params.content.length
                : "undefined",
              adminOptionsPk: params.adminOptionsPk,
            }),
          );
          const directResult = await saveGuideContentToDB(params);
          success = !!directResult;
        } catch (directError) {
          console.error("Error in direct call:", directError);

          // Now let's try the regular onSave call as a fallback
          console.log("Trying regular onSave call as fallback");
          const result = await onSave(htmlData);
          success = !!result;
        }
      }

      if (success) {
        toast.success("Content saved");

        // Make sure refetch is called
        if (softRefetch) {
          console.log("Refetching data after save");
          softRefetch();
        }

        // Close the editor
        setTimeout(() => {
          setIsEditorOpen(false);
        }, 300);
      } else {
        toast.error("Error", {
          description: "Failed to save content",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      }
    } catch (error: any) {
      console.error("Error saving content:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to save content",
          description: "Failed to save content",
        });
      }

      setBtnLoading(false);
    };

  return (
    <BaseOptionsButton
      icon={FaSave}
      colorScheme="green"
      canRunFunction={canSave}
      onClick={handleSave}
      toolTipText="Save changes"
      isLoading={btnLoading}
    />
  );
};
