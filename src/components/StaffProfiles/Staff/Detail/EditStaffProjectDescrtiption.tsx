import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { useMediaQuery } from "@/lib/utils/useMediaQuery";
import React, { useCallback, useEffect, useRef, useState } from "react";
import AddItemButton from "./AddItemButton";
import { MdEdit } from "react-icons/md";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import DatabaseRichTextEditor from "../../Editor/DatabaseRichTextEditor";
import { Controller, useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { ToastId, useToast } from "@chakra-ui/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  IUpdateProjectDescription,
  updateProjectDescription,
} from "@/lib/api/api";
import { useEditorContext } from "@/lib/hooks/helper/EditorBlockerContext";

interface IEditDescriptionProps {
  projectId: number;
  projectDescription: string;
  refetch: () => void;
  contentKind?: "drawer" | "dialog";
  onClose?: () => void;
}

const EditStaffProjectDescrtiption = ({
  projectId,
  projectDescription,
  refetch,
}: IEditDescriptionProps) => {
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const [isOpen, setIsOpen] = useState(false);
  const handleClose = () => setIsOpen(false);

  return isDesktop ? (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger>
        <EditTriggerContent />
      </DialogTrigger>
      <DialogContent className="max-h-[80vh] w-[700px] max-w-[700px] overflow-y-auto text-slate-800">
        <DialogHeader>
          <DialogTitle className="mb-2 mt-3">Edit Description</DialogTitle>
        </DialogHeader>
        <EditDecriptionContent
          projectId={projectId}
          projectDescription={projectDescription}
          refetch={refetch}
          contentKind="dialog"
          onClose={handleClose}
        />
      </DialogContent>
    </Dialog>
  ) : (
    <Drawer>
      <DrawerTrigger>
        <EditTriggerContent />
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>Edit Description</DrawerHeader>
        <EditDecriptionContent
          projectId={projectId}
          projectDescription={projectDescription}
          refetch={refetch}
          contentKind="drawer"
          onClose={handleClose}
        />
      </DrawerContent>
    </Drawer>
  );
};

const EditTriggerContent = () => {
  return (
    <span className="flex items-center">
      <AddItemButton
        ml={4}
        // mt={-3}
        icon={MdEdit}
        ariaLabel={"Edit Description Button"}
        label={"Edit Description"}
        onClick={() => {}}
        innerItemSize={"20px"}
        p={1}
        outline={"none"}
      />
    </span>
  );
};

const EditDecriptionContent = ({
  projectId,
  projectDescription,
  refetch,
  contentKind,
  onClose,
}: IEditDescriptionProps) => {
  const queryClient = useQueryClient();
  const toast = useToast();
  const toastIdRef = useRef<ToastId>();
  const addToast = (data) => {
    toastIdRef.current = toast(data);
  };
  const [isUpdating, setIsUpdating] = useState(false);
  const { openEditorsCount, closeEditor } = useEditorContext();

  const closeAllEditors = useCallback(() => {
    if (openEditorsCount > 0) {
      closeEditor();
      setTimeout(closeAllEditors, 0); // Schedule the next call after a short delay
    }
  }, [openEditorsCount, closeEditor]);
  const updateProject = async (formData: IUpdateProjectDescription) => {
    setIsUpdating(true);
    console.log(formData);
    await updateDescriptionMutation.mutate(formData);
    setIsUpdating(false);
  };

  useEffect(() => {
    if (isUpdating) {
      closeAllEditors();
    }
  }, [isUpdating, closeAllEditors]);

  const updateDescriptionMutation = useMutation({
    mutationFn: updateProjectDescription,
    onMutate: () => {
      addToast({
        status: "loading",
        title: `Updating Project`,
        position: "top-right",
      });
    },
    onSuccess: async () => {
      if (toastIdRef.current) {
        toast.update(toastIdRef.current, {
          title: "Success",
          description: `Project Updated`,
          status: "success",
          position: "top-right",
          duration: 3000,
          isClosable: true,
        });
      }

      setTimeout(() => {
        queryClient.invalidateQueries({
          queryKey: ["projects", projectId],
        });
        refetch();
        onClose();
      }, 350);
    },
    onError: (error) => {
      if (toastIdRef.current) {
        toast.update(toastIdRef.current, {
          title: `Could Not udpate project`,
          description: `${error}`,
          status: "error",
          position: "top-right",
          duration: 3000,
          isClosable: true,
        });
      }
    },
  });

  const {
    register,
    handleSubmit,
    control,
    formState: { isValid },
    // watch,
  } = useForm<IUpdateProjectDescription>();

  const isDesktop = useMediaQuery("(min-width: 768px)");

  return (
    <div className="w-full">
      <form className="text-slate-800" onSubmit={handleSubmit(updateProject)}>
        <div className="">
          <Input
            type="hidden"
            {...register("pk", {
              required: true,
              value: projectId,
            })}
            readOnly
          />

          <Controller
            name="description"
            control={control}
            defaultValue={projectDescription}
            render={({ field }) => (
              <DatabaseRichTextEditor
                populationData={projectDescription}
                label="Description"
                hideLabel
                htmlFor="description"
                isEdit
                field={field}
                registerFn={register}
                isMobile={!isDesktop}
              />
            )}
          />
        </div>

        <div className="flex w-full justify-end">
          {contentKind === "drawer" && (
            <DrawerClose asChild className="mb-8 mr-3 mt-3">
              <Button variant="outline">Cancel</Button>
            </DrawerClose>
          )}

          <Button
            type="submit"
            disabled={!isValid || updateDescriptionMutation.isPending}
            className="mt-3"
          >
            Update
          </Button>
        </div>
      </form>
    </div>
  );
};

export default EditStaffProjectDescrtiption;
