import {
  getDoesUserWithEmailExist,
  IEmailRecipientsString,
  sendSPMSLinkEmail,
} from "@/lib/api";
import { useUser } from "@/lib/hooks/tanstack/useUser";
import {
  Button,
  Flex,
  FormControl,
  FormHelperText,
  FormLabel,
  Grid,
  Input,
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

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const EmailSiteLinkModal = ({ isOpen, onClose }: Props) => {
  const [canSend, setCanSend] = useState(false);
  const [toUserEmail, setToUserEmail] = useState("");
  const [emailExists, setEmailExists] = useState(false);

  useEffect(() => {
    const checkEmailExists = async (email) => {
      const doesEmailExist = await getDoesUserWithEmailExist(email);
      if (doesEmailExist === true) {
        if (email !== "jarid.prince@dbca.wa.gov.au") {
          setEmailExists(true);
        } else {
          setEmailExists(false);
        }
      } else {
        if (emailExists) {
          setEmailExists(false);
        }
      }
    };

    checkEmailExists(toUserEmail);
  }, [toUserEmail, emailExists]);

  // Destructure viewing users info
  const { userData, userLoading } = useUser();

  const {
    email: fromUserEmail,
    first_name,
    last_name,
    pk: fromUserPk,
  } = userData ?? {};

  const fromUserName = `${first_name} ${last_name}`;

  useEffect(() => {
    console.log({
      fromUserEmail,
      fromUserName,
      fromUserPk,
      toUserEmail,
    });
    if (
      !toUserEmail ||
      (toUserEmail &&
        (!toUserEmail?.endsWith("dbca.wa.gov.au") ||
          !toUserEmail?.includes("@"))) ||
      !fromUserPk ||
      !fromUserEmail ||
      !fromUserName ||
      emailExists
    ) {
      setCanSend(false);
    } else {
      const splitEmail = toUserEmail?.split("@");
      if (splitEmail?.length > 2) {
        setCanSend(false);
      } else {
        if (splitEmail[0].length >= 5) {
          setCanSend(true);
        } else {
          setCanSend(false);
        }
      }
      // setCanSend(true);
    }
  }, [fromUserEmail, fromUserName, fromUserPk, toUserEmail, emailExists]);

  const {
    register,
    // handleSubmit,
    reset,
  } = useForm<IEmailRecipientsString>();

  const resetData = () => {
    reset();
    setToUserEmail("");
    setCanSend(false);
  };

  const onClick = async (formData: IEmailRecipientsString) => {
    const dataForMutation = {
      fromUserEmail: formData.fromUserEmail,
      toUserEmail: formData.toUserEmail,
    };
    await sendLinkMutation.mutate({ ...dataForMutation });
  };

  const { colorMode } = useColorMode();
  // const queryClient = useQueryClient();
  const toast = useToast();
  const toastIdRef = useRef<ToastId>();
  const addToast = (data) => {
    toastIdRef.current = toast(data);
  };
  const sendLinkMutation = useMutation({
    mutationFn: sendSPMSLinkEmail,
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
        {!userLoading ? (
          <>
            <ModalHeader mt={5}>Send Link to SPMS</ModalHeader>
            <ModalCloseButton />
            <ModalBody mb={5}>
              <Grid gridRowGap={4}>
                <input
                  type="hidden"
                  value={fromUserEmail}
                  {...register("fromUserEmail", {
                    required: true,
                    value: fromUserEmail,
                  })}
                />
                <FormControl mb={2}>
                  <FormLabel>Email (@dbca.wa.gov.au)</FormLabel>
                  <Input
                    placeholder="...@dbca.wa.gov.au"
                    value={toUserEmail}
                    onChange={(e) => setToUserEmail(e.target.value)}
                  />
                  <FormHelperText color={emailExists ? "red.500" : undefined}>
                    {emailExists
                      ? "That email is already registered"
                      : "Enter a DBCA email address which isn't already registered"}
                  </FormHelperText>
                </FormControl>

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
                      The email will be sent by the system, but this email may
                      be listed
                    </Text>
                    <Grid gridTemplateColumns={"2fr 10fr"} px={1}>
                      <Text fontWeight={"bold"}>To:</Text>
                      <Text textAlign={"right"}>{toUserEmail}</Text>
                    </Grid>
                  </>
                ) : null}
              </Grid>
              <Text fontSize={"xs"} color={"gray.500"}>
                Note: This will send an email with a link to access SPMS. Once
                the user logs in, you will be able to find their account and add
                them to projects
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
                  isDisabled={!canSend || sendLinkMutation.isPending}
                  onClick={() => {
                    onClick({
                      fromUserEmail: fromUserEmail,
                      toUserEmail: toUserEmail,
                    });
                  }}
                  color={"white"}
                  background={colorMode === "light" ? "green.500" : "green.600"}
                  _hover={{
                    background:
                      colorMode === "light" ? "green.400" : "green.500",
                  }}
                >
                  Send
                </Button>
              </Flex>
            </ModalFooter>
          </>
        ) : null}
      </ModalContent>
    </Modal>
  );
};
