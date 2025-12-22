import { UnboundStatefulEditor } from "@/shared/components/RichTextEditor/Editors/UnboundStatefulEditor";
import { updateMyBa, type IMyBAUpdateSubmissionData } from "@/features/users/services/users.service";
import useDistilledHtml from "@/shared/hooks/useDistilledHtml";
import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { Label } from "@/shared/components/ui/label";
import { useTheme } from "next-themes";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { StatefulMediaChanger } from "@/features/admin/components/StatefulMediaChanger";

interface IEditBA {
  pk: number;
  introduction: string;
  image: string;
  isOpen: boolean;
  onClose: () => void;
  refetch: () => void;
}

export const EditMyBusinessAreaModal = ({
  pk,
  introduction,
  image,
  isOpen,
  onClose,
  refetch,
}: IEditBA) => {
  const [introductionValue, setIntroductionValue] =
    useState<string>(introduction);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedImageUrl, setSelectedImageUrl] = useState<string>("");
  const [canUpdate, setCanUpdate] = useState<boolean>(false);

  const { theme } = useTheme();
  const isDark = theme === "dark";
  const introTextHtml = useDistilledHtml(introductionValue);
  const originalTextHtml = useDistilledHtml(introduction);

  useEffect(() => {
    // console.log(image);
    if (selectedImageUrl === "") {
      setSelectedImageUrl(image);
    }
    // console.log({
    //     selectedFile, selectedImageUrl, introductionValue, introTextHtml, originalTextHtml
    // })
    if (
      // nope if no intro
      !introductionValue ||
      introTextHtml.length < 1 ||
      // nope if no image
      (selectedFile === null && !selectedImageUrl) ||
      // nope if intro is the same and no new picture
      (introTextHtml === originalTextHtml && selectedImageUrl === image)
    ) {
      setCanUpdate(false);
    } else {
      setCanUpdate(true);
    }
  }, [
    selectedFile,
    selectedImageUrl,
    introductionValue,
    introTextHtml,
    originalTextHtml,
    image,
  ]);

  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: updateMyBa,
    onSuccess: () => {
      toast.success("Business Area Updated");
      queryClient.invalidateQueries({ queryKey: ["myBusinessAreas"] });
      refetch();

      setTimeout(() => {
        onClose();
      }, 350);
    },
    onError: () => {
      toast.error("Failed to update Business Area");
    },
  });

  const onSubmitBusinessAreaUpdate = (formData: IMyBAUpdateSubmissionData) => {
    mutation.mutate(formData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={`max-w-2xl ${isDark ? "text-gray-400" : ""}`}>
        <DialogHeader>
          <DialogTitle>Edit Business Area</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="introduction">Introduction *</Label>
            <UnboundStatefulEditor
              title={"Introduction"}
              showTitle={false}
              isRequired={false}
              showToolbar={true}
              setValueAsPlainText={false}
              value={introductionValue}
              setValueFunction={setIntroductionValue}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="image">Image *</Label>
            <StatefulMediaChanger
              helperText={"Upload an image that represents the Business Area."}
              selectedImageUrl={selectedImageUrl}
              setSelectedImageUrl={setSelectedImageUrl}
              selectedFile={selectedFile}
              setSelectedFile={setSelectedFile}
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            disabled={!canUpdate}
            className={`w-full ${
              isDark 
                ? "bg-blue-600 hover:bg-blue-500" 
                : "bg-blue-500 hover:bg-blue-400"
            } text-white`}
            onClick={() => {
              onSubmitBusinessAreaUpdate({
                pk: pk,
                introduction: introductionValue,
                image: selectedFile,
              });
            }}
          >
            {mutation.isPending ? "Updating..." : "Update"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
