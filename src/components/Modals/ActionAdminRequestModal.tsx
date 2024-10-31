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
import { actionAdminRequestCall } from "../../lib/api";
import { useEffect, useRef, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { IActionAdminTask, IAdminTask } from "../../types";
import { AxiosError } from "axios";
import { useNavigate } from "react-router-dom";
import { formatDate } from "date-fns";

interface Props {
  action: "deleteproject" | "mergeuser" | "setcaretaker";
  projectPk?: number;
  task?: IAdminTask;
  taskPk: number;
  isOpen: boolean;
  onClose: () => void;
  refetch?: () => void;
}

export const ActionAdminRequestModal = ({
  action,
  projectPk,
  task,
  taskPk,
  isOpen,
  onClose,
  refetch,
}: Props) => {
  useEffect(() => {
    console.log({ task });
  }, [task]);
  const toast = useToast();
  const toastIdRef = useRef<ToastId>();
  const addToast = (data) => {
    toastIdRef.current = toast(data);
  };
  const [decision, setDecision] = useState("");
  const navigate = useNavigate();

  // Mutation, query client, onsubmit, and api function
  const queryClient = useQueryClient();

  const actionAdminRequestMutation = useMutation({
    mutationFn: actionAdminRequestCall,
    onMutate: () => {
      addToast({
        status: "loading",
        title: `Actioning Request`,
        position: "top-right",
      });
    },
    onSuccess: async () => {
      if (toastIdRef.current) {
        toast.update(toastIdRef.current, {
          title: "Success",
          description: `Action successful`,
          status: "success",
          position: "top-right",
          duration: 3000,
          isClosable: true,
        });
      }

      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ["pendingAdminTasks"] });
        if (action === "deleteproject") {
          if (decision === "reject") {
            queryClient
              .invalidateQueries({ queryKey: ["project", projectPk] })
              .then(() => refetch?.())
              .then(() => onClose());
          } else if (decision === "approve") {
            queryClient
              .invalidateQueries({ queryKey: ["projects"] })
              .then(() => navigate("/"));
          }
        } else if (action === "mergeuser" || action === "setcaretaker") {
          queryClient
            .invalidateQueries({ queryKey: ["users"] })
            .then(() => refetch?.())
            .then(() => onClose());
        }
      }, 350);
    },
    onError: (error: AxiosError) => {
      if (toastIdRef.current) {
        toast.update(toastIdRef.current, {
          title: `Could not action request`,
          description: `${error.response.data}`,
          status: "error",
          position: "top-right",
          duration: 3000,
          isClosable: true,
        });
      }
    },
  });

  const handleTask = (formData: IActionAdminTask) => {
    console.log(formData);
    actionAdminRequestMutation.mutate(formData);
  };

  const { colorMode } = useColorMode();
  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<IActionAdminTask>();

  useEffect(() => {
    // Submit the form once decision is set
    if (decision === "approve") {
      handleTask({ action: "approve", taskPk });
    } else if (decision === "reject") {
      handleTask({ action: "reject", taskPk });
    }
  }, [decision, taskPk]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} size={"md"}>
      <ModalOverlay />
      <Flex as={"form"} onSubmit={handleSubmit(handleTask)}>
        <ModalContent bg={colorMode === "light" ? "white" : "gray.800"}>
          <ModalHeader>Approve Request?</ModalHeader>
          <ModalCloseButton />

          <ModalBody>
            <FormControl>
              <InputGroup>
                <Input
                  type="hidden"
                  {...register("taskPk", {
                    required: true,
                    value: taskPk,
                  })}
                  readOnly
                />
              </InputGroup>
            </FormControl>

            {action === "deleteproject" ? (
              <>
                <Center>
                  <Text fontWeight={"semibold"} fontSize={"xl"}>
                    Are you sure you want to delete this project? There's no
                    turning back.
                  </Text>
                </Center>
                <Center mt={4}>
                  <UnorderedList>
                    <ListItem>
                      The Project team and area will be cleared
                    </ListItem>
                    <ListItem>The project photo will be deleted</ListItem>
                    <ListItem>Any related comments will be deleted</ListItem>
                    <ListItem>All related documents will be deleted</ListItem>
                  </UnorderedList>
                </Center>
                <Center pt={5}>
                  <Text
                    fontWeight={"bold"}
                    color={"red.400"}
                    textDecoration={"underline"}
                  >
                    This is permanent.
                  </Text>
                </Center>
              </>
            ) : action === "mergeuser" ? (
              <>
                <Box mb={3}>
                  <UnorderedList ml={6} mt={2}>
                    <ListItem>
                      The primary user ({task.primary_user.display_first_name}{" "}
                      {task.primary_user.display_last_name}) will receive any
                      projects belonging to the secondary user (
                      {task.secondary_users[0].display_first_name}{" "}
                      {task.secondary_users[0].display_last_name})
                    </ListItem>
                    <ListItem>
                      The primary user ({task.primary_user.display_first_name}{" "}
                      {task.primary_user.display_last_name}) will receive any
                      comments belonging to the secondary user/s
                    </ListItem>
                    <ListItem>
                      The primary user ({task.primary_user.display_first_name}{" "}
                      {task.primary_user.display_last_name}) will receive any
                      documents and roles belonging to the secondary user (
                      {task.secondary_users[0].display_first_name}{" "}
                      {task.secondary_users[0].display_last_name}) on projects,
                      where applicable (if primary user is already on the
                      project and has a higher role, they will maintain the
                      higher role)
                    </ListItem>
                    <ListItem
                      textDecoration={"underline"}
                      color={colorMode === "light" ? "red.500" : "red.400"}
                    >
                      The secondary user (
                      {task.secondary_users[0].display_first_name}{" "}
                      {task.secondary_users[0].display_last_name}) will be
                      deleted from the system. This is permanent.
                    </ListItem>
                  </UnorderedList>
                </Box>
              </>
            ) : action === "setcaretaker" ? (
              <>
                <Box>
                  <Text mt={4}>
                    {task.primary_user.display_first_name}{" "}
                    {task.primary_user.display_last_name} requested that{" "}
                    {task.secondary_users[0].display_first_name}{" "}
                    {task.secondary_users[0].display_last_name} be their
                    caretaker while they are away.
                  </Text>
                  <Box mt={4}>
                    <UnorderedList>
                      {/* <ListItem>From {formattedStart.split("@")[0]}</ListItem> */}
                      {task.end_date && (
                        <ListItem>
                          Until {formatDate(task.end_date, "dd/MM/YYYY")}
                        </ListItem>
                      )}
                      <ListItem>
                        {task.secondary_users[0].display_first_name} will be
                        able to perform actions on{" "}
                        {task.primary_user.display_first_name}{" "}
                        {task.primary_user.display_last_name}'s' behalf
                      </ListItem>
                      <ListItem>
                        If {task.primary_user.display_first_name}{" "}
                        {task.primary_user.display_last_name} is a business area
                        lead, {task.secondary_users[0].display_first_name} will
                        act in their stead
                      </ListItem>
                    </UnorderedList>
                  </Box>
                </Box>
              </>
            ) : null}
          </ModalBody>
          <ModalFooter>
            <Flex flexDir={"column"}>
              <Center pb={5} px={5} display={"flex"} flexDir={"column"}>
                <Text fontWeight={"semibold"} color={"blue.500"}>
                  If you wish to proceed, click approve. Otherwise, click reject
                  and the request will be removed.
                </Text>
                <Text fontWeight={"semibold"} color={"blue.500"}>
                  To exit, press the close button.
                </Text>
              </Center>
              <Grid gridTemplateColumns={"repeat(2, 1fr)"} gridGap={4}>
                <Button
                  colorScheme="gray"
                  onClick={() => setDecision("reject")}
                >
                  Reject
                </Button>
                <Button
                  color={"white"}
                  background={colorMode === "light" ? "red.500" : "red.600"}
                  _hover={{
                    background: colorMode === "light" ? "red.400" : "red.500",
                  }}
                  disabled={
                    actionAdminRequestMutation.isPending ||
                    !taskPk ||
                    isSubmitting
                  }
                  isLoading={actionAdminRequestMutation.isPending}
                  // type="submit"
                  onClick={() => setDecision("approve")}
                  ml={3}
                >
                  Approve
                </Button>
              </Grid>
            </Flex>
          </ModalFooter>
        </ModalContent>
      </Flex>
    </Modal>
  );
};
