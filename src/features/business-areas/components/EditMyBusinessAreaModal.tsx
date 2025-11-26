import { UnboundStatefulEditor } from "@/shared/components/RichTextEditor/Editors/UnboundStatefulEditor";
import { updateMyBa, type IMyBAUpdateSubmissionData } from "@/features/users/services/users.service";
import useDistilledHtml from "@/shared/hooks/useDistilledHtml";
import {
  Button,
  FormControl,
  FormLabel,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  useColorMode,
  useToast,
} from "@chakra-ui/react";
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

  const { colorMode } = useColorMode();
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

  const toast = useToast();

  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: updateMyBa,
    onSuccess: () => {
      toast({
        status: "success",
        title: "Created",
        position: "top-right",
      });
      queryClient.invalidateQueries({ queryKey: ["myBusinessAreas"] });
      refetch();

      setTimeout(() => {
        onClose();
      }, 350);
    },
    onError: () => {
      toast({
        status: "error",
        title: "Failed",
        position: "top-right",
      });
    },
  });

  const onSubmitBusinessAreaUpdate = (formData: IMyBAUpdateSubmissionData) => {
    mutation.mutate(formData);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size={"2xl"}>
      <ModalOverlay />
      <ModalContent color={colorMode === "dark" ? "gray.400" : null}>
        <ModalCloseButton onClick={onClose} />
        <ModalHeader>Edit Business Area</ModalHeader>
        <ModalBody>
          <FormControl isRequired mb={4}>
            <FormLabel>Introduction</FormLabel>
            <UnboundStatefulEditor
              title={"Introduction"}
              showTitle={false}
              isRequired={false}
              showToolbar={true}
              setValueAsPlainText={false}
              value={introductionValue}
              setValueFunction={setIntroductionValue}
            />
          </FormControl>

          <FormControl isRequired>
            <FormLabel>Image</FormLabel>

            <StatefulMediaChanger
              helperText={"Upload an image that represents the Business Area."}
              selectedImageUrl={selectedImageUrl}
              setSelectedImageUrl={setSelectedImageUrl}
              selectedFile={selectedFile}
              setSelectedFile={setSelectedFile}
            />
          </FormControl>
        </ModalBody>

        <ModalFooter>
          <Button
            isDisabled={!canUpdate}
            isLoading={mutation.isPending}
            color={"white"}
            background={colorMode === "light" ? "blue.500" : "blue.600"}
            _hover={{
              background: colorMode === "light" ? "blue.400" : "blue.500",
            }}
            size="lg"
            width={"100%"}
            onClick={() => {
              onSubmitBusinessAreaUpdate({
                pk: pk,
                introduction: introductionValue,
                image: selectedFile,
              });
            }}
          >
            Update
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
