// A button to control whether the box is editable.
// This will by default be implemented once a document has been approved.
// Only the system, directorate or program leader can click the button again to enable editing.

import { type ToastId, useToast, type UseToastOptions } from "@chakra-ui/react";
import { useMutation } from "@tanstack/react-query";
import { useRef } from "react";
import { FaSave } from "react-icons/fa";
import { type IHTMLSave, saveHtmlToDB } from "@/features/documents/services/documents.service";
import { BaseOptionsButton } from "./BaseOptionsButton";

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
  const ToastIdRef = useRef<ToastId | undefined>(undefined);
  const addToast = (data: UseToastOptions) => {
    ToastIdRef.current = toast(data);
  };

  const htmlSaveProjectMutation = useMutation({
    mutationFn: saveHtmlToDB,
    onMutate: () => {
      addToast({
        status: "loading",
        title: "Updating...",
        position: "top-right",
      });
    },
    onSuccess: () => {
      if (ToastIdRef.current) {
        toast.update(ToastIdRef.current, {
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
      if (ToastIdRef.current) {
        toast.update(ToastIdRef.current, {
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
