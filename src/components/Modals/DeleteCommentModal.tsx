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
  ToastId,
  useToast,
  useColorMode,
  UnorderedList,
  ListItem,
  FormControl,
  InputGroup,
  Input,
  ModalFooter,
  Grid,
  Button,
} from "@chakra-ui/react";
import {
  IDeleteComment,
  ISimplePkProp,
  deleteCommentCall,
  deleteProjectCall,
} from "../../lib/api";
import { useEffect, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { IUserMe } from "../../types";
import { useForm } from "react-hook-form";
import { useGetStudentReportAvailableReportYears } from "../../lib/hooks/useGetStudentReportAvailableReportYears";
import { useGetProgressReportAvailableReportYears } from "../../lib/hooks/useGetProgressReportAvailableReportYears";

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
  const toastIdRef = useRef<ToastId>();
  const addToast = (data: any) => {
    toastIdRef.current = toast(data);
  };

  // Mutation, query client, onsubmit, and api function
  const queryClient = useQueryClient();

  const deleteCommentMutation = useMutation(deleteCommentCall, {
    onMutate: () => {
      addToast({
        status: "loading",
        title: `Removing Comment`,
        position: "top-right",
      });
    },
    onSuccess: async (data) => {
      if (toastIdRef.current) {
        toast.update(toastIdRef.current, {
          title: "Success",
          description: `Comment Removed`,
          status: "success",
          position: "top-right",
          duration: 3000,
          isClosable: true,
        });
        onDeleteSuccess && onDeleteSuccess();
      }
      // onClose();
      queryClient.invalidateQueries(["documentComments", documentPk]);

      setTimeout(async () => {
        await refetchData();
        console.log("removing");
        onClose();
      }, 150);
    },
    onError: (error) => {
      if (toastIdRef.current) {
        toast.update(toastIdRef.current, {
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
    console.log(formData);
    deleteCommentMutation.mutate(formData);
  };

  const { colorMode } = useColorMode();
  const { register, handleSubmit, reset, watch } = useForm<IDeleteComment>();

  const commentsPk = watch("commentPk");
  useEffect(() => console.log(commentsPk, commentPk), [commentPk, commentsPk]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} size={"md"}>
      <ModalOverlay />
      <Flex as={"form"} onSubmit={handleSubmit(deleteComment)}>
        <ModalContent bg={colorMode === "light" ? "white" : "gray.800"}>
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
                colorScheme="red"
                isLoading={deleteCommentMutation.isLoading}
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