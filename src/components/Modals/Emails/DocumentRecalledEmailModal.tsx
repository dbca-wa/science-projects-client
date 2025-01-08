import { ProjectSearchDropdown } from "@/components/Navigation/ProjectSearchDropdown";
import { UserSearchDropdown } from "@/components/Navigation/UserSearchDropdown";
import { sendDocumentRecalledEmail } from "@/lib/api/api";
import { IEmailModalProps, ISendSingleEmail } from "@/types";
import {
  Button,
  Flex,
  FormControl,
  FormLabel,
  Grid,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Select,
  Text,
  ToastId,
  useColorMode,
  useToast,
} from "@chakra-ui/react";
import { useMutation } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";

export const DocumentRecalledEmailModal = ({
  isOpen,
  onClose,
  emailFunction,
  thisUser,
}: IEmailModalProps) => {
  const [canSend, setCanSend] = useState(false);
  const [toUserEmail, setToUserEmail] = useState("");
  const [toUserName, setToUserName] = useState("");
  const [toUserPk, setToUserPk] = useState<null | number>();

  const [projectTitle, setProjectTitle] = useState("");
  const [projectPk, setProjectPk] = useState<null | number>();
  const [projectDocumentKind, setProjectDocumentKind] = useState<
    | "concept"
    | "projectplan"
    | "progressreport"
    | "studentreport"
    | "projectclosure"
  >("concept");
  const [stage, setStage] = useState<number>();

  // Destructure viewing users info
  const {
    email: fromUserEmail,
    first_name,
    last_name,
    pk: fromUserPk,
  } = thisUser ?? {};
  const fromUserName = `${first_name} ${last_name}`;

  useEffect(() => {
    if (
      !projectPk ||
      !toUserEmail ||
      !toUserName ||
      !toUserPk ||
      !fromUserPk ||
      !fromUserEmail ||
      !fromUserName ||
      !projectDocumentKind ||
      !stage
    ) {
      setCanSend(false);
    } else {
      setCanSend(true);
    }
  }, [
    projectPk,
    fromUserEmail,
    fromUserName,
    fromUserPk,
    toUserPk,
    toUserEmail,
    toUserName,
    projectDocumentKind,
    stage,
  ]);

  const {
    register,
    // handleSubmit,
    reset,
  } = useForm<ISendSingleEmail>();

  const resetData = () => {
    reset();
    setToUserPk(null);
    setToUserName("");
    setToUserEmail("");
    setCanSend(false);
  };

  const onClick = async (formData: ISendSingleEmail) => {
    const dataForMutation = {
      recipients_list: [formData.toUserPk],
      project_pk: formData.project,
      document_kind: formData.projectDocumentKind,
      stage: formData.stage,
    };
    await sendDocApprovedEmailMutation.mutate({ ...dataForMutation });
  };

  const { colorMode } = useColorMode();
  // const queryClient = useQueryClient();
  const toast = useToast();
  const toastIdRef = useRef<ToastId>();
  const addToast = (data) => {
    toastIdRef.current = toast(data);
  };
  const sendDocApprovedEmailMutation = useMutation({
    mutationFn: sendDocumentRecalledEmail,
    onMutate: () => {
      addToast({
        status: "loading",
        title: "Sending Email",
        position: "top-right",
      });
    },
    onSuccess: () => {
      if (toastIdRef.current) {
        toast.update(toastIdRef.current, {
          title: "Success",
          description: `Email Sent`,
          status: "success",
          position: "top-right",
          duration: 3000,
          isClosable: true,
        });
      }
    },
    onError: (error) => {
      if (toastIdRef.current) {
        toast.update(toastIdRef.current, {
          title: "Could Not Send Email",
          description: `${error}`,
          status: "error",
          position: "top-right",
          duration: 3000,
          isClosable: true,
        });
      }
    },
  });

  const projectSearchInputRef = useRef<HTMLInputElement | null>(null);

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        resetData();
        onClose();
      }}
      size={"md"}
      // isCentered={true}
    >
      {" "}
      <ModalOverlay />
      <ModalContent bg={colorMode === "light" ? "white" : "gray.800"} p={4}>
        <ModalHeader mt={5}>Send Document Recalled Email</ModalHeader>
        <ModalCloseButton />
        <ModalBody mb={5}>
          <Grid gridRowGap={4}>
            <input
              type="hidden"
              value={thisUser?.pk}
              {...register("fromUserPk", {
                required: true,
                value: thisUser?.pk,
              })}
            />
            <ProjectSearchDropdown
              autoFocus={false}
              isClosed={true}
              inputRef={projectSearchInputRef}
              {...register("project", { required: true })}
              user={fromUserPk}
              allProjects
              isRequired={true}
              setProjectFunction={setProjectPk}
              setProjectTitleFunction={setProjectTitle}
              label="Project"
              placeholder="Select a project..."
              helperText={"The project you would like to send an email about."}
            />
            {projectPk ? (
              <UserSearchDropdown
                autoFocus={true}
                {...register("toUserPk", { required: true })}
                setUserFunction={setToUserPk}
                setUserEmailFunction={setToUserEmail}
                setUserNameFunction={setToUserName}
                isEditable
                projectPk={projectPk}
                onlyInternal={true}
                isRequired={true}
                label="Send To"
                placeholder="Search for a user..."
                helperText={"Select the user you would like to send to."}
              />
            ) : null}
            {toUserPk ? (
              <FormControl isRequired>
                <FormLabel>Document Kind</FormLabel>
                <Select
                  {...register("projectDocumentKind")}
                  onChange={(e) =>
                    setProjectDocumentKind(
                      e.target.value as
                        | "concept"
                        | "projectplan"
                        | "progressreport"
                        | "studentreport"
                        | "projectclosure",
                    )
                  }
                >
                  <option value={"concept"}>Concept</option>
                  <option value={"projectplan"}>Project Plan</option>
                  <option value={"progressreport"}>Progress Report</option>
                  <option value={"studentreport"}>Student Report</option>
                  <option value={"projectclosure"}>Closure</option>
                </Select>
              </FormControl>
            ) : null}

            {projectDocumentKind ? (
              <FormControl isRequired>
                <FormLabel>Stage</FormLabel>
                <Select onChange={(e) => setStage(Number(e.target.value))}>
                  <option value={1}>1</option>
                  <option value={2}>2</option>
                  <option value={3}>3</option>
                </Select>
              </FormControl>
            ) : null}

            {canSend ? (
              <>
                <Grid gridTemplateColumns={"2fr 10fr"} px={1} mt={4}>
                  <Text fontWeight={"bold"}>From: </Text>
                  <Text textAlign={"right"}>{fromUserEmail}</Text>
                </Grid>
                <Text
                  fontSize={"x-small"}
                  textAlign={"right"}
                  color={"gray.500"}
                >
                  The email will be sent by the system, but this email may be
                  listed
                </Text>
                <Grid gridTemplateColumns={"2fr 10fr"} px={1}>
                  <Text fontWeight={"bold"}>To:</Text>
                  <Text textAlign={"right"}>{toUserEmail}</Text>
                </Grid>
                <Grid gridTemplateColumns={"2fr 10fr"} px={1}>
                  <Text fontWeight={"bold"}>Doc Type:</Text>
                  <Text textAlign={"right"}>{projectDocumentKind}</Text>
                </Grid>
                <Grid gridTemplateColumns={"2fr 10fr"} px={1}>
                  <Text fontWeight={"bold"}>Stage:</Text>
                  <Text textAlign={"right"}>{stage}</Text>
                </Grid>
              </>
            ) : null}
          </Grid>
          <Text fontSize={"xs"} color={"gray.500"}>
            Note: This will have no effect on the status of the chosen document
          </Text>
        </ModalBody>
        <ModalFooter>
          <Flex>
            <Button
              onClick={() => {
                resetData();
                onClose();
              }}
              mr={3}
              colorScheme={"gray"}
            >
              Cancel
            </Button>
            <Button
              isDisabled={!canSend}
              onClick={() => {
                onClick({
                  toUserEmail: toUserEmail,
                  toUserName: toUserName,
                  toUserPk: toUserPk,
                  fromUserEmail: fromUserEmail,
                  fromUserName: fromUserName,
                  fromUserPk: fromUserPk,
                  project: projectPk,
                  projectTitle: projectTitle,
                  projectDocumentKind: projectDocumentKind,
                  stage: stage,
                });
              }}
              color={"white"}
              background={colorMode === "light" ? "green.500" : "green.600"}
              _hover={{
                background: colorMode === "light" ? "green.400" : "green.500",
              }}
            >
              Send
            </Button>
          </Flex>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
