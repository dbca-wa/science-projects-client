import { UserSearchDropdown } from "@/components/Navigation/UserSearchDropdown";
import { sendFeedbackReceivedEmail } from "@/lib/api";
import { IEmailModalProps, ISendSingleEmail } from "@/types";
import {
  Button,
  Flex,
  Grid,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Text,
  ToastId,
  useColorMode,
  useToast,
} from "@chakra-ui/react";
import { useMutation } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";

export const FeedbackReceivedEmailModal = ({
  isOpen,
  onClose,
  emailFunction,
  thisUser,
}: IEmailModalProps) => {
  const [canSend, setCanSend] = useState(false);
  const [toUserEmail, setToUserEmail] = useState("");
  const [toUserName, setToUserName] = useState("");
  const [toUserPk, setToUserPk] = useState<null | number>();

  // Destructure viewing users info
  const {
    email: fromUserEmail,
    first_name,
    last_name,
    pk: fromUserPk,
  } = thisUser ?? {};
  const fromUserName = `${first_name} ${last_name}`;

  useEffect(() => {
    console.log({
      fromUserEmail,
      fromUserName,
      fromUserPk,
      toUserPk,
      toUserEmail,
      toUserName,
    });
    if (
      !toUserEmail ||
      !toUserName ||
      !toUserPk ||
      !fromUserPk ||
      !fromUserEmail ||
      !fromUserName
    ) {
      setCanSend(false);
    } else {
      setCanSend(true);
    }
  }, [
    fromUserEmail,
    fromUserName,
    fromUserPk,
    toUserPk,
    toUserEmail,
    toUserName,
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
    // API Call here
    console.log("API CALL");
    console.log(formData);
    console.log(emailFunction);
    const dataForMutation = {
      recipients_list: [formData.toUserPk],
      project_pk: formData.project,
      document_kind: formData.projectDocumentKind,
      stage: formData.stage,
    };
    await sendFeedbackReceivedMutation.mutate({ ...dataForMutation });
  };

  const { colorMode } = useColorMode();
  // const queryClient = useQueryClient();
  const toast = useToast();
  const toastIdRef = useRef<ToastId>();
  const addToast = (data) => {
    toastIdRef.current = toast(data);
  };
  const sendFeedbackReceivedMutation = useMutation({
    mutationFn: sendFeedbackReceivedEmail,
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
        <ModalHeader mt={5}>Send Feedback Received Email</ModalHeader>
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

            <UserSearchDropdown
              autoFocus={true}
              {...register("toUserPk", { required: true })}
              setUserFunction={setToUserPk}
              setUserEmailFunction={setToUserEmail}
              setUserNameFunction={setToUserName}
              isEditable
              onlyInternal={true}
              isRequired={true}
              label="Send To"
              placeholder="Search for a user..."
              helperText={"Select the user you would like to send to."}
            />

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
