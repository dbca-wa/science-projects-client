// A button to control whether the box is editable.
// This will by default be implemented once a document has been approved.
// Only the system, directorate or program leader can click the button again to enable editing.

import { ToastId, useToast } from "@chakra-ui/react";
import { useMutation } from "@tanstack/react-query";
import { useRef } from "react";
import { FaSave } from "react-icons/fa";
import { IHTMLGuideSave, saveGuideHtmlToDB } from "../../../lib/api";
import { BaseOptionsButton } from "./BaseOptionsButton";

export const GuideSaveButton = ({
  htmlData,
  adminOptionsPk,
  section,
  isUpdate,
  softRefetch,
  setIsEditorOpen,
  canSave,
}: IHTMLGuideSave) => {
  const toast = useToast();
  const toastIdRef = useRef<ToastId>();
  const addToast = (data) => {
    toastIdRef.current = toast(data);
  };

  const htmlSaveGuide = useMutation({
    mutationFn: saveGuideHtmlToDB,
    onMutate: () => {
      addToast({
        status: "loading",
        title: "Updating...",
        position: "top-right",
      });
    },
    onSuccess: () => {
      if (toastIdRef.current) {
        toast.update(toastIdRef.current, {
          title: "Success",
          description: `Saved Text`,
          status: "success",
          position: "top-right",
          duration: 3000,
          isClosable: true,
        });
      }

      setTimeout(() => {
        if (softRefetch) {
          softRefetch();
        }
        setIsEditorOpen(false);
      }, 350);
    },
    onError: (error) => {
      if (toastIdRef.current) {
        toast.update(toastIdRef.current, {
          title: "Could Not Update",
          description: `${error}`,
          status: "error",
          position: "top-right",
          duration: 3000,
          isClosable: true,
        });
      }
    },
  });

  const saveToDB = (formData: IHTMLGuideSave) => {
    htmlSaveGuide.mutate(formData);
  };

  return (
    <BaseOptionsButton
      icon={FaSave}
      colorScheme="green"
      canRunFunction={canSave}
      onClick={() =>
        saveToDB({
          htmlData,
          isUpdate,
          adminOptionsPk,
          section,
          canSave,
        })
      }
      toolTipText="Save changes"
    />
  );
};
