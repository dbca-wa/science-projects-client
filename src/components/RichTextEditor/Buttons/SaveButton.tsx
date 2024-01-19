// A button to control whether the box is editable.
// This will by default be implemented once a document has been approved.
// Only the system, directorate or program leader can click the button again to enable editing.

import { ToastId, useToast } from "@chakra-ui/react";
import { useRef } from "react";
import { BaseOptionsButton } from "./BaseOptionsButton";
import { FaSave } from "react-icons/fa";
import { useMutation } from "@tanstack/react-query";
import { IHTMLSave, saveHtmlToDB } from "../../../lib/api";

export const SaveButton = ({
  editorType,
  htmlData,
  project_pk,
  document_pk,
  section,
  isUpdate,
  writeable_document_kind,
  writeable_document_pk,
  details_pk,
  softRefetch,
  setIsEditorOpen,
  canSave,
}: IHTMLSave) => {
  const toast = useToast();
  const toastIdRef = useRef<ToastId>();
  const addToast = (data) => {
    toastIdRef.current = toast(data);
  };

  const htmlSaveProjectMutation = useMutation(saveHtmlToDB, {
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

  const saveToDB = (formData: IHTMLSave) => {
    htmlSaveProjectMutation.mutate(formData);
  };

  return (
    <BaseOptionsButton
      icon={FaSave}
      colorScheme="green"
      canRunFunction={canSave}
      onClick={() =>
        saveToDB({
          details_pk,
          editorType,
          htmlData,
          project_pk,
          document_pk,
          section,
          isUpdate,
          writeable_document_kind,
          writeable_document_pk,
          canSave,
        })
      }
      toolTipText="Save changes"
    />
  );
};
