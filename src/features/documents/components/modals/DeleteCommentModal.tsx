import {
  Text,
  Center,
  Flex,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  type ToastId,
  useToast,
  useColorMode,
  FormControl,
  InputGroup,
  Input,
  ModalFooter,
  Grid,
  Button,
  type UseToastOptions,
} from "@chakra-ui/react";
import { IDeleteComment, deleteCommentCall } from "@/features/documents/services/documents.service";
import { useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";

interface Props {
  commentPk: string | number;
  documentPk: string | number;
  refetchData: () => void;
  isOpen: boolean;
  onClose: () => void;
  onDeleteSuccess?: () => void;
}

export const DeleteCommentModal = ({
  commentPk,
  documentPk,
  refetchData,
  isOpen,
  onClose,
  onDeleteSuccess,
}: Props) => {
  const toast = useToast();
  const ToastIdRef = useRef<ToastId | undefined>(undefined);
  const addToast = (data: UseToastOptions) => {
    ToastIdRef.current = toast(data);
  };

  // Mutation, query client, onsubmit, and api function
  const queryClient = useQueryClient();

  const deleteCommentMutation = useMutation({
    mutationFn: deleteCommentCall,
    onMutate: () => {
      addToast({
        status: "loading",
        title: `Removing Comment`,
        position: "top-right",
      });
    },
    onSuccess: async () => {
      if (ToastIdRef.current) {
        toast.update(ToastIdRef.current, {
          title: "Success",
          description: `Comment Removed`,
          status: "success",
          position: "top-right",
          duration: 3000,
          isClosable: true,
        });
        onDeleteSuccess?.();
      }
      queryClient.invalidateQueries({
        queryKey: ["documentComments", documentPk],
      });

      setTimeout(async () => {
        await refetchData();
        onClose();
      }, 150);
    },
    onError: (error) => {
      if (ToastIdRef.current) {
        toast.update(ToastIdRef.current, {
          title: `Could not remove comment`,
          description: `${error}`,
          status: "error",
          position: "top-right",
          duration: 3000,
          isClosable: true,
        });
      }
    },
  });

  const deleteComment = (formData: IDeleteComment) => {
    // console.log(formData);
    deleteCommentMutation.mutate(formData);
  };

  const { colorMode } = useColorMode();
  const { register, handleSubmit } = useForm<IDeleteComment>();

  return (
    <Modal isOpen={isOpen} onClose={onClose} size={"md"}>
      <ModalOverlay />
      <Flex as={"form"} onSubmit={handleSubmit(deleteComment)}>
        <ModalContent
          color={colorMode === "dark" ? "gray.400" : null}
          bg={colorMode === "light" ? "white" : "gray.800"}
        >
          <ModalHeader>Delete Comment?</ModalHeader>
          <ModalCloseButton />

          <ModalBody>
            <Center>
              <Text fontWeight={"semibold"} fontSize={"xl"}>
                Are you sure you want to delete this comment? There's no turning
                back.
              </Text>
            </Center>
            <FormControl>
              <InputGroup>
                <Input
                  type="hidden"
                  {...register("commentPk", {
                    required: true,
                    value: Number(commentPk),
                  })}
                  readOnly
                />
              </InputGroup>
            </FormControl>
            <FormControl>
              <InputGroup>
                <Input
                  type="hidden"
                  {...register("documentPk", {
                    required: true,
                    value: Number(documentPk),
                  })}
                  readOnly
                />
              </InputGroup>
            </FormControl>
            <Center mt={2} p={5} pb={3}>
              <Text
                fontWeight={"bold"}
                color={"red.400"}
                textDecoration={"underline"}
              >
                This is irreversible.
              </Text>
            </Center>
          </ModalBody>
          <ModalFooter>
            <Grid gridTemplateColumns={"repeat(2, 1fr)"} gridGap={4}>
              <Button colorScheme="gray" onClick={onClose}>
                Cancel
              </Button>
              <Button
                color={"white"}
                background={colorMode === "light" ? "red.500" : "red.600"}
                _hover={{
                  background: colorMode === "light" ? "red.400" : "red.500",
                }}
                isLoading={deleteCommentMutation.isPending}
                type="submit"
                ml={3}
              >
                Delete
              </Button>
            </Grid>
          </ModalFooter>
        </ModalContent>
      </Flex>
    </Modal>
  );
};
