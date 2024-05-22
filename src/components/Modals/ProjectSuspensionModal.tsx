import {
  Box,
  Button,
  Center,
  Flex,
  FormControl,
  Grid,
  Input,
  InputGroup,
  ListItem,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Text,
  ToastId,
  UnorderedList,
  useColorMode,
  useToast,
} from "@chakra-ui/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRef } from "react";
import { useForm } from "react-hook-form";
import { ISimplePkProp, suspendProjectCall } from "../../lib/api";

interface Props {
  projectPk: string | number;
  isOpen: boolean;
  onClose: () => void;
  refetchData: () => void;
  projectStatus: string;
}

export const ProjectSuspensionModal = ({
  projectPk,
  isOpen,
  onClose,
  refetchData,
  projectStatus,
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

  const suspendMutation = useMutation({
    mutationFn: suspendProjectCall,
    onMutate: () => {
      addToast({
        status: "loading",
        title: `${
          projectStatus !== "suspended" ? "Suspending" : "Unsuspending "
        } Project`,
        position: "top-right",
      });
    },
    onSuccess: async () => {
      if (toastIdRef.current) {
        toast.update(toastIdRef.current, {
          title: "Success",
          description: `Project has been ${
            projectStatus !== "suspended" ? "suspended" : "unsuspended"
          }`,
          status: "success",
          position: "top-right",
          duration: 3000,
          isClosable: true,
        });
      }

      setTimeout(() => {
        // if (setIsAnimating) {
        //     setIsAnimating(false)
        // }
        queryClient.invalidateQueries({ queryKey: ["projects", projectPk] });
        refetchData();
        onClose();

        // navigate('/projects');

        // queryClient.refetchQueries([`mytasks`])
      }, 350);
    },
    onError: (error) => {
      if (toastIdRef.current) {
        toast.update(toastIdRef.current, {
          title: `Could not ${
            projectStatus !== "suspended" ? "suspend" : "unsuspend"
          } project`,
          description: `${error}`,
          status: "error",
          position: "top-right",
          duration: 3000,
          isClosable: true,
        });
      }
    },
  });

  const suspendProject = (formData: ISimplePkProp) => {
    console.log(formData);
    const newForm = {
      pk: projPk,
    };
    suspendMutation.mutate(newForm);
  };

  const { colorMode } = useColorMode();

  return (
    <Modal isOpen={isOpen} onClose={onClose} size={"md"}>
      <ModalOverlay />
      <Flex as={"form"} onSubmit={handleSubmit(suspendProject)}>
        <ModalContent bg={colorMode === "light" ? "white" : "gray.800"}>
          <ModalHeader>
            Are you sure you want to{" "}
            {projectStatus !== "suspended" ? "suspend" : "unsuspend"} this
            project?
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
                      {projectStatus !== "suspended"
                        ? "The project will become inactive, with the status set to 'suspended'"
                        : "The project will become active, with the status set to 'active'"}
                    </ListItem>
                    <ListItem>
                      {projectStatus !== "suspended"
                        ? "The project will not be closed, but it's progress reports will not be included on the Annual Report."
                        : "The project's progress reports will be included on the Annual Report, if one exists/is created for that FY."}
                    </ListItem>
                    {projectStatus !== "suspended" && (
                      <ListItem>
                        When a new Annual Reporting cycle begins, you will be
                        sent a request to update your progress report. Either
                        update the report or re-suspend the project.
                      </ListItem>
                    )}

                    <ListItem>
                      This will not create or delete any Project Closures
                    </ListItem>
                  </UnorderedList>
                </Box>

                <Center mt={2} p={5} pb={3}>
                  <Text
                    fontWeight={"bold"}
                    color={"blue.400"}
                    textDecoration={"underline"}
                  >
                    {projectStatus !== "suspended"
                      ? "You can unsuspend the project again at any time, setting the status of the project to 'active'"
                      : "You can suspend the project again at any time, immediately setting the status of the project to 'suspended'"}
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
                isLoading={suspendMutation.isPending}
                type="submit"
                ml={3}
              >
                {projectStatus !== "suspended"
                  ? "Suspend Project"
                  : "Unsuspend Project"}
              </Button>
            </Grid>
          </ModalFooter>
        </ModalContent>
      </Flex>
    </Modal>
  );
};
