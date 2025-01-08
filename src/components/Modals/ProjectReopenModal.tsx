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
  Box,
} from "@chakra-ui/react";
import { ISimplePkProp, openProjectCall } from "../../lib/api/api";
import { useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";

interface Props {
  projectPk: string | number;
  isOpen: boolean;
  onClose: () => void;
  refetchData: () => void;
}

export const ProjectReopenModal = ({
  projectPk,
  isOpen,
  onClose,
  refetchData,
}: Props) => {
  const { register, handleSubmit, watch } = useForm<ISimplePkProp>();
  const projPk = watch("pk");

  const toast = useToast();
  const toastIdRef = useRef<ToastId>();
  const addToast = (data) => {
    toastIdRef.current = toast(data);
  };

  // Mutation, query client, onsubmit, and api function
  const queryClient = useQueryClient();

  const reopenMutation = useMutation({
    mutationFn: openProjectCall,
    onMutate: () => {
      addToast({
        status: "loading",
        title: `Repening Project`,
        position: "top-right",
      });
    },
    onSuccess: async () => {
      if (toastIdRef.current) {
        toast.update(toastIdRef.current, {
          title: "Success",
          description: `Project has been reopened`,
          status: "success",
          position: "top-right",
          duration: 3000,
          isClosable: true,
        });
      }

      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ["projects", projectPk] });
        refetchData();
        onClose();
      }, 350);
    },
    onError: (error) => {
      if (toastIdRef.current) {
        toast.update(toastIdRef.current, {
          title: `Could not reopen project`,
          description: `${error}`,
          status: "error",
          position: "top-right",
          duration: 3000,
          isClosable: true,
        });
      }
    },
  });

  const openProject = (formData: ISimplePkProp) => {
    const newForm = {
      pk: projPk,
    };
    reopenMutation.mutate(newForm);
  };

  const { colorMode } = useColorMode();

  return (
    <Modal isOpen={isOpen} onClose={onClose} size={"md"}>
      <ModalOverlay />
      <Flex as={"form"} onSubmit={handleSubmit(openProject)}>
        <ModalContent bg={colorMode === "light" ? "white" : "gray.800"}>
          <ModalHeader>
            Are you sure you want to reopen this project?
          </ModalHeader>
          <ModalCloseButton />

          <ModalBody>
            <Grid gridTemplateColumns={"repeat(1, 1fr)"} gridGap={10}>
              <Box
                bg={colorMode === "light" ? "gray.50" : "gray.700"}
                rounded={"2xl"}
                p={2}
              >
                <Box px={4}>
                  <Text fontWeight={"semibold"} fontSize={"xl"}>
                    Info
                  </Text>
                </Box>

                <Box mt={8}>
                  <Box px={4}>
                    <Text>The following will occur:</Text>
                  </Box>
                  <UnorderedList px={10} pt={4}>
                    <ListItem>
                      The project will become active, with the status set to
                      'updating'
                    </ListItem>
                    <ListItem>
                      The project closure document will be deleted
                    </ListItem>
                    <ListItem>Progress Reports can be created again</ListItem>
                  </UnorderedList>
                </Box>

                <Center mt={2} p={5} pb={3}>
                  <Text
                    fontWeight={"bold"}
                    color={"blue.400"}
                    textDecoration={"underline"}
                  >
                    You can close the project again at any time.
                  </Text>
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
              </Box>
            </Grid>
          </ModalBody>
          <ModalFooter>
            <Grid gridTemplateColumns={"repeat(2, 1fr)"} gridGap={4}>
              <Button colorScheme="gray" onClick={onClose}>
                Cancel
              </Button>
              <Button
                color={"white"}
                background={colorMode === "light" ? "green.500" : "green.600"}
                _hover={{
                  background: colorMode === "light" ? "green.400" : "green.500",
                }}
                isLoading={reopenMutation.isPending}
                type="submit"
                ml={3}
              >
                Open Project
              </Button>
            </Grid>
          </ModalFooter>
        </ModalContent>
      </Flex>
    </Modal>
  );
};
