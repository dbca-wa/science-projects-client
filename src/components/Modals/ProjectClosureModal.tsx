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
  Select,
  Box,
  FormLabel,
  FormHelperText,
  UseToastOptions,
} from "@chakra-ui/react";
import { ICloseProjectProps, closeProjectCall } from "../../lib/api";
import { useEffect, useRef, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";

interface Props {
  projectKind: string;
  projectPk: string | number;
  isOpen: boolean;
  onClose: () => void;
  refetchData: () => void;
  setToLastTab: (tabToGoTo?: number) => void;
}

export const ProjectClosureModal = ({
  projectKind,
  projectPk,
  isOpen,
  onClose,
  refetchData,
  setToLastTab,
}: Props) => {
  const { register, handleSubmit, watch } = useForm<ICloseProjectProps>();
  const [closureReason, setClosureReason] = useState("");
  const reasonValue = watch("reason");
  const outcomeValue = watch("outcome");
  const projPk = watch("projectPk");

  const toast = useToast();
  const toastIdRef = useRef<ToastId | undefined>(undefined);
  const addToast = (data: UseToastOptions) => {
    toastIdRef.current = toast(data);
  };

  // Mutation, query client, onsubmit, and api function
  const queryClient = useQueryClient();

  const closureMutation = useMutation({
    mutationFn: closeProjectCall,
    onMutate: () => {
      addToast({
        status: "loading",
        title: `Closing`,
        position: "top-right",
      });
    },
    onSuccess: async () => {
      if (toastIdRef.current) {
        toast.update(toastIdRef.current, {
          title: "Success",
          description: `Closure Requested`,
          status: "success",
          position: "top-right",
          duration: 3000,
          isClosable: true,
        });
      }

      setTimeout(async () => {
        queryClient.invalidateQueries({ queryKey: ["projects", projectPk] });
        await refetchData();
        setToLastTab(-1);
        onClose();
      }, 350);
    },
    onError: (error) => {
      if (toastIdRef.current) {
        toast.update(toastIdRef.current, {
          title: `Could Not Request Closure`,
          description: `${error}`,
          status: "error",
          position: "top-right",
          duration: 3000,
          isClosable: true,
        });
      }
    },
  });

  const closeProject = () => {
    const newForm = {
      projectKind: projectKind,
      reason: reasonValue,
      projectPk: projPk,
      outcome: outcomeValue,
    };
    closureMutation.mutate(newForm);
  };

  const { colorMode } = useColorMode();

  useEffect(() => {
    let prefillText = "";
    let prefillHtml;
    if (outcomeValue === "completed") {
      prefillText = "The project has run its course and was completed";
    } else if (outcomeValue === "forcecompleted") {
      prefillText = "The project needed to be forcefully closed";
    } else if (outcomeValue === "suspended") {
      prefillText = "The project needs to be put on hold";
    } else if (outcomeValue === "terminated") {
      prefillText = "The project has not been completed, but is terminated.";
    }
    if (colorMode === "light") {
      prefillHtml = `<p class='editor-p-light'>${prefillText}</p>`;
    } else {
      prefillHtml = `<p class='editor-p-dark'>${prefillText}</p>`;
    }
    setClosureReason(prefillHtml);
  }, [colorMode, outcomeValue]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} size={"6xl"}>
      <ModalOverlay />
      <Flex
        as={"form"}
        onSubmit={handleSubmit(closeProject)}
        bg={colorMode === "light" ? "white" : "gray.800"}
      >
        <ModalContent bg={colorMode === "light" ? "white" : "gray.800"}>
          <ModalHeader>
            Are you sure you want to close this project?
          </ModalHeader>
          <ModalCloseButton />

          <ModalBody>
            <Grid
              gridTemplateColumns={"repeat(1, 1fr)"}
              gridGap={10}
              bg={colorMode === "light" ? "white" : "gray.800"}
            >
              <Box
                bg={colorMode === "light" ? "white" : "gray.800"}
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
                    <Text>
                      The project will remain in the system, however, the
                      following will occur:
                    </Text>
                  </Box>
                  <UnorderedList px={10} pt={4}>
                    <ListItem>Spawns a project closure document</ListItem>
                    <ListItem>Prevents any further reports</ListItem>
                    <ListItem>
                      Sets the status of the project to closure requested, until
                      the closure document is approved
                    </ListItem>
                  </UnorderedList>
                </Box>

                <Center mt={2} p={5} pb={3}>
                  <Text
                    fontWeight={"bold"}
                    color={"red.400"}
                    textDecoration={"underline"}
                  >
                    You can re-open the project at any time and the closure form
                    will be deleted.
                  </Text>
                </Center>
                <Center p={5}>
                  <Text fontWeight={"semibold"} color={"blue.500"}>
                    If instead you wish to permanently delete this project,
                    please press cancel and select 'Delete' from the menu.
                  </Text>
                </Center>

                <FormControl>
                  <InputGroup>
                    <Input
                      type="hidden"
                      {...register("projectPk", {
                        required: true,
                        value: Number(projectPk),
                      })}
                      readOnly
                    />
                  </InputGroup>
                </FormControl>

                <Center p={5}>
                  <FormControl isRequired>
                    <FormLabel>Outcome</FormLabel>
                    <Select
                      {...register("outcome", { required: true })}
                      variant="filled"
                      placeholder="Select a Closure Reason"
                    >
                      <option value={"completed"}>Completion</option>
                      <option value={"terminated"}>Termination</option>
                    </Select>
                    <FormHelperText>
                      Select an intended outcome for this project on closure.
                    </FormHelperText>
                  </FormControl>
                </Center>

                <FormControl>
                  <InputGroup>
                    <Input
                      type="hidden"
                      value={closureReason}
                      {...register("reason", { required: true })}
                    />
                  </InputGroup>
                </FormControl>

                <Center p={5}>
                  <Text fontWeight={"semibold"} textDecoration={"underline"}>
                    Once created, please fill out the scientific outputs,
                    knowledge transfer and data location sections on the closure
                    form.
                  </Text>
                </Center>
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
                background={colorMode === "light" ? "red.500" : "red.600"}
                _hover={{
                  background: colorMode === "light" ? "red.400" : "red.500",
                }}
                isLoading={closureMutation.isPending}
                type="submit"
                isDisabled={!closureReason || !outcomeValue || !projPk}
                ml={3}
              >
                Request Closure
              </Button>
            </Grid>
          </ModalFooter>
        </ModalContent>
      </Flex>
    </Modal>
  );
};
