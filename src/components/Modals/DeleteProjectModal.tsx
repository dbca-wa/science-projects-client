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
  UseToastOptions,
} from "@chakra-ui/react";
import { deleteProjectCall } from "@/lib/api";
import { useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { ISimplePkProp } from "@/types";

interface Props {
  projectPk: string | number;
  isOpen: boolean;
  onClose: () => void;
}

export const DeleteProjectModal = ({ projectPk, isOpen, onClose }: Props) => {
  const navigate = useNavigate();

  const toast = useToast();
  const toastIdRef = useRef<ToastId | undefined>(undefined);
  const addToast = (data: UseToastOptions) => {
    toastIdRef.current = toast(data);
  };

  // Mutation, query client, onsubmit, and api function
  const queryClient = useQueryClient();

  const deleteProjectMutation = useMutation({
    mutationFn: deleteProjectCall,
    onMutate: () => {
      addToast({
        status: "loading",
        title: `Deleting`,
        position: "top-right",
      });
    },
    onSuccess: async () => {
      if (toastIdRef.current) {
        toast.update(toastIdRef.current, {
          title: "Success",
          description: `Project Deleted`,
          status: "success",
          position: "top-right",
          duration: 3000,
          isClosable: true,
        });
      }

      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ["projects", projectPk] });
        navigate("/projects");
      }, 350);
    },
    onError: (error) => {
      if (toastIdRef.current) {
        toast.update(toastIdRef.current, {
          title: `Could Not delete project`,
          description: `${error}`,
          status: "error",
          position: "top-right",
          duration: 3000,
          isClosable: true,
        });
      }
    },
  });

  const deleteProject = (formData: ISimplePkProp) => {
    deleteProjectMutation.mutate(formData);
  };

  const { colorMode } = useColorMode();
  const { register, handleSubmit } = useForm<ISimplePkProp>();

  return (
    <Modal isOpen={isOpen} onClose={onClose} size={"md"}>
      <ModalOverlay />
      <Flex as={"form"} onSubmit={handleSubmit(deleteProject)}>
        <ModalContent
          color={colorMode === "dark" ? "gray.400" : null}
          bg={colorMode === "light" ? "white" : "gray.800"}
        >
          <ModalHeader>Delete Project?</ModalHeader>
          <ModalCloseButton />

          <ModalBody>
            <Center>
              <Text fontWeight={"semibold"} fontSize={"xl"}>
                Are you sure you want to delete this project? There's no turning
                back.
              </Text>
            </Center>
            <Center mt={8}>
              <UnorderedList>
                <ListItem>The Project team and area will be cleared</ListItem>
                <ListItem>The project photo will be deleted</ListItem>
                <ListItem>Any related comments will be deleted</ListItem>
                <ListItem>All related documents will be deleted</ListItem>
              </UnorderedList>
            </Center>
            <FormControl>
              <InputGroup>
                <Input
                  type="hidden"
                  {...register("pk", {
                    required: true,
                    value: Number(projectPk),
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
                This is permanent.
              </Text>
            </Center>
            <Center p={5}>
              <Text fontWeight={"semibold"} color={"blue.500"}>
                If instead you wish to create a project closure, please press
                cancel and select 'Create Closure' from the vertical ellipsis.
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
                isLoading={deleteProjectMutation.isPending}
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
